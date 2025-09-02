package com.asiattiger.booking.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Duration;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "User ID is required")
    @Column(name = "user_id", nullable = false)
    private String userId;

    @NotNull(message = "Facility is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(pending|confirmed|cancelled|completed)$", 
             message = "Status must be one of: pending, confirmed, cancelled, completed")
    @Column(nullable = false)
    private String status = "pending";

    @Size(max = 200, message = "Purpose cannot exceed 200 characters")
    @Column(length = 200)
    private String purpose;

    @Column(name = "total_cost", precision = 10, scale = 2)
    private BigDecimal totalCost;

    @Size(max = 100, message = "User name cannot exceed 100 characters")
    @Column(name = "user_name")
    private String userName;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Business logic methods
    @PrePersist
    @PreUpdate
    protected void validateBooking() {
        if (startTime != null && endTime != null) {
            if (endTime.isBefore(startTime) || endTime.equals(startTime)) {
                throw new IllegalArgumentException("End time must be after start time");
            }
            
            // Calculate total cost
            if (facility != null && facility.getHourlyRate() != null) {
                long minutes = Duration.between(startTime, endTime).toMinutes();
                double hours = minutes / 60.0;
                this.totalCost = facility.getHourlyRate().multiply(BigDecimal.valueOf(hours));
            }
        }
    }

    public long getDurationInHours() {
        if (startTime != null && endTime != null) {
            return Duration.between(startTime, endTime).toHours();
        }
        return 0;
    }

    public double getDurationInHoursAsDouble() {
        if (startTime != null && endTime != null) {
            long minutes = Duration.between(startTime, endTime).toMinutes();
            return minutes / 60.0;
        }
        return 0.0;
    }

    public boolean isActive() {
        return "confirmed".equals(this.status) || "pending".equals(this.status);
    }

    public boolean canBeCancelled() {
        if (!"confirmed".equals(this.status) && !"pending".equals(this.status)) {
            return false;
        }
        // Can cancel if booking is more than 2 hours in the future
        return startTime != null && LocalDateTime.now().plusHours(2).isBefore(startTime);
    }

    public String getFacilityName() {
        return facility != null ? facility.getName() : null;
    }

    public String getFacilityType() {
        return facility != null ? facility.getType() : null;
    }
}