package com.asiattiger.booking.service;

import com.asiattiger.booking.dto.BookingDTO;
import com.asiattiger.booking.entity.Booking;
import com.asiattiger.booking.entity.Facility;
import com.asiattiger.booking.repository.BookingRepository;
import com.asiattiger.booking.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FacilityRepository facilityRepository;

    // ==================== READ OPERATIONS ====================

    @Transactional(readOnly = true)
    public List<BookingDTO> getAllBookings() {
        log.info("📋 Fetching all bookings");
        List<Booking> bookings = bookingRepository.findAll();
        
        return bookings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getBookingsByUserId(String userId) {
        log.info("👤 Fetching bookings for user: {}", userId);
        List<Booking> bookings = bookingRepository.findByUserIdOrderByStartTimeDesc(userId);
        
        return bookings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getUpcomingBookingsByUserId(String userId) {
        log.info("⏰ Fetching upcoming bookings for user: {}", userId);
        LocalDateTime now = LocalDateTime.now();
        List<Booking> bookings = bookingRepository.findUpcomingBookingsByUserId(userId, now);
        
        return bookings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getPastBookingsByUserId(String userId) {
        log.info("📅 Fetching past bookings for user: {}", userId);
        LocalDateTime now = LocalDateTime.now();
        List<Booking> bookings = bookingRepository.findPastBookingsByUserId(userId, now);
        
        return bookings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingDTO getBookingById(Long id) {
        log.info("🔍 Fetching booking with ID: {}", id);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + id));
        
        return convertToDTO(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getBookingsByFacility(Long facilityId) {
        log.info("🏟️ Fetching bookings for facility ID: {}", facilityId);
        
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new RuntimeException("Facility not found with ID: " + facilityId));
        
        List<Booking> bookings = bookingRepository.findByFacilityOrderByStartTimeAsc(facility);
        
        return bookings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getBookingsByStatus(String status) {
        log.info("📊 Fetching bookings with status: {}", status);
        List<Booking> bookings = bookingRepository.findByStatusOrderByStartTimeDesc(status);
        
        return bookings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getActiveBookings() {
        log.info("🔥 Fetching active bookings");
        List<Booking> bookings = bookingRepository.findActiveBookings();
        
        return bookings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getBookingsInDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("📆 Fetching bookings between {} and {}", startDate, endDate);
        List<Booking> bookings = bookingRepository.findBookingsInDateRange(startDate, endDate);
        
        return bookings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getCancellableBookingsByUserId(String userId) {
        log.info("❌ Fetching cancellable bookings for user: {}", userId);
        LocalDateTime cutoffTime = LocalDateTime.now().plusHours(2); // 2-hour cancellation policy
        List<Booking> bookings = bookingRepository.findCancellableBookingsByUserId(userId, cutoffTime);
        
        return bookings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ==================== BOOKING OPERATIONS ====================

    public BookingDTO createBooking(BookingDTO bookingDTO) {
        log.info("➕ Creating new booking for user: {} at facility: {}", 
                bookingDTO.getUserId(), bookingDTO.getFacilityId());
        
        // Validate and get facility
        Facility facility = facilityRepository.findById(bookingDTO.getFacilityId())
                .orElseThrow(() -> new RuntimeException("Facility not found with ID: " + bookingDTO.getFacilityId()));
        
        // Check if facility is available for booking
        if (!facility.isAvailableForBooking()) {
            throw new RuntimeException("Facility '" + facility.getName() + "' is not available for booking");
        }
        
        // Validate booking times
        validateBookingTimes(bookingDTO.getStartTime(), bookingDTO.getEndTime());
        
        // Check for conflicting bookings
        List<Booking> conflictingBookings = bookingRepository.findConflictingBookings(
                facility, bookingDTO.getStartTime(), bookingDTO.getEndTime());
        
        if (!conflictingBookings.isEmpty()) {
            throw new RuntimeException("Time slot conflicts with existing booking. Please choose different time.");
        }
        
        // Create booking entity
        Booking booking = convertToEntity(bookingDTO);
        booking.setFacility(facility);
        booking.setStatus("pending");
        
        // Calculate total cost
        double hours = Duration.between(booking.getStartTime(), booking.getEndTime()).toMinutes() / 60.0;
        booking.setTotalCost(facility.getHourlyRate().multiply(BigDecimal.valueOf(hours)));
        
        Booking savedBooking = bookingRepository.save(booking);
        log.info("✅ Successfully created booking with ID: {}", savedBooking.getId());
        
        return convertToDTO(savedBooking);
    }

    public BookingDTO updateBooking(Long id, BookingDTO bookingDTO) {
        log.info("✏️ Updating booking with ID: {}", id);
        
        Booking existingBooking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + id));
        
        // Only allow updates for pending bookings
        if (!"pending".equals(existingBooking.getStatus())) {
            throw new RuntimeException("Can only update pending bookings. Current status: " + existingBooking.getStatus());
        }
        
        // Validate new booking times
        if (bookingDTO.getStartTime() != null && bookingDTO.getEndTime() != null) {
            validateBookingTimes(bookingDTO.getStartTime(), bookingDTO.getEndTime());
            
            // Check for conflicts (excluding current booking)
            List<Booking> conflictingBookings = bookingRepository.findConflictingBookingsExcluding(
                    existingBooking.getFacility(), 
                    bookingDTO.getStartTime(), 
                    bookingDTO.getEndTime(), 
                    id);
            
            if (!conflictingBookings.isEmpty()) {
                throw new RuntimeException("New time slot conflicts with existing booking. Please choose different time.");
            }
        }
        
        // Update booking fields
        updateBookingFromDTO(existingBooking, bookingDTO);
        
        // Recalculate total cost if times changed
        if (bookingDTO.getStartTime() != null && bookingDTO.getEndTime() != null) {
            double hours = Duration.between(existingBooking.getStartTime(), existingBooking.getEndTime()).toMinutes() / 60.0;
            existingBooking.setTotalCost(existingBooking.getFacility().getHourlyRate().multiply(BigDecimal.valueOf(hours)));
        }
        
        Booking updatedBooking = bookingRepository.save(existingBooking);
        log.info("✅ Successfully updated booking with ID: {}", updatedBooking.getId());
        
        return convertToDTO(updatedBooking);
    }

    public BookingDTO confirmBooking(Long id) {
        log.info("✅ Confirming booking with ID: {}", id);
        
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + id));
        
        if (!"pending".equals(booking.getStatus())) {
            throw new RuntimeException("Can only confirm pending bookings. Current status: " + booking.getStatus());
        }
        
        booking.setStatus("confirmed");
        Booking confirmedBooking = bookingRepository.save(booking);
        
        log.info("✅ Successfully confirmed booking with ID: {}", confirmedBooking.getId());
        return convertToDTO(confirmedBooking);
    }

    public BookingDTO cancelBooking(Long id) {
        log.info("❌ Cancelling booking with ID: {}", id);
        
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + id));
        
        if (!booking.canBeCancelled()) {
            throw new RuntimeException("Booking cannot be cancelled. Either it's not in cancellable status or it's too close to start time.");
        }
        
        booking.setStatus("cancelled");
        Booking cancelledBooking = bookingRepository.save(booking);
        
        log.info("✅ Successfully cancelled booking with ID: {}", cancelledBooking.getId());
        return convertToDTO(cancelledBooking);
    }

    public BookingDTO completeBooking(Long id) {
        log.info("🏁 Completing booking with ID: {}", id);
        
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + id));
        
        if (!"confirmed".equals(booking.getStatus())) {
            throw new RuntimeException("Can only complete confirmed bookings. Current status: " + booking.getStatus());
        }
        
        // Check if booking end time has passed
        if (LocalDateTime.now().isBefore(booking.getEndTime())) {
            throw new RuntimeException("Cannot complete booking before its end time");
        }
        
        booking.setStatus("completed");
        Booking completedBooking = bookingRepository.save(booking);
        
        log.info("✅ Successfully completed booking with ID: {}", completedBooking.getId());
        return convertToDTO(completedBooking);
    }

    // ==================== VALIDATION & UTILITY METHODS ====================

    private void validateBookingTimes(LocalDateTime startTime, LocalDateTime endTime) {
        LocalDateTime now = LocalDateTime.now();
        
        // Start time must be in the future
        if (startTime.isBefore(now)) {
            throw new RuntimeException("Start time must be in the future");
        }
        
        // End time must be after start time
        if (endTime.isBefore(startTime) || endTime.equals(startTime)) {
            throw new RuntimeException("End time must be after start time");
        }
        
        // Minimum booking duration: 1 hour
        long minutes = Duration.between(startTime, endTime).toMinutes();
        if (minutes < 60) {
            throw new RuntimeException("Minimum booking duration is 1 hour");
        }
        
        // Maximum booking duration: 8 hours
        if (minutes > 480) {
            throw new RuntimeException("Maximum booking duration is 8 hours");
        }
        
        // Booking must be within 30 days from now
        if (startTime.isAfter(now.plusDays(30))) {
            throw new RuntimeException("Cannot book more than 30 days in advance");
        }
    }

    @Transactional(readOnly = true)
    public boolean isTimeSlotAvailable(Long facilityId, LocalDateTime startTime, LocalDateTime endTime) {
        return isTimeSlotAvailable(facilityId, startTime, endTime, null);
    }

    @Transactional(readOnly = true)
    public boolean isTimeSlotAvailable(Long facilityId, LocalDateTime startTime, LocalDateTime endTime, Long excludeBookingId) {
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new RuntimeException("Facility not found with ID: " + facilityId));
        
        List<Booking> conflictingBookings;
        if (excludeBookingId != null) {
            conflictingBookings = bookingRepository.findConflictingBookingsExcluding(
                    facility, startTime, endTime, excludeBookingId);
        } else {
            conflictingBookings = bookingRepository.findConflictingBookings(facility, startTime, endTime);
        }
        
        return conflictingBookings.isEmpty();
    }

    // ==================== STATISTICS & REPORTS ====================

    @Transactional(readOnly = true)
    public Long getTotalBookings() {
        return (long) bookingRepository.findAll().size();
    }

    @Transactional(readOnly = true)
    public Long getConfirmedBookingsCount() {
        return bookingRepository.countConfirmedBookings();
    }

    @Transactional(readOnly = true)
    public Long getPendingBookingsCount() {
        return bookingRepository.countPendingBookings();
    }

    @Transactional(readOnly = true)
    public Long getCancelledBookingsCount() {
        return bookingRepository.countCancelledBookings();
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalRevenue(LocalDateTime startDate, LocalDateTime endDate) {
        BigDecimal revenue = bookingRepository.getTotalRevenueInDateRange(startDate, endDate);
        return revenue != null ? revenue : BigDecimal.ZERO;
    }

    @Transactional(readOnly = true)
    public Long getBookingsCountInDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return bookingRepository.countBookingsInDateRange(startDate, endDate);
    }

    // ==================== CONVERSION METHODS ====================

    private BookingDTO convertToDTO(Booking booking) {
        return BookingDTO.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .facilityId(booking.getFacility().getId())
                .facilityName(booking.getFacilityName())
                .facilityType(booking.getFacilityType())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .status(booking.getStatus())
                .purpose(booking.getPurpose())
                .totalCost(booking.getTotalCost())
                .userName(booking.getUserName())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .durationInHours(booking.getDurationInHoursAsDouble())
                .canBeCancelled(booking.canBeCancelled())
                .isActive(booking.isActive())
                .build();
    }

    private Booking convertToEntity(BookingDTO dto) {
        Booking booking = new Booking();
        updateBookingFromDTO(booking, dto);
        return booking;
    }

    private void updateBookingFromDTO(Booking booking, BookingDTO dto) {
        if (dto.getUserId() != null) {
            booking.setUserId(dto.getUserId());
        }
        if (dto.getStartTime() != null) {
            booking.setStartTime(dto.getStartTime());
        }
        if (dto.getEndTime() != null) {
            booking.setEndTime(dto.getEndTime());
        }
        if (dto.getPurpose() != null) {
            booking.setPurpose(dto.getPurpose());
        }
        if (dto.getUserName() != null) {
            booking.setUserName(dto.getUserName());
        }
    }
}