package com.gym.management.controller;

import com.gym.management.dto.trainer.TrainerDashboardStatsDTO;
import com.gym.management.dto.trainer.TrainerSessionDTO;
import com.gym.management.dto.trainer.DashboardAlertDTO;
import com.gym.management.dto.trainer.ChartDataDTO;
import com.gym.management.model.ProgressNote;
import com.gym.management.model.PTSession;
import com.gym.management.model.User;
import com.gym.management.model.TrainerDetails;
import com.gym.management.dto.trainer.TrainerProfileDTO;
import com.gym.management.repository.PTSessionRepository;
import com.gym.management.repository.ProgressNoteRepository;
import com.gym.management.repository.SessionRatingRepository;
import com.gym.management.repository.UserRepository;
import com.gym.management.security.CustomUserDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import com.gym.management.dto.trainer.TrainerMemberDTO;
import com.gym.management.repository.MembershipRepository;
import com.gym.management.model.MembershipStatus;
import com.gym.management.model.TrainerClassAttendee.AttendeeStatus;
import com.gym.management.model.SessionStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.*;
import java.io.IOException;
import java.util.UUID;

/**
 * Trainer Dashboard Controller - TRAINER, OWNER, ADMIN
 * Provides trainer-specific functionality: members, schedule, classes, notes.
 */
@RestController
@RequestMapping("/api/trainer")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175" })
@PreAuthorize("hasAnyRole('TRAINER', 'OWNER', 'ADMIN')")
public class TrainerDashboardController {

