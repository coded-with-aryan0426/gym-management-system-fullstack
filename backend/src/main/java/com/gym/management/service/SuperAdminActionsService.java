package com.gym.management.service;

import com.gym.management.model.AuditLog;
import com.gym.management.model.Gym;
import com.gym.management.model.User;
import com.gym.management.repository.AuditLogRepository;
import com.gym.management.repository.GymRepository;
import com.gym.management.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

/**
 * Service for Super Admin mutating actions:
 *  - Suspend / activate a gym
 *  - Ban / unban a user
 * All actions are automatically recorded in the audit_logs table.
 */
@Service
public class SuperAdminActionsService {

    private final GymRepository gymRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public SuperAdminActionsService(GymRepository gymRepository,
                                    UserRepository userRepository,
                                    AuditLogRepository auditLogRepository) {
        this.gymRepository = gymRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    /** Suspend a gym — sets isPublic=false so it disappears from discovery. */
    @Transactional
    public Map<String, Object> suspendGym(Long gymId, String reason) {
        Optional<Gym> gymOpt = gymRepository.findById(gymId);
        if (gymOpt.isEmpty()) {
            return Map.of("success", false, "message", "Gym not found");
        }
        Gym gym = gymOpt.get();
        gym.setIsPublic(false);
        gymRepository.save(gym);

        auditLogRepository.save(AuditLog.builder()
                .action("GYM_SUSPENDED")
                .entity("Gym")
                .entityId(String.valueOf(gymId))
                .entityName(gym.getName())
                .details("Gym suspended by Super Admin. Reason: " + (reason != null ? reason : "Not specified"))
                .userName("SuperAdmin")
                .userRole("SUPER_ADMIN")
                .severity("high")
                .timestamp(LocalDateTime.now())
                .build());

        return Map.of("success", true, "message", "Gym '" + gym.getName() + "' has been suspended");
    }

    /** Reactivate a suspended gym. */
    @Transactional
    public Map<String, Object> activateGym(Long gymId) {
        Optional<Gym> gymOpt = gymRepository.findById(gymId);
        if (gymOpt.isEmpty()) {
            return Map.of("success", false, "message", "Gym not found");
        }
        Gym gym = gymOpt.get();
        gym.setIsPublic(true);
        gymRepository.save(gym);

        auditLogRepository.save(AuditLog.builder()
                .action("GYM_ACTIVATED")
                .entity("Gym")
                .entityId(String.valueOf(gymId))
                .entityName(gym.getName())
                .details("Gym reactivated by Super Admin")
                .userName("SuperAdmin")
                .userRole("SUPER_ADMIN")
                .severity("info")
                .timestamp(LocalDateTime.now())
                .build());

        return Map.of("success", true, "message", "Gym '" + gym.getName() + "' has been reactivated");
    }

    /** Ban a user — sets accountNonLocked=false to prevent login. */
    @Transactional
    public Map<String, Object> banUser(Long userId, String reason) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("success", false, "message", "User not found");
        }
        User user = userOpt.get();
        user.setAccountNonLocked(false);
        userRepository.save(user);

        auditLogRepository.save(AuditLog.builder()
                .action("USER_BANNED")
                .entity("User")
                .entityId(String.valueOf(userId))
                .entityName(user.getFullName() != null ? user.getFullName() : user.getUsername())
                .details("User banned by Super Admin. Reason: " + (reason != null ? reason : "Not specified"))
                .userName("SuperAdmin")
                .userRole("SUPER_ADMIN")
                .severity("critical")
                .timestamp(LocalDateTime.now())
                .build());

        return Map.of("success", true, "message", "User '" + user.getUsername() + "' has been banned");
    }

    /** Unban a user — restores accountNonLocked=true. */
    @Transactional
    public Map<String, Object> unbanUser(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return Map.of("success", false, "message", "User not found");
        }
        User user = userOpt.get();
        user.setAccountNonLocked(true);
        userRepository.save(user);

        auditLogRepository.save(AuditLog.builder()
                .action("USER_UNBANNED")
                .entity("User")
                .entityId(String.valueOf(userId))
                .entityName(user.getFullName() != null ? user.getFullName() : user.getUsername())
                .details("User unbanned by Super Admin")
                .userName("SuperAdmin")
                .userRole("SUPER_ADMIN")
                .severity("info")
                .timestamp(LocalDateTime.now())
                .build());

        return Map.of("success", true, "message", "User '" + user.getUsername() + "' has been unbanned");
    }
}
