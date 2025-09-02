package com.asiattiger.booking.controller;

import com.asiattiger.booking.dto.FacilityDTO;
import com.asiattiger.booking.dto.ApiResponse;
import com.asiattiger.booking.service.FacilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "🐅 Asian Tiger Facilities", description = "Elite sports facility management endpoints")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class FacilityController {

    private final FacilityService facilityService;

    @Operation(summary = "Get all active facilities", description = "Retrieve all available facilities for booking")
    @GetMapping
    public ResponseEntity<ApiResponse<List<FacilityDTO>>> getAllFacilities() {
        try {
            log.info("🏟️ Fetching all active facilities");
            List<FacilityDTO> facilities = facilityService.getAllActiveFacilities();
            
            return ResponseEntity.ok(ApiResponse.<List<FacilityDTO>>builder()
                .success(true)
                .data(facilities)
                .message("Successfully retrieved " + facilities.size() + " facilities")
                .build());
                
        } catch (Exception e) {
            log.error("❌ Error fetching facilities", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<List<FacilityDTO>>builder()
                    .success(false)
                    .error("Failed to retrieve facilities: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Get facilities by type", description = "Filter facilities by type (futsal or badminton)")
    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<FacilityDTO>>> getFacilitiesByType(
            @Parameter(description = "Facility type", example = "futsal")
            @PathVariable String type) {
        try {
            log.info("🎯 Fetching facilities of type: {}", type);
            List<FacilityDTO> facilities = facilityService.getFacilitiesByType(type);
            
            return ResponseEntity.ok(ApiResponse.<List<FacilityDTO>>builder()
                .success(true)
                .data(facilities)
                .message("Found " + facilities.size() + " " + type + " facilities")
                .build());
                
        } catch (Exception e) {
            log.error("❌ Error fetching facilities by type: {}", type, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<List<FacilityDTO>>builder()
                    .success(false)
                    .error("Failed to retrieve facilities by type: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Get facility by ID", description = "Retrieve specific facility details")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FacilityDTO>> getFacilityById(
            @Parameter(description = "Facility ID") 
            @PathVariable Long id) {
        try {
            log.info("🔍 Fetching facility with ID: {}", id);
            FacilityDTO facility = facilityService.getFacilityById(id);
            
            return ResponseEntity.ok(ApiResponse.<FacilityDTO>builder()
                .success(true)
                .data(facility)
                .message("Facility retrieved successfully")
                .build());
                
        } catch (RuntimeException e) {
            log.error("❌ Facility not found with ID: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.<FacilityDTO>builder()
                    .success(false)
                    .error("Facility not found with ID: " + id)
                    .build());
        } catch (Exception e) {
            log.error("❌ Error fetching facility with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<FacilityDTO>builder()
                    .success(false)
                    .error("Failed to retrieve facility: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Create new facility", description = "Add a new sports facility (Admin only)")
    @PostMapping
    public ResponseEntity<ApiResponse<FacilityDTO>> createFacility(
            @Valid @RequestBody FacilityDTO facilityDTO) {
        try {
            log.info("➕ Creating new facility: {}", facilityDTO.getName());
            FacilityDTO createdFacility = facilityService.createFacility(facilityDTO);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<FacilityDTO>builder()
                    .success(true)
                    .data(createdFacility)
                    .message("Facility created successfully: " + createdFacility.getName())
                    .build());
                    
        } catch (Exception e) {
            log.error("❌ Error creating facility", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<FacilityDTO>builder()
                    .success(false)
                    .error("Failed to create facility: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Update facility", description = "Update existing facility details (Admin only)")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FacilityDTO>> updateFacility(
            @Parameter(description = "Facility ID") 
            @PathVariable Long id,
            @Valid @RequestBody FacilityDTO facilityDTO) {
        try {
            log.info("✏️ Updating facility with ID: {}", id);
            FacilityDTO updatedFacility = facilityService.updateFacility(id, facilityDTO);
            
            return ResponseEntity.ok(ApiResponse.<FacilityDTO>builder()
                .success(true)
                .data(updatedFacility)
                .message("Facility updated successfully")
                .build());
                
        } catch (RuntimeException e) {
            log.error("❌ Facility not found for update with ID: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.<FacilityDTO>builder()
                    .success(false)
                    .error("Facility not found with ID: " + id)
                    .build());
        } catch (Exception e) {
            log.error("❌ Error updating facility with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<FacilityDTO>builder()
                    .success(false)
                    .error("Failed to update facility: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Delete facility", description = "Soft delete a facility (Admin only)")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFacility(
            @Parameter(description = "Facility ID") 
            @PathVariable Long id) {
        try {
            log.info("🗑️ Deleting facility with ID: {}", id);
            facilityService.deleteFacility(id);
            
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Facility deleted successfully")
                .build());
                
        } catch (RuntimeException e) {
            log.error("❌ Facility not found for deletion with ID: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.<Void>builder()
                    .success(false)
                    .error("Facility not found with ID: " + id)
                    .build());
        } catch (Exception e) {
            log.error("❌ Error deleting facility with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<Void>builder()
                    .success(false)
                    .error("Failed to delete facility: " + e.getMessage())
                    .build());
        }
    }

    @Operation(summary = "Initialize sample facilities", description = "Populate database with sample Asian Tiger facilities")
    @PostMapping("/seed")
    public ResponseEntity<ApiResponse<List<FacilityDTO>>> seedFacilities() {
        try {
            log.info("🌱 Seeding sample facilities for Asian Tiger");
            List<FacilityDTO> seededFacilities = facilityService.seedSampleFacilities();
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<List<FacilityDTO>>builder()
                    .success(true)
                    .data(seededFacilities)
                    .message("Successfully seeded " + seededFacilities.size() + " sample facilities")
                    .build());
                    
        } catch (Exception e) {
            log.error("❌ Error seeding facilities", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<List<FacilityDTO>>builder()
                    .success(false)
                    .error("Failed to seed facilities: " + e.getMessage())
                    .build());
        }
    }
}