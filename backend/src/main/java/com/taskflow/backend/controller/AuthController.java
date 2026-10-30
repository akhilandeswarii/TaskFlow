
package com.taskflow.backend.controller;

import com.taskflow.backend.dto.SignupRequest;
import com.taskflow.backend.dto.LoginRequest;
import com.taskflow.backend.service.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {

        String token = authService.signup(
            request.getName(),
            request.getEmail(),
            request.getPassword()
        );

        return ResponseEntity.ok(
            Map.of(
                "message", "Signup successful",
                "token", token
            )
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        String token = authService.login(
            request.getEmail(),
            request.getPassword()
        );

        return ResponseEntity.ok(
            Map.of(
                "message", "Login successful",
                "token", token
            )
        );
    }
}
