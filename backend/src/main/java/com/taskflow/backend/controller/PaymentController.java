
package com.taskflow.backend.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.taskflow.backend.entity.Payment;
import com.taskflow.backend.entity.User;
import com.taskflow.backend.repository.PaymentRepository;
import com.taskflow.backend.repository.UserRepository;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    public PaymentController(
            UserRepository userRepository,
            PaymentRepository paymentRepository) {
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(Authentication authentication) {
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", 19900);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "taskflow_" + user.getId()
                    + "_" + System.currentTimeMillis());

            Order order = razorpay.orders.create(orderRequest);

            String orderId = order.get("id");
            Integer amount = order.get("amount");

            paymentRepository.save(
                    new Payment(user, orderId, amount, "CREATED")
            );

            return ResponseEntity.ok(Map.of(
                    "keyId", keyId,
                    "orderId", orderId,
                    "amount", amount,
                    "currency", "INR"
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Could not create payment order"));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestBody Map<String, String> data,
            Authentication authentication) {

        try {
            String orderId = data.get("razorpay_order_id");
            String paymentId = data.get("razorpay_payment_id");
            String signature = data.get("razorpay_signature");

            if (orderId == null || paymentId == null || signature == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Missing payment details"));
            }

            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Payment payment = paymentRepository
                    .findByRazorpayOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            if (!payment.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403)
                        .body(Map.of("message", "Order does not belong to this user"));
            }

            if ("PAID".equals(payment.getStatus())) {
                return ResponseEntity.ok(
                        Map.of("message", "Payment already verified")
                );
            }

            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            boolean isValid = Utils.verifyPaymentSignature(options, keySecret);

            if (!isValid) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Invalid payment signature"));
            }

            payment.setRazorpayPaymentId(paymentId);
            payment.setStatus("PAID");
            paymentRepository.save(payment);

            user.setPremium(true);
            userRepository.save(user);

            return ResponseEntity.ok(
                    Map.of("message", "Payment verified. Premium activated!")
            );

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Payment verification failed"));
        }
    }
}
