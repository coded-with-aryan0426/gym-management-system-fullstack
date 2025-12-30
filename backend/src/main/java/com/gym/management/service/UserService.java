package com.gym.management.service;

import com.gym.management.dto.MemberDTO;
import com.gym.management.dto.PageResponse;
import com.gym.management.model.Role;
import com.gym.management.model.User;
import com.gym.management.model.Membership;
import com.gym.management.model.MembershipStatus;
import com.gym.management.repository.RoleRepository;
import com.gym.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private EmailService emailService;

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

    /**
     * Paginated Members with "today first" sorting.
     * Members created today appear at the top (sorted by createdAt DESC),
     * followed by older members sorted alphabetically (fullName ASC).
     */
    @Transactional(readOnly = true)
    public PageResponse<MemberDTO> getMembersPaginated(int page, int size, String search, String status, String plan) {
        // Get all customers first (we'll do in-memory pagination with custom sorting)
        List<User> allCustomers = userRepository.findByRoleName("CUSTOMER");

        // Apply search filter
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            allCustomers = allCustomers.stream()
                    .filter(u -> (u.getFullName() != null && u.getFullName().toLowerCase().contains(searchLower)) ||
                            (u.getEmail() != null && u.getEmail().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
        }

        // Convert to MemberDTO and apply additional filters
        LocalDate today = LocalDate.now();
        List<MemberDTO> allMembers = allCustomers.stream().map(user -> {
            MemberDTO dto = new MemberDTO();
            dto.setUserId(user.getUserId());
            dto.setFullName(user.getFullName());
            dto.setEmail(user.getEmail());
            dto.setPhone(user.getPhone());
            dto.setCreatedAt(user.getCreatedAt());

            // Fetch membership
            List<Membership> memberships = membershipRepository.findByUserUserId(user.getUserId());
            if (!memberships.isEmpty()) {
                Membership activeMembership = memberships.stream()
                        .filter(m -> m.getStatus() == MembershipStatus.ACTIVE)
                        .findFirst()
                        .orElse(memberships.get(0));

                dto.setStatus(activeMembership.getStatus() != null ? activeMembership.getStatus().name() : "UNKNOWN");

                if (activeMembership.getMembershipPackage() != null) {
                    dto.setPlanName(activeMembership.getMembershipPackage().getPackageName());
                    Integer months = activeMembership.getMembershipPackage().getDurationMonths();
                    dto.setPlanDuration(months != null ? months + (months == 1 ? " Month" : " Months")
                            : activeMembership.getMembershipPackage().getDurationDays() + " Days");
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
        }).collect(Collectors.toList());

        // Apply status filter
        if (status != null && !status.trim().isEmpty()) {
            allMembers = allMembers.stream()
                    .filter(m -> m.getStatus() != null && m.getStatus().equalsIgnoreCase(status))
                    .collect(Collectors.toList());
        }

        // Apply plan filter
        if (plan != null && !plan.trim().isEmpty()) {
            allMembers = allMembers.stream()
                    .filter(m -> m.getPlanName() != null && m.getPlanName().toLowerCase().contains(plan.toLowerCase()))
                    .collect(Collectors.toList());
        }

        // Sort: today's entries first (by createdAt DESC), then alphabetically
        allMembers.sort((a, b) -> {
            boolean aToday = a.getCreatedAt() != null && a.getCreatedAt().toLocalDate().equals(today);
            boolean bToday = b.getCreatedAt() != null && b.getCreatedAt().toLocalDate().equals(today);

            if (aToday && !bToday)
                return -1;
            if (!aToday && bToday)
                return 1;
            if (aToday && bToday) {
                // Both today: sort by createdAt DESC (newest first)
                return b.getCreatedAt().compareTo(a.getCreatedAt());
            }
            // Neither today: sort alphabetically
            String nameA = a.getFullName() != null ? a.getFullName() : "";
            String nameB = b.getFullName() != null ? b.getFullName() : "";
            return nameA.compareToIgnoreCase(nameB);
        });

        // Paginate
        long totalCount = allMembers.size();
        int start = page * size;
        int end = Math.min(start + size, allMembers.size());
        List<MemberDTO> pageContent = start < allMembers.size() ? allMembers.subList(start, end)
                : Collections.emptyList();

        return new PageResponse<>(pageContent, page, size, totalCount, "newest");
    }

    /**
     * Paginated Trainers with "today first" sorting.
     */
    @Transactional(readOnly = true)
    public PageResponse<User> getTrainersPaginated(int page, int size, String search, String role) {
        String targetRole = (role != null && !role.trim().isEmpty()) ? role.toUpperCase() : "TRAINER";
        List<User> allTrainers = userRepository.findByRoleName(targetRole);

        // Apply search filter
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            allTrainers = allTrainers.stream()
                    .filter(u -> (u.getFullName() != null && u.getFullName().toLowerCase().contains(searchLower)) ||
                            (u.getEmail() != null && u.getEmail().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
        }

        // Sort: today's entries first (by createdAt DESC), then alphabetically
        LocalDate today = LocalDate.now();
        allTrainers.sort((a, b) -> {
            boolean aToday = a.getCreatedAt() != null && a.getCreatedAt().toLocalDate().equals(today);
            boolean bToday = b.getCreatedAt() != null && b.getCreatedAt().toLocalDate().equals(today);

            if (aToday && !bToday)
                return -1;
            if (!aToday && bToday)
                return 1;
            if (aToday && bToday) {
                return b.getCreatedAt().compareTo(a.getCreatedAt());
            }
            String nameA = a.getFullName() != null ? a.getFullName() : "";
            String nameB = b.getFullName() != null ? b.getFullName() : "";
            return nameA.compareToIgnoreCase(nameB);
        });

        // Paginate
        long totalCount = allTrainers.size();
        int start = page * size;
        int end = Math.min(start + size, allTrainers.size());
        List<User> pageContent = start < allTrainers.size() ? allTrainers.subList(start, end) : Collections.emptyList();

        return new PageResponse<>(pageContent, page, size, totalCount, "newest");
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

        // Map joinDate to createdAt if provided (for backdating/start date)
        if (user.getJoinDate() != null) {
            user.setCreatedAt(user.getJoinDate().atStartOfDay());
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

        // Generate password if not provided (for automated creation of
        // trainers/members)
        String generatedPassword = null;
        if ((user.getPassword() == null || user.getPassword().isEmpty()) &&
                (user.getRoles().size() == 1 && (user.getRoles().iterator().next().getRoleName().equals("TRAINER")
                        || user.getRoles().iterator().next().getRoleName().equals("CUSTOMER")))) {
            generatedPassword = generateSecurePassword();
            user.setPassword(generatedPassword);
            user.setIsFirstLogin(true);
        }

        // Save user with roles
        User savedUser = userRepository.save(user);

        // Send Welcome Email if password was generated
        if (generatedPassword != null) {
            String roleName = user.getRoles().iterator().next().getRoleName();
            emailService.sendWelcomeCredentials(user.getEmail(), user.getFullName(), generatedPassword, roleName);
        }

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

    private String generateSecurePassword() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
        StringBuilder password = new StringBuilder();
        java.security.SecureRandom random = new java.security.SecureRandom();
        for (int i = 0; i < 10; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        return password.toString();
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
            // Update phone if provided (from either phone or phoneNumber transient field)
            if (user.getPhone() != null) {
                existingUser.setPhone(user.getPhone());
            } else if (user.getPhoneNumber() != null) {
                existingUser.setPhone(user.getPhoneNumber());
            }
            // Update join date if provided
            if (user.getJoinDate() != null) {
                existingUser.setCreatedAt(user.getJoinDate().atStartOfDay());
            }
            // Update leaving date if provided
            if (user.getLeavingDate() != null) {
                existingUser.setLeavingDate(user.getLeavingDate());
            }
            // Update status if provided
            if (user.getStatus() != null) {
                existingUser.setStatus(user.getStatus());
            }
            // Update avatarId if provided
            if (user.getAvatarId() != null) {
                existingUser.setAvatarId(user.getAvatarId());
            }
            return userRepository.save(existingUser);
        }
        return null;
    }

    @Autowired
    private com.gym.management.repository.PTSessionRepository ptSessionRepository;

    @Transactional
    public void deleteUser(Long id) {
        Objects.requireNonNull(id, "User ID must not be null");
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return; // Or throw exception
        }

        // 1. Clear ManyToMany relationships (Trainer <-> Customer)
        // We need to remove this user from others' lists to avoid FK constraint issues
        // in bridging tables

        // Remove as customer from all trainers
        for (User trainer : user.getTrainers()) {
            trainer.getCustomers().remove(user);
            userRepository.save(trainer);
        }
        user.getTrainers().clear();

        // Remove as trainer from all customers
        for (User customer : user.getCustomers()) {
            customer.getTrainers().remove(user);
            userRepository.save(customer);
        }
        user.getCustomers().clear();

        // Save to update join tables
        userRepository.save(user);

        // 2. Delete Memberships
        List<Membership> memberships = membershipRepository.findByUserUserId(id);
        membershipRepository.deleteAll(memberships);

        // 3. Delete PT Sessions (as member or trainer)
        List<com.gym.management.model.PTSession> sessionsAsMember = ptSessionRepository.findByMemberId(id);
        ptSessionRepository.deleteAll(sessionsAsMember);

        List<com.gym.management.model.PTSession> sessionsAsTrainer = ptSessionRepository.findByTrainerId(id);
        ptSessionRepository.deleteAll(sessionsAsTrainer);

        // 4. Finally Delete User
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
