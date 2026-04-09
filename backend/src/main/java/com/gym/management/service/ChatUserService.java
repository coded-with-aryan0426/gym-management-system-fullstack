package com.gym.management.service;

import com.gym.management.dto.ChatUserDTO;
import com.gym.management.model.*;
import com.gym.management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ChatUserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserGymRoleRepository userGymRoleRepository;

    @Autowired
    private BlockingService blockingService;

    @Transactional(readOnly = true)
    public List<ChatUserDTO> getAvailableChatUsers(Long userId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<Long> blockedIds = new HashSet<>(blockingService.getBlockedUserIds(userId));
        Set<ChatUserDTO> availableUsers = new HashSet<>();

        List<UserGymRole> userGymRoles = userGymRoleRepository.findByUserUserIdAndStatus(userId, RoleStatus.ACTIVE);

        for (UserGymRole ugr : userGymRoles) {
            GymRole userRole = ugr.getRole();

            if (userRole == GymRole.TRAINER || userRole == GymRole.OWNER) {
                List<UserGymRole> allGymUsers = userGymRoleRepository.findByGymGymIdAndStatus(ugr.getGym().getGymId(), RoleStatus.ACTIVE);
                for (UserGymRole gymUser : allGymUsers) {
                    Long otherId = gymUser.getUser().getUserId();
                    if (!otherId.equals(userId) && !blockedIds.contains(otherId)) {
                        availableUsers.add(mapToDTO(gymUser.getUser(), gymUser.getRole().name()));
                    }
                }
            } else if (userRole == GymRole.MEMBER) {
                Set<User> userTrainers = currentUser.getTrainers();
                if (userTrainers != null) {
                    for (User trainer : userTrainers) {
                        if (!blockedIds.contains(trainer.getUserId())) {
                            availableUsers.add(mapToDTO(trainer, GymRole.TRAINER.name()));
                        }
                    }
                }

                List<UserGymRole> owners = userGymRoleRepository.findByGymGymIdAndRoleAndStatus(
                        ugr.getGym().getGymId(), GymRole.OWNER, RoleStatus.ACTIVE);
                for (UserGymRole ownerRole : owners) {
                    Long ownerId = ownerRole.getUser().getUserId();
                    if (!ownerId.equals(userId) && !blockedIds.contains(ownerId)) {
                        availableUsers.add(mapToDTO(ownerRole.getUser(), GymRole.OWNER.name()));
                    }
                }
            }
        }

        if (availableUsers.isEmpty()) {
            List<User> allUsers = userRepository.findAll();
            for (User u : allUsers) {
                if (!u.getUserId().equals(userId) && !blockedIds.contains(u.getUserId())) {
                    String fallbackRole = GymRole.MEMBER.name();
                    if (u.getRoles() != null) {
                        for (Role r : u.getRoles()) {
                            String rName = r.getRoleName() != null ? r.getRoleName().toUpperCase() : "";
                            if (rName.contains("OWNER") || rName.contains("ADMIN")) {
                                fallbackRole = GymRole.OWNER.name();
                                break;
                            } else if (rName.contains("TRAINER")) {
                                fallbackRole = GymRole.TRAINER.name();
                                break;
                            }
                        }
                    }
                    availableUsers.add(mapToDTO(u, fallbackRole));
                }
            }
        }

        return new ArrayList<>(availableUsers);
    }

    @Transactional(readOnly = true)
    public List<ChatUserDTO> searchUsers(Long currentUserId, String query) {
        Set<Long> blockedIds = new HashSet<>(blockingService.getBlockedUserIds(currentUserId));
        List<User> matchingUsers = userRepository.findAll().stream()
                .filter(u -> (u.getUsername() != null && u.getUsername().toLowerCase().contains(query.toLowerCase()))
                        || (u.getEmail() != null && u.getEmail().toLowerCase().contains(query.toLowerCase())))
                .toList();

        Set<ChatUserDTO> results = new HashSet<>();
        for (User u : matchingUsers) {
            if (!u.getUserId().equals(currentUserId) && !blockedIds.contains(u.getUserId())) {
                String deducedRole = GymRole.MEMBER.name();
                List<UserGymRole> roles = userGymRoleRepository.findByUserUserIdAndStatus(u.getUserId(), RoleStatus.ACTIVE);
                if (!roles.isEmpty()) {
                    deducedRole = roles.get(0).getRole().name();
                }
                results.add(mapToDTO(u, deducedRole));
            }
        }
        return new ArrayList<>(results);
    }

    private ChatUserDTO mapToDTO(User user, String role) {
        ChatUserDTO dto = new ChatUserDTO();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setRole(role);
        return dto;
    }
}
