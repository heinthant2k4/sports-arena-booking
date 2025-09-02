package com.asiattiger.booking.repository;

import com.asiattiger.booking.entity.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {

    // Find active facilities
    List<Facility> findByIsActiveTrueOrderByNameAsc();

    // Find by type
    List<Facility> findByTypeAndIsActiveTrueOrderByHourlyRateAsc(String type);

    // Find by type (case insensitive)
    @Query("SELECT f FROM Facility f WHERE LOWER(f.type) = LOWER(:type) AND f.isActive = true ORDER BY f.hourlyRate ASC")
    List<Facility> findByTypeIgnoreCaseAndIsActiveTrue(@Param("type") String type);

    // Find available facilities (active and not under maintenance)
    @Query("SELECT f FROM Facility f WHERE f.isActive = true AND f.isUnderMaintenance = false ORDER BY f.name ASC")
    List<Facility> findAllAvailableForBooking();

    // Find by name (case insensitive, partial match)
    @Query("SELECT f FROM Facility f WHERE LOWER(f.name) LIKE LOWER(CONCAT('%', :name, '%')) AND f.isActive = true")
    List<Facility> findByNameContainingIgnoreCaseAndIsActiveTrue(@Param("name") String name);

    // Find facilities within price range
    @Query("SELECT f FROM Facility f WHERE f.hourlyRate BETWEEN :minRate AND :maxRate AND f.isActive = true ORDER BY f.hourlyRate ASC")
    List<Facility> findByHourlyRateBetweenAndIsActiveTrueOrderByHourlyRateAsc(
            @Param("minRate") BigDecimal minRate, 
            @Param("maxRate") BigDecimal maxRate);

    // Find facilities with minimum capacity
    @Query("SELECT f FROM Facility f WHERE f.capacity >= :minCapacity AND f.isActive = true ORDER BY f.capacity ASC")
    List<Facility> findByCapacityGreaterThanEqualAndIsActiveTrueOrderByCapacityAsc(@Param("minCapacity") Integer minCapacity);

    // Complex search query
    @Query("SELECT f FROM Facility f WHERE " +
           "(:type IS NULL OR LOWER(f.type) = LOWER(:type)) AND " +
           "(:minRate IS NULL OR f.hourlyRate >= :minRate) AND " +
           "(:maxRate IS NULL OR f.hourlyRate <= :maxRate) AND " +
           "(:minCapacity IS NULL OR f.capacity >= :minCapacity) AND " +
           "f.isActive = true AND f.isUnderMaintenance = false " +
           "ORDER BY f.hourlyRate ASC")
    List<Facility> findFacilitiesWithFilters(
            @Param("type") String type,
            @Param("minRate") BigDecimal minRate,
            @Param("maxRate") BigDecimal maxRate,
            @Param("minCapacity") Integer minCapacity);

    // Count active facilities by type
    @Query("SELECT COUNT(f) FROM Facility f WHERE LOWER(f.type) = LOWER(:type) AND f.isActive = true")
    Long countByTypeIgnoreCaseAndIsActiveTrue(@Param("type") String type);

    // Find facilities under maintenance
    List<Facility> findByIsUnderMaintenanceTrueAndIsActiveTrue();

    // Check if facility name exists (for uniqueness)
    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Facility f WHERE LOWER(f.name) = LOWER(:name) AND (:id IS NULL OR f.id != :id)")
    boolean existsByNameIgnoreCaseAndIdNot(@Param("name") String name, @Param("id") Long id);

    // Find popular facilities (with most bookings)
    @Query("SELECT f FROM Facility f LEFT JOIN f.bookings b " +
           "WHERE f.isActive = true AND f.isUnderMaintenance = false " +
           "GROUP BY f.id ORDER BY COUNT(b) DESC")
    List<Facility> findPopularFacilities();

    // Dashboard statistics
    @Query("SELECT COUNT(f) FROM Facility f WHERE f.isActive = true")
    Long countActiveFacilities();

    @Query("SELECT COUNT(f) FROM Facility f WHERE f.isActive = true AND f.isUnderMaintenance = true")
    Long countFacilitiesUnderMaintenance();

    @Query("SELECT AVG(f.hourlyRate) FROM Facility f WHERE f.isActive = true")
    BigDecimal getAverageHourlyRate();

    // Find by location
    @Query("SELECT f FROM Facility f WHERE LOWER(f.location) LIKE LOWER(CONCAT('%', :location, '%')) AND f.isActive = true")
    List<Facility> findByLocationContainingIgnoreCaseAndIsActiveTrue(@Param("location") String location);
}