    private static final Logger log = LoggerFactory.getLogger(TrainerDashboardController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PTSessionRepository ptSessionRepository;
    @Autowired
    private SessionRatingRepository sessionRatingRepository;

    @Autowired
    private com.gym.management.repository.TrainerDetailsRepository trainerDetailsRepository;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Autowired
    private ProgressNoteRepository progressNoteRepository;

    @Autowired
    private com.gym.management.repository.TrainerClassRepository trainerClassRepository;

    @Autowired
    private com.gym.management.repository.TrainerClassAttendeeRepository trainerClassAttendeeRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private com.gym.management.repository.StaffShiftRepository staffShiftRepository;

    @GetMapping("/members")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<List<TrainerMemberDTO>> getAssignedMembers() {
        Long trainerId = getAuthenticatedTrainerId();
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        Set<User> customers = trainer.getCustomers();
        if (customers == null)
            customers = new HashSet<>();

        List<TrainerMemberDTO> dtos = customers.stream().map(member -> {
            TrainerMemberDTO dto = new TrainerMemberDTO();
            dto.setId(member.getUserId());
            dto.setName(member.getFullName());
            dto.setEmail(member.getEmail());
            dto.setPhone(member.getPhone());

            // Plan & Status
            Optional<com.gym.management.model.Membership> membershipOpt = membershipRepository
                    .findTopByUserUserIdAndStatusOrderByEndDateDesc(member.getUserId(), MembershipStatus.ACTIVE);
            if (membershipOpt.isPresent()) {
                com.gym.management.model.Membership membership = membershipOpt.get();
                dto.setStatus("ACTIVE");
                // Will fix getName below after checking model
                dto.setPlan(
                        membership.getMembershipPackage() != null ? membership.getMembershipPackage().getPackageName()
                                : "Standard");

                long days = 0;
                if (membership.getEndDate() != null) {
                    days = java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.now(),
                            membership.getEndDate());
                }
                dto.setDaysLeft((int) days);
            } else {
                dto.setStatus("INACTIVE");
                dto.setPlan("-");
                dto.setDaysLeft(0);
            }

            // Stats
            long classes = trainerClassAttendeeRepository.countByMemberIdAndStatus(member.getUserId(),
                    AttendeeStatus.CONFIRMED);
            long ptCompleted = ptSessionRepository.countByMemberUserIdAndStatus(member.getUserId(),
                    SessionStatus.COMPLETED);
            
            // Get weight - show N/A if null
            String weight = member.getWeight() != null ? member.getWeight().toString() : "N/A";
            
            dto.setStats(new TrainerMemberDTO.MemberStats((int) classes, weight, String.valueOf(ptCompleted)));

            // Last Session
            PTSession lastSession = ptSessionRepository.findTopByMemberUserIdOrderBySessionDateDesc(member.getUserId());
            if (lastSession != null) {
                dto.setLastSession(lastSession.getSessionDate().toLocalDate().toString());
            } else {
                dto.setLastSession("Never");
            }

            dto.setGoal("Fitness"); // Default goal until ProgressNote is structured

            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/dashboard")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<TrainerDashboardStatsDTO> getDashboard() {
        Long trainerId = getAuthenticatedTrainerId();
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        List<PTSession> allSessions;
        try {
            allSessions = ptSessionRepository.findByTrainerId(trainerId);
        } catch (Exception e) {
            log.error("Failed to fetch sessions for trainer {}", trainerId, e);
            allSessions = new ArrayList<>();
        }
        
        if (allSessions == null) allSessions = new ArrayList<>();
        
        LocalDate today = LocalDate.now();

        // 1. Calculate Earnings (Mock Logic: Completed Session * $50)
        double todayEarnings = 0;
        double monthEarnings = 0;
        try {
            todayEarnings = allSessions.stream()
                    .filter(s -> s != null && s.getSessionDate() != null && s.getStatus() != null && 
                                 s.getSessionDate().toLocalDate().equals(today) && 
                                 SessionStatus.COMPLETED.equals(s.getStatus()))
                    .count() * 50.0;

            monthEarnings = allSessions.stream()
                    .filter(s -> s != null && s.getSessionDate() != null && s.getStatus() != null && 
                                 s.getSessionDate().getMonth().equals(today.getMonth())
                                 && s.getSessionDate().getYear() == today.getYear()
                                 && SessionStatus.COMPLETED.equals(s.getStatus()))
                    .count() * 50.0;
        } catch (Exception e) {
            log.error("Error calculating earnings for trainer {}", trainerId, e);
        }

        // 2. Today's Stats
        int totalToday = 0;
        int completedToday = 0;
        try {
            List<PTSession> todaySessions = allSessions.stream()
                    .filter(s -> s != null && s.getSessionDate() != null && s.getSessionDate().toLocalDate().equals(today))
                    .collect(Collectors.toList());

            totalToday = todaySessions.size();
            completedToday = (int) todaySessions.stream()
                    .filter(s -> s.getStatus() != null && SessionStatus.COMPLETED.equals(s.getStatus()))
                    .count();
        } catch (Exception e) {
            log.error("Error calculating today's stats for trainer {}", trainerId, e);
        }

        // 3. Attendance Rate (Completed / (Completed + Cancelled + NoShow) * 100)
        double attendanceRate = 0;
        try {
            long totalForRate = allSessions.stream()
                    .filter(s -> s != null && s.getStatus() != null && 
                                 Set.of("COMPLETED", "CANCELLED", "MISSED").contains(s.getStatus().name()))
                    .count();
            long completedTotal = allSessions.stream()
                    .filter(s -> s != null && SessionStatus.COMPLETED.equals(s.getStatus()))
                    .count();
            attendanceRate = totalForRate > 0 ? ((double) completedTotal / totalForRate) * 100 : 0;
        } catch (Exception e) {
            log.error("Error calculating attendance rate for trainer {}", trainerId, e);
        }

        // 4. Active Members
        int activeMembers = 0;
        try {
            activeMembers = trainer.getCustomers() != null ? trainer.getCustomers().size() : 0;
        } catch (Exception e) {
            log.error("Failed to fetch customer size for trainer {}", trainerId, e);
        }
        int totalMembers = activeMembers;

        // 5. Map Sessions to DTO
        List<TrainerSessionDTO> sessionDTOs = new ArrayList<>();
        try {
            sessionDTOs = allSessions.stream()
                    .filter(s -> s != null && s.getSessionDate() != null && 
                                 s.getSessionDate().isAfter(LocalDateTime.now().minusHours(24)))
                    .sorted((s1, s2) -> {
                        if (s1.getSessionDate() == null) return 1;
                        if (s2.getSessionDate() == null) return -1;
                        return s1.getSessionDate().compareTo(s2.getSessionDate());
                    })
                    .limit(10)
                    .map(this::mapToSessionDTO)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error mapping sessions for trainer {}", trainerId, e);
        }

        // 6. Generate Alerts
        List<DashboardAlertDTO> alerts = new ArrayList<>();
        try {
            // Pending Notes
            allSessions.stream()
                    .filter(s -> s != null && s.getStatus() == SessionStatus.COMPLETED &&
                            (s.getProgressNotes() == null || s.getProgressNotes().trim().isEmpty()))
                    .filter(s -> s.getMember() != null && s.getSessionDate() != null)
                    .sorted((s1, s2) -> s2.getSessionDate().compareTo(s1.getSessionDate()))
                    .limit(2)
                    .forEach(s -> {
                        try {
                            alerts.add(DashboardAlertDTO.builder()
                                .id("note-" + s.getSessionId())
                                .type("PENDING_NOTE")
                                .message("Progress note missing")
                                .memberName(s.getMember().getFullName())
                                .memberId(s.getMember().getUserId())
                                .severity("medium")
                                .time(formatTimeAgo(s.getSessionDate()))
                                .build());
                        } catch (Exception e) {
                            log.warn("Failed to create alert for session {}", s.getSessionId());
                        }
                    });

            // Missed Sessions
            allSessions.stream()
                    .filter(s -> s != null && s.getSessionDate() != null && (s.getStatus() == SessionStatus.MISSED ||
                            (s.getStatus() == SessionStatus.SCHEDULED && s.getSessionDate().isBefore(LocalDateTime.now()))))
                    .filter(s -> s.getSessionDate().isAfter(LocalDateTime.now().minusDays(7)))
                    .filter(s -> s.getMember() != null)
                    .sorted((s1, s2) -> s2.getSessionDate().compareTo(s1.getSessionDate()))
                    .limit(2)
                    .forEach(s -> {
                        try {
                            alerts.add(DashboardAlertDTO.builder()
                                .id("missed-" + s.getSessionId())
                                .type("MISSED_SESSION")
                                .message("Session missed")
                                .memberName(s.getMember().getFullName())
                                .memberId(s.getMember().getUserId())
                                .severity("high")
                                .time(formatTimeAgo(s.getSessionDate()))
                                .build());
                        } catch (Exception e) {
                            log.warn("Failed to create alert for missed session {}", s.getSessionId());
                        }
                    });

            // Sort alerts by severity (High first) then time
            alerts.sort((a1, a2) -> {
                if (a1 == null || a2 == null) return 0;
                if (a1.getSeverity() == null || a2.getSeverity() == null) return 0;
                if (a1.getSeverity().equals(a2.getSeverity())) return 0;
                return "high".equals(a1.getSeverity()) ? -1 : 1;
            });
        } catch (Exception e) {
            log.error("Error generating alerts for trainer {}", trainerId, e);
        }

        // 7. Generate Charts Data
        List<ChartDataDTO> weeklyActivity = new ArrayList<>();
        try {
            LocalDate weekStart = today.minusDays(6);
            for (int i = 0; i < 7; i++) {
                LocalDate date = weekStart.plusDays(i);
                final LocalDate fDate = date;
                long count = allSessions.stream()
                        .filter(s -> s != null && s.getSessionDate() != null && 
                                     s.getSessionDate().toLocalDate().equals(fDate) && 
                                     SessionStatus.COMPLETED.equals(s.getStatus()))
                        .count();
                String label = date.getDayOfWeek().name().substring(0, 3);
                weeklyActivity.add(ChartDataDTO.builder().label(label).value((double) count).build());
            }
        } catch (Exception e) {
            log.error("Error generating weekly activity chart for trainer {}", trainerId, e);
        }

        List<ChartDataDTO> monthlyEarningsHistory = new ArrayList<>();
        try {
            LocalDate monthStart = today.minusMonths(5).withDayOfMonth(1);
            for (int i = 0; i < 6; i++) {
                LocalDate date = monthStart.plusMonths(i);
                final LocalDate fDate = date;
                double earnings = allSessions.stream()
                        .filter(s -> s != null && s.getSessionDate() != null && 
                                     s.getSessionDate().getMonth().equals(fDate.getMonth()) && 
                                     s.getSessionDate().getYear() == fDate.getYear() && 
                                     SessionStatus.COMPLETED.equals(s.getStatus()))
                        .count() * 50.0;
                String label = date.getMonth().name().substring(0, 3);
                monthlyEarningsHistory.add(ChartDataDTO.builder().label(label).value(earnings).build());
            }
        } catch (Exception e) {
            log.error("Error generating monthly earnings history for trainer {}", trainerId, e);
        }

        List<ChartDataDTO> sessionDistribution = new ArrayList<>();
        try {
            List<com.gym.management.model.TrainerClass> trainerClasses = trainerClassRepository
                    .findByTrainerUserIdOrderByClassDateAscStartTimeAsc(trainerId);
            long ptCount = allSessions.size();
            long classCount = trainerClasses != null ? trainerClasses.size() : 0;

            sessionDistribution.add(ChartDataDTO.builder().label("PT Sessions").value((double) ptCount).meta("#06b6d4").build());
            sessionDistribution.add(ChartDataDTO.builder().label("Classes").value((double) classCount).meta("#8b5cf6").build());
        } catch (Exception e) {
            log.error("Error generating session distribution chart for trainer {}", trainerId, e);
        }

        TrainerDashboardStatsDTO stats = TrainerDashboardStatsDTO.builder()
                .trainerName(trainer.getFullName())
                .todayEarnings(todayEarnings)
                .monthEarnings(monthEarnings)
                .completedToday(completedToday)
                .totalToday(totalToday)
                .attendanceRate(Math.round(attendanceRate * 10.0) / 10.0)
                .activeMembers(activeMembers)
                .totalMembers(totalMembers)
                .sessions(sessionDTOs)
                .alerts(alerts)
                .weeklyActivity(weeklyActivity)
                .monthlyEarningsHistory(monthlyEarningsHistory)
                .sessionDistribution(sessionDistribution)
                .build();

        return ResponseEntity.ok(stats);
    }

    private String formatTimeAgo(LocalDateTime dateTime) {
        long minutes = java.time.temporal.ChronoUnit.MINUTES.between(dateTime, LocalDateTime.now());
        if (minutes < 60)
            return minutes + "m ago";
        long hours = minutes / 60;
        if (hours < 24)
            return hours + "h ago";
        return (hours / 24) + "d ago";
    }

    @GetMapping("/profile")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<?> getProfile() {
        Long trainerId = getAuthenticatedTrainerId();
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        com.gym.management.model.TrainerDetails details = trainerDetailsRepository.findById(trainerId).orElse(null);

        // Map to DTO
        com.gym.management.dto.trainer.TrainerProfileDTO dto = mapToProfileDTO(trainer, details);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/profile")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> updateProfile(@RequestBody com.gym.management.dto.trainer.TrainerProfileDTO dto) {
        Long trainerId = getAuthenticatedTrainerId();
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        // Update User basic info
        if (dto.getName() != null)
            trainer.setFullName(dto.getName());
        if (dto.getPhone() != null)
            trainer.setPhone(dto.getPhone());
        userRepository.save(trainer);

        // Update Details
        com.gym.management.model.TrainerDetails details = trainerDetailsRepository.findById(trainerId)
                .orElse(new com.gym.management.model.TrainerDetails());
        details.setUser(trainer); // Ensure ID link for new

        // employeeId is system-generated and immutable — never allow updates from
        // client

        if (dto.getDob() != null)
            details.setDob(LocalDate.parse(dto.getDob())); // Assumes YYYY-MM-DD
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
        } catch (Exception e) {
            log.error("Failed to serialize trainer profile data for trainer {}", trainerId, e);
        }

        trainerDetailsRepository.save(details);
        return ResponseEntity.ok(apiResponse(true, mapToProfileDTO(trainer, details), "Profile updated successfully"));
    }

    @PostMapping("/profile/password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> payload) {
        Long trainerId = getAuthenticatedTrainerId();
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        String currentPassword = payload.get("currentPassword");
        String newPassword = payload.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(apiResponse(false, null, "Current and new password are required"));
        }

        // We use BCryptPasswordEncoder directly or via an interface if we had one
        // injected,
        // but since we might not have it here, we'll autowire PasswordEncoder at the
        // top and use it.
        // If it's not injected, we'll let it throw a 500 so we know to add it.
        if (!passwordEncoder.matches(currentPassword, trainer.getPassword())) {
            return ResponseEntity.badRequest().body(apiResponse(false, null, "Incorrect current password"));
        }

        trainer.setPassword(passwordEncoder.encode(newPassword));
        trainer.setPasswordChangedAt(LocalDateTime.now());
        userRepository.save(trainer);

        return ResponseEntity.ok(apiResponse(true, null, "Password changed successfully"));
    }

