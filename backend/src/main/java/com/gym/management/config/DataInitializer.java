package com.gym.management.config;

import com.gym.management.model.MembershipPackage;
import com.gym.management.model.PTSession;
import com.gym.management.model.Role;
import com.gym.management.model.SessionStatus;
import com.gym.management.model.User;
import com.gym.management.model.Membership;
import com.gym.management.model.MembershipStatus;
import com.gym.management.model.Gym;
import com.gym.management.model.TieredMembershipPlan;
import com.gym.management.model.PlanVariant;
import com.gym.management.model.PlanFeature;
import com.gym.management.repository.MembershipRepository;
import com.gym.management.repository.GymRepository;
import com.gym.management.repository.MembershipPackageRepository;
import com.gym.management.repository.PTSessionRepository;
import com.gym.management.repository.RoleRepository;
import com.gym.management.repository.UserRepository;
import com.gym.management.repository.TieredMembershipPlanRepository;
import com.gym.management.repository.PlanVariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Initializes default data on application startup
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final String[] FIRST_NAMES = {
            "James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles",
            "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen",
            "Christopher", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua"
    };

    private static final String[] LAST_NAMES = {
            "Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor",
            "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson",
            "Clark", "Rodriguez", "Lewis", "Lee", "Walker", "Hall", "Allen", "Young", "Hernandez", "King"
    };

    private java.util.Random random = new java.util.Random();

    @Autowired
    private MembershipPackageRepository membershipPackageRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PTSessionRepository ptSessionRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private GymRepository gymRepository;

    @Autowired
    private TieredMembershipPlanRepository tieredPlanRepository;

    @Autowired
    private PlanVariantRepository planVariantRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize roles first (they are required for users)
        if (roleRepository.count() == 0) {
            initializeRoles();
        }

        // Initialize default membership packages if none exist
        if (membershipPackageRepository.count() == 0) {
            initializeMembershipPackages();
        }

        // Initialize tiered plans if none exist
        if (tieredPlanRepository.count() == 0) {
            initializeTieredPlans();
        }

        // Initialize sample users if count is low (bulk generation)
        if (userRepository.count() < 50) {
            initializeSampleUsers();
        }

        // Initialize sample PT sessions if none exist
        if (ptSessionRepository.count() == 0) {
            initializeSamplePTSessions();
        }
    }

    private void initializeRoles() {
        String[] roleNames = { "OWNER", "TRAINER", "STAFF", "CUSTOMER", "ADMIN", "MANAGER",
            "RECEPTIONIST", "FLOOR_MANAGER", "MAINTENANCE", "CLEANING", "OPERATIONS", "SALES" };
        for (String roleName : roleNames) {
            if (roleRepository.findByRoleName(roleName) == null) {
                Role role = new Role();
                role.setRoleName(roleName);
                roleRepository.save(role);
            }
        }
        System.out.println("✅ Default roles initialized!");
    }

    private void initializeMembershipPackages() {
        // Gold Plan
        MembershipPackage gold = new MembershipPackage();
        gold.setPackageName("Gold Plan");
        gold.setPrice(2999.0);
        gold.setDurationDays(30);
        gold.setIncludedPTSessions(4);
        gold.setIsActive(true);
        membershipPackageRepository.save(gold);

        // Silver Plan
        MembershipPackage silver = new MembershipPackage();
        silver.setPackageName("Silver Plan");
        silver.setPrice(1999.0);
        silver.setDurationDays(30);
        silver.setIncludedPTSessions(2);
        silver.setIsActive(true);
        membershipPackageRepository.save(silver);

        // Platinum Plan
        MembershipPackage platinum = new MembershipPackage();
        platinum.setPackageName("Platinum Plan");
        platinum.setPrice(4999.0);
        platinum.setDurationDays(30);
        platinum.setIncludedPTSessions(8);
        platinum.setIsActive(true);
        membershipPackageRepository.save(platinum);

        // Basic Plan
        MembershipPackage basic = new MembershipPackage();
        basic.setPackageName("Basic Plan");
        basic.setPrice(999.0);
        basic.setDurationDays(30);
        basic.setIncludedPTSessions(0);
        basic.setIsActive(true);
        membershipPackageRepository.save(basic);

        // Annual Gold Plan
        MembershipPackage annualGold = new MembershipPackage();
        annualGold.setPackageName("Annual Gold Plan");
        annualGold.setPrice(29999.0);
        annualGold.setDurationDays(365);
        annualGold.setIncludedPTSessions(48);
        annualGold.setIsActive(true);
        membershipPackageRepository.save(annualGold);

        System.out.println("✅ Default membership packages initialized!");
    }

    private void initializeTieredPlans() {
        // === Basic Plan ===
        TieredMembershipPlan basic = new TieredMembershipPlan();
        basic.setPlanName("Basic");
        basic.setDescription("Essential gym access with basic amenities");
        basic.setCategory(TieredMembershipPlan.PlanCategory.STANDARD);
        basic.setPlanColor("#6B7280");
        basic.setIconName("dumbbell");
        basic.setStatus(TieredMembershipPlan.PlanStatus.ACTIVE);
        basic.setIsRecommended(false);
        basic.setSortOrder(1);
        basic = tieredPlanRepository.save(basic);
        createVariant(basic, 1, PlanVariant.DurationUnit.MONTHS, 999.0, null, 0, false, true, 1);
        createVariant(basic, 3, PlanVariant.DurationUnit.MONTHS, 2499.0, 2997.0, 0, false, false, 2);
        createVariant(basic, 6, PlanVariant.DurationUnit.MONTHS, 4499.0, 5994.0, 0, false, false, 3);
        createVariant(basic, 1, PlanVariant.DurationUnit.YEARS, 7999.0, 11988.0, 0, false, false, 4);

        // === Standard Plan ===
        TieredMembershipPlan standard = new TieredMembershipPlan();
        standard.setPlanName("Standard");
        standard.setDescription("Full gym access with group classes and locker");
        standard.setCategory(TieredMembershipPlan.PlanCategory.STANDARD);
        standard.setPlanColor("#3B82F6");
        standard.setIconName("star");
        standard.setStatus(TieredMembershipPlan.PlanStatus.ACTIVE);
        standard.setIsRecommended(true);
        standard.setSortOrder(2);
        standard = tieredPlanRepository.save(standard);
        createVariant(standard, 1, PlanVariant.DurationUnit.MONTHS, 1999.0, null, 2, false, true, 1);
        createVariant(standard, 3, PlanVariant.DurationUnit.MONTHS, 4999.0, 5997.0, 6, true, false, 2);
        createVariant(standard, 6, PlanVariant.DurationUnit.MONTHS, 8999.0, 11994.0, 12, false, false, 3);
        createVariant(standard, 1, PlanVariant.DurationUnit.YEARS, 15999.0, 23988.0, 24, false, false, 4);

        // === Premium Plan ===
        TieredMembershipPlan premium = new TieredMembershipPlan();
        premium.setPlanName("Premium");
        premium.setDescription("Unlimited access with PT sessions, spa, and priority booking");
        premium.setCategory(TieredMembershipPlan.PlanCategory.PREMIUM);
        premium.setPlanColor("#F59E0B");
        premium.setIconName("crown");
        premium.setStatus(TieredMembershipPlan.PlanStatus.ACTIVE);
        premium.setIsRecommended(false);
        premium.setSortOrder(3);
        premium = tieredPlanRepository.save(premium);
        createVariant(premium, 1, PlanVariant.DurationUnit.MONTHS, 3999.0, null, 4, false, true, 1);
        createVariant(premium, 3, PlanVariant.DurationUnit.MONTHS, 9999.0, 11997.0, 12, true, false, 2);
        createVariant(premium, 6, PlanVariant.DurationUnit.MONTHS, 17999.0, 23994.0, 24, false, false, 3);
        createVariant(premium, 1, PlanVariant.DurationUnit.YEARS, 29999.0, 47988.0, 48, false, false, 4);

        System.out.println("✅ Tiered membership plans initialized (Basic, Standard, Premium)!");
    }

    private PlanVariant createVariant(TieredMembershipPlan plan, int durationValue, PlanVariant.DurationUnit unit,
                                       double price, Double originalPrice, int ptSessions,
                                       boolean isPopular, boolean isActive, int sortOrder) {
        PlanVariant v = new PlanVariant();
        v.setPlan(plan);
        v.setDurationValue(durationValue);
        v.setDurationUnit(unit);
        v.setPrice(price);
        v.setOriginalPrice(originalPrice);
        v.setIncludedPTSessions(ptSessions);
        v.setIsPopular(isPopular);
        v.setIsActive(isActive);
        v.setSortOrder(sortOrder);
        // Calculate duration days
        v.calculateDurationDays();
        return planVariantRepository.save(v);
    }

    private void initializeSampleUsers() {
        Role trainerRole = roleRepository.findByRoleName("TRAINER");
        Role customerRole = roleRepository.findByRoleName("CUSTOMER");
        Role staffRole = roleRepository.findByRoleName("STAFF");
        Role ownerRole = roleRepository.findByRoleName("OWNER");

        System.out.println("Initializing bulk users schema...");

        // Create 30 Trainers
        for (int i = 1; i <= 30; i++) {
            String firstName = FIRST_NAMES[random.nextInt(FIRST_NAMES.length)];
            String lastName = LAST_NAMES[random.nextInt(LAST_NAMES.length)];
            String fullName = firstName + " " + lastName;
            String username = (firstName + "." + lastName + i).toLowerCase();

            if (!userRepository.existsByUsername(username)) {
                User user = new User();
                user.setUsername(username);
                user.setFullName(fullName);
                user.setEmail(username + "@gym.com");
                user.setPassword(passwordEncoder.encode("password123"));
                Set<Role> roles = new HashSet<>();
                roles.add(trainerRole);
                user.setRoles(roles);
                userRepository.save(user);
            }
        }

        // Create 100 Members/Customers using tiered plans
        java.util.List<TieredMembershipPlan> tieredPlans = tieredPlanRepository.findAll().stream()
                .filter(p -> p.getStatus() == TieredMembershipPlan.PlanStatus.ACTIVE)
                .collect(java.util.stream.Collectors.toList());
        java.util.List<PlanVariant> allVariants = planVariantRepository.findAll().stream()
                .filter(v -> v.getIsActive())
                .collect(java.util.stream.Collectors.toList());

        Gym defaultGym = gymRepository.findAll().stream().findFirst().orElseGet(() -> {
            Gym g = new Gym();
            g.setName("Default Gym");
            g.setAddress("123 Main St");
            g.setPhone("555-1234");
            g.setEmail("info@gym.com");
            return gymRepository.save(g);
        });

        for (int i = 1; i <= 100; i++) {
            String firstName = FIRST_NAMES[random.nextInt(FIRST_NAMES.length)];
            String lastName = LAST_NAMES[random.nextInt(LAST_NAMES.length)];
            String fullName = firstName + " " + lastName;
            String username = (firstName + "." + lastName + i).toLowerCase();

            if (!userRepository.existsByUsername(username)) {
                User user = new User();
                user.setUsername(username);
                user.setFullName(fullName);
                user.setEmail(username + "@gym.com");
                user.setPhone("+91 " + (9000000000L + random.nextInt(999999999)));
                user.setPassword(passwordEncoder.encode("password123"));
                Set<Role> roles = new HashSet<>();
                roles.add(customerRole);
                user.setRoles(roles);
                User savedUser = userRepository.save(user);

                // Create Membership with tiered plans
                if (!tieredPlans.isEmpty() && !allVariants.isEmpty()) {
                    // Pick a random plan
                    TieredMembershipPlan plan = tieredPlans.get(random.nextInt(tieredPlans.size()));
                    // Get variants for this plan
                    java.util.List<PlanVariant> planVariants = allVariants.stream()
                            .filter(v -> v.getPlan().getPlanId().equals(plan.getPlanId()))
                            .collect(java.util.stream.Collectors.toList());
                    if (planVariants.isEmpty()) planVariants = allVariants;
                    PlanVariant variant = planVariants.get(random.nextInt(planVariants.size()));

                    Membership m = new Membership();
                    m.setUser(savedUser);
                    m.setGym(defaultGym);
                    m.setTieredPlan(plan);
                    m.setPlanVariant(variant);

                    // 80% active, 10% expiring soon, 10% expired
                    double roll = random.nextDouble();
                    if (roll > 0.2) {
                        // Active members with various days remaining
                        m.setStatus(MembershipStatus.ACTIVE);
                        int startDaysAgo = random.nextInt(Math.max(1, variant.getDurationDays() - 5));
                        m.setStartDate(java.time.LocalDate.now().minusDays(startDaysAgo));
                        m.setEndDate(m.getStartDate().plusDays(variant.getDurationDays()));
                    } else if (roll > 0.1) {
                        // Expiring soon (within 7 days)
                        m.setStatus(MembershipStatus.ACTIVE);
                        m.setStartDate(java.time.LocalDate.now().minusDays(variant.getDurationDays() - random.nextInt(7)));
                        m.setEndDate(java.time.LocalDate.now().plusDays(1 + random.nextInt(6)));
                    } else {
                        // Expired
                        m.setStatus(MembershipStatus.EXPIRED);
                        m.setStartDate(java.time.LocalDate.now().minusDays(variant.getDurationDays() + 10 + random.nextInt(90)));
                        m.setEndDate(java.time.LocalDate.now().minusDays(1 + random.nextInt(30)));
                    }
                    membershipRepository.save(m);
                }
            }
        }

        // Create 20 Staff members
        for (int i = 1; i <= 20; i++) {
            String firstName = FIRST_NAMES[random.nextInt(FIRST_NAMES.length)];
            String lastName = LAST_NAMES[random.nextInt(LAST_NAMES.length)];
            String fullName = firstName + " " + lastName;
            String username = ("staff." + firstName + "." + lastName + i).toLowerCase();

            if (!userRepository.existsByUsername(username)) {
                User user = new User();
                user.setUsername(username);
                user.setFullName(fullName);
                user.setEmail(username + "@gym.com");
                user.setPassword(passwordEncoder.encode("password123"));
                Set<Role> roles = new HashSet<>();
                roles.add(staffRole);
                user.setRoles(roles);
                userRepository.save(user);
            }
        }

        // Ensure Admin exists
        if (!userRepository.existsByUsername("admin")) {
            User user = new User();
            user.setUsername("admin");
            user.setFullName("Admin User");
            user.setEmail("admin@gym.com");
            user.setPassword(passwordEncoder.encode("password123"));
            Set<Role> roles = new HashSet<>();
            roles.add(ownerRole != null ? ownerRole : staffRole);
            user.setRoles(roles);
            userRepository.save(user);
        }

        System.out.println("✅ Bulk users initialized with realistic data!");
    }

    private void initializeSamplePTSessions() {
        // Get trainers and members
        java.util.List<User> trainers = userRepository.findByRoleName("TRAINER");
        java.util.List<User> members = userRepository.findByRoleName("CUSTOMER");

        if (trainers.isEmpty() || members.isEmpty()) {
            System.out.println("⚠️ Cannot create PT sessions - no trainers or members found");
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        int sessionCount = 0;

        // Create sessions for each trainer
        for (int t = 0; t < trainers.size(); t++) {
            User trainer = trainers.get(t);

            // Each trainer gets 4-6 sessions per day for the next 7 days
            for (int day = 0; day < 7; day++) {
                // Morning sessions (6 AM - 12 PM)
                for (int slot = 0; slot < 3; slot++) {
                    int memberIndex = (t * 3 + slot + day) % members.size();
                    User member = members.get(memberIndex);

                    PTSession session = new PTSession();
                    session.setTrainer(trainer);
                    session.setMember(member);
                    session.setSessionDate(now.plusDays(day).withHour(6 + slot * 2).withMinute(0));
                    session.setDurationMinutes(60);
                    session.setStatus(SessionStatus.SCHEDULED);
                    session.setProgressNotes("Focus on strength training");
                    ptSessionRepository.save(session);
                    sessionCount++;
                }

                // Afternoon sessions (2 PM - 8 PM)
                for (int slot = 0; slot < 3; slot++) {
                    int memberIndex = (t * 3 + slot + day + 5) % members.size();
                    User member = members.get(memberIndex);

                    PTSession session = new PTSession();
                    session.setTrainer(trainer);
                    session.setMember(member);
                    session.setSessionDate(now.plusDays(day).withHour(14 + slot * 2).withMinute(0));
                    session.setDurationMinutes(45);
                    session.setStatus(SessionStatus.SCHEDULED);
                    session.setProgressNotes("Cardio and flexibility");
                    ptSessionRepository.save(session);
                    sessionCount++;
                }
            }

            // Add some past completed sessions
            for (int pastDay = 1; pastDay <= 3; pastDay++) {
                int memberIndex = (t + pastDay) % members.size();
                User member = members.get(memberIndex);

                PTSession session = new PTSession();
                session.setTrainer(trainer);
                session.setMember(member);
                session.setSessionDate(now.minusDays(pastDay).withHour(10).withMinute(0));
                session.setDurationMinutes(60);
                session.setStatus(SessionStatus.COMPLETED);
                session.setProgressNotes("Great progress! Member completed all exercises.");
                session.setWorkoutPlan("3x10 Squats, 3x12 Bench Press, 3x15 Rows");
                session.setDietPlan("High protein, 2500 calories");
                ptSessionRepository.save(session);
                sessionCount++;
            }

            // Add some missed sessions
            PTSession missedSession = new PTSession();
            missedSession.setTrainer(trainer);
            missedSession.setMember(members.get(t % members.size()));
            missedSession.setSessionDate(now.minusDays(5).withHour(9).withMinute(0));
            missedSession.setDurationMinutes(60);
            missedSession.setStatus(SessionStatus.MISSED);
            missedSession.setProgressNotes("Member did not attend");
            ptSessionRepository.save(missedSession);
            sessionCount++;
        }

        System.out.println("✅ Sample PT sessions initialized (" + sessionCount + " sessions)!");
    }
}
