package com.asiattiger.booking.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDTO {

    private Long id;

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotNull(message = "Facility ID is required")
    private Long facilityId;

    // Computed fields from facility
    private String facilityName;
    private String facilityType;

    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    @Pattern(regexp = "^(pending|confirmed|cancelled|completed)$", 
             message = "Status must be one of: pending, confirmed, cancelled, completed")
    private String status;

    @Size(max = 200, message = "Purpose cannot exceed 200 characters")
    private String purpose;

    private BigDecimal totalCost;

    @Size(max = 100, message = "User name cannot exceed 100 characters")
    private String userName;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Computed fields
    private Double durationInHours;
    private Boolean canBeCancelled;
    private Boolean isActive;

    // Helper methods
    public String getFormattedCost() {
        return totalCost != null ? "RM " + totalCost : "N/A";
    }

    public String getStatusDisplay() {
        if (status == null) return "Unknown";
        
        switch (status.toLowerCase()) {
            case "pending":
                return "⏳ Pending";
            case "confirmed":
                return "✅ Confirmed";
            case "cancelled":
                return "❌ Cancelled";
            case "completed":
                return "🏁 Completed";
            default:
                return status;
        }
    }

    public String getDurationDisplay() {
        if (durationInHours == null) return "N/A";
        
        if (durationInHours == 1.0) {
            return "1 hour";
        } else if (durationInHours % 1 == 0) {
            return String.format("%.0f hours", durationInHours);
        } else {
            return String.format("%.1f hours", durationInHours);
        }
    }

    public String getBookingPeriod() {
        if (startTime == null || endTime == null) return "N/A";
        
        return String.format("%s - %s", 
            startTime.toLocalTime().toString(), 
            endTime.toLocalTime().toString());
    }
}