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
public class FacilityDTO {

    private Long id;

    @NotBlank(message = "Facility name is required")
    @Size(min = 2, max = 100, message = "Facility name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Facility type is required")
    @Pattern(regexp = "^(futsal|badminton|basketball|tennis|volleyball)$", 
             message = "Type must be one of: futsal, badminton, basketball, tennis, volleyball")
    private String type;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Hourly rate is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Hourly rate must be greater than 0")
    private BigDecimal hourlyRate;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @Size(max = 200, message = "Location cannot exceed 200 characters")
    private String location;

    private Boolean isActive;

    @Size(max = 1000, message = "Amenities cannot exceed 1000 characters")
    private String amenities;

    @Size(max = 500, message = "Image URL cannot exceed 500 characters")
    private String imageUrl;

    @Pattern(regexp = "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Opening time must be in HH:MM format")
    private String openingTime;

    @Pattern(regexp = "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Closing time must be in HH:MM format")
    private String closingTime;

    private Boolean isUnderMaintenance;

    @Size(max = 300, message = "Maintenance note cannot exceed 300 characters")
    private String maintenanceNote;

    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Computed fields
    private String displayName;
    private String statusDisplay;
    private Boolean availableForBooking;
    private Integer activeBookingsCount;
    
    // Helper methods
    public String getTypeCapitalized() {
        return type != null ? type.substring(0, 1).toUpperCase() + type.substring(1) : null;
    }

    public String getFormattedRate() {
        return hourlyRate != null ? "RM " + hourlyRate + "/hour" : "N/A";
    }
}