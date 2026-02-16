package com.gym.management.config;

import com.gym.management.model.MembershipPackage;
import com.gym.management.model.PTSession;
import com.gym.management.model.Role;
import com.gym.management.model.SessionStatus;
import com.gym.management.model.User;
import com.gym.management.model.Membership;
import com.gym.management.model.MembershipStatus;
import com.gym.management.model.Gym;
import com.gym.management.repository.MembershipRepository;
import com.gym.management.repository.GymRepository;
import com.gym.management.repository.MembershipPackageRepository;
import com.gym.management.repository.PTSessionRepository;
import com.gym.management.repository.RoleRepository;
import com.gym.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
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
        String[] roleNames = { "OWNER", "TRAINER", "STAFF", "CUSTOMER" };
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

        // Create 100 Members/Customers
        // Create 100 Members/Customers
        java.util.List<MembershipPackage> packages = membershipPackageRepository.findAll();
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
            String username = (firstName + "." + lastName + i).toLowerCase(); // Add i to ensure uniqueness

            if (!userRepository.existsByUsername(username)) {
                User user = new User();
                user.setUsername(username);
                user.setFullName(fullName);
                user.setEmail(username + "@gym.com");
                user.setPassword(passwordEncoder.encode("password123"));
                Set<Role> roles = new HashSet<>();
                roles.add(customerRole);
                user.setRoles(roles);
                User savedUser = userRepository.save(user);

                // Create Membership
                if (packages != null && !packages.isEmpty()) {
                    Membership m = new Membership();
                    m.setUser(savedUser);
                    m.setGym(defaultGym);
                    m.setMembershipPackage(packages.get(random.nextInt(packages.size())));
                    // 80% active, 20% expired/inactive
                    if (random.nextDouble() > 0.2) {
                        m.setStatus(MembershipStatus.ACTIVE);
                        m.setStartDate(java.time.LocalDate.now().minusDays(random.nextInt(20)));
                        m.setEndDate(java.time.LocalDate.now().plusDays(30 + random.nextInt(300)));
                    } else {
                        m.setStatus(MembershipStatus.EXPIRED);
                        m.setStartDate(java.time.LocalDate.now().minusDays(100));
                        m.setEndDate(java.time.LocalDate.now().minusDays(1));
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
