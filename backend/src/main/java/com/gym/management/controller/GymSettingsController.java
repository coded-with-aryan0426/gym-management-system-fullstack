package com.gym.management.controller;

import com.gym.management.dto.GymHoursDTO;
import com.gym.management.dto.PTConfigDTO;
import com.gym.management.dto.BlackoutDayDTO;
import com.gym.management.model.Gym;
import com.gym.management.model.User;
import com.gym.management.repository.GymRepository;
import com.gym.management.repository.UserRepository;
import com.gym.management.security.CustomUserDetails;
import com.gym.management.service.GymSettingsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/settings/gym")
public class GymSettingsController {

    private static final Logger logger = LoggerFactory.getLogger(GymSettingsController.class);

    @Autowired
    private GymSettingsService gymSettingsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GymRepository gymRepository;

    @Autowired
    private com.gym.management.service.AuditLogService auditLogService;

    // ==================== Owner Profile ====================

    @GetMapping("/owner-profile")
    public ResponseEntity<Map<String, Object>> getOwnerProfile() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Map<String, Object> profile = new HashMap<>();

        // Registration data (from User entity)
        try {
            // Use a custom query to avoid eager loading issues
            String ownerName = userRepository.findFullNameByUserId(userId);
            String email = userRepository.findEmailByUserId(userId);
            String phone = userRepository.findPhoneByUserId(userId);

            profile.put("ownerName", ownerName != null ? ownerName : "");
            profile.put("email", email != null ? email : "");
            profile.put("phone", phone != null ? phone : "");
        } catch (Exception e) {
            System.err.println("Error loading user data: " + e.getMessage());
            // Fallback to empty values
            profile.put("ownerName", "");
            profile.put("email", "");
            profile.put("phone", "");
        }

        // Gym data
        try {
            Optional<Gym> gymOpt = gymRepository.findFirstByOwnerUserIdOrderByCreatedAtDesc(userId);
            if (gymOpt.isPresent()) {
                Gym gym = gymOpt.get();
                profile.put("gymId", gym.getGymId());
                profile.put("gymName", gym.getName() != null ? gym.getName() : "");
                profile.put("address", gym.getAddress() != null ? gym.getAddress() : "");
                profile.put("city", gym.getCity() != null ? gym.getCity() : "");
                profile.put("state", gym.getState() != null ? gym.getState() : "");
                profile.put("country", gym.getCountry() != null ? gym.getCountry() : "");
                profile.put("gymPhone", gym.getPhone() != null ? gym.getPhone() : "");
                profile.put("gymEmail", gym.getEmail() != null ? gym.getEmail() : "");
            }
        } catch (Exception e) {
            // Gym query may fail if owner_id column missing or no gym exists
        }

        // Extra settings from key-value store
        try {
            Map<String, String> allSettings = gymSettingsService.getAllSettings();
            profile.put("taxId", allSettings.getOrDefault("ownerTaxId", ""));
            profile.put("businessType", allSettings.getOrDefault("ownerBusinessType", "sole_proprietor"));
            profile.put("zipCode", allSettings.getOrDefault("ownerZipCode", ""));
        } catch (Exception e) {
            profile.put("taxId", "");
            profile.put("businessType", "sole_proprietor");
            profile.put("zipCode", "");
        }

