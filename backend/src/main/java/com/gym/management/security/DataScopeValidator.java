package com.gym.management.security;

import com.gym.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collection;
import java.util.Optional;
import com.gym.management.model.User;
import java.util.Set;

/**
 * Utility class for role-based data access control.
 * Ensures users can only access data within their authorized scope.
 */
@Component
public class DataScopeValidator {

    private static final Logger log = LoggerFactory.getLogger(DataScopeValidator.class);

    @Autowired
    private UserRepository userRepository;

    /**
     * Check if current user has ADMIN or OWNER role
     */
    public boolean isAdminOrOwner() {
        Collection<? extends GrantedAuthority> authorities = getAuthorities();
        return authorities.stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN") || 
                                  auth.getAuthority().equals("ROLE_OWNER"));
    }

    /**
     * Check if current user is a TRAINER
     */
    public boolean isTrainer() {
        Collection<? extends GrantedAuthority> authorities = getAuthorities();
        return authorities.stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_TRAINER"));
    }

    /**
     * Check if current user is a MEMBER
     */
    public boolean isMember() {
        Collection<? extends GrantedAuthority> authorities = getAuthorities();
        return authorities.stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_MEMBER"));
    }

    /**
     * Validate that TRAINER can only access their own data
     * @param trainerId The trainer ID from the request
     * @param currentUserId The current authenticated user's ID
     * @return true if access is allowed, false otherwise
     */
    public boolean canTrainerAccessData(Long trainerId, Long currentUserId) {
        if (isAdminOrOwner()) {
            return true; // Admin/Owner can access all trainer data
        }
        
        if (isTrainer()) {
            // Trainer can only access their own data
            boolean allowed = trainerId.equals(currentUserId);
            if (!allowed) {
                log.warn("RBAC violation: Trainer {} attempted to access data for trainer {}", 
                         currentUserId, trainerId);
            }
            return allowed;
        }
        
        return false;
    }

    /**
     * Validate that MEMBER can only access their own data
     * @param memberId The member ID from the request
     * @param currentUserId The current authenticated user's ID
     * @return true if access is allowed, false otherwise
     */
    public boolean canAccessMemberData(Long memberId, Long currentUserId) {
        if (isAdminOrOwner()) {
            return true; // Admin/Owner can access all member data
        }
        
        if (isTrainer()) {
            // Trainer can access their assigned members (checked separately)
            return true;
        }
        
        if (isMember()) {
            // Member can only access their own data
            boolean allowed = memberId.equals(currentUserId);
            if (!allowed) {
                log.warn("RBAC violation: Member {} attempted to access data for member {}", 
                         currentUserId, memberId);
            }
            return allowed;
        }
        
        return false;
    }

    /**
     * Get current user ID from security context
     */
    public Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            return userDetails.getId();
        }
        return null;
    }

    /**
     * Get current user role
     */
    public String getCurrentUserRole() {
        Collection<? extends GrantedAuthority> authorities = getAuthorities();
        return authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .filter(auth -> auth.startsWith("ROLE_"))
                .findFirst()
                .orElse("ROLE_GUEST");
    }

    private Collection<? extends GrantedAuthority> getAuthorities() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            return auth.getAuthorities();
        }
        return java.util.Collections.emptyList();
    }

    /**
     * Check if TRAINER can access a specific MEMBER's data
     * Validates that the member is assigned to this trainer
     * @param trainerId The trainer's user ID
     * @param memberId The member's user ID
     * @return true if trainer is assigned to this member, false otherwise
     */
    public boolean canTrainerAccessMember(Long trainerId, Long memberId) {
        if (isAdminOrOwner()) {
            return true; // Admin/Owner can access all data
        }
        
        if (!isTrainer()) {
            return false; // Non-trainers cannot use this check
        }
        
        try {
            Optional<User> memberOpt = userRepository.findById(memberId);
            if (memberOpt.isEmpty()) {
                log.warn("RBAC check: Member {} not found", memberId);
                return false;
            }
            
            User member = memberOpt.get();
            Set<User> assignedTrainers = member.getTrainers();
            
            if (assignedTrainers == null || assignedTrainers.isEmpty()) {
                log.warn("RBAC violation: Trainer {} attempted to access member {} who has no assigned trainers", 
                         trainerId, memberId);
                return false;
            }
            
            boolean isAssigned = assignedTrainers.stream()
                    .anyMatch(trainer -> trainer.getUserId().equals(trainerId));
            
            if (!isAssigned) {
                log.warn("RBAC violation: Trainer {} attempted to access member {} who is not assigned to them", 
                         trainerId, memberId);
            }
            
            return isAssigned;
        } catch (Exception e) {
            log.error("Error checking trainer-member relationship for trainer {} and member {}", 
                      trainerId, memberId, e);
            return false;
        }
    }

    /**
     * Log data access attempt (for audit trail)
     */
    public void logDataAccess(String resourceType, Long resourceId, String action) {
        Long userId = getCurrentUserId();
        String role = getCurrentUserRole();
        log.info("Data access: user={}, role={}, resource={}, resourceId={}, action={}", 
                 userId, role, resourceType, resourceId, action);
    }
}
