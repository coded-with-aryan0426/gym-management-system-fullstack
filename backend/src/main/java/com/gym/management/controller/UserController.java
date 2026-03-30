package com.gym.management.controller;

import com.gym.management.model.User;
import com.gym.management.model.Role;
import com.gym.management.model.TrainerDetails;
import com.gym.management.model.TrainerCompensationRule;
import com.gym.management.model.CheckIn;
import com.gym.management.dto.trainer.TrainerProfileDTO;
import com.gym.management.dto.UserProfileDTO;
import com.gym.management.repository.TrainerDetailsRepository;
import com.gym.management.repository.TrainerCompensationRuleRepository;
import com.gym.management.repository.CheckInRepository;
import com.gym.management.repository.SessionRatingRepository;
import com.gym.management.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private TrainerDetailsRepository trainerDetailsRepository;

    @Autowired
    private SessionRatingRepository sessionRatingRepository;

    @Autowired
    private TrainerCompensationRuleRepository compensationRuleRepository;

    @Autowired
    private CheckInRepository checkInRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping
    public List<UserProfileDTO> getUsers(@RequestParam(required = false) String role) {
        List<User> users;
        if (role != null) {
            users = userService.getUsersByRole(role.toUpperCase());
        } else {
            users = userService.getAllUsers();
        }
        return users.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @GetMapping("/members/plan-names")
    public ResponseEntity<?> getDistinctPlanNames() {
        try {
            return ResponseEntity.ok(userService.getDistinctMemberPlanNames());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/members/assign-random-packages")
    public ResponseEntity<?> assignRandomMembershipPackages() {
        try {
            return ResponseEntity.ok(userService.randomlyAssignMembershipPackages());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/members")
    public ResponseEntity<?> getMembers() {
        try {
            return ResponseEntity.ok(userService.getAllMembers());
        } catch (Exception e) {
            log.error("Failed to retrieve members", e);
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", "Failed to retrieve members. Please try again."));
        }
    }

    @GetMapping("/members/paginated")
    public ResponseEntity<?> getMembersPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String plan) {
        try {
            return ResponseEntity.ok(userService.getMembersPaginated(page, size, search, status, plan));
        } catch (Exception e) {
            log.error("Failed to retrieve paginated members", e);
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", "Failed to retrieve members. Please try again."));
        }
    }

    @GetMapping("/trainers/paginated")
    public ResponseEntity<?> getTrainersPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status) {
        try {
            return ResponseEntity.ok(userService.getTrainersPaginated(page, size, search, role, status));
        } catch (Exception e) {
            log.error("Failed to retrieve paginated trainers", e);
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", "Failed to retrieve trainers. Please try again."));
        }
    }

    @GetMapping("/staff/paginated")
    public ResponseEntity<?> getStaffPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status) {
        try {
            return ResponseEntity.ok(userService.getStaffPaginated(page, size, search, role, status));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", e.getMessage(), "type", e.getClass().getName()));
        }
    }

    @PutMapping("/staff/{id}")
    public ResponseEntity<?> updateStaff(@PathVariable Long id, @RequestBody java.util.Map<String, Object> updates) {
        try {
            return ResponseEntity.ok(userService.updateStaffDetails(id, updates));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", e.getMessage(), "type", e.getClass().getName()));
        }
    }

    @GetMapping("/search")
    public List<UserProfileDTO> searchUsers(
            @RequestParam String role,
            @RequestParam String q) {
        return userService.searchUsers(role.toUpperCase(), q)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<UserProfileDTO> getUser(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return (user != null)
                ? ResponseEntity.ok(convertToDTO(user))
                : ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/customers")
    public ResponseEntity<Set<UserProfileDTO>> getCustomers(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return (user != null)
                ? ResponseEntity.ok(user.getCustomers().stream().map(this::convertToDTO).collect(Collectors.toSet()))
                : ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/trainers")
    public ResponseEntity<Set<UserProfileDTO>> getTrainers(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return (user != null)
                ? ResponseEntity.ok(user.getTrainers().stream().map(this::convertToDTO).collect(Collectors.toSet()))
                : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            User created = userService.createUser(user);
            return ResponseEntity.ok(convertToDTO(created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating user: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            User updated = userService.updateUser(id, user);
            if (updated != null) {
                return ResponseEntity.ok(convertToDTO(updated));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating user: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(java.util.Map.of("success", true, "message", "User deleted successfully"));
        } catch (Exception e) {
            log.error("Failed to delete user {}", id, e);
            return ResponseEntity.status(500).body(java.util.Map.of("success", false, "error", e.getMessage()));
        }
    }

    // Assign customer to trainer
    @PostMapping("/{trainerId}/customers/{customerId}")
    public ResponseEntity<?> assignCustomerToTrainer(
            @PathVariable Long trainerId,
            @PathVariable Long customerId) {
        try {
            long customerCount = userService.assignCustomerToTrainer(trainerId, customerId);
            if (customerCount == -1L)
                return ResponseEntity.notFound().build();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "trainerId", trainerId,
                    "customerId", customerId,
                    "customerCount", customerCount));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // Remove customer from trainer
    @DeleteMapping("/{trainerId}/customers/{customerId}")
    public ResponseEntity<?> removeCustomerFromTrainer(
            @PathVariable Long trainerId,
            @PathVariable Long customerId) {
        try {
            long customerCount = userService.removeCustomerFromTrainer(trainerId, customerId);
            if (customerCount == -1L)
                return ResponseEntity.notFound().build();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "trainerId", trainerId,
                    "customerId", customerId,
                    "customerCount", customerCount));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // Get performance metrics for all trainers
    @GetMapping("/trainers/performance")
    public ResponseEntity<?> getAllTrainersPerformance() {
        try {
            return ResponseEntity.ok(userService.getAllTrainersPerformance());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", e.getMessage(), "type", e.getClass().getName()));
        }
    }

    // Get performance metrics for a specific trainer
    @GetMapping("/trainers/{trainerId}/performance")
    public ResponseEntity<?> getTrainerPerformance(@PathVariable Long trainerId) {
        try {
            var performance = userService.getTrainerPerformance(trainerId);
            if (performance != null) {
                return ResponseEntity.ok(performance);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", e.getMessage(), "type", e.getClass().getName()));
        }
    }

    // ============================================================================
    // Trainer Details (Owner-side) - GET & PUT
    // ============================================================================

    @GetMapping("/trainers/{trainerId}/details")
    public ResponseEntity<?> getTrainerDetails(@PathVariable Long trainerId) {
        try {
            User trainer = userService.getUserById(trainerId);
            if (trainer == null)
                return ResponseEntity.notFound().build();

            TrainerDetails details = trainerDetailsRepository.findById(trainerId).orElse(null);
            TrainerProfileDTO dto = mapToOwnerProfileDTO(trainer, details);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/trainers/{trainerId}/details")
    public ResponseEntity<?> updateTrainerDetails(@PathVariable Long trainerId,
            @RequestBody TrainerProfileDTO dto) {
        try {
            User trainer = userService.getUserById(trainerId);
            if (trainer == null)
                return ResponseEntity.notFound().build();

            // Update basic user fields
            if (dto.getName() != null)
                trainer.setFullName(dto.getName());
            if (dto.getPhone() != null)
                trainer.setPhone(dto.getPhone());
            userService.updateUser(trainerId, trainer);

            // Update or create TrainerDetails
            TrainerDetails details = trainerDetailsRepository.findById(trainerId)
                    .orElse(new TrainerDetails());
            details.setUser(trainer);

            if (dto.getEmployeeId() != null)
                details.setEmployeeId(dto.getEmployeeId());
            if (dto.getDob() != null)
                details.setDob(LocalDate.parse(dto.getDob()));
            if (dto.getGender() != null)
                details.setGender(dto.getGender());
            if (dto.getBloodType() != null)
                details.setBloodType(dto.getBloodType());
            if (dto.getAddress() != null)
                details.setAddress(dto.getAddress());
            if (dto.getAltPhone() != null)
                details.setAltPhone(dto.getAltPhone());
            if (dto.getDepartment() != null)
                details.setDepartment(dto.getDepartment());
            if (dto.getJoiningDate() != null)
                details.setJoiningDate(LocalDate.parse(dto.getJoiningDate()));
            if (dto.getReportingTo() != null)
                details.setReportingTo(dto.getReportingTo());
            if (dto.getBio() != null)
                details.setBio(dto.getBio());
            if (dto.getInstagram() != null)
                details.setInstagram(dto.getInstagram());
            if (dto.getLinkedin() != null)
                details.setLinkedin(dto.getLinkedin());
            if (dto.getEmergencyName() != null)
                details.setEmergencyName(dto.getEmergencyName());
            if (dto.getEmergencyPhone() != null)
                details.setEmergencyPhone(dto.getEmergencyPhone());
            if (dto.getBankName() != null)
                details.setBankName(dto.getBankName());
            if (dto.getAccountNo() != null)
                details.setAccountNo(dto.getAccountNo());
            if (dto.getIfsc() != null)
                details.setIfsc(dto.getIfsc());
            if (dto.getShift() != null)
                details.setShift(dto.getShift());
            if (dto.getExperienceYears() != null)
                details.setExperienceYears(dto.getExperienceYears());

            if (dto.getSpecializations() != null) {
                details.setSpecializations(String.join(",", dto.getSpecializations()));
            }

            try {
                if (dto.getCertifications() != null) {
                    details.setCertificationsJson(objectMapper.writeValueAsString(dto.getCertifications()));
                }
                if (dto.getDocuments() != null) {
                    details.setDocumentsJson(objectMapper.writeValueAsString(dto.getDocuments()));
                }
                if (dto.getAvailability() != null) {
                    details.setAvailabilityJson(objectMapper.writeValueAsString(dto.getAvailability()));
                }
                if (dto.getSkills() != null) {
                    details.setSkillsJson(objectMapper.writeValueAsString(dto.getSkills()));
                }
            } catch (Exception e) {
                e.printStackTrace();
            }

            trainerDetailsRepository.save(details);

            TrainerProfileDTO result = mapToOwnerProfileDTO(trainer, details);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    private TrainerProfileDTO mapToOwnerProfileDTO(User trainer, TrainerDetails details) {
        TrainerProfileDTO.TrainerProfileDTOBuilder builder = TrainerProfileDTO.builder()
                .userId(trainer.getUserId())
                .name(trainer.getFullName())
                .email(trainer.getEmail())
                .phone(trainer.getPhone())
                .role(trainer.getRoles() != null && !trainer.getRoles().isEmpty()
                        ? trainer.getRoles().iterator().next().getRoleName()
                        : "TRAINER");

        if (details != null) {
            builder.employeeId(details.getEmployeeId())
                    .dob(details.getDob() != null ? details.getDob().toString() : null)
                    .gender(details.getGender())
                    .bloodType(details.getBloodType())
                    .address(details.getAddress())
                    .altPhone(details.getAltPhone())
                    .joiningDate(details.getJoiningDate() != null ? details.getJoiningDate().toString() : null)
                    .department(details.getDepartment())
                    .reportingTo(details.getReportingTo())
                    .bio(details.getBio())
                    .instagram(details.getInstagram())
                    .linkedin(details.getLinkedin())
                    .emergencyName(details.getEmergencyName())
                    .emergencyPhone(details.getEmergencyPhone())
                    .bankName(details.getBankName())
                    .accountNo(details.getAccountNo())
                    .ifsc(details.getIfsc())
                    .shift(details.getShift())
                    .experienceYears(details.getExperienceYears());

            if (details.getSpecializations() != null && !details.getSpecializations().isEmpty()) {
                builder.specializations(Arrays.asList(details.getSpecializations().split(",")));
            } else {
                builder.specializations(Collections.emptyList());
            }

            // Parse JSON fields
            try {
                if (details.getCertificationsJson() != null) {
                    builder.certifications(objectMapper.readValue(details.getCertificationsJson(),
                            new com.fasterxml.jackson.core.type.TypeReference<List<TrainerProfileDTO.CertificationDTO>>() {
                            }));
                }
                if (details.getDocumentsJson() != null) {
                    builder.documents(objectMapper.readValue(details.getDocumentsJson(),
                            new com.fasterxml.jackson.core.type.TypeReference<List<TrainerProfileDTO.DocumentDTO>>() {
                            }));
                }
                if (details.getAvailabilityJson() != null) {
                    builder.availability(objectMapper.readValue(details.getAvailabilityJson(),
                            new com.fasterxml.jackson.core.type.TypeReference<List<TrainerProfileDTO.AvailabilityDTO>>() {
                            }));
                }
                if (details.getSkillsJson() != null) {
                    builder.skills(objectMapper.readValue(details.getSkillsJson(),
                            new com.fasterxml.jackson.core.type.TypeReference<List<TrainerProfileDTO.SkillDTO>>() {
                            }));
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else {
            builder.specializations(Collections.emptyList());
        }

        // Stats
        Double avgRating = sessionRatingRepository.findAverageRatingByTrainer(trainer.getUserId());
        long reviewCount = sessionRatingRepository.countByTrainerUserId(trainer.getUserId());
        int activeMembers = trainer.getCustomers() != null ? trainer.getCustomers().size() : 0;

        builder.stats(TrainerProfileDTO.ProfileStatsDTO.builder()
                .rating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0)
                .reviews((int) reviewCount)
                .activeMembers(activeMembers)
                .build());

        return builder.build();
    }

    // ========================================================================
    // Compensation / Salary endpoints (owner-side)
    // ========================================================================

    @GetMapping("/{trainerId}/compensation")
    public ResponseEntity<?> getTrainerCompensation(@PathVariable Long trainerId) {
        try {
            List<TrainerCompensationRule> rules = compensationRuleRepository
                    .findByTrainerUserIdOrderByEffectiveFromDesc(trainerId);

            List<Map<String, Object>> result = rules.stream().map(r -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", r.getId());
                map.put("perSessionRate", r.getPerSessionRate());
                map.put("perHourRate", r.getPerHourRate());
                map.put("perClassRate", r.getPerClassRate());
                map.put("perAttendeeRate", r.getPerAttendeeRate());
                map.put("commissionPercent", r.getCommissionPercent());
                map.put("effectiveFrom", r.getEffectiveFrom());
                map.put("effectiveTo", r.getEffectiveTo());
                map.put("isActive", r.getIsActive());
                map.put("createdAt", r.getCreatedAt());
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch compensation: " + e.getMessage()));
        }
    }

    @PostMapping("/{trainerId}/compensation")
    public ResponseEntity<?> createCompensationRule(
            @PathVariable Long trainerId,
            @RequestBody Map<String, Object> body) {
        try {
            User trainer = userService.getUserById(trainerId);
            if (trainer == null) {
                return ResponseEntity.notFound().build();
            }

            TrainerCompensationRule rule = TrainerCompensationRule.builder()
                    .trainer(trainer)
                    .perSessionRate(
                            body.get("perSessionRate") != null ? new BigDecimal(body.get("perSessionRate").toString())
                                    : null)
                    .perHourRate(
                            body.get("perHourRate") != null ? new BigDecimal(body.get("perHourRate").toString()) : null)
                    .perClassRate(body.get("perClassRate") != null ? new BigDecimal(body.get("perClassRate").toString())
                            : null)
                    .perAttendeeRate(
                            body.get("perAttendeeRate") != null ? new BigDecimal(body.get("perAttendeeRate").toString())
                                    : null)
                    .commissionPercent(body.get("commissionPercent") != null
                            ? new BigDecimal(body.get("commissionPercent").toString())
                            : null)
                    .effectiveFrom(
                            body.get("effectiveFrom") != null ? LocalDate.parse(body.get("effectiveFrom").toString())
                                    : LocalDate.now())
                    .effectiveTo(body.get("effectiveTo") != null ? LocalDate.parse(body.get("effectiveTo").toString())
                            : null)
                    .isActive(true)
                    .build();

            TrainerCompensationRule saved = compensationRuleRepository.save(rule);
            return ResponseEntity.ok(Map.of("id", saved.getId(), "message", "Compensation rule created"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to create compensation rule: " + e.getMessage()));
        }
    }

    @PutMapping("/{trainerId}/compensation/{ruleId}")
    public ResponseEntity<?> updateCompensationRule(
            @PathVariable Long trainerId,
            @PathVariable Long ruleId,
            @RequestBody Map<String, Object> body) {
        try {
            Optional<TrainerCompensationRule> opt = compensationRuleRepository.findById(ruleId);
            if (opt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            TrainerCompensationRule rule = opt.get();
            if (body.containsKey("perSessionRate"))
                rule.setPerSessionRate(
                        body.get("perSessionRate") != null ? new BigDecimal(body.get("perSessionRate").toString())
                                : null);
            if (body.containsKey("perHourRate"))
                rule.setPerHourRate(
                        body.get("perHourRate") != null ? new BigDecimal(body.get("perHourRate").toString()) : null);
            if (body.containsKey("perClassRate"))
                rule.setPerClassRate(
                        body.get("perClassRate") != null ? new BigDecimal(body.get("perClassRate").toString()) : null);
            if (body.containsKey("perAttendeeRate"))
                rule.setPerAttendeeRate(
                        body.get("perAttendeeRate") != null ? new BigDecimal(body.get("perAttendeeRate").toString())
                                : null);
            if (body.containsKey("commissionPercent"))
                rule.setCommissionPercent(
                        body.get("commissionPercent") != null ? new BigDecimal(body.get("commissionPercent").toString())
                                : null);
            if (body.containsKey("effectiveFrom"))
                rule.setEffectiveFrom(LocalDate.parse(body.get("effectiveFrom").toString()));
            if (body.containsKey("effectiveTo"))
                rule.setEffectiveTo(
                        body.get("effectiveTo") != null ? LocalDate.parse(body.get("effectiveTo").toString()) : null);
            if (body.containsKey("isActive"))
                rule.setIsActive((Boolean) body.get("isActive"));

            compensationRuleRepository.save(rule);
            return ResponseEntity.ok(Map.of("message", "Compensation rule updated"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to update: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{trainerId}/compensation/{ruleId}")
    public ResponseEntity<?> deleteCompensationRule(
            @PathVariable Long trainerId,
            @PathVariable Long ruleId) {
        try {
            compensationRuleRepository.deleteById(ruleId);
            return ResponseEntity.ok(Map.of("message", "Compensation rule deleted"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to delete: " + e.getMessage()));
        }
    }

    // ========================================================================
    // Attendance / Check-in endpoints (owner-side, per trainer)
    // ========================================================================

    @GetMapping("/{trainerId}/attendance")
    public ResponseEntity<?> getTrainerAttendance(
            @PathVariable Long trainerId,
            @RequestParam(defaultValue = "30") int days) {
        try {
            LocalDateTime startDate = LocalDateTime.now().minusDays(days).withHour(0).withMinute(0).withSecond(0);
            List<CheckIn> checkIns = checkInRepository.findByUserUserIdOrderByCheckInTimeDesc(trainerId);

            // Filter to requested range
            List<Map<String, Object>> result = checkIns.stream()
                    .filter(c -> c.getCheckInTime().isAfter(startDate))
                    .map(c -> {
                        Map<String, Object> map = new LinkedHashMap<>();
                        map.put("id", c.getCheckInId());
                        map.put("checkInTime", c.getCheckInTime());
                        map.put("checkOutTime", c.getCheckOutTime());
                        map.put("status", c.getStatus());
                        return map;
                    })
                    .collect(Collectors.toList());

            // Summary stats
            long totalDays = days;
            long presentDays = result.stream()
                    .map(c -> ((LocalDateTime) c.get("checkInTime")).toLocalDate())
                    .distinct()
                    .count();

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("records", result);
            response.put("summary", Map.of(
                    "totalDays", totalDays,
                    "presentDays", presentDays,
                    "absentDays", totalDays - presentDays,
                    "attendancePercent", totalDays > 0 ? Math.round((presentDays * 100.0) / totalDays) : 0));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch attendance: " + e.getMessage()));
        }
    }

    private UserProfileDTO convertToDTO(User user) {
        if (user == null) return null;
        return UserProfileDTO.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarId(user.getAvatarId())
                .createdAt(user.getCreatedAt())
                .leavingDate(user.getLeavingDate())
                .status(user.getStatus())
                .roles(user.getRoles().stream()
                        .map(Role::getRoleName)
                        .collect(Collectors.toSet()))
                .build();
    }
}
