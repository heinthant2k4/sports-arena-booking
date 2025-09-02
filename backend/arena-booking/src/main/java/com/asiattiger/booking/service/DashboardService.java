package com.asiattiger.booking.service;

import com.asiattiger.booking.dto.DashboardStatsDTO;
import com.asiattiger.booking.repository.BookingRepository;
import com.asiattiger.booking.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardService {

    private final FacilityRepository facilityRepository;
    private final BookingRepository bookingRepository;

    public DashboardStatsDTO getDashboardStatistics() {
        log.info("📊 Generating dashboard statistics");
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth()).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfMonth = now.with(TemporalAdjusters.lastDayOfMonth()).withHour(23).withMinute(59).withSecond(59);
        
        return DashboardStatsDTO.builder()
                .totalFacilities(facilityRepository.countActiveFacilities())
                .facilitiesUnderMaintenance(facilityRepository.countFacilitiesUnderMaintenance())
                .totalBookings(bookingRepository.countConfirmedBookings() + bookingRepository.countPendingBookings())
                .confirmedBookings(bookingRepository.countConfirmedBookings())
                .pendingBookings(bookingRepository.countPendingBookings())
                .cancelledBookings(bookingRepository.countCancelledBookings())
                .monthlyBookings(bookingRepository.countBookingsInDateRange(startOfMonth, endOfMonth))
                .monthlyRevenue(bookingRepository.getTotalRevenueInDateRange(startOfMonth, endOfMonth))
                .averageHourlyRate(facilityRepository.getAverageHourlyRate())
                .popularTimeSlots(getPopularTimeSlots())
                .facilityUsageStats(getFacilityUsageStatistics())
                .revenueByMonth(getMonthlyRevenueData())
                .bookingTrends(getBookingTrendsData())
                .build();
    }

    public Map<String, Object> getRevenueData(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("💰 Getting revenue data from {} to {}", startDate, endDate);
        
        BigDecimal totalRevenue = bookingRepository.getTotalRevenueInDateRange(startDate, endDate);
        Long totalBookings = bookingRepository.countBookingsInDateRange(startDate, endDate);
        BigDecimal averageBookingValue = BigDecimal.ZERO;
        
        if (totalBookings > 0 && totalRevenue != null) {
            averageBookingValue = totalRevenue.divide(BigDecimal.valueOf(totalBookings), 2, java.math.RoundingMode.HALF_UP);
        }
        
        Map<String, Object> revenueData = new HashMap<>();
        revenueData.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        revenueData.put("totalBookings", totalBookings);
        revenueData.put("averageBookingValue", averageBookingValue);
        revenueData.put("startDate", startDate);
        revenueData.put("endDate", endDate);
        
        return revenueData;
    }

    public List<Map<String, Object>> getPopularFacilities() {
        log.info("🔥 Getting popular facilities data");
        
        List<Object[]> facilityStats = bookingRepository.getFacilityUsageStatistics();
        
        return facilityStats.stream()
                .limit(10) // Top 10 popular facilities
                .map(stat -> {
                    Map<String, Object> facilityData = new HashMap<>();
                    // stat[0] is Facility entity, stat[1] is booking count
                    facilityData.put("facility", stat[0]);
                    facilityData.put("bookingCount", stat[1]);
                    return facilityData;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getBookingTrends(int months) {
        log.info("📈 Getting booking trends for last {} months", months);
        
        List<Map<String, Object>> trends = new ArrayList<>();
        LocalDateTime endDate = LocalDateTime.now();
        
        for (int i = 0; i < months; i++) {
            LocalDateTime startDate = endDate.minusMonths(i + 1).with(TemporalAdjusters.firstDayOfMonth())
                    .withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = endDate.minusMonths(i).with(TemporalAdjusters.lastDayOfMonth())
                    .withHour(23).withMinute(59).withSecond(59);
            
            Long bookingCount = bookingRepository.countBookingsInDateRange(startDate, monthEnd);
            BigDecimal revenue = bookingRepository.getTotalRevenueInDateRange(startDate, monthEnd);
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", startDate.getMonth().toString());
            monthData.put("year", startDate.getYear());
            monthData.put("bookingCount", bookingCount);
            monthData.put("revenue", revenue != null ? revenue : BigDecimal.ZERO);
            monthData.put("startDate", startDate);
            monthData.put("endDate", monthEnd);
            
            trends.add(0, monthData); // Add to beginning to get chronological order
        }
        
        return trends;
    }

    public Map<String, Object> getTodayStats() {
        log.info("📅 Getting today's statistics");
        
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1).minusSeconds(1);
        
        Long todayBookings = bookingRepository.countBookingsInDateRange(startOfDay, endOfDay);
        BigDecimal todayRevenue = bookingRepository.getTotalRevenueInDateRange(startOfDay, endOfDay);
        
        Map<String, Object> todayStats = new HashMap<>();
        todayStats.put("todayBookings", todayBookings);
        todayStats.put("todayRevenue", todayRevenue != null ? todayRevenue : BigDecimal.ZERO);
        todayStats.put("date", LocalDate.now());
        
        return todayStats;
    }

    public Map<String, Object> getWeeklyStats() {
        log.info("📊 Getting weekly statistics");
        
        LocalDateTime startOfWeek = LocalDate.now().atStartOfDay().minusDays(7);
        LocalDateTime endOfWeek = LocalDateTime.now();
        
        Long weeklyBookings = bookingRepository.countBookingsInDateRange(startOfWeek, endOfWeek);
        BigDecimal weeklyRevenue = bookingRepository.getTotalRevenueInDateRange(startOfWeek, endOfWeek);
        
        Map<String, Object> weeklyStats = new HashMap<>();
        weeklyStats.put("weeklyBookings", weeklyBookings);
        weeklyStats.put("weeklyRevenue", weeklyRevenue != null ? weeklyRevenue : BigDecimal.ZERO);
        weeklyStats.put("startDate", startOfWeek);
        weeklyStats.put("endDate", endOfWeek);
        
        return weeklyStats;
    }

    public List<Map<String, Object>> getFacilityTypeDistribution() {
        log.info("📊 Getting facility type distribution");
        
        // This would need a custom query in the repository, but for now we'll simulate
        Map<String, Long> distribution = new HashMap<>();
        distribution.put("futsal", facilityRepository.countByTypeIgnoreCaseAndIsActiveTrue("futsal"));
        distribution.put("badminton", facilityRepository.countByTypeIgnoreCaseAndIsActiveTrue("badminton"));
        distribution.put("basketball", facilityRepository.countByTypeIgnoreCaseAndIsActiveTrue("basketball"));
        distribution.put("tennis", facilityRepository.countByTypeIgnoreCaseAndIsActiveTrue("tennis"));
        distribution.put("volleyball", facilityRepository.countByTypeIgnoreCaseAndIsActiveTrue("volleyball"));
        
        return distribution.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> typeData = new HashMap<>();
                    typeData.put("type", entry.getKey());
                    typeData.put("count", entry.getValue());
                    return typeData;
                })
                .collect(Collectors.toList());
    }

    // Private helper methods
    private List<Map<String, Object>> getPopularTimeSlots() {
        List<Object[]> timeSlots = bookingRepository.findPopularTimeSlots();
        
        return timeSlots.stream()
                .limit(5) // Top 5 time slots
                .map(slot -> {
                    Map<String, Object> slotData = new HashMap<>();
                    slotData.put("hour", slot[0]);
                    slotData.put("bookingCount", slot[1]);
                    return slotData;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> getFacilityUsageStatistics() {
        List<Object[]> facilityStats = bookingRepository.getFacilityUsageStatistics();
        
        return facilityStats.stream()
                .limit(5) // Top 5 facilities
                .map(stat -> {
                    Map<String, Object> facilityData = new HashMap<>();
                    facilityData.put("facility", stat[0]);
                    facilityData.put("bookingCount", stat[1]);
                    return facilityData;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> getMonthlyRevenueData() {
        List<Map<String, Object>> monthlyData = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        for (int i = 5; i >= 0; i--) {
            LocalDateTime startDate = now.minusMonths(i).with(TemporalAdjusters.firstDayOfMonth())
                    .withHour(0).withMinute(0).withSecond(0);
            LocalDateTime endDate = now.minusMonths(i).with(TemporalAdjusters.lastDayOfMonth())
                    .withHour(23).withMinute(59).withSecond(59);
            
            BigDecimal revenue = bookingRepository.getTotalRevenueInDateRange(startDate, endDate);
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", startDate.getMonth().toString());
            monthData.put("year", startDate.getYear());
            monthData.put("revenue", revenue != null ? revenue : BigDecimal.ZERO);
            
            monthlyData.add(monthData);
        }
        
        return monthlyData;
    }

    private List<Map<String, Object>> getBookingTrendsData() {
        List<Map<String, Object>> trends = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        for (int i = 6; i >= 0; i--) {
            LocalDateTime startDate = now.minusMonths(i).with(TemporalAdjusters.firstDayOfMonth())
                    .withHour(0).withMinute(0).withSecond(0);
            LocalDateTime endDate = now.minusMonths(i).with(TemporalAdjusters.lastDayOfMonth())
                    .withHour(23).withMinute(59).withSecond(59);
            
            Long bookingCount = bookingRepository.countBookingsInDateRange(startDate, endDate);
            
            Map<String, Object> trendData = new HashMap<>();
            trendData.put("month", startDate.getMonth().toString());
            trendData.put("year", startDate.getYear());
            trendData.put("bookingCount", bookingCount);
            
            trends.add(trendData);
        }
        
        return trends;
    }
}