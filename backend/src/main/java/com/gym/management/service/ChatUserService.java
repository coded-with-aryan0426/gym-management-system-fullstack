package com.gym.management.service;

import com.gym.management.dto.ChatUserDTO;
import com.gym.management.model.*;
import com.gym.management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for discovering users available for chat.
 * Handles gym-scoped user discovery and filtering by role.
 */
@Service
public class ChatUserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserGymRoleRepository userGymRoleRepository;

    @Autowired
    private BlockingService blockingService;

    /**
     * Get all users available for chat for a given user.
     * Includes: assigned members (for trainers), gym owners, other trainers in same
     * gym.
     * Excludes: blocked users.
     */
    @Transactional(readOnly = true)
    public List<ChatUserDTO> getAvailableChatUsers(Long userId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<Long> blockedIds = new HashSet<>(blockingService.getBlockedUserIds(userId));
        Set<ChatUserDTO> availableUsers = new HashSet<>();

        // Get user's gym memberships
        List<UserGymRole> userGymRoles = userGymRoleRepository.findByUserUserIdAndStatus(userId, RoleStatus.ACTIVE);

        for (UserGymRole ugr : userGymRoles) {
            Long gymId = ugr.getGym().getGymId();
            GymRole userRole = ugr.getRole();

            // If user is a trainer or owner, they can chat with everyone in the gym
            if (userRole == GymRole.TRAINER || userRole == GymRole.OWNER) {
                // Add all active users in this gym
                List<UserGymRole> allGymUsers = userGymRoleRepository.findByGymGymIdAndStatus(gymId, RoleStatus.ACTIVE);
                for (UserGymRole gymUser : allGymUsers) {
                    Long otherId = gymUser.getUser().getUserId();
                    if (!otherId.equals(userId) && !blockedIds.contains(otherId)) {
                        availableUsers.add(mapToDTO(gymUser.getUser(), gymUser.getRole(), gymId));
                    }
                }
            }
            // If user is a member, they see their assigned trainers + owners
            else if (userRole == GymRole.MEMBER) {
                // Add assigned trainers
                Set<User> userTrainers = currentUser.getTrainers();
                if (userTrainers != null) {
                    for (User trainer : userTrainers) {
                        if (!blockedIds.contains(trainer.getUserId())) {
                            availableUsers.add(mapToDTO(trainer, GymRole.TRAINER, gymId));
                        }
                    }
                }

                // Add gym owners (always reachable)
                List<UserGymRole> owners = userGymRoleRepository.findByGymGymIdAndRoleAndStatus(
                        gymId, GymRole.OWNER, RoleStatus.ACTIVE);
                for (UserGymRole ownerRole : owners) {
                    Long ownerId = ownerRole.getUser().getUserId();
                    if (!ownerId.equals(userId) && !blockedIds.contains(ownerId)) {
                        availableUsers.add(mapToDTO(ownerRole.getUser(), GymRole.OWNER, gymId));
                    }
                }
            }
        }

        return new ArrayList<>(availableUsers);
    }

    /**
     * Search users by name within a gym, optionally filtered by role.
     */
    @Transactional(readOnly = true)
    public List<ChatUserDTO> searchUsers(Long currentUserId, String query, Long gymId, GymRole roleFilter) {
        Set<Long> blockedIds = new HashSet<>(blockingService.getBlockedUserIds(currentUserId));

        List<UserGymRole> gymMembers;
        if (roleFilter != null) {
            gymMembers = userGymRoleRepository.findByGymGymIdAndRoleAndStatus(gymId, roleFilter, RoleStatus.ACTIVE);
        } else {
            // Get all active members of the gym
            gymMembers = userGymRoleRepository.findByUserUserIdAndGymGymIdAndStatus(currentUserId, gymId,
                    RoleStatus.ACTIVE);
            // Actually we need all users in the gym, let me fix this
            gymMembers = new ArrayList<>();
            for (GymRole role : GymRole.values()) {
                gymMembers.addAll(userGymRoleRepository.findByGymGymIdAndRoleAndStatus(gymId, role, RoleStatus.ACTIVE));
            }
        }

        String lowerQuery = query.toLowerCase();

        return gymMembers.stream()
                .filter(ugr -> !ugr.getUser().getUserId().equals(currentUserId))
                .filter(ugr -> !blockedIds.contains(ugr.getUser().getUserId()))
                .filter(ugr -> {
                    String fullName = ugr.getUser().getFullName();
                    return fullName != null && fullName.toLowerCase().contains(lowerQuery);
                })
                .map(ugr -> mapToDTO(ugr.getUser(), ugr.getRole(), gymId))
                .distinct()
                .collect(Collectors.toList());
    }

    /**
     * Get users by specific role in a gym.
     */
    @Transactional(readOnly = true)
    public List<ChatUserDTO> getUsersByRole(Long currentUserId, Long gymId, GymRole role) {
        Set<Long> blockedIds = new HashSet<>(blockingService.getBlockedUserIds(currentUserId));

        return userGymRoleRepository.findByGymGymIdAndRoleAndStatus(gymId, role, RoleStatus.ACTIVE).stream()
                .filter(ugr -> !ugr.getUser().getUserId().equals(currentUserId))
                .filter(ugr -> !blockedIds.contains(ugr.getUser().getUserId()))
                .map(ugr -> mapToDTO(ugr.getUser(), role, gymId))
                .collect(Collectors.toList());
    }

    private ChatUserDTO mapToDTO(User user, GymRole role, Long gymId) {
        ChatUserDTO dto = new ChatUserDTO();
        dto.setUserId(user.getUserId());
        dto.setFullName(user.getFullName());
        dto.setUsername(user.getUsername());
        dto.setAvatarId(user.getAvatarId());
        dto.setRole(role.name());
        dto.setGymId(gymId);
        dto.setOnline(false); // TODO: Implement presence tracking
        return dto;
    }
}
