package com.gym.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for User responses with role-based field filtering.
 * Ensures sensitive data is never exposed to unauthorized roles.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    
    // Public fields (visible to all authenticated users)
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String role;
    private String status;
    
    // Fields visible only to ADMIN/OWNER
    private String phone;
    private String address;
    private LocalDate registrationDate;
    private LocalDate membershipExpiry;
    private String membershipPlan;
    
    // Fields visible to TRAINER (for their assigned members only)
    private String membershipStatus;
    private String assignedTrainer;
    
    // NEVER include these fields (handled by entity @JsonIgnore)
    // - password
    // - tokenHash
    // - internalId
    
    /**
     * Create basic DTO (minimal info for listings)
     */
    public static UserDTO createBasic(Long id, String username, String fullName, String role) {
        return UserDTO.builder()
                .id(id)
                .username(username)
                .fullName(fullName)
                .role(role)
                .build();
    }
    
    /**
     * Create full DTO for ADMIN/OWNER view
     */
    public static UserDTO createFull(
            Long id, String username, String fullName, String email,
            String role, String phone, String address, String status) {
        return UserDTO.builder()
                .id(id)
                .username(username)
                .fullName(fullName)
                .email(email)
                .role(role)
                .phone(phone)
                .address(address)
                .status(status)
                .build();
    }
    
    /**
     * Create trainer-scoped DTO (for viewing assigned members)
     */
    public static UserDTO createTrainerScoped(
            Long id, String fullName, String email, 
            String membershipStatus, String assignedTrainer) {
        return UserDTO.builder()
                .id(id)
                .fullName(fullName)
                .email(email)
                .membershipStatus(membershipStatus)
                .assignedTrainer(assignedTrainer)
                .build();
    }
}
