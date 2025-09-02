package com.university.arena_booking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class testController {

    // Root endpoint to avoid whitelabel error
    @GetMapping("/")
    public ResponseEntity<Map<String, String>> root() {
        return ResponseEntity.ok(Map.of(
            "service", "Sports Arena Booking System API",
            "version", "1.0.0",
            "status", "Running",
            "endpoints", "Visit /api/health for health check"
        ));
    }

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "message", "Sports Arena Booking API is running!"
        ));
    }

    @GetMapping("/api/test")
    public ResponseEntity<Map<String, String>> test() {
        return ResponseEntity.ok(Map.of(
            "message", "Backend is working correctly!",
            "timestamp", String.valueOf(System.currentTimeMillis())
        ));
    }
}