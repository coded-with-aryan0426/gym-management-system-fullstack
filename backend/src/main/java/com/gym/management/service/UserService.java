
package com.gym.management.service;

import com.gym.management.dto.MemberDTO;
import com.gym.management.dto.PageResponse;
import com.gym.management.dto.TrainerPerformanceDTO;
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
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
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

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private MembershipService membershipService;

    @PersistenceContext
    private EntityManager entityManager;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(String roleName) {
        String baseRole = roleName.toUpperCase();
        List<User> users = new ArrayList<>();
        users.addAll(userRepository.findByRoleName(baseRole));
        if (!baseRole.startsWith("ROLE_")) {
            users.addAll(userRepository.findByRoleName("ROLE_" + baseRole));
        } else {
            users.addAll(userRepository.findByRoleName(baseRole.replace("ROLE_", "")));
        }
        // Deduplicate
        return users.stream().distinct().collect(Collectors.toList());
    }

    public List<User> searchUsers(String roleName, String query) {
        String baseRole = roleName.toUpperCase();
        List<User> users = new ArrayList<>();
        users.addAll(userRepository.searchUsers(baseRole, query));
        if (!baseRole.startsWith("ROLE_")) {
            users.addAll(userRepository.searchUsers("ROLE_" + baseRole, query));
        } else {
            users.addAll(userRepository.searchUsers(baseRole.replace("ROLE_", ""), query));
        }
        return users.stream().distinct().collect(Collectors.toList());
    }

    @Autowired
    private com.gym.management.repository.MembershipRepository membershipRepository;

    /**
     * Get distinct plan names from all members' active memberships.
     * Used for dynamic filter generation on the frontend.
     */
    @Transactional(readOnly = true)
    public List<String> getDistinctMemberPlanNames() {
        List<com.gym.management.model.Membership> allMemberships = membershipRepository.findAll();
        return allMemberships.stream()
                .map(m -> {
                    // Priority: tiered plan > legacy package
                    if (m.getTieredPlan() != null) {
                        return m.getTieredPlan().getPlanName();
                    } else if (m.getMembershipPackage() != null) {
                        return m.getMembershipPackage().getPackageName();
                    }
                    return null;
                })
                .filter(name -> name != null)
                .distinct()
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .collect(Collectors.toList());
    }

    /**
     * Randomly assign membership packages to all members who have no package or
     * have null package.
     * This is a migration/normalization endpoint to align legacy members with the
     * new membership system.
     * Returns a summary of changes made.
     */
    @Transactional
    public Map<String, Object> randomlyAssignMembershipPackages() {
        List<com.gym.management.model.MembershipPackage> activePackages = membershipPackageRepository
                .findActivePackages();
        if (activePackages.isEmpty()) {
            throw new RuntimeException("No active membership packages available for assignment");
        }

        // Get all members (users with CUSTOMER/MEMBER roles)
        Set<Long> seenIds = new HashSet<>();
        List<User> allCustomers = new ArrayList<>();
        String[] memberRoles = { "CUSTOMER", "MEMBER", "ROLE_CUSTOMER", "ROLE_MEMBER" };
        for (String roleName : memberRoles) {
            List<User> users = userRepository.findByRoleName(roleName);
            for (User u : users) {
                if (seenIds.add(u.getUserId()))
                    allCustomers.add(u);
            }
        }

        Random random = new Random();
        int assignedCount = 0;
        int skippedCount = 0;
        List<Map<String, Object>> log = new ArrayList<>();

        for (User user : allCustomers) {
            List<com.gym.management.model.Membership> memberships = membershipRepository
                    .findByUserUserId(user.getUserId());

            com.gym.management.model.Membership membership;

            if (memberships.isEmpty()) {
                // Create a new membership record for legacy members without one
                try {
                    com.gym.management.model.Gym defaultGym = gymRepository.findById(1L)
                            .orElseThrow(() -> new RuntimeException("Default gym not found"));
                    membership = new com.gym.management.model.Membership();
                    membership.setUser(user);
                    membership.setGym(defaultGym);
                } catch (Exception e) {
                    skippedCount++;
                    continue;
                }
            } else {
                // Find the active or first membership
                membership = memberships.stream()
                        .filter(m -> m.getStatus() == MembershipStatus.ACTIVE)
                        .findFirst()
                        .orElse(memberships.get(0));
            }

            // Assign a random package
            com.gym.management.model.MembershipPackage randomPackage = activePackages
                    .get(random.nextInt(activePackages.size()));
            String oldPlanName = membership.getMembershipPackage() != null
                    ? membership.getMembershipPackage().getPackageName()
                    : "null";

            membership.setMembershipPackage(randomPackage);

            // Set dates if missing
            if (membership.getStartDate() == null) {
                membership.setStartDate(LocalDate.now());
            }
            if (membership.getEndDate() == null) {
                int durationDays = randomPackage.getDurationDays() != null ? randomPackage.getDurationDays() : 30;
                membership.setEndDate(membership.getStartDate().plusDays(durationDays));
            }

            if (membership.getStatus() == null || membership.getStatus() == MembershipStatus.PENDING) {
                membership.setStatus(MembershipStatus.ACTIVE);
            }

            membershipRepository.save(membership);
            assignedCount++;

            Map<String, Object> entry = new HashMap<>();
            entry.put("userId", user.getUserId());
            entry.put("fullName", user.getFullName());
            entry.put("oldPlan", oldPlanName);
            entry.put("newPlan", randomPackage.getPackageName());
            entry.put("packageId", randomPackage.getPackageId());
            log.add(entry);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("totalMembers", allCustomers.size());
        result.put("assigned", assignedCount);
        result.put("skipped", skippedCount);
        result.put("availablePackages",
                activePackages.stream().map(p -> p.getPackageName()).collect(Collectors.toList()));
        result.put("log", log);
        return result;
    }

    @Transactional(readOnly = true)
    public List<com.gym.management.dto.MemberDTO> getAllMembers() {
        // Query all possible member role names (legacy support for different naming
        // conventions)
        java.util.Set<Long> seenIds = new java.util.HashSet<>();
        List<User> allMembers = new java.util.ArrayList<>();

        String[] memberRoles = { "CUSTOMER", "MEMBER", "ROLE_CUSTOMER", "ROLE_MEMBER" };
        for (String roleName : memberRoles) {
            List<User> users = userRepository.findByRoleName(roleName);
            for (User u : users) {
                if (seenIds.add(u.getUserId()))
                    allMembers.add(u);
            }
        }

        return allMembers.stream().map(user -> populateMemberDTO(user))
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Shared helper: populate a MemberDTO from a User by reading their membership.
     * Supports both tiered plans and legacy packages.
     */
    private MemberDTO populateMemberDTO(User user) {
        MemberDTO dto = new MemberDTO();
        dto.setUserId(user.getUserId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setCreatedAt(user.getCreatedAt());

        // Emergency contact & health info
        dto.setEmergencyContactName(user.getEmergencyContactName());
        dto.setEmergencyContactPhone(user.getEmergencyContactPhone());
        dto.setEmergencyContactRelation(user.getEmergencyContactRelation());
        dto.setHealthNotes(user.getHealthNotes());
        dto.setFitnessGoals(user.getFitnessGoals());

        // Personal info
        dto.setGender(user.getGender());
        dto.setDateOfBirth(user.getDateOfBirth());
        dto.setBloodType(user.getBloodType());
        dto.setAddress(user.getAddress());
        dto.setCity(user.getCity());
        dto.setState(user.getState());
        dto.setZipCode(user.getZipCode());
        dto.setAvatarId(user.getAvatarId());

        List<Membership> memberships = membershipRepository.findByUserUserId(user.getUserId());
        if (!memberships.isEmpty()) {
            Membership activeMembership = memberships.stream()
                    .filter(m -> m.getStatus() == MembershipStatus.ACTIVE)
                    .findFirst()
                    .orElse(memberships.get(0));

            // Recompute live status from effective end timestamp (avoids stale stored
            // value)
            MembershipStatus liveStatus = membershipService.calculateStatusFromEndDateTime(
                    activeMembership.getEffectiveEndDateTime());
            dto.setStatus(liveStatus.name());
            dto.setStartDate(activeMembership.getStartDate());
            dto.setEndDate(activeMembership.getEndDate());
            dto.setStartDateTime(activeMembership.getEffectiveStartDateTime());
            dto.setEndDateTime(activeMembership.getEffectiveEndDateTime());

            // Priority: tieredPlan > planVariant > legacy membershipPackage
            if (activeMembership.getTieredPlan() != null) {
                dto.setPlanName(activeMembership.getTieredPlan().getPlanName());
                dto.setMembershipPlanName(activeMembership.getTieredPlan().getPlanName());
                dto.setMembershipPlanCategory(activeMembership.getTieredPlan().getCategory() != null
                        ? activeMembership.getTieredPlan().getCategory().name()
                        : null);
                if (activeMembership.getPlanVariant() != null) {
                    dto.setPlanDuration(activeMembership.getPlanVariant().getFormattedDuration());
                    dto.setMembershipPlanPrice(activeMembership.getPlanVariant().getPrice());
                } else {
                    // Calculate from dates if variant missing
                    dto.setPlanDuration(
                            calculateDurationLabel(activeMembership.getStartDate(), activeMembership.getEndDate()));
                }
            } else if (activeMembership.getMembershipPackage() != null) {
                dto.setPlanName(activeMembership.getMembershipPackage().getPackageName());
                Integer months = activeMembership.getMembershipPackage().getDurationMonths();
                if (months != null) {
                    dto.setPlanDuration(months + (months == 1 ? " Month" : " Months"));
                } else {
                    Integer days = activeMembership.getMembershipPackage().getDurationDays();
                    dto.setPlanDuration(days != null ? days + " Days" : "-");
                }
            } else {
                // No plan reference but has membership record - derive from dates
                dto.setPlanName("Custom Plan");
                dto.setPlanDuration(
                        calculateDurationLabel(activeMembership.getStartDate(), activeMembership.getEndDate()));
            }

            if (user.getCreatedAt() != null) {
                dto.setJoinDate(user.getCreatedAt().toLocalDate());
            }
        } else {
            dto.setStatus("Inactive");
            dto.setPlanName("No Plan");
        }
        return dto;
    }

    /**
     * Calculate a human-readable duration label from start/end dates.
     */
    private String calculateDurationLabel(LocalDate start, LocalDate end) {
        if (start == null || end == null)
            return "-";
        long days = java.time.temporal.ChronoUnit.DAYS.between(start, end);
        if (days >= 365) {
            long years = days / 365;
            return years + (years == 1 ? " Year" : " Years");
        } else if (days >= 28) {
            long months = days / 30;
            return months + (months == 1 ? " Month" : " Months");
        } else if (days >= 7) {
            long weeks = days / 7;
            return weeks + (weeks == 1 ? " Week" : " Weeks");
        } else {
            return days + (days == 1 ? " Day" : " Days");
        }
    }

    /**
     * Paginated Members with "today first" sorting.
     * Members created today appear at the top (sorted by createdAt DESC),
     * followed by older members sorted alphabetically (fullName ASC).
     */
    @Transactional(readOnly = true)
    public PageResponse<MemberDTO> getMembersPaginated(int page, int size, String search, String status, String plan) {
        // Query all possible member role names (legacy support)
        java.util.Set<Long> seenIds = new java.util.HashSet<>();
        List<User> allCustomers = new java.util.ArrayList<>();

        String[] memberRoles = { "CUSTOMER", "MEMBER", "ROLE_CUSTOMER", "ROLE_MEMBER" };
        for (String roleName : memberRoles) {
            List<User> users = userRepository.findByRoleName(roleName);
            for (User u : users) {
                if (seenIds.add(u.getUserId()))
                    allCustomers.add(u);
            }
        }

        // Apply search filter
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            allCustomers = allCustomers.stream()
                    .filter(u -> (u.getFullName() != null && u.getFullName().toLowerCase().contains(searchLower)) ||
                            (u.getEmail() != null && u.getEmail().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
        }

        // Convert to MemberDTO using shared helper (supports tiered plans + legacy
        // packages)
        LocalDate today = LocalDate.now();
        List<MemberDTO> allMembers = allCustomers.stream()
                .map(user -> populateMemberDTO(user))
                .collect(Collectors.toList());

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
    public PageResponse<User> getTrainersPaginated(int page, int size, String search, String role, String status) {
        String baseRole = (role != null && !role.trim().isEmpty()) ? role.toUpperCase() : "TRAINER";

        // Handle both conventions for the target role
        java.util.Set<String> rolesToQuery = new java.util.HashSet<>();
        rolesToQuery.add(baseRole);
        if (!baseRole.startsWith("ROLE_")) {
            rolesToQuery.add("ROLE_" + baseRole);
        } else {
            rolesToQuery.add(baseRole.replace("ROLE_", ""));
        }

        java.util.Set<Long> seenIds = new java.util.HashSet<>();
        List<User> allTrainers = new java.util.ArrayList<>();

        for (String r : rolesToQuery) {
            List<User> users = userRepository.findByRoleName(r);
            for (User u : users) {
                if (seenIds.add(u.getUserId())) {
                    allTrainers.add(u);
                }
            }
        }

        // Apply search filter
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            allTrainers = allTrainers.stream()
                    .filter(u -> (u.getFullName() != null && u.getFullName().toLowerCase().contains(searchLower)) ||
                            (u.getEmail() != null && u.getEmail().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
        }

        // Apply status filter
        if (status != null && !status.trim().isEmpty()) {
            allTrainers = allTrainers.stream()
                    .filter(u -> u.getStatus() != null && u.getStatus().equalsIgnoreCase(status))
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

    // Staff roles that are NOT trainers (operations/admin staff)
    private static final java.util.Set<String> STAFF_ROLES = java.util.Set.of(
            "STAFF", "RECEPTIONIST", "FLOOR_MANAGER", "MAINTENANCE", "CLEANING", "OPERATIONS", "SALES", "ADMIN",
            "MANAGER");

    @Transactional(readOnly = true)
    public PageResponse<com.gym.management.dto.StaffDTO> getStaffPaginated(int page, int size, String search,
            String role, String status) {
        java.util.Set<String> rolesToQuery = new java.util.HashSet<>();
        if (role != null && !role.trim().isEmpty()) {
            rolesToQuery.add(role.toUpperCase());
            rolesToQuery.add("ROLE_" + role.toUpperCase());
        } else {
            for (String r : STAFF_ROLES) {
                rolesToQuery.add(r);
                rolesToQuery.add("ROLE_" + r);
            }
        }

        List<User> allStaff = userRepository.findByRoleNames(rolesToQuery);

        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            allStaff = allStaff.stream()
                    .filter(u -> (u.getFullName() != null && u.getFullName().toLowerCase().contains(searchLower)) ||
                            (u.getEmail() != null && u.getEmail().toLowerCase().contains(searchLower)) ||
                            (u.getJobTitle() != null && u.getJobTitle().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
        }

        if (status != null && !status.trim().isEmpty()) {
            allStaff = allStaff.stream()
                    .filter(u -> u.getStatus() != null && u.getStatus().equalsIgnoreCase(status))
                    .collect(Collectors.toList());
        }

        allStaff.sort((a, b) -> {
            String nameA = a.getFullName() != null ? a.getFullName() : "";
            String nameB = b.getFullName() != null ? b.getFullName() : "";
            return nameA.compareToIgnoreCase(nameB);
        });

        long totalCount = allStaff.size();
        int start = page * size;
        int end = Math.min(start + size, allStaff.size());
        List<User> pageContent = start < allStaff.size() ? allStaff.subList(start, end) : Collections.emptyList();

        List<com.gym.management.dto.StaffDTO> dtos = pageContent.stream()
                .map(this::populateStaffDTO)
                .collect(Collectors.toList());

        return new PageResponse<>(dtos, page, size, totalCount, "alphabetical");
    }

    private com.gym.management.dto.StaffDTO populateStaffDTO(User user) {
        com.gym.management.dto.StaffDTO dto = new com.gym.management.dto.StaffDTO();
        dto.setUserId(user.getUserId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setGender(user.getGender());
        dto.setDateOfBirth(user.getDateOfBirth());
        dto.setAddress(user.getAddress());
        dto.setCity(user.getCity());
        dto.setState(user.getState());
        dto.setZipCode(user.getZipCode());
        dto.setAvatarId(user.getAvatarId());
        dto.setJobTitle(user.getJobTitle());
        dto.setDepartment(user.getDepartment());
        dto.setShiftTiming(user.getShiftTiming());
        dto.setSalary(user.getSalary());
        dto.setEmployeeIdCode(user.getEmployeeIdCode());
        dto.setStatus(user.getStatus() != null ? user.getStatus() : "Active");
        dto.setCreatedAt(user.getCreatedAt());
        dto.setLeavingDate(user.getLeavingDate());
        dto.setEmergencyContactName(user.getEmergencyContactName());
        dto.setEmergencyContactPhone(user.getEmergencyContactPhone());
        dto.setEmergencyContactRelation(user.getEmergencyContactRelation());
        return dto;
    }

    @Transactional
    public com.gym.management.dto.StaffDTO updateStaffDetails(Long userId, java.util.Map<String, Object> updates) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Staff not found: " + userId));
        if (updates.containsKey("fullName"))
            user.setFullName((String) updates.get("fullName"));
        if (updates.containsKey("email"))
            user.setEmail((String) updates.get("email"));
        if (updates.containsKey("phone"))
            user.setPhone((String) updates.get("phone"));
        if (updates.containsKey("gender"))
            user.setGender((String) updates.get("gender"));
        if (updates.containsKey("address"))
            user.setAddress((String) updates.get("address"));
        if (updates.containsKey("city"))
            user.setCity((String) updates.get("city"));
        if (updates.containsKey("state"))
            user.setState((String) updates.get("state"));
        if (updates.containsKey("zipCode"))
            user.setZipCode((String) updates.get("zipCode"));
        if (updates.containsKey("jobTitle"))
            user.setJobTitle((String) updates.get("jobTitle"));
        if (updates.containsKey("department"))
            user.setDepartment((String) updates.get("department"));
        if (updates.containsKey("shiftTiming"))
            user.setShiftTiming((String) updates.get("shiftTiming"));
        if (updates.containsKey("employeeIdCode"))
            user.setEmployeeIdCode((String) updates.get("employeeIdCode"));
        if (updates.containsKey("status"))
            user.setStatus((String) updates.get("status"));
        if (updates.containsKey("salary") && updates.get("salary") != null) {
            user.setSalary(new java.math.BigDecimal(updates.get("salary").toString()));
        }
        if (updates.containsKey("emergencyContactName"))
            user.setEmergencyContactName((String) updates.get("emergencyContactName"));
        if (updates.containsKey("emergencyContactPhone"))
            user.setEmergencyContactPhone((String) updates.get("emergencyContactPhone"));
        if (updates.containsKey("emergencyContactRelation"))
            user.setEmergencyContactRelation((String) updates.get("emergencyContactRelation"));
        if (updates.containsKey("dateOfBirth") && updates.get("dateOfBirth") != null) {
            user.setDateOfBirth(java.time.LocalDate.parse(updates.get("dateOfBirth").toString()));
        }
        userRepository.save(user);
        return populateStaffDTO(user);
    }

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            // Log failed password change attempt
            auditLogService.logSecurityEvent(
                    "PASSWORD_CHANGE_FAILED",
                    "Failed password change attempt - incorrect current password",
                    userId,
                    1L,
                    "medium",
                    null);
            throw new RuntimeException("Incorrect current password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setIsFirstLogin(false);
        user.setPasswordChangedAt(LocalDateTime.now());
        userRepository.save(user);

        // Log successful password change
        auditLogService.logSecurityEvent(
                "PASSWORD_CHANGED",
                "User changed their password",
                userId,
                1L,
                "info",
                null);
    }

    public User getUserById(Long id) {
        Objects.requireNonNull(id, "User ID must not be null");
        return userRepository.findById(id).orElse(null);
    }

    @Autowired
    private com.gym.management.repository.MembershipPackageRepository membershipPackageRepository;

    @Autowired
    private com.gym.management.repository.TieredMembershipPlanRepository tieredPlanRepository;

    @Autowired
    private com.gym.management.repository.PlanVariantRepository planVariantRepository;

    @Autowired
    private com.gym.management.repository.GymRepository gymRepository;

    @Transactional
    public User createUser(User user) {
        // ── Duplicate email guard ────────────────────────────────────
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            if (userRepository.existsByEmailIgnoreCase(user.getEmail().trim())) {
                throw new RuntimeException("An account with the email '" + user.getEmail().trim() + "' already exists");
            }
            // Normalize email to lowercase before saving
            user.setEmail(user.getEmail().trim().toLowerCase());
        }

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

        // Log user creation in audit log
        String roleName = savedUser.getRoles() != null && !savedUser.getRoles().isEmpty()
                ? savedUser.getRoles().iterator().next().getRoleName()
                : "USER";
        auditLogService.logCreate(
                "User",
                savedUser.getUserId().toString(),
                savedUser.getFullName(),
                savedUser.getUserId(),
                1L, // Default gym ID
                String.format("New %s created: %s (%s)", roleName, savedUser.getFullName(), savedUser.getEmail()),
                null);

        // Create Membership if this is a CUSTOMER with packageId (or variantId/planId)
        if (isCustomer && (user.getPackageId() != null || user.getVariantId() != null)) {
            try {
                // Get gym context
                com.gym.management.model.Gym gym = null;
                if (user.getGymId() != null) {
                    gym = gymRepository.findById(user.getGymId()).orElse(null);
                }

                if (gym == null) {
                    // Fallback to default gym (id=1 or any first gym)
                    gym = gymRepository.findById(1L).orElse(null);
                    if (gym == null) {
                        List<com.gym.management.model.Gym> allGyms = gymRepository.findAll();
                        if (!allGyms.isEmpty()) {
                            gym = allGyms.get(0);
                        }
                    }
                }

                if (gym == null) {
                    throw new RuntimeException("No gym found in the system. Cannot create membership.");
                }

                com.gym.management.model.Membership membership = new com.gym.management.model.Membership();
                membership.setUser(savedUser);
                membership.setGym(gym);

                // Determine start datetime from payload (frontend may send a datetime-local
                // value)
                java.time.LocalDateTime startDateTime;
                if (user.getStartDateTime() != null) {
                    startDateTime = user.getStartDateTime();
                } else if (user.getStartDate() != null) {
                    startDateTime = user.getStartDate().atStartOfDay();
                } else {
                    startDateTime = java.time.LocalDateTime.now();
                }
                java.time.LocalDate startDate = startDateTime.toLocalDate();
                membership.setStartDate(startDate);
                membership.setStartDateTime(startDateTime);

                if (user.getPlanId() != null && user.getVariantId() != null) {
                    // Tiered Plan
                    com.gym.management.model.TieredMembershipPlan plan = tieredPlanRepository.findById(user.getPlanId())
                            .orElseThrow(() -> new RuntimeException("Plan not found: " + user.getPlanId()));
                    com.gym.management.model.PlanVariant variant = planVariantRepository.findById(user.getVariantId())
                            .orElseThrow(() -> new RuntimeException("Variant not found: " + user.getVariantId()));

                    membership.setTieredPlan(plan);
                    membership.setPlanVariant(variant);
                    java.time.LocalDateTime endDateTime = startDateTime.plusDays(variant.getDurationDays());
                    membership.setEndDateTime(endDateTime);
                    membership.setEndDate(endDateTime.toLocalDate());
                } else if (user.getPackageId() != null) {
                    // Try to find if packageId is actually a Tiered Plan Variant (for backward
                    // compatibility)
                    Optional<com.gym.management.model.PlanVariant> variantOpt = planVariantRepository
                            .findById(user.getPackageId());

                    if (variantOpt.isPresent()) {
                        com.gym.management.model.PlanVariant variant = variantOpt.get();
                        membership.setTieredPlan(variant.getPlan());
                        membership.setPlanVariant(variant);
                        java.time.LocalDateTime endDateTime = startDateTime.plusDays(variant.getDurationDays());
                        membership.setEndDateTime(endDateTime);
                        membership.setEndDate(endDateTime.toLocalDate());
                    } else {
                        // Fallback to legacy MembershipPackage
                        com.gym.management.model.MembershipPackage pkg = membershipPackageRepository
                                .findById(user.getPackageId())
                                .orElseThrow(() -> new RuntimeException(
                                        "Package/Variant not found: " + user.getPackageId()));

                        membership.setMembershipPackage(pkg);

                        java.time.LocalDateTime endDateTime;
                        Integer durationDays = pkg.getDurationDays();
                        if (durationDays != null && durationDays > 0) {
                            endDateTime = startDateTime.plusDays(durationDays);
                        } else {
                            int months = user.getDuration() != null ? user.getDuration() : 1;
                            if (months <= 0) {
                                months = pkg.getDurationMonths() != null ? pkg.getDurationMonths() : 1;
                            }
                            endDateTime = startDateTime.plusMonths(months);
                        }
                        membership.setEndDateTime(endDateTime);
                        membership.setEndDate(endDateTime.toLocalDate());
                    }
                }

                membership.setStatus(membershipService.calculateStatusFromEndDateTime(membership.getEndDateTime()));
                membershipRepository.save(membership);
            } catch (Exception e) {
                System.err.println("Failed to create membership during user creation: " + e.getMessage());
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
            // Track changes for audit log
            List<String> changes = new ArrayList<>();

            // Update fields
            if (user.getUsername() != null && !user.getUsername().equals(existingUser.getUsername())) {
                changes.add(String.format("Username: '%s' → '%s'", existingUser.getUsername(), user.getUsername()));
                existingUser.setUsername(user.getUsername());
            }
            if (user.getFullName() != null && !user.getFullName().equals(existingUser.getFullName())) {
                changes.add(String.format("Name: '%s' → '%s'", existingUser.getFullName(), user.getFullName()));
                existingUser.setFullName(user.getFullName());
            }
            if (user.getEmail() != null && !user.getEmail().equals(existingUser.getEmail())) {
                changes.add(String.format("Email: '%s' → '%s'", existingUser.getEmail(), user.getEmail()));
                existingUser.setEmail(user.getEmail());
            }
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                changes.add("Password changed");
                existingUser.setPassword(user.getPassword());
            }
            // Update roles if provided
            if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                changes.add("Roles updated");
                existingUser.setRoles(user.getRoles());
            }
            // Update phone if provided (from either phone or phoneNumber transient field)
            if (user.getPhone() != null && !user.getPhone().equals(existingUser.getPhone())) {
                changes.add(String.format("Phone: '%s' → '%s'", existingUser.getPhone(), user.getPhone()));
                existingUser.setPhone(user.getPhone());
            } else if (user.getPhoneNumber() != null && !user.getPhoneNumber().equals(existingUser.getPhone())) {
                changes.add(String.format("Phone: '%s' → '%s'", existingUser.getPhone(), user.getPhoneNumber()));
                existingUser.setPhone(user.getPhoneNumber());
            }
            // Update join date if provided
            if (user.getJoinDate() != null) {
                changes.add("Join date updated");
                existingUser.setCreatedAt(user.getJoinDate().atStartOfDay());
            }
            // Update leaving date if provided
            if (user.getLeavingDate() != null) {
                changes.add("Leaving date updated");
                existingUser.setLeavingDate(user.getLeavingDate());
            }
            // Update status if provided
            if (user.getStatus() != null && !user.getStatus().equals(existingUser.getStatus())) {
                changes.add(String.format("Status: '%s' → '%s'", existingUser.getStatus(), user.getStatus()));
                existingUser.setStatus(user.getStatus());
            }
            // Update avatarId if provided
            if (user.getAvatarId() != null && !user.getAvatarId().equals(existingUser.getAvatarId())) {
                changes.add("Avatar updated");
                existingUser.setAvatarId(user.getAvatarId());
            }
            // Update personal info fields
            if (user.getGender() != null && !user.getGender().equals(existingUser.getGender())) {
                changes.add(String.format("Gender: '%s' → '%s'", existingUser.getGender(), user.getGender()));
                existingUser.setGender(user.getGender());
            }
            if (user.getDateOfBirth() != null) {
                changes.add("Date of birth updated");
                existingUser.setDateOfBirth(user.getDateOfBirth());
            }
            if (user.getBloodType() != null && !user.getBloodType().equals(existingUser.getBloodType())) {
                changes.add("Blood type updated");
                existingUser.setBloodType(user.getBloodType());
            }
            if (user.getAddress() != null && !user.getAddress().equals(existingUser.getAddress())) {
                changes.add("Address updated");
                existingUser.setAddress(user.getAddress());
            }
            if (user.getCity() != null && !user.getCity().equals(existingUser.getCity())) {
                changes.add("City updated");
                existingUser.setCity(user.getCity());
            }
            if (user.getState() != null && !user.getState().equals(existingUser.getState())) {
                changes.add("State updated");
                existingUser.setState(user.getState());
            }
            if (user.getZipCode() != null && !user.getZipCode().equals(existingUser.getZipCode())) {
                changes.add("Zip code updated");
                existingUser.setZipCode(user.getZipCode());
            }
            // Update emergency contact fields
            if (user.getEmergencyContactName() != null) {
                existingUser.setEmergencyContactName(user.getEmergencyContactName());
                changes.add("Emergency contact name updated");
            }
            if (user.getEmergencyContactPhone() != null) {
                existingUser.setEmergencyContactPhone(user.getEmergencyContactPhone());
                changes.add("Emergency contact phone updated");
            }
            if (user.getEmergencyContactRelation() != null) {
                existingUser.setEmergencyContactRelation(user.getEmergencyContactRelation());
                changes.add("Emergency contact relation updated");
            }
            // Update health info fields
            if (user.getHealthNotes() != null) {
                existingUser.setHealthNotes(user.getHealthNotes());
                changes.add("Health notes updated");
            }
            if (user.getFitnessGoals() != null) {
                existingUser.setFitnessGoals(user.getFitnessGoals());
                changes.add("Fitness goals updated");
            }

            User updatedUser = userRepository.save(existingUser);

            // Log the update in audit log
            if (!changes.isEmpty()) {
                String changesStr = String.join("; ", changes);
                auditLogService.logUpdate(
                        "User",
                        id.toString(),
                        existingUser.getFullName(),
                        id,
                        1L, // Default gym ID
                        "User profile updated",
                        changesStr,
                        null);
            }

            return updatedUser;
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

        // Capture user info for audit log before deletion
        String userName = user.getFullName();
        String userEmail = user.getEmail();
        String userRole = user.getRoles() != null && !user.getRoles().isEmpty()
                ? user.getRoles().iterator().next().getRoleName()
                : "USER";

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

        // 2. Keep historical memberships/sessions/ratings and soft-delete only.
        // Deleting child rows here causes FK violations because many historical tables
        // (class bookings, ratings, notes, notifications, etc.) still reference this
        // user.

        // 3. Soft-delete user to avoid FK constraint failures from historical records
        // while hiding the profile from regular queries via @SQLRestriction.
        user.setIsDeleted(true);
        user.setStatus("Deleted");
        userRepository.save(user);

        // Log the deletion in audit log
        auditLogService.logDelete(
                "User",
                id.toString(),
                userName,
                null, // We don't know who deleted, could be passed as param
                1L, // Default gym ID
                String.format("%s deleted: %s (%s)", userRole, userName, userEmail),
                null);
    }

    /**
     * Assign a customer to a trainer.
     *
     * Uses a native Oracle MERGE (upsert) directly on the join table to avoid:
     * - @Version OptimisticLockException when saving the customer entity
     * - HashSet equals/hashCode bugs caused by Lombok @Data including @Version
     * field
     * - Recursive EAGER loading chains on both sides of the ManyToMany
     *
     * Idempotent: safe to call even if the relationship already exists.
     */
    @Transactional
    public long assignCustomerToTrainer(Long trainerId, Long customerId) {
        Objects.requireNonNull(trainerId, "Trainer ID must not be null");
        Objects.requireNonNull(customerId, "Customer ID must not be null");

        if (!userRepository.existsById(trainerId) || !userRepository.existsById(customerId)) {
            return -1L; // signal not found
        }

        // Oracle MERGE = upsert: only inserts if the row doesn't exist
        entityManager.createNativeQuery(
                "MERGE INTO trainer_customer_map t " +
                        "USING dual ON (t.trainer_user_id = :tid AND t.customer_user_id = :cid) " +
                        "WHEN NOT MATCHED THEN " +
                        "  INSERT (trainer_user_id, customer_user_id) VALUES (:tid, :cid)")
                .setParameter("tid", trainerId)
                .setParameter("cid", customerId)
                .executeUpdate();

        // Return updated customer count for this trainer
        Number count = (Number) entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM trainer_customer_map WHERE trainer_user_id = :tid")
                .setParameter("tid", trainerId)
                .getSingleResult();

        return count.longValue();
    }

    /**
     * Remove a customer from a trainer.
     *
     * Uses native SQL DELETE directly on the join table for the same reasons
     * as assignCustomerToTrainer. Idempotent: safe even if row doesn't exist.
     */
    @Transactional
    public long removeCustomerFromTrainer(Long trainerId, Long customerId) {
        Objects.requireNonNull(trainerId, "Trainer ID must not be null");
        Objects.requireNonNull(customerId, "Customer ID must not be null");

        if (!userRepository.existsById(trainerId)) {
            return -1L; // signal not found
        }

        entityManager.createNativeQuery(
                "DELETE FROM trainer_customer_map " +
                        "WHERE trainer_user_id = :tid AND customer_user_id = :cid")
                .setParameter("tid", trainerId)
                .setParameter("cid", customerId)
                .executeUpdate();

        Number count = (Number) entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM trainer_customer_map WHERE trainer_user_id = :tid")
                .setParameter("tid", trainerId)
                .getSingleResult();

        return count.longValue();
    }

    /**
     * Calculate performance metrics for a trainer
     * 
     * @param trainerId The trainer's user ID
     * @return TrainerPerformanceDTO with clients, revenue, sessions
     */
    @Transactional(readOnly = true)
    public TrainerPerformanceDTO getTrainerPerformance(Long trainerId) {
        User trainer = userRepository.findById(trainerId).orElse(null);
        if (trainer == null) {
            return null;
        }

        // Get client count from trainer-customer mapping
        int clientCount = trainer.getCustomers() != null ? trainer.getCustomers().size() : 0;

        // Get current month's date range
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfMonth = now.withDayOfMonth(now.toLocalDate().lengthOfMonth())
                .withHour(23).withMinute(59).withSecond(59);

        // Count completed sessions this month
        Long completedSessions = ptSessionRepository.countCompletedSessionsByTrainerAndDateRange(
                trainerId, startOfMonth, endOfMonth);
        int sessionsCount = completedSessions != null ? completedSessions.intValue() : 0;

        // Get total session minutes this month
        Long totalMinutes = ptSessionRepository.sumSessionMinutesByTrainerAndDateRange(
                trainerId, startOfMonth, endOfMonth);
        double totalHours = totalMinutes != null ? totalMinutes / 60.0 : 0.0;

        // Calculate revenue (using default rate of ₹500/session for MVP)
        // In future: fetch from TrainerCompensationRule
        BigDecimal defaultRatePerSession = new BigDecimal("500");
        BigDecimal monthlyRevenue = defaultRatePerSession.multiply(BigDecimal.valueOf(sessionsCount));

        return TrainerPerformanceDTO.builder()
                .trainerId(trainerId)
                .clientCount(clientCount)
                .completedSessions(sessionsCount)
                .totalHours(totalHours)
                .monthlyRevenue(monthlyRevenue)
                .build();
    }

    /**
     * Get performance metrics for all trainers (batch)
     * 
     * @return Map of trainerId -> TrainerPerformanceDTO
     */
    @Transactional(readOnly = true)
    public Map<Long, TrainerPerformanceDTO> getAllTrainersPerformance() {
        List<User> trainers = userRepository.findByRoleName("TRAINER");
        Map<Long, TrainerPerformanceDTO> result = new HashMap<>();

        for (User trainer : trainers) {
            TrainerPerformanceDTO perf = getTrainerPerformance(trainer.getUserId());
            if (perf != null) {
                result.put(trainer.getUserId(), perf);
            }
        }

        return result;
    }
}