        return ResponseEntity.ok(profile);
    }

    @PutMapping("/owner-profile")
    @Transactional
    public ResponseEntity<?> updateOwnerProfile(@RequestBody Map<String, Object> data) {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();

            // Update user fields
            if (data.containsKey("ownerName")) {
                user.setFullName((String) data.get("ownerName"));
            }
            if (data.containsKey("email")) {
                user.setEmail((String) data.get("email"));
            }
            if (data.containsKey("phone")) {
                user.setPhone((String) data.get("phone"));
            }
            userRepository.save(user);

            // Update gym fields
            Optional<Gym> gymOpt = gymRepository.findFirstByOwnerUserIdOrderByCreatedAtDesc(userId);

            if (gymOpt.isPresent()) {
                Gym gym = gymOpt.get();
                logger.debug("Updating gym profile for gym ID: {}", gym.getGymId());

                if (data.containsKey("gymName")) {
                    String gymName = (String) data.get("gymName");
                    if (gymName != null && !gymName.trim().isEmpty()) {
                        gym.setName(gymName.trim());
                    }
                }

                if (data.containsKey("address")) {
                    gym.setAddress((String) data.get("address"));
                }
                if (data.containsKey("city")) {
                    gym.setCity((String) data.get("city"));
                }
                if (data.containsKey("state")) {
                    gym.setState((String) data.get("state"));
                }
                if (data.containsKey("gymPhone")) {
                    gym.setPhone((String) data.get("gymPhone"));
                }
                if (data.containsKey("gymEmail")) {
                    gym.setEmail((String) data.get("gymEmail"));
                }
                gym.setUpdatedBy(userId);
                gymRepository.save(gym);
                logger.info("Gym profile updated successfully for gym ID: {}", gym.getGymId());
            } else {
                logger.info("Creating new gym for user ID: {}", userId);

                // Auto-create gym when none exists
                Gym newGym = new Gym();

                // Get the user entity for the owner relationship
                Optional<User> ownerUserOpt = userRepository.findById(userId);
                if (ownerUserOpt.isPresent()) {
                    newGym.setOwner(ownerUserOpt.get());
                }

                newGym.setCreatedBy(userId);
                newGym.setUpdatedBy(userId);

                if (data.containsKey("gymName")) {
                    String gymName = (String) data.get("gymName");
                    if (gymName != null && !gymName.trim().isEmpty()) {
                        newGym.setName(gymName.trim());
                    }
                }

                if (data.containsKey("address")) {
                    newGym.setAddress((String) data.get("address"));
                }
                if (data.containsKey("city")) {
                    newGym.setCity((String) data.get("city"));
                }
                if (data.containsKey("state")) {
                    newGym.setState((String) data.get("state"));
                }
                if (data.containsKey("gymPhone")) {
                    newGym.setPhone((String) data.get("gymPhone"));
                }
                if (data.containsKey("gymEmail")) {
                    newGym.setEmail((String) data.get("gymEmail"));
                }

                gymRepository.save(newGym);
                System.out.println("New gym created successfully with ID: " + newGym.getGymId());
            }

            // Save extra fields to key-value store
            if (data.containsKey("taxId")) {
                String taxId = (String) data.get("taxId");
                if (taxId != null && !taxId.trim().isEmpty()) {
                    Map<String, Object> taxIdMap = new HashMap<>();
                    taxIdMap.put("ownerTaxId", taxId.trim());
                    gymSettingsService.updateAllSettings(taxIdMap);
                }
            }
            if (data.containsKey("businessType")) {
                String businessType = (String) data.get("businessType");
                if (businessType != null && !businessType.trim().isEmpty()) {
                    Map<String, Object> businessTypeMap = new HashMap<>();
                    businessTypeMap.put("ownerBusinessType", businessType.trim());
                    gymSettingsService.updateAllSettings(businessTypeMap);
                }
            }
            if (data.containsKey("zipCode")) {
                String zipCode = (String) data.get("zipCode");
                if (zipCode != null && !zipCode.trim().isEmpty()) {
                    Map<String, Object> zipCodeMap = new HashMap<>();
                    zipCodeMap.put("ownerZipCode", zipCode.trim());
                    gymSettingsService.updateAllSettings(zipCodeMap);
                }
            }

            // Log the profile update to audit log
            try {
                Long gymId = gymRepository.findFirstByOwnerUserIdOrderByCreatedAtDesc(userId)
                        .map(Gym::getGymId).orElse(null);

                // Convert changes to proper JSON format
                String changesJson;
                try {
                    ObjectMapper mapper = new ObjectMapper();
                    changesJson = mapper.writeValueAsString(data);
                } catch (Exception e) {
                    changesJson = "{}";
                }

                auditLogService.logUpdate(
                        "PROFILE", // entity
                        user.getUserId().toString(), // entityId
                        user.getFullName(), // entityName
                        userId, // userId
                        gymId, // gymId
                        "Owner profile updated", // details
                        changesJson, // changes (proper JSON)
                        null // ipAddress
                );
            } catch (Exception auditEx) {
                System.err.println("Failed to log owner profile update: " + auditEx.getMessage());
            }

            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
        } catch (Exception e) {
            // Log the error and return a proper error response
            logger.error("Error updating owner profile: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update profile: " + e.getMessage()));
        }
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
            return ((CustomUserDetails) auth.getPrincipal()).getId();
        }
        return null;
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAllExceptions(Exception e) {
        logger.error("Exception in GymSettingsController: ", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error: " + e.getMessage(),
                        "trace", e.getClass().getSimpleName() + ": " + e.getMessage()));
    }

    // ==================== General Settings ====================

    @GetMapping("")
    public ResponseEntity<Map<String, String>> getAllSettings() {
        return ResponseEntity.ok(gymSettingsService.getAllSettings());
    }

    @PutMapping("")
    public ResponseEntity<Void> updateAllSettings(@RequestBody Map<String, Object> settings) {
        gymSettingsService.updateAllSettings(settings);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/gym-hours")
    public ResponseEntity<List<GymHoursDTO>> getGymHours() {
        List<GymHoursDTO> hours = gymSettingsService.getGymHours();
        return ResponseEntity.ok(hours);
    }

    @PutMapping("/gym-hours")
    public ResponseEntity<GymHoursDTO> updateGymHours(@Valid @RequestBody GymHoursDTO dto) {
        GymHoursDTO updated = gymSettingsService.updateGymHours(dto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/pt-config")
    public ResponseEntity<PTConfigDTO> getPTConfig() {
        PTConfigDTO config = gymSettingsService.getPTConfiguration();
        return ResponseEntity.ok(config);
    }

    @PutMapping("/pt-config")
    public ResponseEntity<PTConfigDTO> updatePTConfig(@Valid @RequestBody PTConfigDTO dto) {
        PTConfigDTO updated = gymSettingsService.updatePTConfiguration(dto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/blackout-days")
    public ResponseEntity<List<BlackoutDayDTO>> getBlackoutDays() {
        List<BlackoutDayDTO> blackoutDays = gymSettingsService.getBlackoutDays();
        return ResponseEntity.ok(blackoutDays);
    }

    @PostMapping("/blackout-days")
    public ResponseEntity<BlackoutDayDTO> addBlackoutDay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String reason) {
        try {
            BlackoutDayDTO created = gymSettingsService.addBlackoutDay(date, reason);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/blackout-days")
    public ResponseEntity<Void> deleteBlackoutDay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        gymSettingsService.deleteBlackoutDay(date);
        return ResponseEntity.noContent().build();
    }
}
