package com.gym.management.service;

import com.gym.management.dto.MemberProfileDTO;
import com.gym.management.dto.MemberProfileUpdateDTO;
import com.gym.management.model.*;
import com.gym.management.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberProfileService {

    private final UserRepository userRepository;
    private final MembershipRepository membershipRepository;
    private final WorkoutLogRepository workoutLogRepository;
    private final MemberAchievementRepository memberAchievementRepository;

    public MemberProfileDTO getMemberProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        MemberProfileDTO.MemberStatsDTO stats = calculateMemberStatsSafe(userId, user);
        MemberProfileDTO.MembershipInfoDTO membershipInfo = getMembershipInfoSafe(userId);
        List<MemberProfileDTO.AchievementDTO> achievements = getAchievementsSafe(userId);

        return MemberProfileDTO.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarId(user.getAvatarId())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender())
                .bloodType(user.getBloodType())
                .address(user.getAddress())
                .city(user.getCity())
                .state(user.getState())
                .zipCode(user.getZipCode())
                .emergencyContactName(user.getEmergencyContactName())
                .emergencyContactPhone(user.getEmergencyContactPhone())
                .healthNotes(user.getHealthNotes())
                .fitnessGoals(parseFitnessGoals(user.getFitnessGoals()))
                .height(user.getHeight())
                .weight(user.getWeight())
                .bodyFat(user.getBodyFat())
                .twoFactorEnabled(user.getTwoFactorEnabled())
                .stats(stats)
                .membership(membershipInfo)
                .achievements(achievements)
                .build();
    }

    @Transactional
    public MemberProfileDTO updateMemberProfile(Long userId, MemberProfileUpdateDTO updateDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (updateDTO.getFullName() != null) {
            user.setFullName(updateDTO.getFullName());
        }
        if (updateDTO.getPhone() != null) {
            user.setPhone(updateDTO.getPhone());
        }
        if (updateDTO.getAvatarId() != null) {
            user.setAvatarId(updateDTO.getAvatarId());
        }
        if (updateDTO.getDateOfBirth() != null) {
            user.setDateOfBirth(updateDTO.getDateOfBirth());
        }
        if (updateDTO.getGender() != null) {
            user.setGender(updateDTO.getGender());
        }
        if (updateDTO.getBloodType() != null) {
            user.setBloodType(updateDTO.getBloodType());
        }
        if (updateDTO.getAddress() != null) {
            user.setAddress(updateDTO.getAddress());
        }
        if (updateDTO.getCity() != null) {
            user.setCity(updateDTO.getCity());
        }
        if (updateDTO.getState() != null) {
            user.setState(updateDTO.getState());
        }
        if (updateDTO.getZipCode() != null) {
            user.setZipCode(updateDTO.getZipCode());
        }
        if (updateDTO.getEmergencyContactName() != null) {
            user.setEmergencyContactName(updateDTO.getEmergencyContactName());
        }
        if (updateDTO.getEmergencyContactPhone() != null) {
            user.setEmergencyContactPhone(updateDTO.getEmergencyContactPhone());
        }
        if (updateDTO.getHealthNotes() != null) {
            user.setHealthNotes(updateDTO.getHealthNotes());
        }
        if (updateDTO.getFitnessGoals() != null) {
            user.setFitnessGoals(String.join(",", updateDTO.getFitnessGoals()));
        }
        if (updateDTO.getHeight() != null) {
            user.setHeight(updateDTO.getHeight());
        }
        if (updateDTO.getWeight() != null) {
            user.setWeight(updateDTO.getWeight());
        }
        if (updateDTO.getBodyFat() != null) {
            user.setBodyFat(updateDTO.getBodyFat());
        }

        userRepository.save(user);
        return getMemberProfile(userId);
    }

    private MemberProfileDTO.MemberStatsDTO calculateMemberStatsSafe(Long userId, User user) {
        String memberLevel = "Beginner";
        LocalDate joinedDate = user.getCreatedAt() != null ? user.getCreatedAt().toLocalDate() : null;

        return MemberProfileDTO.MemberStatsDTO.builder()
                .totalWorkouts(0)
                .currentStreak(0)
                .memberLevel(memberLevel)
                .joinedDate(joinedDate)
                .build();
    }

    private MemberProfileDTO.MembershipInfoDTO getMembershipInfoSafe(Long userId) {
        try {
            return membershipRepository.findTopByUserUserIdAndStatusOrderByEndDateDesc(userId, MembershipStatus.ACTIVE)
                    .map(membership -> {
                        int daysRemaining = (int) ChronoUnit.DAYS.between(LocalDate.now(), membership.getEndDate());
                        return MemberProfileDTO.MembershipInfoDTO.builder()
                                .membershipId(membership.getId())
                                .planName(membership.getMembershipPackage() != null ? 
                                        membership.getMembershipPackage().getPackageName() : "Unknown")
                                .planType(null)
                                .startDate(membership.getStartDate())
                                .endDate(membership.getEndDate())
                                .daysRemaining(Math.max(0, daysRemaining))
                                .status(membership.getStatus().name())
                                .build();
                    })
                    .orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private List<MemberProfileDTO.AchievementDTO> getAchievementsSafe(Long userId) {
        return Collections.emptyList();
    }

    private int calculateStreak(Long userId) {
        List<LocalDate> workoutDates = workoutLogRepository.findWorkoutDatesByUserId(userId);
        if (workoutDates.isEmpty()) {
            return 0;
        }

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        
        if (!workoutDates.contains(today) && !workoutDates.contains(yesterday)) {
            return 0;
        }

        int streak = 0;
        LocalDate checkDate = workoutDates.contains(today) ? today : yesterday;
        
        for (LocalDate date : workoutDates) {
            if (date.equals(checkDate)) {
                streak++;
                checkDate = checkDate.minusDays(1);
            } else if (date.isBefore(checkDate)) {
                break;
            }
        }

        return streak;
    }

    private String calculateMemberLevel(long totalWorkouts) {
        if (totalWorkouts >= 200) return "Platinum";
        if (totalWorkouts >= 100) return "Gold";
        if (totalWorkouts >= 50) return "Silver";
        if (totalWorkouts >= 20) return "Bronze";
        return "Beginner";
    }

    private List<String> parseFitnessGoals(String fitnessGoals) {
        if (fitnessGoals == null || fitnessGoals.isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.asList(fitnessGoals.split(","));
    }
}
