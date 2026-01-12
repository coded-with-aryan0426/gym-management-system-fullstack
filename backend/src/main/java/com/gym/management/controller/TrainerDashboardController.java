package com.gym.management.controller;

import com.gym.management.dto.trainer.TrainerDashboardStatsDTO;
import com.gym.management.dto.trainer.TrainerSessionDTO;
import com.gym.management.model.ProgressNote;
import com.gym.management.model.PTSession;
import com.gym.management.model.User;
import com.gym.management.repository.ProgressNoteRepository;
import com.gym.management.repository.UserRepository;
import com.gym.management.repository.PTSessionRepository;
import com.gym.management.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.*;
import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/trainer")
public class TrainerDashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PTSessionRepository ptSessionRepository;

    @Autowired
    private com.gym.management.repository.TrainerDetailsRepository trainerDetailsRepository;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Autowired
    private ProgressNoteRepository progressNoteRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<TrainerDashboardStatsDTO> getDashboard() {
        Long trainerId = getAuthenticatedTrainerId();
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        List<PTSession> allSessions = ptSessionRepository.findByTrainerId(trainerId);
        LocalDate today = LocalDate.now();

        // 1. Calculate Earnings (Mock Logic: Completed Session * $50)
        double todayEarnings = allSessions.stream()
                .filter(s -> s.getSessionDate().toLocalDate().equals(today) && "COMPLETED".equals(s.getStatus().name()))
                .count() * 50.0;

        double monthEarnings = allSessions.stream()
                .filter(s -> s.getSessionDate().getMonth().equals(today.getMonth())
                        && "COMPLETED".equals(s.getStatus().name()))
                .count() * 50.0;

        // 2. Today's Stats
        List<PTSession> todaySessions = allSessions.stream()
                .filter(s -> s.getSessionDate().toLocalDate().equals(today))
                .collect(Collectors.toList());

        int totalToday = todaySessions.size();
        int completedToday = (int) todaySessions.stream()
                .filter(s -> "COMPLETED".equals(s.getStatus().name()))
                .count();

        // 3. Attendance Rate (Completed / (Completed + Cancelled + NoShow) * 100)
        long totalForRate = allSessions.stream()
                .filter(s -> Set.of("COMPLETED", "CANCELLED", "MISSED").contains(s.getStatus().name()))
                .count();
        long completedTotal = allSessions.stream()
                .filter(s -> "COMPLETED".equals(s.getStatus().name()))
                .count();
        double attendanceRate = totalForRate > 0 ? ((double) completedTotal / totalForRate) * 100 : 0;

        // 4. Active Members
        int activeMembers = trainer.getCustomers() != null ? trainer.getCustomers().size() : 0;
        int totalMembers = activeMembers; // Assuming all assigned are 'total' for now

        // 5. Map Sessions to DTO
        List<TrainerSessionDTO> sessionDTOs = allSessions.stream()
                .filter(s -> s.getSessionDate().isAfter(LocalDateTime.now().minusHours(24))) // Last 24h + Future
                .sorted(Comparator.comparing(PTSession::getSessionDate))
                .limit(10)
                .map(this::mapToSessionDTO)
                .collect(Collectors.toList());

        TrainerDashboardStatsDTO stats = TrainerDashboardStatsDTO.builder()
                .trainerName(trainer.getFullName())
                .todayEarnings(todayEarnings)
                .monthEarnings(monthEarnings)
                .completedToday(completedToday)
                .totalToday(totalToday)
                .attendanceRate(Math.round(attendanceRate * 10.0) / 10.0) // Round to 1 decimal
                .activeMembers(activeMembers)
                .totalMembers(totalMembers)
                .sessions(sessionDTOs)
                .build();

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Long trainerId = getAuthenticatedTrainerId();
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        com.gym.management.model.TrainerDetails details = trainerDetailsRepository.findById(trainerId).orElse(null);

        // Map to DTO
        com.gym.management.dto.trainer.TrainerProfileDTO dto = mapToProfileDTO(trainer, details);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/profile")
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

        if (dto.getEmployeeId() != null)
            details.setEmployeeId(dto.getEmployeeId());
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
            e.printStackTrace();
        }

        trainerDetailsRepository.save(details);
        return ResponseEntity.ok(apiResponse(true, mapToProfileDTO(trainer, details), "Profile updated successfully"));
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
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(apiResponse(false, null, "Failed to upload file: " + e.getMessage()));
        }
    }

    private com.gym.management.dto.trainer.TrainerProfileDTO mapToProfileDTO(User trainer,
            com.gym.management.model.TrainerDetails details) {
        com.gym.management.dto.trainer.TrainerProfileDTO.TrainerProfileDTOBuilder builder = com.gym.management.dto.trainer.TrainerProfileDTO
                .builder()
                .userId(trainer.getUserId())
                .name(trainer.getFullName())
                .email(trainer.getEmail())
                .phone(trainer.getPhone())
                .role("Senior Personal Trainer");

        if (details != null) {
            builder.employeeId(details.getEmployeeId())
                    .dob(details.getDob() != null ? details.getDob().toString() : null)
                    .gender(details.getGender())
                    .bloodType(details.getBloodType())
                    .address(details.getAddress())
                    .altPhone(details.getAltPhone())
                    .joiningDate(details.getJoiningDate() != null ? details.getJoiningDate().toString() : "Jan 2020")
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
                    .shift(details.getShift());

            if (details.getSpecializations() != null) {
                builder.specializations(Arrays.asList(details.getSpecializations().split(",")));
            } else {
                builder.specializations(Collections.emptyList());
            }

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
            // Default empty/mock values for new profile
            builder.languages(Arrays.asList("English", "Hindi"))
                    .specializations(Arrays.asList("Strength Training", "HIIT"))
                    .certifications(Collections.emptyList())
                    .documents(Collections.emptyList());
        }

        builder.stats(com.gym.management.dto.trainer.TrainerProfileDTO.ProfileStatsDTO.builder()
                .activeMembers(trainer.getCustomers() != null ? trainer.getCustomers().size() : 0)
                .totalMembers(trainer.getCustomers() != null ? trainer.getCustomers().size() : 0)
                .sessionsMonth(86)
                .attendance(94.0)
                .rating(4.9)
                .reviews(127)
                .experience("8 Yrs")
                .earnings(48500.0)
                .build());

        return builder.build();
    }

    // Keeping other methods but ensuring they use standard response structure if
    // needed...
    @GetMapping("/my-members")
    public ResponseEntity<?> getMyMembers(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String q) {
        Long trainerId = getAuthenticatedTrainerId();
        User trainer = userRepository.findById(trainerId).orElseThrow();

        List<User> filtered = trainer.getCustomers().stream()
                .filter(c -> q == null || c.getFullName().toLowerCase().contains(q.toLowerCase()))
                .collect(Collectors.toList());

        // Simple pagination
        int fromIndex = Math.min(page * size, filtered.size());
        int toIndex = Math.min(fromIndex + size, filtered.size());
        List<User> pageContent = filtered.subList(fromIndex, toIndex);

        Map<String, Object> result = new HashMap<>();
        result.put("items", pageContent);
        result.put("totalItems", filtered.size());
        result.put("totalPages", (int) Math.ceil((double) filtered.size() / size));

        return ResponseEntity.ok(apiResponse(true, result, null));
    }

    @GetMapping("/schedule")
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
    public ResponseEntity<?> getAllNotes() {
        Long trainerId = getAuthenticatedTrainerId();
        return ResponseEntity
                .ok(apiResponse(true, progressNoteRepository.findByTrainerUserIdOrderByCreatedAtDesc(trainerId), null));
    }

    private Long getAuthenticatedTrainerId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new SecurityException("No authentication info found");
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof CustomUserDetails) {
            return ((CustomUserDetails) principal).getId();
        } else if (principal instanceof UserDetails) {
            // Fallback if CustomUserDetails is not used but UserDetails is (unlikely given
            // setup but possible)
            // We might need to look up by username
            String username = ((UserDetails) principal).getUsername();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
            return user.getUserId();
        } else if (principal instanceof String) {
            // Fallback for string principal (e.g. "anonymousUser" or just username)
            String username = (String) principal;
            if ("anonymousUser".equals(username)) {
                throw new SecurityException("User is anonymous");
            }
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
            return user.getUserId();
        }

        throw new SecurityException("Unknown principal type: " + principal.getClass().getName());
    }

    private TrainerSessionDTO mapToSessionDTO(PTSession s) {
        try {
            // Safe null checks
            String clientName = s.getMember() != null ? s.getMember().getFullName() : "Unknown Client";
            LocalDateTime start = s.getSessionDate();
            int duration = s.getDurationMinutes() != null ? s.getDurationMinutes() : 60;
            LocalDateTime end = start != null ? start.plusMinutes(duration) : null;

            return TrainerSessionDTO.builder()
                    .id(String.valueOf(s.getSessionId()))
                    .title("PT: " + clientName)
                    .type("pt")
                    .startTime(start)
                    .endTime(end)
                    .room("Training Zone") // Mock default
                    .enrolled(1)
                    .capacity(1)
                    .status(mapStatusForFrontend(s))
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private String mapStatusForFrontend(PTSession s) {
        if (s.getStatus() == null)
            return "upcoming";

        String status = s.getStatus().name();

        if ("COMPLETED".equals(status))
            return "completed";
        if ("CANCELLED".equals(status))
            return "cancelled";
        if ("MISSED".equals(status))
            return "cancelled"; // Treat missed as cancelled for now or add 'missed'

        // Time based check for upcoming/in-progress
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
