package com.gym.management.controller;

import com.gym.management.dto.trainer.TrainerProfileDTO;
import com.gym.management.model.TrainerDetails;
import com.gym.management.model.User;
import com.gym.management.repository.TrainerDetailsRepository;
import com.gym.management.repository.UserRepository;
import com.gym.management.repository.SessionRatingRepository;
import com.gym.management.repository.PTSessionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/member/trainers")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175" })
@PreAuthorize("hasAnyRole('MEMBER', 'CUSTOMER', 'OWNER', 'ADMIN')")
public class MemberTrainerController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TrainerDetailsRepository trainerDetailsRepository;

    @Autowired
    private SessionRatingRepository sessionRatingRepository;

    @Autowired
    private PTSessionRepository ptSessionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping("/assigned")
    public ResponseEntity<List<TrainerProfileDTO>> getAssignedTrainers(@RequestHeader("Authorization") String token) {
        // In a real app, we'd get the user from the token
        // For now, let's assume we can get the current user. 
        // We'll need a way to identify the current logged-in user.
        // Let's use the security context.
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username).orElse(null);
        
        if (currentUser == null || currentUser.getTrainers() == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        
        List<TrainerProfileDTO> dtos = currentUser.getTrainers().stream()
                .map(this::mapToDiscoveryDTO)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{trainerId}/request")
    public ResponseEntity<Map<String, String>> requestTrainer(@PathVariable Long trainerId) {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username).orElse(null);
        User trainer = userRepository.findById(trainerId).orElse(null);

        if (currentUser == null || trainer == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "User or Trainer not found"));
        }

        // For now, let's just add the trainer to the user's trainers list
        // In a more complex system, this would create a 'TrainerRequest' entity
        currentUser.getTrainers().add(trainer);
        userRepository.save(currentUser);

        return ResponseEntity.ok(Map.of("message", "Trainer request successful! " + trainer.getFullName() + " has been assigned."));
    }

    @GetMapping
    public ResponseEntity<List<TrainerProfileDTO>> getAllTrainers() {
        List<User> trainers = userRepository.findByRoleName("TRAINER");
        
        List<TrainerProfileDTO> dtos = trainers.stream()
                .map(this::mapToDiscoveryDTO)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(dtos);
    }

    private TrainerProfileDTO mapToDiscoveryDTO(User trainer) {
        TrainerDetails details = trainerDetailsRepository.findById(trainer.getUserId()).orElse(null);
        
        TrainerProfileDTO.TrainerProfileDTOBuilder builder = TrainerProfileDTO.builder()
                .userId(trainer.getUserId())
                .name(trainer.getFullName())
                .email(trainer.getEmail())
                .phone(trainer.getPhone())
                .bio(details != null ? details.getBio() : "Experienced trainer.")
                .specializations(details != null && details.getSpecializations() != null
                        ? List.of(details.getSpecializations().split(","))
                        : Collections.emptyList())
                .experienceYears(details != null ? details.getExperienceYears() : 0);

        if (details != null) {
            // Skills
            if (details.getSkillsJson() != null) {
                try {
                    List<TrainerProfileDTO.SkillDTO> skills = objectMapper.readValue(
                            details.getSkillsJson(),
                            new com.fasterxml.jackson.core.type.TypeReference<List<TrainerProfileDTO.SkillDTO>>() {});
                    builder.skills(skills);
                } catch (Exception e) {
                    builder.skills(Collections.emptyList());
                }
            } else {
                builder.skills(Collections.emptyList());
            }

            // Availability
            if (details.getAvailabilityJson() != null) {
                try {
                    List<TrainerProfileDTO.AvailabilityDTO> availability = objectMapper.readValue(
                            details.getAvailabilityJson(),
                            new com.fasterxml.jackson.core.type.TypeReference<List<TrainerProfileDTO.AvailabilityDTO>>() {});
                    builder.availability(availability);
                } catch (Exception e) {
                    builder.availability(Collections.emptyList());
                }
            } else {
                builder.availability(Collections.emptyList());
            }

            // Certifications
            if (details.getCertificationsJson() != null) {
                try {
                    List<TrainerProfileDTO.CertificationDTO> certs = objectMapper.readValue(
                            details.getCertificationsJson(),
                            new com.fasterxml.jackson.core.type.TypeReference<List<TrainerProfileDTO.CertificationDTO>>() {});
                    builder.certifications(certs);
                } catch (Exception e) {
                    builder.certifications(Collections.emptyList());
                }
            } else {
                builder.certifications(Collections.emptyList());
            }
        }

        // Stats for discovery
        Double avgRating = sessionRatingRepository.findAverageRatingByTrainer(trainer.getUserId());
        long reviewsVal = sessionRatingRepository.countByTrainerUserId(trainer.getUserId());
        
        builder.stats(TrainerProfileDTO.ProfileStatsDTO.builder()
                .rating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .reviews((int) reviewsVal)
                .experience(details != null && details.getExperienceYears() != null ? details.getExperienceYears() + " Yrs" : "0 Yrs")
                .activeMembers(trainer.getCustomers() != null ? trainer.getCustomers().size() : 0)
                .build());

        return builder.build();
    }
}
