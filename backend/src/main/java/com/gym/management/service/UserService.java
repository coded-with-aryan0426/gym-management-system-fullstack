package com.gym.management.service;

import com.gym.management.model.Role;
import com.gym.management.model.User;
import com.gym.management.repository.RoleRepository;
import com.gym.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(String roleName) {
        return userRepository.findByRoleName(roleName);
    }

    public List<User> searchUsers(String roleName, String query) {
        return userRepository.searchUsers(roleName, query);
    }

    @Autowired
    private com.gym.management.repository.MembershipRepository membershipRepository;

    @Transactional(readOnly = true)
    public List<com.gym.management.dto.MemberDTO> getAllMembers() {
        List<User> customers = userRepository.findByRoleName("CUSTOMER");
        return customers.stream().map(user -> {
            com.gym.management.dto.MemberDTO dto = new com.gym.management.dto.MemberDTO();
            dto.setUserId(user.getUserId());
            dto.setFullName(user.getFullName());
            dto.setEmail(user.getEmail());
            dto.setPhone(user.getPhone());

            // Fetch membership
            List<com.gym.management.model.Membership> memberships = membershipRepository
                    .findByUserUserId(user.getUserId());
            if (!memberships.isEmpty()) {
                // Determine active membership (simplistic logic: take the last one or active
                // one)
                com.gym.management.model.Membership activeMembership = memberships.stream()
                        .filter(m -> m.getStatus() == com.gym.management.model.MembershipStatus.ACTIVE)
                        .findFirst()
                        .orElse(memberships.get(0)); // Fallback to first

                if (activeMembership.getStatus() != null) {
                    dto.setStatus(activeMembership.getStatus().name());
                } else {
                    dto.setStatus("UNKNOWN");
                }

                if (activeMembership.getMembershipPackage() != null) {
                    dto.setPlanName(activeMembership.getMembershipPackage().getPackageName());
                    Integer months = activeMembership.getMembershipPackage().getDurationMonths();
                    if (months != null) {
                        dto.setPlanDuration(months + (months == 1 ? " Month" : " Months"));
                    } else {
                        // Fallback logic if null (though migration should fix only on restart)
                        dto.setPlanDuration(activeMembership.getMembershipPackage().getDurationDays() + " Days");
                    }
                } else {
                    dto.setPlanName("Unknown Plan");
                    dto.setPlanDuration("-");
                }

                dto.setStartDate(activeMembership.getStartDate());
                dto.setEndDate(activeMembership.getEndDate());
                if (user.getCreatedAt() != null) {
                    dto.setJoinDate(user.getCreatedAt().toLocalDate());
                }
            } else {
                dto.setStatus("Inactive");
                dto.setPlanName("No Plan");
            }
            return dto;
        }).collect(java.util.stream.Collectors.toList());
    }

    public User getUserById(Long id) {
        Objects.requireNonNull(id, "User ID must not be null");
        return userRepository.findById(id).orElse(null);
    }

    @Autowired
    private com.gym.management.repository.MembershipPackageRepository membershipPackageRepository;

    @Autowired
    private com.gym.management.repository.GymRepository gymRepository;

    @Transactional
    public User createUser(User user) {
        // Map phoneNumber to phone if provided
        if (user.getPhoneNumber() != null && !user.getPhoneNumber().isEmpty()) {
            user.setPhone(user.getPhoneNumber());
        }

        // Look up actual Role entities from the database based on role names
        boolean isCustomer = false;
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            Set<Role> actualRoles = new HashSet<>();
            for (Role role : user.getRoles()) {
                Role dbRole = null;
                if (role.getRoleName() != null) {
                    dbRole = roleRepository.findByRoleName(role.getRoleName());
                    if ("CUSTOMER".equalsIgnoreCase(role.getRoleName())) {
                        isCustomer = true;
                    }
                }
                if (dbRole != null) {
                    actualRoles.add(dbRole);
                }
            }
            user.setRoles(actualRoles);
        } else {
            // Default to CUSTOMER role if no roles provided
            Role customerRole = roleRepository.findByRoleName("CUSTOMER");
            if (customerRole != null) {
                Set<Role> roles = new HashSet<>();
                roles.add(customerRole);
                user.setRoles(roles);
                isCustomer = true;
            }
        }

        // Save user with roles
        User savedUser = userRepository.save(user);

        // Create Membership if this is a CUSTOMER with packageId
        if (isCustomer && user.getPackageId() != null) {
            try {
                com.gym.management.model.MembershipPackage pkg = membershipPackageRepository
                        .findById(user.getPackageId())
                        .orElseThrow(() -> new RuntimeException("Package not found: " + user.getPackageId()));

                // Get default gym (id=1)
                com.gym.management.model.Gym defaultGym = gymRepository.findById(1L)
                        .orElseThrow(() -> new RuntimeException("Default gym not found"));

                com.gym.management.model.Membership membership = new com.gym.management.model.Membership();
                membership.setUser(savedUser);
                membership.setGym(defaultGym); // Set required gym
                membership.setMembershipPackage(pkg);

                // Set start date (default to today if not provided)
                java.time.LocalDate startDate = user.getStartDate() != null
                        ? user.getStartDate()
                        : java.time.LocalDate.now();
                membership.setStartDate(startDate);

                // Calculate end date based on duration
                int months = user.getDuration() != null ? user.getDuration() : 1;
                if (months <= 0) {
                    months = pkg.getDurationMonths() != null ? pkg.getDurationMonths() : 1;
                }
                java.time.LocalDate endDate = startDate.plusMonths(months);
                membership.setEndDate(endDate);

                // Set status to ACTIVE
                membership.setStatus(com.gym.management.model.MembershipStatus.ACTIVE);

                membershipRepository.save(membership);
            } catch (Exception e) {
                // Log but don't fail user creation
                System.err.println("Failed to create membership: " + e.getMessage());
            }
        }

        return savedUser;
    }

    public User updateUser(Long id, User user) {
        Objects.requireNonNull(id, "User ID must not be null");
        User existingUser = userRepository.findById(id).orElse(null);
        if (existingUser != null) {
            // Update fields
            if (user.getUsername() != null) {
                existingUser.setUsername(user.getUsername());
            }
            if (user.getFullName() != null) {
                existingUser.setFullName(user.getFullName());
            }
            if (user.getEmail() != null) {
                existingUser.setEmail(user.getEmail());
            }
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                existingUser.setPassword(user.getPassword());
            }
            // Update roles if provided
            if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                existingUser.setRoles(user.getRoles());
            }
            // Update phone if provided
            if (user.getPhone() != null) {
                existingUser.setPhone(user.getPhone());
            }
            // Update join date if provided
            if (user.getJoinDate() != null) {
                existingUser.setCreatedAt(user.getJoinDate().atStartOfDay());
            }
            return userRepository.save(existingUser);
        }
        return null;
    }

    public void deleteUser(Long id) {
        Objects.requireNonNull(id, "User ID must not be null");
        userRepository.deleteById(id);
    }

    @Transactional
    public User assignCustomerToTrainer(Long trainerId, Long customerId) {
        Objects.requireNonNull(trainerId, "Trainer ID must not be null");
        Objects.requireNonNull(customerId, "Customer ID must not be null");
        User trainer = userRepository.findById(trainerId).orElse(null);
        User customer = userRepository.findById(customerId).orElse(null);

        if (trainer != null && customer != null) {
            // Add to both sides of the relationship
            trainer.getCustomers().add(customer);
            customer.getTrainers().add(trainer);
            userRepository.save(trainer);
            userRepository.save(customer);

            // Flush to ensure database write completes and clear cache
            entityManager.flush();
            entityManager.clear();

            // Re-fetch fresh trainer data to return
            return userRepository.findById(trainerId).orElse(null);
        }
        return null;
    }

    @Transactional
    public User removeCustomerFromTrainer(Long trainerId, Long customerId) {
        Objects.requireNonNull(trainerId, "Trainer ID must not be null");
        Objects.requireNonNull(customerId, "Customer ID must not be null");
        User trainer = userRepository.findById(trainerId).orElse(null);
        User customer = userRepository.findById(customerId).orElse(null);

        if (trainer != null && customer != null) {
            // Remove from both sides using ID-based comparison to avoid proxy equality
            // issues
            trainer.getCustomers().removeIf(c -> c.getUserId().equals(customerId));
            customer.getTrainers().removeIf(t -> t.getUserId().equals(trainerId));

            userRepository.save(trainer);
            userRepository.save(customer);

            // Flush to ensure database write completes and clear cache
            entityManager.flush();
            entityManager.clear();

            // Re-fetch fresh trainer data to return
            return userRepository.findById(trainerId).orElse(null);
        }
        return null;
    }
}
