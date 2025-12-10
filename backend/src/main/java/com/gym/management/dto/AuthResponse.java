package com.gym.management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Response DTO for login with gym associations
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String token;

    // Role context - what the user logged in as
    private String context; // "STAFF" or "MEMBER"

    // For gym selection (when user has multiple gyms)
    private List<GymAssociation> gymAssociations;

    // Selected gym (if only one or after selection)
    private Long activeGymId;
    private String activeGymName;
    private String staffRole; // OWNER, ADMIN, TRAINER, etc. (only for STAFF context)

    // Flags to indicate what contexts are available
    private boolean hasStaffAccess;
    private boolean hasMemberAccess;

    // Membership status for members (APPROVED, PENDING, REJECTED, or null)
    private String membershipStatus;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class GymAssociation {
        private Long gymId;
        private String gymName;
        private String role; // For staff: OWNER/ADMIN/TRAINER, For member: null
        private String status; // ACTIVE, EXPIRED, PENDING
        private String membershipEndDate; // For members only
    }
}
