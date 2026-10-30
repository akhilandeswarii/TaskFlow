
import { useState } from "react";
import { Check, CreditCard, Crown } from "lucide-react";
import api from "../services/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function Subscription() {
  const [loading, setLoading] = useState(false);

  const features = [
    "Unlimited task creation",
    "Unlimited project management",
    "Advanced calendar planning",
    "Email deadline reminders",
    "Priority support",
  ];

  async function handleUpgrade() {
    try {
      setLoading(true);

      // Load Razorpay Checkout script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(
          new Error("Could not load Razorpay Checkout")
        );
        document.body.appendChild(script);
      });

      // Create order through Spring Boot
      const orderResponse = await api.post("/payment/create-order");
      const order = orderResponse.data;

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "TaskFlow",
        description: "Premium Plan Subscription",
        order_id: order.orderId,

        handler: async function (response: any) {
          try {
            // Verify payment through Spring Boot
            const verificationResponse = await api.post(
              "/payment/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            alert(verificationResponse.data.message);
          } catch (error) {
            console.error("Payment verification failed:", error);
            alert(
              "Payment verification failed. Contact support with your payment ID: " +
              response.razorpay_payment_id
            );
          }
        },

        theme: {
          color: "#7657e8",
        },

        modal: {
          ondismiss: function () {
            console.log("Payment window closed");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        alert("Payment failed. Please try again.");
      });

      razorpay.open();

    } catch (error) {
      console.error("Checkout error:", error);
      alert("Unable to start payment. Check whether the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="eyebrow">TASKFLOW PLANS</p>

      <div className="page-heading">
        <div>
          <h1>Subscription Plans</h1>
          <p className="subtitle">
            Choose a plan that matches your productivity needs.
          </p>
        </div>
      </div>

      <div className="subscription-grid">
        <div className="subscription-card">
          <div className="subscription-icon">
            <CreditCard size={27} />
          </div>

          <h2>Free Plan</h2>
          <h1>₹0 <span>/ forever</span></h1>
          <p className="subscription-description">
            Essential tools to manage your daily tasks.
          </p>

          <ul>
            <li><Check size={17} /> Create and manage tasks</li>
            <li><Check size={17} /> Manage projects</li>
            <li><Check size={17} /> Basic dashboard</li>
          </ul>

          <button className="subscription-current" disabled>
            Current Plan
          </button>
        </div>

        <div className="subscription-card premium-card">
          <span className="premium-label">RECOMMENDED</span>

          <div className="subscription-icon">
            <Crown size={27} />
          </div>

          <h2>Premium Plan</h2>
          <h1>₹199 <span>/ month</span></h1>
          <p className="subscription-description">
            More control and advanced productivity features.
          </p>

          <ul>
            {features.map((feature) => (
              <li key={feature}>
                <Check size={17} /> {feature}
              </li>
            ))}
          </ul>

          <button
            className="subscription-upgrade"
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? "Processing..." : "Upgrade to Premium"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Subscription;
