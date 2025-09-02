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
import java.util.List;

@Entity
@Table(name = "facilities")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Facility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Facility name is required")
    @Size(min = 2, max = 100, message = "Facility name must be between 2 and 100 characters")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Facility type is required")
    @Pattern(regexp = "^(futsal|badminton)$", message = "Type must be either 'futsal' or 'badminton'")
    @Column(nullable = false)
    private String type;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 100, message = "Capacity cannot exceed 100")
    @Column(nullable = false)
    private Integer capacity;

    @NotNull(message = "Hourly rate is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Hourly rate must be positive")
    @DecimalMax(value = "1000.0", message = "Hourly rate cannot exceed 1000")
    @Column(name = "hourly_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @ElementCollection
    @CollectionTable(
        name = "facility_equipment", 
        joinColumns = @JoinColumn(name = "facility_id")
    )
    @Column(name = "equipment_item")
    private List<String> equipment;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    @Column(length = 500)
    private String description;

    @Pattern(
        regexp = "^(https?://).*\\.(jpg|jpeg|png|gif|webp)$", 
        message = "Image URL must be a valid HTTP/HTTPS URL ending with a supported image format"
    )
    @Column(name = "image_url")
    private String imageUrl;

    @Size(max = 200, message = "Location cannot exceed 200 characters")
    @Column(length = 200)
    private String location;

    @Size(max = 1000, message = "Amenities cannot exceed 1000 characters")
    @Column(length = 1000)
    private String amenities;

    @Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Opening time must be in HH:mm format")
    @Column(name = "opening_time")
    private String openingTime = "06:00";

    @Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Closing time must be in HH:mm format")
    @Column(name = "closing_time")
    private String closingTime = "23:00";

    @Column(name = "is_under_maintenance", nullable = false)
    private Boolean isUnderMaintenance = false;

    @Size(max = 500, message = "Maintenance note cannot exceed 500 characters")
    @Column(name = "maintenance_note", length = 500)
    private String maintenanceNote;

    @Size(max = 100, message = "Created by field cannot exceed 100 characters")
    @Column(name = "created_by", length = 100)
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Business logic methods
    public boolean isAvailable() {
        return this.isActive != null && this.isActive && 
               (this.isUnderMaintenance == null || !this.isUnderMaintenance);
    }

    public boolean isAvailableForBooking() {
        return isAvailable() && this.hourlyRate != null && this.hourlyRate.compareTo(BigDecimal.ZERO) > 0;
    }

    public String getDisplayName() {
        return this.name + " (" + this.type.substring(0, 1).toUpperCase() + 
               this.type.substring(1) + ")";
    }

    public Double getHourlyRateAsDouble() {
        return this.hourlyRate != null ? this.hourlyRate.doubleValue() : 0.0;
    }

    public String getStatusDisplay() {
        if (this.isUnderMaintenance != null && this.isUnderMaintenance) {
            return "Under Maintenance";
        } else if (this.isActive != null && this.isActive) {
            return "Active";
        } else {
            return "Inactive";
        }
    }

    @PrePersist
    protected void onCreate() {
        if (this.isActive == null) {
            this.isActive = true;
        }
        if (this.isUnderMaintenance == null) {
            this.isUnderMaintenance = false;
        }
        if (this.openingTime == null) {
            this.openingTime = "06:00";
        }
        if (this.closingTime == null) {
            this.closingTime = "23:00";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}