    @PostMapping("/documents/upload")
    public ResponseEntity<?> uploadDocument(@RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", defaultValue = "document") String type) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(apiResponse(false, null, "File is empty"));
        }

        try {
            // Create uploads directory if not exists
            String uploadsDir = System.getProperty("user.dir") + "/uploads";
            Path uploadPath = Paths.get(uploadsDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
            String filename = UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Construct URL (Pseudo-URL, needs ResourceHandler to really work)
            // For now, valid for storage reference
            String fileUrl = "/uploads/" + filename;

            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("name", originalFilename);
            response.put("type", type);
            response.put("filename", filename);

            return ResponseEntity.ok(apiResponse(true, response, "File uploaded successfully"));

        } catch (IOException e) {
            log.error("Failed to upload file: {}", type, e);
            return ResponseEntity.internalServerError()
                    .body(apiResponse(false, null, "Failed to upload file"));
        }
    }

    private TrainerProfileDTO mapToProfileDTO(User trainer, TrainerDetails details) {
        TrainerProfileDTO.TrainerProfileDTOBuilder builder = TrainerProfileDTO.builder()
                .userId(trainer.getUserId())
                .name(trainer.getFullName())
                .email(trainer.getEmail())
                .phone(trainer.getPhone())
                // .profilePictureUrl(trainer.getAvatarId()) Removed as it's not in DTO
                // Set defaults if details missing
                .bio(details != null ? details.getBio() : "Experienced trainer passionate about fitness.")
                .specializations(details != null && details.getSpecializations() != null
                        ? List.of(details.getSpecializations().split(","))
                        : List.of("Strength", "HIIT"))
                .languages(List.of("English", "Hindi"))
                .emergencyName(details != null ? details.getEmergencyName() : "")
                .emergencyPhone(details != null ? details.getEmergencyPhone() : "")
                .instagram(details != null ? details.getInstagram() : "")
                .linkedin(details != null ? details.getLinkedin() : "")
                .joiningDate(details != null && details.getJoiningDate() != null
                        ? details.getJoiningDate().toString()
                        : java.time.LocalDate.now().toString());

        // Calculate real stats
        int sessionsMonth = ptSessionRepository.findByTrainerIdAndDateRange(trainer.getUserId(),
                LocalDateTime.now().minusMonths(1), LocalDateTime.now()).size();
        Double avgRating = sessionRatingRepository.findAverageRatingByTrainer(trainer.getUserId());
        long reviewsVal = sessionRatingRepository.countByTrainerUserId(trainer.getUserId());
        String exp = "0 Yrs";
        if (details != null && details.getJoiningDate() != null) {
            long years = java.time.temporal.ChronoUnit.YEARS.between(details.getJoiningDate(),
                    java.time.LocalDate.now());
            exp = years + " Yrs";
        }

        builder.stats(TrainerProfileDTO.ProfileStatsDTO.builder()
                .activeMembers(trainer.getCustomers() != null ? trainer.getCustomers().size() : 0)
                .totalMembers(trainer.getCustomers() != null ? trainer.getCustomers().size() : 0)
                .sessionsMonth(sessionsMonth)
                .attendance(95.0)
                .rating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .reviews((int) reviewsVal)
                .experience(exp)
                .earnings(0.0)
                .build());

        // Re-adding the original logic for employeeId, dob, gender, etc.
        if (details != null) {
            // Use the REAL system-generated employeeIdCode from the User entity (same field
            // shown in owner's staff list)
            // TrainerDetails.employeeId is a stale field — we ignore it
            String empId = trainer.getEmployeeIdCode();
            if (empId == null || empId.isBlank()) {
                // Fallback: generate and persist to User entity
                empId = String.format("TRAINER-%04d", trainer.getUserId());
                trainer.setEmployeeIdCode(empId);
                userRepository.save(trainer);
            }
            builder.employeeId(empId)
                    .dob(details.getDob() != null ? details.getDob().toString() : null)
                    .gender(details.getGender())
                    .bloodType(details.getBloodType())
                    .address(details.getAddress())
                    .altPhone(details.getAltPhone())
                    .department(details.getDepartment())
                    .reportingTo(details.getReportingTo())
                    .shift(details.getShift())
                    .bankName(details.getBankName())
                    .accountNo(details.getAccountNo())
                    .ifsc(details.getIfsc());

            if (details.getCertificationsJson() != null) {
                try {
                    List<com.gym.management.dto.trainer.TrainerProfileDTO.CertificationDTO> certs = objectMapper
                            .readValue(
                                    details.getCertificationsJson(),
                                    new com.fasterxml.jackson.core.type.TypeReference<List<com.gym.management.dto.trainer.TrainerProfileDTO.CertificationDTO>>() {
                                    });
                    builder.certifications(certs);
                } catch (Exception e) {
                    builder.certifications(Collections.emptyList());
                }
            } else {
                builder.certifications(Collections.emptyList());
            }

            if (details.getDocumentsJson() != null) {
                try {
                    List<com.gym.management.dto.trainer.TrainerProfileDTO.DocumentDTO> docs = objectMapper.readValue(
                            details.getDocumentsJson(),
                            new com.fasterxml.jackson.core.type.TypeReference<List<com.gym.management.dto.trainer.TrainerProfileDTO.DocumentDTO>>() {
                            });
                    builder.documents(docs);
                } catch (Exception e) {
                    builder.documents(Collections.emptyList());
                }
            } else {
                builder.documents(Collections.emptyList());
            }

        } else {
            // No TrainerDetails yet — still read the real ID from User entity
            String empId = trainer.getEmployeeIdCode();
            if (empId == null || empId.isBlank()) {
                empId = String.format("TRAINER-%04d", trainer.getUserId());
                trainer.setEmployeeIdCode(empId);
                userRepository.save(trainer);
            }
            builder.employeeId(empId)
                    .languages(Arrays.asList("English", "Hindi"))
                    .specializations(Arrays.asList("Strength Training", "HIIT"))
                    .certifications(Collections.emptyList())
                    .documents(Collections.emptyList());
        }

        return builder.build();
    }

