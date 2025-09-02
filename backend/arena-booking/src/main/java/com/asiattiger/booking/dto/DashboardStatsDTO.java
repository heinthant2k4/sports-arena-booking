package com.asiattiger.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {

    // Facility Statistics
    private Long totalFacilities;
    private Long facilitiesUnderMaintenance;
    private BigDecimal averageHourlyRate;

    // Booking Statistics
    private Long totalBookings;
    private Long confirmedBookings;
    private Long pendingBookings;
    private Long cancelledBookings;
    private Long monthlyBookings;

    // Revenue Statistics
    private BigDecimal monthlyRevenue;
    private BigDecimal totalRevenue;
    private BigDecimal averageBookingValue;

    // Time-based Statistics
    private List<Map<String, Object>> popularTimeSlots;
    private List<Map<String, Object>> facilityUsageStats;
    private List<Map<String, Object>> revenueByMonth;
    private List<Map<String, Object>> bookingTrends;

    // Computed Properties
    public Double getBookingConfirmationRate() {
        if (totalBookings == null || totalBookings == 0) return 0.0;
        if (confirmedBookings == null) return 0.0;
        
        return (confirmedBookings.doubleValue() / totalBookings.doubleValue()) * 100;
    }

    public Double getCancellationRate() {
        if (totalBookings == null || totalBookings == 0) return 0.0;
        if (cancelledBookings == null) return 0.0;
        
        return (cancelledBookings.doubleValue() / totalBookings.doubleValue()) * 100;
    }

    public Long getAvailableFacilities() {
        if (totalFacilities == null) return 0L;
        if (facilitiesUnderMaintenance == null) return totalFacilities;
        
        return totalFacilities - facilitiesUnderMaintenance;
    }

    public String getFormattedMonthlyRevenue() {
        return monthlyRevenue != null ? "RM " + monthlyRevenue : "RM 0.00";
    }

    public String getFormattedAverageRate() {
        return averageHourlyRate != null ? "RM " + averageHourlyRate + "/hour" : "N/A";
    }
}