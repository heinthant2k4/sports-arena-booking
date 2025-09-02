package com.asiattiger.booking.controller;

import com.asiattiger.booking.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
@Slf4j
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        log.info("🔍 Health check requested");
        
        Map<String, Object> healthData = new HashMap<>();
        healthData.put("status", "UP");
        healthData.put("timestamp", LocalDateTime.now());
        healthData.put("service", "Asian Tiger Booking System");
        healthData.put("version", "1.0.0");
        healthData.put("database", "H2 (In-Memory)");
        
        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
            .success(true)
            .data(healthData)
            .message("Asian Tiger Booking System is running successfully! 🏅")
            .build());
    }

    @GetMapping("/test")
    public ResponseEntity<ApiResponse<String>> test() {
        log.info("🧪 Test endpoint called");
        
        return ResponseEntity.ok(ApiResponse.<String>builder()
            .success(true)
            .data("Backend is working perfectly!")
            .message("Test successful! Ready for frontend integration. 🚀")
            .build());
    }
}