    // Keeping other methods but ensuring they use standard response structure if
    // needed...
    @GetMapping("/my-members")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<?> getMyMembers(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String q) {
        Long trainerId = getAuthenticatedTrainerId();
        User trainer = userRepository.findById(trainerId).orElseThrow();

        if (trainer.getCustomers() == null) {
            Map<String, Object> empty = new HashMap<>();
            empty.put("items", Collections.emptyList());
            empty.put("totalItems", 0);
            empty.put("totalPages", 0);
            return ResponseEntity.ok(apiResponse(true, empty, null));
        }

        List<User> filtered = trainer.getCustomers().stream()
                .filter(c -> c != null && (q == null || (c.getFullName() != null && c.getFullName().toLowerCase().contains(q.toLowerCase()))))
                .collect(Collectors.toList());

        // Transform to DTO to include stats and weight
        List<TrainerMemberDTO> dtos = filtered.stream().map(member -> {
            TrainerMemberDTO dto = new TrainerMemberDTO();
            dto.setId(member.getUserId());
            dto.setName(member.getFullName());
            dto.setEmail(member.getEmail());
            dto.setPhone(member.getPhone());

            // Plan & Status
            Optional<com.gym.management.model.Membership> membershipOpt = membershipRepository
                    .findTopByUserUserIdAndStatusOrderByEndDateDesc(member.getUserId(), MembershipStatus.ACTIVE);
            if (membershipOpt.isPresent()) {
                com.gym.management.model.Membership membership = membershipOpt.get();
                dto.setStatus("ACTIVE");
                dto.setPlan(
                        membership.getMembershipPackage() != null ? membership.getMembershipPackage().getPackageName()
                                : "Standard");

                long days = 0;
                if (membership.getEndDate() != null) {
                    days = java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.now(),
                            membership.getEndDate());
                }
                dto.setDaysLeft((int) days);
            } else {
                dto.setStatus("INACTIVE");
                dto.setPlan("-");
                dto.setDaysLeft(0);
            }

            // Stats with weight
            long classesCount = trainerClassAttendeeRepository.countByMemberIdAndStatus(member.getUserId(),
                    AttendeeStatus.CONFIRMED);
            long ptCompleted = ptSessionRepository.countByMemberUserIdAndStatus(member.getUserId(),
                    SessionStatus.COMPLETED);
            String weightValue = member.getWeight() != null ? member.getWeight().toString() : "N/A";
            dto.setStats(new TrainerMemberDTO.MemberStats((int) classesCount, weightValue, String.valueOf(ptCompleted)));

            // Last Session
            PTSession lastSession = ptSessionRepository.findTopByMemberUserIdOrderBySessionDateDesc(member.getUserId());
            if (lastSession != null && lastSession.getSessionDate() != null) {
                dto.setLastSession(lastSession.getSessionDate().toLocalDate().toString());
            } else {
                dto.setLastSession("Never");
            }

            dto.setGoal("Fitness");
            return dto;
        }).collect(Collectors.toList());

