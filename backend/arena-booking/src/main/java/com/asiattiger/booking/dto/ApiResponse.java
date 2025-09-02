package com.asiattiger.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {
    
    private boolean success;
    private T data;
    private String message;
    private String error;
    
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    
    private String requestId;
    private Integer count; // For list responses
    
    // Success response builders
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }
    
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .build();
    }
    
    public static <T> ApiResponse<T> successWithCount(T data, String message, Integer count) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .count(count)
                .build();
    }
    
    // Error response builders
    public static <T> ApiResponse<T> error(String error) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(error)
                .build();
    }
    
    public static <T> ApiResponse<T> error(String error, String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(error)
                .message(message)
                .build();
    }
    
    // Validation error response
    public static <T> ApiResponse<T> validationError(String error) {
        return ApiResponse.<T>builder()
                .success(false)
                .error("Validation failed: " + error)
                .message("Please check your input data")
                .build();
    }
}