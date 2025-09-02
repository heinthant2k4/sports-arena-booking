package com.asiattiger.booking.controller;

import com.asiattiger.booking.dto.BookingDTO;
import com.asiattiger.booking.dto.ApiResponse;
import com.asiattiger.booking.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "📅 Asian Tiger Bookings", description = "Sports facility booking management endpoints")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class BookingController {

    private final BookingService bookingService;

    @Operation(summary = "Get all bookings", description = "Retrieve all bookings in the system (Admin only)")
    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingDTO>>> getAllBookings() {
        try {
            log.info("📋 Fetching all bookings");
            List<BookingDTO> bookings = bookingService.getAllBookings();
            
            return ResponseEntity.ok(ApiResponse.<List<BookingDTO>>builder()
                .success(true)
                .data(bookings)
                .message("Successfully retrieved " + bookings.size() + " bookings")
                .count(bookings.size())
                .build());
                
        } catch (Exception e) {
            log.error("❌ Error fetching all bookings", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<List<BookingDTO>>builder()
                    .success(false)
                    .error("Failed to retrieve bookings: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Get user bookings", description = "Retrieve all bookings for a specific user")
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<BookingDTO>>> getBookingsByUserId(
            @Parameter(description = "User ID") 
            @PathVariable String userId) {
        try {
            log.info("👤 Fetching bookings for user: {}", userId);
            List<BookingDTO> bookings = bookingService.getBookingsByUserId(userId);
            
            return ResponseEntity.ok(ApiResponse.<List<BookingDTO>>builder()
                .success(true)
                .data(bookings)
                .message("Found " + bookings.size() + " bookings for user")
                .count(bookings.size())
                .build());
                
        } catch (Exception e) {
            log.error("❌ Error fetching bookings for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<List<BookingDTO>>builder()
                    .success(false)
                    .error("Failed to retrieve user bookings: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Get upcoming user bookings", description = "Retrieve upcoming bookings for a specific user")
    @GetMapping("/user/{userId}/upcoming")
    public ResponseEntity<ApiResponse<List<BookingDTO>>> getUpcomingBookingsByUserId(
            @Parameter(description = "User ID") 
            @PathVariable String userId) {
        try {
            log.info("⏰ Fetching upcoming bookings for user: {}", userId);
            List<BookingDTO> bookings = bookingService.getUpcomingBookingsByUserId(userId);
            
            return ResponseEntity.ok(ApiResponse.<List<BookingDTO>>builder()
                .success(true)
                .data(bookings)
                .message("Found " + bookings.size() + " upcoming bookings")
                .count(bookings.size())
                .build());
                
        } catch (Exception e) {
            log.error("❌ Error fetching upcoming bookings for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<List<BookingDTO>>builder()
                    .success(false)
                    .error("Failed to retrieve upcoming bookings: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Get past user bookings", description = "Retrieve past bookings for a specific user")
    @GetMapping("/user/{userId}/past")
    public ResponseEntity<ApiResponse<List<BookingDTO>>> getPastBookingsByUserId(
            @Parameter(description = "User ID") 
            @PathVariable String userId) {
        try {
            log.info("📅 Fetching past bookings for user: {}", userId);
            List<BookingDTO> bookings = bookingService.getPastBookingsByUserId(userId);
            
            return ResponseEntity.ok(ApiResponse.<List<BookingDTO>>builder()
                .success(true)
                .data(bookings)
                .message("Found " + bookings.size() + " past bookings")
                .count(bookings.size())
                .build());
                
        } catch (Exception e) {
            log.error("❌ Error fetching past bookings for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<List<BookingDTO>>builder()
                    .success(false)
                    .error("Failed to retrieve past bookings: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Get booking by ID", description = "Retrieve specific booking details")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingDTO>> getBookingById(
            @Parameter(description = "Booking ID") 
            @PathVariable Long id) {
        try {
            log.info("🔍 Fetching booking with ID: {}", id);
            BookingDTO booking = bookingService.getBookingById(id);
            
            return ResponseEntity.ok(ApiResponse.<BookingDTO>builder()
                .success(true)
                .data(booking)
                .message("Booking retrieved successfully")
                .build());
                
        } catch (RuntimeException e) {
            log.error("❌ Booking not found with ID: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.<BookingDTO>builder()
                    .success(false)
                    .error("Booking not found with ID: " + id)
                    .build());
        } catch (Exception e) {
            log.error("❌ Error fetching booking with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<BookingDTO>builder()
                    .success(false)
                    .error("Failed to retrieve booking: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Get facility bookings", description = "Retrieve all bookings for a specific facility")
    @GetMapping("/facility/{facilityId}")
    public ResponseEntity<ApiResponse<List<BookingDTO>>> getBookingsByFacility(
            @Parameter(description = "Facility ID") 
            @PathVariable Long facilityId) {
        try {
            log.info("🏟️ Fetching bookings for facility ID: {}", facilityId);
            List<BookingDTO> bookings = bookingService.getBookingsByFacility(facilityId);
            
            return ResponseEntity.ok(ApiResponse.<List<BookingDTO>>builder()
                .success(true)
                .data(bookings)
                .message("Found " + bookings.size() + " bookings for facility")
                .count(bookings.size())
                .build());
                
        } catch (RuntimeException e) {
            log.error("❌ Facility not found with ID: {}", facilityId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.<List<BookingDTO>>builder()
                    .success(false)
                    .error("Facility not found with ID: " + facilityId)
                    .build());
        } catch (Exception e) {
            log.error("❌ Error fetching facility bookings with ID: {}", facilityId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<List<BookingDTO>>builder()
                    .success(false)
                    .error("Failed to retrieve facility bookings: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Get bookings by status", description = "Filter bookings by status")
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<BookingDTO>>> getBookingsByStatus(
            @Parameter(description = "Booking status", example = "confirmed") 
            @PathVariable String status) {
        try {
            log.info("📊 Fetching bookings with status: {}", status);
            List<BookingDTO> bookings = bookingService.getBookingsByStatus(status);
            
            return ResponseEntity.ok(ApiResponse.<List<BookingDTO>>builder()
                .success(true)
                .data(bookings)
                .message("Found " + bookings.size() + " " + status + " bookings")
                .count(bookings.size())
                .build());
                
        } catch (Exception e) {
            log.error("❌ Error fetching bookings by status: {}", status, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<List<BookingDTO>>builder()
                    .success(false)
                    .error("Failed to retrieve bookings by status: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Get active bookings", description = "Retrieve all confirmed and pending bookings")
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<BookingDTO>>> getActiveBookings() {
        try {
            log.info("🔥 Fetching active bookings");
            List<BookingDTO> bookings = bookingService.getActiveBookings();
            
            return ResponseEntity.ok(ApiResponse.<List<BookingDTO>>builder()
                .success(true)
                .data(bookings)
                .message("Found " + bookings.size() + " active bookings")
                .count(bookings.size())
                .build());
                
        } catch (Exception e) {
            log.error("❌ Error fetching active bookings", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<List<BookingDTO>>builder()
                    .success(false)
                    .error("Failed to retrieve active bookings: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Get bookings in date range", description = "Retrieve bookings within specific date range")
    @GetMapping("/date-range")
    public ResponseEntity<ApiResponse<List<BookingDTO>>> getBookingsInDateRange(
            @Parameter(description = "Start date") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "End date") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            log.info("📆 Fetching bookings between {} and {}", startDate, endDate);
            List<BookingDTO> bookings = bookingService.getBookingsInDateRange(startDate, endDate);
            
            return ResponseEntity.ok(ApiResponse.<List<BookingDTO>>builder()
                .success(true)
                .data(bookings)
                .message("Found " + bookings.size() + " bookings in date range")
                .count(bookings.size())
                .build());
                
        } catch (Exception e) {
            log.error("❌ Error fetching bookings in date range", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<List<BookingDTO>>builder()
                    .success(false)
                    .error("Failed to retrieve bookings in date range: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Create new booking", description = "Book a facility for specific time slot")
    @PostMapping
    public ResponseEntity<ApiResponse<BookingDTO>> createBooking(
            @Valid @RequestBody BookingDTO bookingDTO) {
        try {
            log.info("➕ Creating new booking for user: {} at facility: {}", 
                    bookingDTO.getUserId(), bookingDTO.getFacilityId());
            BookingDTO createdBooking = bookingService.createBooking(bookingDTO);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<BookingDTO>builder()
                    .success(true)
                    .data(createdBooking)
                    .message("Booking created successfully")
                    .build());
                    
        } catch (RuntimeException e) {
            log.error("❌ Business logic error creating booking", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<BookingDTO>builder()
                    .success(false)
                    .error(e.getMessage())
                    .build());
        } catch (Exception e) {
            log.error("❌ Error creating booking", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<BookingDTO>builder()
                    .success(false)
                    .error("Failed to create booking: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Update booking", description = "Update existing booking details (pending bookings only)")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingDTO>> updateBooking(
            @Parameter(description = "Booking ID") 
            @PathVariable Long id,
            @Valid @RequestBody BookingDTO bookingDTO) {
        try {
            log.info("✏️ Updating booking with ID: {}", id);
            BookingDTO updatedBooking = bookingService.updateBooking(id, bookingDTO);
            
            return ResponseEntity.ok(ApiResponse.<BookingDTO>builder()
                .success(true)
                .data(updatedBooking)
                .message("Booking updated successfully")
                .build());
                
        } catch (RuntimeException e) {
            log.error("❌ Business logic error updating booking with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<BookingDTO>builder()
                    .success(false)
                    .error(e.getMessage())
                    .build());
        } catch (Exception e) {
            log.error("❌ Error updating booking with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<BookingDTO>builder()
                    .success(false)
                    .error("Failed to update booking: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Confirm booking", description = "Confirm a pending booking")
    @PostMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<BookingDTO>> confirmBooking(
            @Parameter(description = "Booking ID") 
            @PathVariable Long id) {
        try {
            log.info("✅ Confirming booking with ID: {}", id);
            BookingDTO confirmedBooking = bookingService.confirmBooking(id);
            
            return ResponseEntity.ok(ApiResponse.<BookingDTO>builder()
                .success(true)
                .data(confirmedBooking)
                .message("Booking confirmed successfully")
                .build());
                
        } catch (RuntimeException e) {
            log.error("❌ Error confirming booking with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<BookingDTO>builder()
                    .success(false)
                    .error(e.getMessage())
                    .build());
        } catch (Exception e) {
            log.error("❌ Error confirming booking with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<BookingDTO>builder()
                    .success(false)
                    .error("Failed to confirm booking: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Cancel booking", description = "Cancel a booking (with cancellation policy)")
    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingDTO>> cancelBooking(
            @Parameter(description = "Booking ID") 
            @PathVariable Long id) {
        try {
            log.info("❌ Cancelling booking with ID: {}", id);
            BookingDTO cancelledBooking = bookingService.cancelBooking(id);
            
            return ResponseEntity.ok(ApiResponse.<BookingDTO>builder()
                .success(true)
                .data(cancelledBooking)
                .message("Booking cancelled successfully")
                .build());
                
        } catch (RuntimeException e) {
            log.error("❌ Error cancelling booking with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<BookingDTO>builder()
                    .success(false)
                    .error(e.getMessage())
                    .build());
        } catch (Exception e) {
            log.error("❌ Error cancelling booking with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<BookingDTO>builder()
                    .success(false)
                    .error("Failed to cancel booking: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Complete booking", description = "Mark a booking as completed")
    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<BookingDTO>> completeBooking(
            @Parameter(description = "Booking ID") 
            @PathVariable Long id) {
        try {
            log.info("🏁 Completing booking with ID: {}", id);
            BookingDTO completedBooking = bookingService.completeBooking(id);
            
            return ResponseEntity.ok(ApiResponse.<BookingDTO>builder()
                .success(true)
                .data(completedBooking)
                .message("Booking completed successfully")
                .build());
                
        } catch (RuntimeException e) {
            log.error("❌ Error completing booking with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<BookingDTO>builder()
                    .success(false)
                    .error(e.getMessage())
                    .build());
        } catch (Exception e) {
            log.error("❌ Error completing booking with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<BookingDTO>builder()
                    .success(false)
                    .error("Failed to complete booking: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Check time slot availability", description = "Check if a time slot is available for booking")
    @GetMapping("/check-availability")
    public ResponseEntity<ApiResponse<Boolean>> checkTimeSlotAvailability(
            @Parameter(description = "Facility ID") 
            @RequestParam Long facilityId,
            @Parameter(description = "Start time") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @Parameter(description = "End time") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @Parameter(description = "Exclude booking ID (for updates)")
            @RequestParam(required = false) Long excludeBookingId) {
        try {
            log.info("🔍 Checking availability for facility {} from {} to {}", facilityId, startTime, endTime);
            
            boolean isAvailable = excludeBookingId != null 
                ? bookingService.isTimeSlotAvailable(facilityId, startTime, endTime, excludeBookingId)
                : bookingService.isTimeSlotAvailable(facilityId, startTime, endTime);
            
            String message = isAvailable ? "Time slot is available" : "Time slot is not available";
            
            return ResponseEntity.ok(ApiResponse.<Boolean>builder()
                .success(true)
                .data(isAvailable)
                .message(message)
                .build());
                
        } catch (RuntimeException e) {
            log.error("❌ Error checking availability", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Boolean>builder()
                    .success(false)
                    .error(e.getMessage())
                    .build());
        } catch (Exception e) {
            log.error("❌ Error checking time slot availability", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<Boolean>builder()
                    .success(false)
                    .error("Failed to check availability: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Get cancellable bookings", description = "Get bookings that can be cancelled by user")
    @GetMapping("/user/{userId}/cancellable")
    public ResponseEntity<ApiResponse<List<BookingDTO>>> getCancellableBookingsByUserId(
            @Parameter(description = "User ID") 
            @PathVariable String userId) {
        try {
            log.info("❌ Fetching cancellable bookings for user: {}", userId);
            List<BookingDTO> bookings = bookingService.getCancellableBookingsByUserId(userId);
            
            return ResponseEntity.ok(ApiResponse.<List<BookingDTO>>builder()
                .success(true)
                .data(bookings)
                .message("Found " + bookings.size() + " cancellable bookings")
                .count(bookings.size())
                .build());
                
        } catch (Exception e) {
            log.error("❌ Error fetching cancellable bookings for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<List<BookingDTO>>builder()
                    .success(false)
                    .error("Failed to retrieve cancellable bookings: " + e.getMessage())
                    .build());
        }
    }
}