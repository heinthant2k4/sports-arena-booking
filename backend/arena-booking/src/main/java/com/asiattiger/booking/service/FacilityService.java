package com.asiattiger.booking.service;

import com.asiattiger.booking.dto.FacilityDTO;
import com.asiattiger.booking.entity.Facility;
import com.asiattiger.booking.repository.FacilityRepository;
import com.asiattiger.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FacilityService {

    private final FacilityRepository facilityRepository;
    private final BookingRepository bookingRepository;

    // ==================== READ OPERATIONS ====================

    @Transactional(readOnly = true)
    public List<FacilityDTO> getAllActiveFacilities() {
        log.info("🏟️ Fetching all active facilities");
        List<Facility> facilities = facilityRepository.findByIsActiveTrueOrderByNameAsc();
        
        return facilities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FacilityDTO> getFacilitiesByType(String type) {
        log.info("🎯 Fetching facilities of type: {}", type);
        List<Facility> facilities = facilityRepository.findByTypeIgnoreCaseAndIsActiveTrue(type);
        
        return facilities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FacilityDTO getFacilityById(Long id) {
        log.info("🔍 Fetching facility with ID: {}", id);
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found with ID: " + id));
        
        return convertToDTO(facility);
    }

    @Transactional(readOnly = true)
    public List<FacilityDTO> getAvailableFacilities() {
        log.info("✅ Fetching available facilities for booking");
        List<Facility> facilities = facilityRepository.findAllAvailableForBooking();
        
        return facilities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FacilityDTO> searchFacilities(String name) {
        log.info("🔎 Searching facilities with name containing: {}", name);
        List<Facility> facilities = facilityRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(name);
        
        return facilities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FacilityDTO> getFacilitiesByPriceRange(BigDecimal minRate, BigDecimal maxRate) {
        log.info("💰 Fetching facilities in price range: {} - {}", minRate, maxRate);
        List<Facility> facilities = facilityRepository.findByHourlyRateBetweenAndIsActiveTrueOrderByHourlyRateAsc(minRate, maxRate);
        
        return facilities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FacilityDTO> getFacilitiesWithFilters(String type, BigDecimal minRate, 
                                                     BigDecimal maxRate, Integer minCapacity) {
        log.info("🎛️ Fetching facilities with filters - type: {}, price: {}-{}, capacity: {}+", 
                type, minRate, maxRate, minCapacity);
        
        List<Facility> facilities = facilityRepository.findFacilitiesWithFilters(type, minRate, maxRate, minCapacity);
        
        return facilities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FacilityDTO> getPopularFacilities() {
        log.info("🔥 Fetching popular facilities");
        List<Facility> facilities = facilityRepository.findPopularFacilities();
        
        return facilities.stream()
                .limit(10) // Top 10 popular facilities
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ==================== WRITE OPERATIONS ====================

    public FacilityDTO createFacility(FacilityDTO facilityDTO) {
        log.info("➕ Creating new facility: {}", facilityDTO.getName());
        
        // Check if facility name already exists
        if (facilityRepository.existsByNameIgnoreCaseAndIdNot(facilityDTO.getName(), null)) {
            throw new RuntimeException("Facility with name '" + facilityDTO.getName() + "' already exists");
        }
        
        Facility facility = convertToEntity(facilityDTO);
        facility.setCreatedBy("system"); // In real app, get from security context
        
        Facility savedFacility = facilityRepository.save(facility);
        log.info("✅ Successfully created facility: {} with ID: {}", savedFacility.getName(), savedFacility.getId());
        
        return convertToDTO(savedFacility);
    }

    public FacilityDTO updateFacility(Long id, FacilityDTO facilityDTO) {
        log.info("✏️ Updating facility with ID: {}", id);
        
        Facility existingFacility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found with ID: " + id));
        
        // Check if name is being changed and if it conflicts with another facility
        if (!existingFacility.getName().equalsIgnoreCase(facilityDTO.getName())) {
            if (facilityRepository.existsByNameIgnoreCaseAndIdNot(facilityDTO.getName(), id)) {
                throw new RuntimeException("Facility with name '" + facilityDTO.getName() + "' already exists");
            }
        }
        
        updateFacilityFromDTO(existingFacility, facilityDTO);
        Facility updatedFacility = facilityRepository.save(existingFacility);
        
        log.info("✅ Successfully updated facility: {}", updatedFacility.getName());
        return convertToDTO(updatedFacility);
    }

    public void deleteFacility(Long id) {
        log.info("🗑️ Soft deleting facility with ID: {}", id);
        
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found with ID: " + id));
        
        // Check if there are active bookings
        Long activeBookings = bookingRepository.countBookingsByFacility(facility);
        if (activeBookings > 0) {
            log.warn("⚠️ Facility has {} active bookings, setting inactive instead of deleting", activeBookings);
            facility.setIsActive(false);
            facilityRepository.save(facility);
        } else {
            facility.setIsActive(false);
            facilityRepository.save(facility);
        }
        
        log.info("✅ Successfully soft deleted facility: {}", facility.getName());
    }

    // ==================== UTILITY OPERATIONS ====================

    public List<FacilityDTO> seedSampleFacilities() {
        log.info("🌱 Seeding sample Asian Tiger facilities");
        
        List<Facility> sampleFacilities = Arrays.asList(
                createSampleFacility("Asian Tiger Futsal Court A", "futsal", 
                    "Premium indoor futsal court with artificial grass", 
                    new BigDecimal("80.00"), 12, "Ground Floor, Main Building",
                    "Air conditioning, LED lighting, Score board, Premium artificial turf"),
                
                createSampleFacility("Asian Tiger Futsal Court B", "futsal", 
                    "Standard futsal court perfect for casual games", 
                    new BigDecimal("70.00"), 12, "Ground Floor, Main Building",
                    "LED lighting, Score board, Quality artificial turf"),
                
                createSampleFacility("Asian Tiger Badminton Court 1", "badminton", 
                    "Professional badminton court with wooden flooring", 
                    new BigDecimal("45.00"), 4, "First Floor, Sports Complex",
                    "Wooden floor, Professional nets, Air conditioning, Spectator seating"),
                
                createSampleFacility("Asian Tiger Badminton Court 2", "badminton", 
                    "Standard badminton court for recreational play", 
                    new BigDecimal("40.00"), 4, "First Floor, Sports Complex",
                    "Synthetic floor, Professional nets, Good ventilation"),
                
                createSampleFacility("Asian Tiger Basketball Court", "basketball", 
                    "Full-size basketball court with professional standards", 
                    new BigDecimal("100.00"), 20, "Main Arena",
                    "Wooden floor, Adjustable hoops, Scoreboard, Spectator stands, Air conditioning"),
                
                createSampleFacility("Asian Tiger Tennis Court", "tennis", 
                    "Outdoor tennis court with professional surface", 
                    new BigDecimal("60.00"), 4, "Outdoor Complex",
                    "Professional surface, Net system, Lighting for night play")
        );
        
        List<Facility> savedFacilities = facilityRepository.saveAll(sampleFacilities);
        log.info("✅ Successfully seeded {} sample facilities", savedFacilities.size());
        
        return savedFacilities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Long getTotalActiveFacilities() {
        return facilityRepository.countActiveFacilities();
    }

    @Transactional(readOnly = true)
    public Long getFacilitiesUnderMaintenance() {
        return facilityRepository.countFacilitiesUnderMaintenance();
    }

    @Transactional(readOnly = true)
    public BigDecimal getAverageHourlyRate() {
        return facilityRepository.getAverageHourlyRate();
    }

    // ==================== CONVERSION METHODS ====================

    private FacilityDTO convertToDTO(Facility facility) {
        FacilityDTO dto = FacilityDTO.builder()
                .id(facility.getId())
                .name(facility.getName())
                .type(facility.getType())
                .description(facility.getDescription())
                .hourlyRate(facility.getHourlyRate())
                .capacity(facility.getCapacity())
                .location(facility.getLocation())
                .isActive(facility.getIsActive())
                .amenities(facility.getAmenities())
                .imageUrl(facility.getImageUrl())
                .openingTime(facility.getOpeningTime())
                .closingTime(facility.getClosingTime())
                .isUnderMaintenance(facility.getIsUnderMaintenance())
                .maintenanceNote(facility.getMaintenanceNote())
                .createdBy(facility.getCreatedBy())
                .createdAt(facility.getCreatedAt())
                .updatedAt(facility.getUpdatedAt())
                .build();

        // Set computed fields
        dto.setDisplayName(facility.getDisplayName());
        dto.setStatusDisplay(facility.getStatusDisplay());
        dto.setAvailableForBooking(facility.isAvailableForBooking());
        
        // Count active bookings for this facility
        Long activeBookings = bookingRepository.countBookingsByFacility(facility);
        dto.setActiveBookingsCount(activeBookings != null ? activeBookings.intValue() : 0);

        return dto;
    }

    private Facility convertToEntity(FacilityDTO dto) {
        Facility facility = new Facility();
        updateFacilityFromDTO(facility, dto);
        return facility;
    }

    private void updateFacilityFromDTO(Facility facility, FacilityDTO dto) {
        facility.setName(dto.getName());
        facility.setType(dto.getType().toLowerCase());
        facility.setDescription(dto.getDescription());
        facility.setHourlyRate(dto.getHourlyRate());
        facility.setCapacity(dto.getCapacity());
        facility.setLocation(dto.getLocation());
        
        if (dto.getIsActive() != null) {
            facility.setIsActive(dto.getIsActive());
        }
        
        facility.setAmenities(dto.getAmenities());
        facility.setImageUrl(dto.getImageUrl());
        facility.setOpeningTime(dto.getOpeningTime() != null ? dto.getOpeningTime() : "06:00");
        facility.setClosingTime(dto.getClosingTime() != null ? dto.getClosingTime() : "23:00");
        
        if (dto.getIsUnderMaintenance() != null) {
            facility.setIsUnderMaintenance(dto.getIsUnderMaintenance());
        }
        
        facility.setMaintenanceNote(dto.getMaintenanceNote());
        facility.setCreatedBy(dto.getCreatedBy());
    }

    private Facility createSampleFacility(String name, String type, String description, 
                                        BigDecimal hourlyRate, Integer capacity, String location, 
                                        String amenities) {
        Facility facility = new Facility();
        facility.setName(name);
        facility.setType(type);
        facility.setDescription(description);
        facility.setHourlyRate(hourlyRate);
        facility.setCapacity(capacity);
        facility.setLocation(location);
        facility.setAmenities(amenities);
        facility.setIsActive(true);
        facility.setIsUnderMaintenance(false);
        facility.setOpeningTime("06:00");
        facility.setClosingTime("23:00");
        facility.setCreatedBy("seed-system");
        
        // Set appropriate image URLs based on type
        switch (type.toLowerCase()) {
            case "futsal":
                facility.setImageUrl("https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500");
                break;
            case "badminton":
                facility.setImageUrl("https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500");
                break;
            case "basketball":
                facility.setImageUrl("https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500");
                break;
            case "tennis":
                facility.setImageUrl("https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500");
                break;
            default:
                facility.setImageUrl("https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500");
        }
        
        return facility;
    }
}