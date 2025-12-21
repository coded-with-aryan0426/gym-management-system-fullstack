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
     * Paginated Members with advanced filtering and exhaustive sorting.
     */
    @Transactional(readOnly = true)
    public PageResponse<MemberDTO> getMembersPaginated(int page, int size, String search, String status, String plan, String duration, String dateFilter) {
        // Get all customers first
        List<User> allCustomers = userRepository.findByRoleName("CUSTOMER");

        // Apply search filter
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            allCustomers = allCustomers.stream()
                    .filter(u -> (u.getFullName() != null && u.getFullName().toLowerCase().contains(searchLower)) ||
                            (u.getEmail() != null && u.getEmail().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
        }

        // Convert to MemberDTO and populate fields
        LocalDate today = LocalDate.now();
        List<MemberDTO> allMembers = allCustomers.stream().map(user -> {
            MemberDTO dto = new MemberDTO();
            dto.setUserId(user.getUserId());
            dto.setFullName(user.getFullName());
            dto.setEmail(user.getEmail());
            dto.setPhone(user.getPhone());
            dto.setCreatedAt(user.getCreatedAt());

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
                    if (months != null) {
                        dto.setPlanDuration(months + (months == 1 ? " Month" : " Months"));
                        dto.setDurationMonths(months);
                    } else {
                        dto.setPlanDuration(activeMembership.getMembershipPackage().getDurationDays() + " Days");
                        dto.setDurationMonths(0);
                    }
                } else {
                    dto.setPlanName("Unknown Plan");
                    dto.setPlanDuration("-");
                    dto.setDurationMonths(0);
                }

                dto.setStartDate(activeMembership.getStartDate());
                dto.setEndDate(activeMembership.getEndDate());
                if (user.getCreatedAt() != null) {
                    dto.setJoinDate(user.getCreatedAt().toLocalDate());
                }
            } else {
                dto.setStatus("Inactive");
                dto.setPlanName("No Plan");
                dto.setDurationMonths(0);
            }
            return dto;
        }).collect(Collectors.toList());

        // Apply advanced filters
        
        // 1. Status Filter
        if (status != null && !status.trim().isEmpty()) {
            allMembers = allMembers.stream()
                    .filter(m -> m.getStatus() != null && m.getStatus().equalsIgnoreCase(status))
                    .collect(Collectors.toList());
        }

        // 2. Plan Filter
        if (plan != null && !plan.trim().isEmpty()) {
            allMembers = allMembers.stream()
                    .filter(m -> m.getPlanName() != null && m.getPlanName().toLowerCase().contains(plan.toLowerCase()))
                    .collect(Collectors.toList());
        }

        // 3. Duration Filter
        if (duration != null && !duration.trim().isEmpty()) {
            if (duration.equalsIgnoreCase("Expired")) {
                allMembers = allMembers.stream()
                        .filter(m -> "EXPIRED".equalsIgnoreCase(m.getStatus()))
                        .collect(Collectors.toList());
            } else if (duration.toLowerCase().contains("month")) {
                try {
                    int months = Integer.parseInt(duration.replaceAll("[^0-9]", ""));
                    allMembers = allMembers.stream()
                            .filter(m -> m.getDurationMonths() != null && m.getDurationMonths() == months)
                            .collect(Collectors.toList());
                } catch (Exception ignored) {}
            }
        }

        // 4. Date Filter (YYYY, MM/YYYY, DD/MM/YYYY)
        if (dateFilter != null && !dateFilter.trim().isEmpty()) {
            allMembers = allMembers.stream()
                    .filter(m -> matchesDate(m.getJoinDate(), dateFilter))
                    .collect(Collectors.toList());
        }

        // Sorting Logic:
        // 1️⃣ Newest entries (by createdAt DESC)
        // 2️⃣ Alphabetical (by fullName ASC)
        // 3️⃣ Status category (Expired entries drop to bottom)
        allMembers.sort((a, b) -> {
            // Priority 3: Status (Expired at bottom)
            boolean aExpired = "EXPIRED".equalsIgnoreCase(a.getStatus());
            boolean bExpired = "EXPIRED".equalsIgnoreCase(b.getStatus());
            if (aExpired && !bExpired) return 1;
            if (!aExpired && bExpired) return -1;

            // Priority 1: Newest First
            if (a.getCreatedAt() != null && b.getCreatedAt() != null) {
                int dateCompare = b.getCreatedAt().compareTo(a.getCreatedAt());
                if (dateCompare != 0) return dateCompare;
            }

            // Priority 2: Alphabetical
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

        return new PageResponse<>(pageContent, page, size, totalCount, "advanced");
    }

    /**
     * Paginated Staff with filters and exhaustive sorting.
     */
    @Transactional(readOnly = true)
    public PageResponse<User> getStaffPaginated(int page, int size, String search, String role, String status, String dateFilter) {
        String targetRole = (role != null && !role.trim().isEmpty()) ? role.toUpperCase() : null;
        List<User> allStaff;
        if (targetRole != null) {
            allStaff = userRepository.findByRoleName(targetRole);
        } else {
            // If no role specified, include TRAINER, ADMIN, MANAGER
            allStaff = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> 
                    Arrays.asList("TRAINER", "ADMIN", "MANAGER").contains(r.getRoleName())))
                .collect(Collectors.toList());
        }

        // Apply filters
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            allStaff = allStaff.stream()
                    .filter(u -> (u.getFullName() != null && u.getFullName().toLowerCase().contains(searchLower)) ||
                            (u.getEmail() != null && u.getEmail().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
        }

        if (status != null && !status.trim().isEmpty()) {
            // Simplistic: all staff considered Active for now unless logic added to User model
            if ("Inactive".equalsIgnoreCase(status)) {
                allStaff = Collections.emptyList();
            }
        }

        if (dateFilter != null && !dateFilter.trim().isEmpty()) {
            allStaff = allStaff.stream()
                    .filter(u -> u.getCreatedAt() != null && matchesDate(u.getCreatedAt().toLocalDate(), dateFilter))
                    .collect(Collectors.toList());
        }

        // Sort: Newest First, then Alphabetical
        allStaff.sort((a, b) -> {
            if (a.getCreatedAt() != null && b.getCreatedAt() != null) {
                int dateCompare = b.getCreatedAt().compareTo(a.getCreatedAt());
                if (dateCompare != 0) return dateCompare;
            }
            String nameA = a.getFullName() != null ? a.getFullName() : "";
            String nameB = b.getFullName() != null ? b.getFullName() : "";
            return nameA.compareToIgnoreCase(nameB);
        });

        // Paginate
        long totalCount = allStaff.size();
        int start = page * size;
        int end = Math.min(start + size, allStaff.size());
        List<User> pageContent = start < allStaff.size() ? allStaff.subList(start, end) : Collections.emptyList();

        return new PageResponse<>(pageContent, page, size, totalCount, "advanced");
    }

    private boolean matchesDate(LocalDate date, String filter) {
        if (date == null || filter == null) return false;
        filter = filter.trim();
        
        // YYYY
        if (filter.matches("^\\d{4}$")) {
            return String.valueOf(date.getYear()).equals(filter);
        }
        
        // MM/YYYY
        if (filter.matches("^\\d{2}/\\d{4}$")) {
            String[] parts = filter.split("/");
            int m = Integer.parseInt(parts[0]);
            int y = Integer.parseInt(parts[1]);
            return date.getMonthValue() == m && date.getYear() == y;
        }
        
        // DD/MM/YYYY
        if (filter.matches("^\\d{2}/\\d{2}/\\d{4}$")) {
            String[] parts = filter.split("/");
            int d = Integer.parseInt(parts[0]);
            int m = Integer.parseInt(parts[1]);
            int y = Integer.parseInt(parts[2]);
            return date.getDayOfMonth() == d && date.getMonthValue() == m && date.getYear() == y;
        }
        
        return false;
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