        // Simple pagination
        int fromIndex = Math.min(page * size, dtos.size());
        int toIndex = Math.min(fromIndex + size, dtos.size());
        List<TrainerMemberDTO> pageContent = dtos.subList(fromIndex, toIndex);

        Map<String, Object> result = new HashMap<>();
        result.put("items", pageContent);
        result.put("totalItems", dtos.size());
        result.put("totalPages", (int) Math.ceil((double) dtos.size() / size));

        return ResponseEntity.ok(apiResponse(true, result, null));
    }

    @GetMapping("/schedule")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<?> getSchedule(@RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        // Return List<TrainerSessionDTO> directly for cleanliness
        Long trainerId = getAuthenticatedTrainerId();
        List<PTSession> sessions = ptSessionRepository.findByTrainerId(trainerId);

        // Filter by date if provided (omitted for brevity, can add back if needed)

        List<TrainerSessionDTO> dtos = sessions.stream()
                .map(this::mapToSessionDTO)
                .filter(Objects::nonNull) // Filter out nulls from mapToSessionDTO
                .collect(Collectors.toList());

        return ResponseEntity.ok(apiResponse(true, dtos, null));
    }

    /**
     * Get trainer's weekly shift schedule from staff_shifts table
     * This shows the shifts assigned by gym owner/admin
     */
    @GetMapping("/weekly-shifts")
    public ResponseEntity<?> getWeeklyShifts() {
        Long trainerId = getAuthenticatedTrainerId();
        
        // Get current week's shifts (Monday to Sunday)
        LocalDate today = LocalDate.now();
        LocalDate monday = today.with(java.time.DayOfWeek.MONDAY);
        LocalDate sunday = monday.plusDays(6);
        
        List<com.gym.management.model.StaffShift> shifts = 
            staffShiftRepository.findByStaffIdAndDateRange(trainerId, monday, sunday);
        
        // Convert to DTO
        List<Map<String, Object>> shiftDTOs = shifts.stream().map(shift -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("shiftId", shift.getShiftId());
            dto.put("date", shift.getShiftDate());
            dto.put("dayOfWeek", shift.getShiftDate().getDayOfWeek().toString());
            dto.put("startTime", shift.getStartTime());
            dto.put("endTime", shift.getEndTime());
            dto.put("status", shift.getStatus());
            
            // Calculate duration in hours
            long durationMinutes = java.time.Duration.between(
                shift.getStartTime(), 
                shift.getEndTime()
            ).toMinutes();
            dto.put("durationHours", durationMinutes / 60.0);
            
            return dto;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(apiResponse(true, shiftDTOs, null));
    }

    @GetMapping("/members/{memberId}/notes")
    public ResponseEntity<?> getMemberNotes(@PathVariable Long memberId) {
        Long trainerId = getAuthenticatedTrainerId();
        return ResponseEntity
                .ok(apiResponse(true, progressNoteRepository.findByTrainerAndMember(trainerId, memberId), null));
    }

    @PostMapping("/members/{memberId}/notes")
    public ResponseEntity<?> addProgressNote(@PathVariable Long memberId, @RequestBody Map<String, String> body) {
        Long trainerId = getAuthenticatedTrainerId();
        User trainer = userRepository.findById(trainerId).orElseThrow();
        User member = userRepository.findById(memberId).orElseThrow();

        ProgressNote note = new ProgressNote(trainer, member, body.get("note"));
        return ResponseEntity.ok(apiResponse(true, progressNoteRepository.save(note), "Note added"));
    }

    @GetMapping("/notes")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<?> getAllNotes() {
        Long trainerId = getAuthenticatedTrainerId();
        return ResponseEntity
                .ok(apiResponse(true, progressNoteRepository.findByTrainerUserIdOrderByCreatedAtDesc(trainerId), null));
    }

    // ============ TRAINER CLASSES ENDPOINTS ============

    @GetMapping("/classes")
    public ResponseEntity<?> getClasses(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        Long trainerId = getAuthenticatedTrainerId();

        List<com.gym.management.model.TrainerClass> classes;
        if (startDate != null && endDate != null) {
            classes = trainerClassRepository.findByTrainerUserIdAndClassDateBetweenOrderByClassDateAscStartTimeAsc(
                    trainerId, LocalDate.parse(startDate), LocalDate.parse(endDate));
        } else {
            classes = trainerClassRepository.findByTrainerUserIdOrderByClassDateAscStartTimeAsc(trainerId);
        }

        List<com.gym.management.dto.trainer.TrainerClassDTO> dtos = classes.stream()
                .map(this::mapToClassDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(apiResponse(true, dtos, null));
    }

    @GetMapping("/classes/today")
    public ResponseEntity<?> getTodayClasses() {
        Long trainerId = getAuthenticatedTrainerId();
        LocalDate today = LocalDate.now();
        List<com.gym.management.model.TrainerClass> classes = trainerClassRepository
                .findByTrainerUserIdAndClassDate(trainerId, today);
        List<com.gym.management.dto.trainer.TrainerClassDTO> dtos = classes.stream()
                .map(this::mapToClassDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(apiResponse(true, dtos, null));
    }

    @PostMapping("/classes")
    public ResponseEntity<?> createClass(
            @RequestBody com.gym.management.dto.trainer.TrainerClassDTO.CreateRequest req) {
        Long trainerId = getAuthenticatedTrainerId();

        com.gym.management.model.TrainerClass cls = new com.gym.management.model.TrainerClass();
        User trainer = userRepository.findById(trainerId).orElseThrow(() -> new RuntimeException("Trainer not found"));
        cls.setTrainer(trainer);
        cls.setTitle(req.getTitle());
        cls.setClassDate(LocalDate.parse(req.getDate()));
        cls.setStartTime(java.time.LocalTime.parse(req.getStartTime()));
        cls.setEndTime(java.time.LocalTime.parse(req.getEndTime()));
        cls.setDuration(req.getDuration());
        cls.setRoom(req.getRoom());
        cls.setCapacity(req.getCapacity() != null ? req.getCapacity() : 20);
        cls.setType("pt".equalsIgnoreCase(req.getType())
                ? com.gym.management.model.TrainerClass.ClassType.PT
                : com.gym.management.model.TrainerClass.ClassType.GROUP);
        cls.setRecurring(req.getRecurring() != null && req.getRecurring());
        cls.setNotes(req.getNotes());
        cls.setStatus(com.gym.management.model.TrainerClass.ClassStatus.UPCOMING);

        trainerClassRepository.save(cls);
        return ResponseEntity.ok(apiResponse(true, mapToClassDTO(cls), "Class created successfully"));
    }

    @PutMapping("/classes/{id}")
    public ResponseEntity<?> updateClass(@PathVariable Long id,
            @RequestBody com.gym.management.dto.trainer.TrainerClassDTO.CreateRequest req) {
        Long trainerId = getAuthenticatedTrainerId();
        com.gym.management.model.TrainerClass cls = trainerClassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        if (!cls.getTrainer().getUserId().equals(trainerId)) {
            return ResponseEntity.status(403).body(apiResponse(false, null, "Access denied"));
        }

        if (req.getTitle() != null)
            cls.setTitle(req.getTitle());
        if (req.getDate() != null)
            cls.setClassDate(LocalDate.parse(req.getDate()));
        if (req.getStartTime() != null)
            cls.setStartTime(java.time.LocalTime.parse(req.getStartTime()));
        if (req.getEndTime() != null)
            cls.setEndTime(java.time.LocalTime.parse(req.getEndTime()));
        if (req.getDuration() != null)
            cls.setDuration(req.getDuration());
        if (req.getRoom() != null)
            cls.setRoom(req.getRoom());
        if (req.getCapacity() != null)
            cls.setCapacity(req.getCapacity());
        if (req.getNotes() != null)
            cls.setNotes(req.getNotes());
        if (req.getRecurring() != null)
            cls.setRecurring(req.getRecurring());
        if (req.getType() != null) {
            cls.setType("pt".equalsIgnoreCase(req.getType())
                    ? com.gym.management.model.TrainerClass.ClassType.PT
                    : com.gym.management.model.TrainerClass.ClassType.GROUP);
        }

        trainerClassRepository.save(cls);
        return ResponseEntity.ok(apiResponse(true, mapToClassDTO(cls), "Class updated successfully"));
    }

    @PutMapping("/classes/{id}/status")
    public ResponseEntity<?> updateClassStatus(@PathVariable Long id,
            @RequestBody com.gym.management.dto.trainer.TrainerClassDTO.StatusRequest req) {
        Long trainerId = getAuthenticatedTrainerId();
        com.gym.management.model.TrainerClass cls = trainerClassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        if (!cls.getTrainer().getUserId().equals(trainerId)) {
            return ResponseEntity.status(403).body(apiResponse(false, null, "Access denied"));
        }

        String status = req.getStatus().toUpperCase().replace("-", "_");
        cls.setStatus(com.gym.management.model.TrainerClass.ClassStatus.valueOf(status));
        trainerClassRepository.save(cls);

        return ResponseEntity.ok(apiResponse(true, mapToClassDTO(cls), "Status updated"));
    }

    @DeleteMapping("/classes/{id}")
    public ResponseEntity<?> deleteClass(@PathVariable Long id) {
        Long trainerId = getAuthenticatedTrainerId();
        com.gym.management.model.TrainerClass cls = trainerClassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        if (!cls.getTrainer().getUserId().equals(trainerId)) {
            return ResponseEntity.status(403).body(apiResponse(false, null, "Access denied"));
        }

        trainerClassAttendeeRepository.deleteByClassId(id);
        trainerClassRepository.delete(cls);
        return ResponseEntity.ok(apiResponse(true, null, "Class deleted"));
    }

    @GetMapping("/classes/{id}/attendees")
    public ResponseEntity<?> getClassAttendees(@PathVariable Long id) {
        List<com.gym.management.model.TrainerClassAttendee> attendees = trainerClassAttendeeRepository
                .findByClassId(id);
        List<Map<String, Object>> result = attendees.stream().map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", a.getId());
            m.put("memberId", a.getMemberId());
            m.put("status", a.getStatus().name());
            // Get member name
            userRepository.findById(a.getMemberId()).ifPresent(u -> m.put("memberName", u.getFullName()));
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(apiResponse(true, result, null));
    }

    @PutMapping("/classes/{id}/attendance")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> updateAttendance(@PathVariable Long id,
            @RequestBody com.gym.management.dto.trainer.TrainerClassDTO.AttendanceRequest req) {
        // Update attendance for each attendee
        for (com.gym.management.dto.trainer.TrainerClassDTO.AttendeeUpdate update : req.getAttendees()) {
            trainerClassAttendeeRepository.findByClassId(id).stream()
                    .filter(a -> a.getMemberId().equals(update.getMemberId()))
                    .findFirst()
                    .ifPresent(a -> {
                        a.setStatus(com.gym.management.model.TrainerClassAttendee.AttendeeStatus
                                .valueOf(update.getStatus()));
                        trainerClassAttendeeRepository.save(a);
                    });
        }

        // Recalculate enrolled count
        com.gym.management.model.TrainerClass cls = trainerClassRepository.findById(id).orElse(null);
        if (cls != null) {
            long confirmed = trainerClassAttendeeRepository.countByClassIdAndStatus(id,
                    com.gym.management.model.TrainerClassAttendee.AttendeeStatus.CONFIRMED);
            long pending = trainerClassAttendeeRepository.countByClassIdAndStatus(id,
                    com.gym.management.model.TrainerClassAttendee.AttendeeStatus.PENDING);
            cls.setEnrolled((int) (confirmed + pending));
            trainerClassRepository.save(cls);
        }

        return ResponseEntity.ok(apiResponse(true, null, "Attendance updated"));
    }

    private com.gym.management.dto.trainer.TrainerClassDTO mapToClassDTO(com.gym.management.model.TrainerClass cls) {
        // Get attendance counts
        long confirmed = trainerClassAttendeeRepository.countByClassIdAndStatus(cls.getId(),
                com.gym.management.model.TrainerClassAttendee.AttendeeStatus.CONFIRMED);
        long pending = trainerClassAttendeeRepository.countByClassIdAndStatus(cls.getId(),
                com.gym.management.model.TrainerClassAttendee.AttendeeStatus.PENDING);
        long absent = trainerClassAttendeeRepository.countByClassIdAndStatus(cls.getId(),
                com.gym.management.model.TrainerClassAttendee.AttendeeStatus.ABSENT);

        String[] days = { "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" };
        String day = days[cls.getClassDate().getDayOfWeek().getValue() % 7];

        return com.gym.management.dto.trainer.TrainerClassDTO.builder()
                .id(cls.getId())
                .title(cls.getTitle())
                .startTime(cls.getStartTime().toString().substring(0, 5))
                .endTime(cls.getEndTime().toString().substring(0, 5))
                .duration(cls.getDuration())
                .day(day)
                .date(cls.getClassDate().toString())
                .room(cls.getRoom())
                .enrolled(cls.getEnrolled())
                .capacity(cls.getCapacity())
                .status(cls.getStatus().name().toLowerCase().replace("_", "-"))
                .attendees(com.gym.management.dto.trainer.TrainerClassDTO.Attendees.builder()
                        .confirmed((int) confirmed)
                        .pending((int) pending)
                        .absent((int) absent)
                        .build())
                .type(cls.getType().name().toLowerCase())
                .recurring(cls.getRecurring())
                .notes(cls.getNotes())
                .build();
    }

    private Long getAuthenticatedTrainerId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || "anonymousUser".equals(auth.getPrincipal())) {
            throw new RuntimeException("Authentication required - no valid session");
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof CustomUserDetails) {
            return ((CustomUserDetails) principal).getId();
        } else if (principal instanceof UserDetails) {
            String username = ((UserDetails) principal).getUsername();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
            return user.getUserId();
        } else if (principal instanceof String) {
            String username = (String) principal;
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
            return user.getUserId();
        }
        throw new RuntimeException("Unable to determine trainer ID from authentication principal");
    }

    private TrainerSessionDTO mapToSessionDTO(PTSession s) {
        if (s == null) return null;
        try {
            // Safe null checks
            String clientName = "Unknown Client";
            try {
                if (s.getMember() != null) {
                    clientName = s.getMember().getFullName();
                }
            } catch (Exception e) {
                log.warn("Failed to fetch member for session {}", s.getSessionId());
            }

            LocalDateTime start = s.getSessionDate();
            int duration = s.getDurationMinutes() != null ? s.getDurationMinutes() : 60;
            LocalDateTime end = start != null ? start.plusMinutes(duration) : null;

            return TrainerSessionDTO.builder()
                    .id(String.valueOf(s.getSessionId()))
                    .title("PT: " + (clientName != null ? clientName : "Unknown Client"))
                    .type("pt")
                    .startTime(start)
                    .endTime(end)
                    .room("Training Zone") // Mock default
                    .enrolled(1)
                    .capacity(1)
                    .status(mapStatusForFrontend(s))
                    .build();
        } catch (Exception e) {
            log.error("Failed to map session to DTO: session {}", s.getSessionId(), e);
            return null;
        }
    }

    private String mapStatusForFrontend(PTSession s) {
        if (s == null || s.getStatus() == null)
            return "upcoming";

        String status;
        try {
            status = s.getStatus().name();
        } catch (Exception e) {
            return "upcoming";
        }

        if ("COMPLETED".equals(status))
            return "completed";
        if ("CANCELLED".equals(status))
            return "cancelled";
        if ("MISSED".equals(status))
            return "cancelled"; // Treat missed as cancelled for now or add 'missed'

        // Time based check for upcoming/in-progress
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime start = s.getSessionDate();
            int duration = s.getDurationMinutes() != null ? s.getDurationMinutes() : 60;

            if (start != null) {
                LocalDateTime end = start.plusMinutes(duration);
                if (now.isAfter(start) && now.isBefore(end))
                    return "in-progress";
                if (now.isAfter(end) && !"COMPLETED".equals(status))
                    return "completed"; // Auto-complete logic or 'pending-review'
            }
        } catch (Exception e) {
            log.warn("Error calculating time-based status for session {}", s.getSessionId());
        }

        return "upcoming";
    }

    private Map<String, Object> apiResponse(boolean success, Object data, String message) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", success);
        response.put("data", data);
        response.put("message", message);
        return response;
    }
}
