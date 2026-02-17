package com.gym.management.repository;

import com.gym.management.model.GymSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for GymSettings entity
 * Provides CRUD operations and custom queries for gym configuration management
 */
@Repository
public interface GymSettingsRepository extends JpaRepository<GymSettings, Long> {

    /**
     * Find a setting by its key
     * @param settingKey The unique setting key
     * @return Optional containing the setting if found
     */
    Optional<GymSettings> findBySettingKey(String settingKey);

    /**
     * Find all settings of a specific type
     * @param settingType The type of settings (e.g., GYM_HOURS, PT_CONFIG)
     * @return List of settings of that type
     */
    List<GymSettings> findBySettingType(String settingType);

    /**
     * Find settings by type ordered by key
     * @param settingType The type of settings
     * @return List of settings ordered by key
     */
    @Query("SELECT s FROM GymSettings s WHERE s.settingType = :settingType " +
           "ORDER BY s.settingKey")
    List<GymSettings> findBySettingTypeOrderByKey(@Param("settingType") String settingType);

    /**
     * Check if a setting key exists
     * @param settingKey The setting key to check
     * @return true if exists, false otherwise
     */
    boolean existsBySettingKey(String settingKey);

    /**
     * Delete a setting by its key
     * @param settingKey The setting key to delete
     */
    void deleteBySettingKey(String settingKey);

    /**
     * Find settings by key pattern (for grouped settings)
     * @param keyPattern The pattern to match (e.g., "gym_hours_%")
     * @return List of matching settings
     */
    @Query("SELECT s FROM GymSettings s WHERE s.settingKey LIKE :keyPattern " +
           "ORDER BY s.settingKey")
    List<GymSettings> findBySettingKeyPattern(@Param("keyPattern") String keyPattern);

    /**
     * Count settings by type
     * @param settingType The type of settings
     * @return Count of settings
     */
    @Query("SELECT COUNT(s) FROM GymSettings s WHERE s.settingType = :settingType")
    Long countBySettingType(@Param("settingType") String settingType);
}
