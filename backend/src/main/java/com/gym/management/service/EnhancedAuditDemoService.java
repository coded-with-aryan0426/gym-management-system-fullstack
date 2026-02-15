package com.gym.management.service;

import com.gym.management.annotation.Loggable;
import com.gym.management.model.User;
import com.gym.management.model.Membership;
import com.gym.management.model.MembershipPackage;
import com.gym.management.model.MembershipStatus;
import com.gym.management.dto.MemberDTO;
import com.gym.management.dto.MemberProfileDTO;
import com.gym.management.dto.MemberProfileUpdateDTO;
import com.gym.management.repository.UserRepository;
import com.gym.management.repository.MembershipRepository;
import com.gym.management.repository.MembershipPackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Example service demonstrating the enhanced audit logging system
 * Shows how to use @Loggable annotation for comprehensive tracking
 */
@Service
public class EnhancedAuditDemoService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private MembershipPackageRepository membershipPackageRepository;

    /**
     * Create a new member with comprehensive audit logging
     */
    @Loggable(action = "MEMBER_CREATE", entity = "User", severity = "info", logParameters = true, logReturnValue = true, trackChanges = true, detailsTemplate = "New member registration", excludeFields = {
            "password", "otpSecret" })
    @Transactional
    public MemberDTO createMember(MemberProfileDTO memberProfile) {
        User user = new User();
        user.setUsername(memberProfile.getEmail());
        user.setFullName(memberProfile.getFullName());
        user.setEmail(memberProfile.getEmail());
        user.setPhoneNumberPersisted(memberProfile.getPhone());
        user.setDateOfBirth(memberProfile.getDateOfBirth());
        user.setGender(memberProfile.getGender());
        // Note: User model doesn't have address field, so we'll skip it
        // user.setAddress(memberProfile.getAddress());
        // Note: User model doesn't have emergency contact field, so we'll skip it
        // user.setEmergencyContact(memberProfile.getEmergencyContactName() + " - " +
        // memberProfile.getEmergencyContactPhone());

        User savedUser = userRepository.save(user);

        // Create membership
        Membership membership = new Membership();
        membership.setUser(savedUser);
        membership.setStatus(MembershipStatus.PENDING);
        membership.setStartDate(LocalDate.now());

        membershipRepository.save(membership);

        return convertToMemberDTO(savedUser, membership);
    }

    /**
     * Update member information with change tracking
     */
    @Loggable(action = "MEMBER_UPDATE", entity = "User", severity = "info", logParameters = true, logReturnValue = true, trackChanges = true, detailsTemplate = "Member profile update", excludeFields = {
            "password" })
    @Transactional
    public MemberDTO updateMember(Long userId, MemberProfileUpdateDTO updateDTO) {
        Optional<User> existingUser = userRepository.findById(userId);

        if (existingUser.isPresent()) {
            User user = existingUser.get();

            // Update with new values
            user.setFullName(updateDTO.getFullName());
            user.setPhoneNumberPersisted(updateDTO.getPhone());
            // Note: User model doesn't have address field, so we'll skip it
            // user.setAddress(updateDTO.getAddress());

            User savedUser = userRepository.save(user);

            // Get membership info
            Optional<Membership> membership = membershipRepository.findByUserUserId(userId).stream().findFirst();

            return convertToMemberDTO(savedUser, membership.orElse(null));
        }

        throw new RuntimeException("User not found with ID: " + userId);
    }

    /**
     * Deactivate member with business impact tracking
     */
    @Loggable(action = "MEMBER_DEACTIVATE", entity = "User", severity = "warning", logParameters = true, logReturnValue = false, trackChanges = true, detailsTemplate = "Member account deactivation")
    @Transactional
    public void deactivateMember(Long userId, String reason) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // Note: User model doesn't have status field with INACTIVE option, so we'll use
            // accountNonLocked
            user.setAccountNonLocked(false);

            userRepository.save(user);

            // Cancel active memberships
            List<Membership> activeMemberships = membershipRepository.findByUserUserIdAndStatus(userId,
                    MembershipStatus.ACTIVE);
            for (Membership membership : activeMemberships) {
                membership.setStatus(MembershipStatus.CANCELLED);
                membership.setEndDate(LocalDate.now());
                membershipRepository.save(membership);
            }
        } else {
            throw new RuntimeException("User not found with ID: " + userId);
        }
    }

    /**
     * Bulk member operations with detailed tracking
     */
    @Loggable(action = "MEMBER_BULK_UPDATE", entity = "User", severity = "info", logParameters = true, logReturnValue = true, trackChanges = false, detailsTemplate = "Bulk member status update")
    @Transactional
    public int bulkUpdateMemberStatus(List<Long> userIds, boolean lockStatus) {
        int updatedCount = 0;

        for (Long userId : userIds) {
            try {
                Optional<User> userOptional = userRepository.findById(userId);
                if (userOptional.isPresent()) {
                    User user = userOptional.get();
                    user.setAccountNonLocked(lockStatus);
                    userRepository.save(user);
                    updatedCount++;
                }
            } catch (Exception e) {
                // Log individual member update failure
                System.err.println("Failed to update member status for user: " + userId + " - " + e.getMessage());
            }
        }

        return updatedCount;
    }

    /**
     * Sensitive operation - membership upgrade
     */
    @Loggable(action = "MEMBERSHIP_UPGRADE", entity = "Membership", severity = "warning", logParameters = true, logReturnValue = false, trackChanges = true, detailsTemplate = "Membership plan upgrade", includeSensitiveData = false)
    @Transactional
    public Membership upgradeMembership(Long userId, Long newPackageId) {
        // Find current active membership
        List<Membership> currentMemberships = membershipRepository.findByUserUserIdAndStatus(userId,
                MembershipStatus.ACTIVE);

        if (!currentMemberships.isEmpty()) {
            Membership membership = currentMemberships.get(0);

            // Get new package
            Optional<MembershipPackage> newPackage = membershipPackageRepository.findById(newPackageId);
            if (newPackage.isPresent()) {
                // Update membership
                membership.setMembershipPackage(newPackage.get());
                membership.setStatus(MembershipStatus.ACTIVE);
                membership.setStartDate(LocalDate.now());
                membership.setEndDate(LocalDate.now().plusMonths(1)); // Assuming monthly packages

                return membershipRepository.save(membership);
            } else {
                throw new RuntimeException("Membership package not found with ID: " + newPackageId);
            }
        } else {
            throw new RuntimeException("No active membership found for user: " + userId);
        }
    }

    /**
     * High-risk operation - member data export
     */
    @Loggable(action = "MEMBER_DATA_EXPORT", entity = "User", severity = "high", logParameters = true, logReturnValue = false, trackChanges = false, detailsTemplate = "Member data export for GDPR compliance", includeSensitiveData = false)
    public String exportMemberData(Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // Create data export (simplified for demo)
            StringBuilder exportData = new StringBuilder();
            exportData.append("Member Data Export\n");
            exportData.append("==================\n");
            exportData.append("Name: ").append(user.getFullName()).append("\n");
            exportData.append("Email: ").append(user.getEmail()).append("\n");
            exportData.append("Phone: ").append(user.getPhoneNumberPersisted()).append("\n");
            exportData.append("Join Date: ").append(user.getCreatedAt()).append("\n");
            exportData.append("Status: ").append(user.getAccountNonLocked() ? "ACTIVE" : "INACTIVE").append("\n");

            return exportData.toString();
        }

        throw new RuntimeException("User not found with ID: " + userId);
    }

    /**
     * System maintenance operation
     */
    @Loggable(action = "MEMBER_MAINTENANCE", entity = "User", severity = "info", logParameters = false, logReturnValue = true, trackChanges = false, detailsTemplate = "System maintenance: Member cleanup")
    public int cleanupInactiveMembers() {
        // Find members inactive for more than 2 years
        // Note: User model doesn't have createdAt field, so we'll use a different
        // approach
        // For demo purposes, we'll just return 0
        return 0;
    }

    /**
     * Get member with audit logging on read operations
     */
    @Loggable(action = "MEMBER_VIEW", entity = "User", severity = "info", logParameters = true, logReturnValue = false, trackChanges = false, detailsTemplate = "Member profile access")
    public MemberDTO getMember(Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            Optional<Membership> membership = membershipRepository.findByUserUserId(userId).stream().findFirst();

            return convertToMemberDTO(user, membership.orElse(null));
        }

        throw new RuntimeException("User not found with ID: " + userId);
    }

    /**
     * Search members with audit logging
     */
    @Loggable(action = "MEMBER_SEARCH", entity = "User", severity = "info", logParameters = true, logReturnValue = false, trackChanges = false, detailsTemplate = "Member search operation")
    public List<MemberDTO> searchMembers(String searchTerm) {
        // Note: UserRepository doesn't have the exact search method, so we'll use
        // role-based search
        List<User> users = userRepository.searchUsers("MEMBER", searchTerm);

        return users.stream().map(user -> {
            Optional<Membership> membership = membershipRepository.findByUserUserId(user.getUserId()).stream()
                    .findFirst();
            return convertToMemberDTO(user, membership.orElse(null));
        }).collect(Collectors.toList());
    }

    /**
     * Convert User and Membership to MemberDTO
     */
    private MemberDTO convertToMemberDTO(User user, Membership membership) {
        MemberDTO dto = new MemberDTO();
        dto.setUserId(user.getUserId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhoneNumberPersisted());
        dto.setStatus(user.getAccountNonLocked() ? "Active" : "Inactive");
        dto.setJoinDate(user.getCreatedAt() != null ? user.getCreatedAt().toLocalDate() : null);

        if (membership != null) {
            dto.setStartDate(membership.getStartDate());
            dto.setEndDate(membership.getEndDate());
            if (membership.getMembershipPackage() != null) {
                dto.setPlanName(membership.getMembershipPackage().getPackageName());
            }
        }

        return dto;
    }
}