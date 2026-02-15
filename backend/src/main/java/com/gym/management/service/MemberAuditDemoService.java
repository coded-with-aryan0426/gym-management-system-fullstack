package com.gym.management.service;

import com.gym.management.annotation.Loggable;
import com.gym.management.model.User;
import com.gym.management.model.Membership;
import com.gym.management.model.MembershipStatus;
import com.gym.management.repository.UserRepository;
import com.gym.management.repository.MembershipRepository;
import com.gym.management.dto.MemberDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

/**
 * Example service demonstrating the enhanced audit logging system
 * Shows how to use @Loggable annotation for comprehensive tracking
 */
@Service
public class MemberAuditDemoService {

    private static final Logger logger = LoggerFactory.getLogger(MemberAuditDemoService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    /**
     * Create a new member with comprehensive audit logging
     */
    @Loggable(action = "MEMBER_CREATE", entity = "User", severity = "info", logParameters = true, logReturnValue = true, trackChanges = true, detailsTemplate = "New member registration", excludeFields = {
            "password", "ssn" })
    @Transactional
    public User createMember(MemberDTO memberDTO) {
        User user = new User();
        user.setFullName(memberDTO.getFullName());
        user.setEmail(memberDTO.getEmail());
        user.setPhone(memberDTO.getPhone());
        user.setUsername(memberDTO.getEmail()); // Use email as username
        user.setPassword("TEMP_PASSWORD"); // Should be set properly in real implementation

        return userRepository.save(user);
    }

    /**
     * Update member information with change tracking
     */
    @Loggable(action = "MEMBER_UPDATE", entity = "User", severity = "info", logParameters = true, logReturnValue = true, trackChanges = true, detailsTemplate = "Member profile update", excludeFields = {
            "password" })
    @Transactional
    public User updateMember(Long userId, MemberDTO memberDTO) {
        Optional<User> existingUser = userRepository.findById(userId);

        if (existingUser.isPresent()) {
            User user = existingUser.get();

            // Update with new values
            user.setFullName(memberDTO.getFullName());
            user.setEmail(memberDTO.getEmail());
            user.setPhone(memberDTO.getPhone());

            return userRepository.save(user);
        }

        throw new RuntimeException("Member not found with ID: " + userId);
    }

    /**
     * Deactivate member with business impact tracking
     */
    @Loggable(action = "MEMBER_DEACTIVATE", entity = "User", severity = "warning", logParameters = true, logReturnValue = false, trackChanges = true, detailsTemplate = "Member account deactivation")
    @Transactional
    public void deactivateMember(Long userId, String reason) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isPresent()) {

            // Cancel active memberships
            List<Membership> activeMemberships = membershipRepository.findByUserUserIdAndStatus(userId,
                    MembershipStatus.ACTIVE);
            for (Membership membership : activeMemberships) {
                membership.setStatus(MembershipStatus.CANCELLED);
                membershipRepository.save(membership);
            }
        } else {
            throw new RuntimeException("Member not found with ID: " + userId);
        }
    }

    /**
     * Bulk member import with detailed tracking
     */
    @Loggable(action = "MEMBER_BULK_IMPORT", entity = "User", severity = "info", logParameters = true, logReturnValue = true, trackChanges = false, detailsTemplate = "Bulk member import operation")
    @Transactional
    public List<User> bulkImportMembers(List<MemberDTO> memberDTOs) {
        List<User> importedMembers = new ArrayList<>();

        for (MemberDTO memberDTO : memberDTOs) {
            try {
                User user = createMember(memberDTO);
                importedMembers.add(user);
            } catch (Exception e) {
                // Log individual member import failure
                logger.error("Failed to import member: {}", memberDTO.getFullName(), e);
            }
        }

        return importedMembers;
    }

    /**
     * Sensitive operation - membership cancellation
     */
    @Loggable(action = "MEMBERSHIP_CANCEL", entity = "Membership", severity = "warning", logParameters = true, logReturnValue = false, trackChanges = true, detailsTemplate = "Membership cancellation with refund processing", includeSensitiveData = false)
    @Transactional
    public void cancelMembership(Long membershipId, String reason, boolean processRefund) {
        Optional<Membership> membershipOptional = membershipRepository.findById(membershipId);

        if (membershipOptional.isPresent()) {
            Membership membership = membershipOptional.get();

            // Update membership
            membership.setStatus(MembershipStatus.CANCELLED);

            membershipRepository.save(membership);

            // Process refund if requested
            if (processRefund) {
                processRefund(membershipId);
            }
        } else {
            throw new RuntimeException("Membership not found with ID: " + membershipId);
        }
    }

    /**
     * High-risk operation - member data export
     */
    @Loggable(action = "MEMBER_DATA_EXPORT", entity = "User", severity = "high", logParameters = true, logReturnValue = false, trackChanges = false, detailsTemplate = "Member data export for GDPR compliance", includeSensitiveData = false)
    public byte[] exportMemberData(Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // Create data export (simplified for demo)
            StringBuilder exportData = new StringBuilder();
            exportData.append("Member Data Export\n");
            exportData.append("==================\n");
            exportData.append("Name: ").append(user.getFullName()).append("\n");
            exportData.append("Email: ").append(user.getEmail()).append("\n");
            exportData.append("Phone: ").append(user.getPhone()).append("\n");

            return exportData.toString().getBytes();
        }

        throw new RuntimeException("Member not found with ID: " + userId);
    }

    /**
     * System maintenance operation
     */
    @Loggable(action = "MEMBER_MAINTENANCE", entity = "User", severity = "info", logParameters = false, logReturnValue = true, trackChanges = false, detailsTemplate = "System maintenance: Member cleanup")
    public int cleanupInactiveMembers() {
        // Find users inactive for more than 2 years
        // This is a simplified implementation - real implementation would need more
        // sophisticated logic
        List<User> inactiveUsers = userRepository.findAll(); // Should filter by last activity

        int cleanedCount = 0;
        for (User user : inactiveUsers) {
            // Anonymize user data instead of deleting
            user.setFullName("ANONYMIZED");
            user.setEmail("anonymized_" + user.getUserId() + "@deleted.com");
            user.setPhone("0000000000");

            userRepository.save(user);
            cleanedCount++;
        }

        return cleanedCount;
    }

    /**
     * Helper method for refund processing (simplified)
     */
    private void processRefund(Long membershipId) {
        // In a real implementation, this would integrate with payment processing
        logger.info("Processing refund for membership: {}", membershipId);
    }

    /**
     * Get member with audit logging on read operations
     */
    @Loggable(action = "MEMBER_VIEW", entity = "User", severity = "info", logParameters = true, logReturnValue = false, trackChanges = false, detailsTemplate = "Member profile access")
    public User getMember(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Member not found with ID: " + userId));
    }

    /**
     * Search members with audit logging
     */
    @Loggable(action = "MEMBER_SEARCH", entity = "User", severity = "info", logParameters = true, logReturnValue = false, trackChanges = false, detailsTemplate = "Member search operation")
    public List<User> searchMembers(String searchTerm) {
        return userRepository.searchUsers("CUSTOMER", searchTerm);
    }
}