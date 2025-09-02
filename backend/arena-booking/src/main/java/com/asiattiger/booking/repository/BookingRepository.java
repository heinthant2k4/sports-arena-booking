package com.asiattiger.booking.repository;

import com.asiattiger.booking.entity.Booking;
import com.asiattiger.booking.entity.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Find bookings by user
    List<Booking> findByUserIdOrderByStartTimeDesc(String userId);

    // Find bookings by facility
    List<Booking> findByFacilityOrderByStartTimeAsc(Facility facility);

    // Find active bookings (confirmed or pending)
    @Query("SELECT b FROM Booking b WHERE b.status IN ('confirmed', 'pending') ORDER BY b.startTime ASC")
    List<Booking> findActiveBookings();

    // Find bookings by status
    List<Booking> findByStatusOrderByStartTimeDesc(String status);

    // Check for conflicting bookings (same facility, overlapping time)
    @Query("SELECT b FROM Booking b WHERE b.facility = :facility AND " +
           "b.status IN ('confirmed', 'pending') AND " +
           "((b.startTime < :endTime AND b.endTime > :startTime))")
    List<Booking> findConflictingBookings(
            @Param("facility") Facility facility,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    // Check for conflicting bookings excluding specific booking (for updates)
    @Query("SELECT b FROM Booking b WHERE b.facility = :facility AND " +
           "b.id != :excludeId AND " +
           "b.status IN ('confirmed', 'pending') AND " +
           "((b.startTime < :endTime AND b.endTime > :startTime))")
    List<Booking> findConflictingBookingsExcluding(
            @Param("facility") Facility facility,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("excludeId") Long excludeId);

    // Find bookings in date range
    @Query("SELECT b FROM Booking b WHERE b.startTime >= :startDate AND b.endTime <= :endDate ORDER BY b.startTime ASC")
    List<Booking> findBookingsInDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Find upcoming bookings for a user
    @Query("SELECT b FROM Booking b WHERE b.userId = :userId AND " +
           "b.startTime > :now AND b.status IN ('confirmed', 'pending') " +
           "ORDER BY b.startTime ASC")
    List<Booking> findUpcomingBookingsByUserId(
            @Param("userId") String userId,
            @Param("now") LocalDateTime now);

    // Find past bookings for a user
    @Query("SELECT b FROM Booking b WHERE b.userId = :userId AND " +
           "b.endTime < :now ORDER BY b.startTime DESC")
    List<Booking> findPastBookingsByUserId(
            @Param("userId") String userId,
            @Param("now") LocalDateTime now);

    // Count bookings by facility
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.facility = :facility AND b.status != 'cancelled'")
    Long countBookingsByFacility(@Param("facility") Facility facility);

    // Find bookings that can be cancelled (future bookings with confirmed/pending status)
    @Query("SELECT b FROM Booking b WHERE b.userId = :userId AND " +
           "b.status IN ('confirmed', 'pending') AND " +
           "b.startTime > :cutoffTime ORDER BY b.startTime ASC")
    List<Booking> findCancellableBookingsByUserId(
            @Param("userId") String userId,
            @Param("cutoffTime") LocalDateTime cutoffTime);

    // Dashboard statistics
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = 'confirmed'")
    Long countConfirmedBookings();

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = 'pending'")
    Long countPendingBookings();

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = 'cancelled'")
    Long countCancelledBookings();

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.startTime >= :startDate AND b.endTime <= :endDate")
    Long countBookingsInDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Revenue calculations
    @Query("SELECT SUM(b.totalCost) FROM Booking b WHERE b.status = 'confirmed' AND " +
           "b.startTime >= :startDate AND b.endTime <= :endDate")
    java.math.BigDecimal getTotalRevenueInDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Popular time slots
    @Query("SELECT HOUR(b.startTime) as hour, COUNT(b) as count FROM Booking b " +
           "WHERE b.status IN ('confirmed', 'completed') " +
           "GROUP BY HOUR(b.startTime) ORDER BY count DESC")
    List<Object[]> findPopularTimeSlots();

    // Find facility usage statistics
    @Query("SELECT b.facility, COUNT(b) as bookingCount FROM Booking b " +
           "WHERE b.status IN ('confirmed', 'completed') " +
           "GROUP BY b.facility ORDER BY bookingCount DESC")
    List<Object[]> getFacilityUsageStatistics();
}