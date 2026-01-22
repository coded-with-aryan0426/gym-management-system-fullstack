package com.gym.management.component;

import com.gym.management.model.User;
import com.gym.management.model.Role;
import com.gym.management.model.PTSession;
import com.gym.management.model.SessionStatus;
import com.gym.management.model.ProgressNote;
import com.gym.management.model.TrainerClass;
import com.gym.management.model.TrainerClass.ClassType;
import com.gym.management.model.TrainerClass.ClassStatus;
import com.gym.management.model.TrainerClassAttendee;
import com.gym.management.model.TrainerClassAttendee.AttendeeStatus;
import com.gym.management.model.Membership;
import com.gym.management.model.MembershipStatus;
import com.gym.management.model.MembershipPackage;
import com.gym.management.model.Gym;
import com.gym.management.repository.UserRepository;
import com.gym.management.repository.RoleRepository;
import com.gym.management.repository.PTSessionRepository;
import com.gym.management.repository.ProgressNoteRepository;
import com.gym.management.repository.TrainerClassRepository;
import com.gym.management.repository.TrainerClassAttendeeRepository;
import com.gym.management.repository.MembershipRepository;
import com.gym.management.repository.MembershipPackageRepository;
import com.gym.management.repository.GymRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;

@Component
public class AppDataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PTSessionRepository ptSessionRepository;
    private final ProgressNoteRepository progressNoteRepository;
    private final TrainerClassRepository trainerClassRepository;
    private final TrainerClassAttendeeRepository trainerClassAttendeeRepository;
    private final MembershipRepository membershipRepository;
    private final MembershipPackageRepository membershipPackageRepository;
    private final GymRepository gymRepository;
    private final PasswordEncoder passwordEncoder;

    public AppDataLoader(UserRepository userRepository,
            RoleRepository roleRepository,
            PTSessionRepository ptSessionRepository,
            ProgressNoteRepository progressNoteRepository,
            TrainerClassRepository trainerClassRepository,
            TrainerClassAttendeeRepository trainerClassAttendeeRepository,
            MembershipRepository membershipRepository,
            MembershipPackageRepository membershipPackageRepository,
            GymRepository gymRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.ptSessionRepository = ptSessionRepository;
        this.progressNoteRepository = progressNoteRepository;
        this.trainerClassRepository = trainerClassRepository;
        this.trainerClassAttendeeRepository = trainerClassAttendeeRepository;
        this.membershipRepository = membershipRepository;
        this.membershipPackageRepository = membershipPackageRepository;
        this.gymRepository = gymRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // ============================================
        // 1. Initialize Roles
        // ============================================
        Role adminRole = createRoleIfNotFound("ROLE_ADMIN");
        Role ownerRole = createRoleIfNotFound("ROLE_OWNER");
        Role trainerRole = createRoleIfNotFound("ROLE_TRAINER");
        Role memberRole = createRoleIfNotFound("ROLE_MEMBER");

        // ============================================
        // 2. Create Admin Account
        // Login: admin / admin123
        // ============================================
        if (!userRepository.findByUsername("admin").isPresent()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setFullName("System Administrator");
            admin.setEmail("admin@fitpro.com");
            admin.setPhone("555-0000");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRoles(new HashSet<>(Collections.singletonList(adminRole)));
            admin.setStatus("Active");
            userRepository.save(admin);
            System.out.println("✅ Seeded Admin: admin / admin123");
        }

        // ============================================
        // 3. Create Owner Account
        // Login: owner / password123
        // ============================================
        if (!userRepository.findByUsername("owner").isPresent()) {
            User owner = new User();
            owner.setUsername("owner");
            owner.setFullName("Gym Owner");
            owner.setEmail("owner@fitpro.com");
            owner.setPhone("555-1000");
            owner.setPassword(passwordEncoder.encode("password123"));
            owner.setRoles(new HashSet<>(Collections.singletonList(ownerRole)));
            owner.setStatus("Active");
            userRepository.save(owner);
            System.out.println("✅ Seeded Owner: owner / password123");
        }

        // ============================================
        // 4. Create Trainers
        // Login: john.smith / password123
        // Login: sarah.jones / password123
        // ============================================
        if (!userRepository.findByUsername("john.smith").isPresent()) {
            User trainer = new User();
            trainer.setUsername("john.smith");
            trainer.setFullName("John Smith");
            trainer.setEmail("john.smith@fitpro.com");
            trainer.setPhone("555-0101");
            trainer.setPassword(passwordEncoder.encode("password123"));
            trainer.setRoles(new HashSet<>(Collections.singletonList(trainerRole)));
            trainer.setStatus("Active");
            userRepository.save(trainer);
            System.out.println("✅ Seeded Trainer: john.smith / password123");
        }

        if (!userRepository.findByUsername("sarah.jones").isPresent()) {
            User trainer2 = new User();
            trainer2.setUsername("sarah.jones");
            trainer2.setFullName("Sarah Jones");
            trainer2.setEmail("sarah.jones@fitpro.com");
            trainer2.setPhone("555-0102");
            trainer2.setPassword(passwordEncoder.encode("password123"));
            trainer2.setRoles(new HashSet<>(Collections.singletonList(trainerRole)));
            trainer2.setStatus("Active");
            userRepository.save(trainer2);
            System.out.println("✅ Seeded Trainer: sarah.jones / password123");
        }

        // ============================================
        // 5. Create Members
        // Login: member1 / password123
        // Login: jane.doe / password123
        // ============================================
        createMemberIfNotFound("member1", "Test Member", "member1@email.com", memberRole);
        createMemberIfNotFound("jane.doe", "Jane Doe", "jane.doe@email.com", memberRole);
        createMemberIfNotFound("emma.davis", "Emma Davis", "emma@example.com", memberRole);
        createMemberIfNotFound("sarah.wilson", "Sarah Wilson", "sarah@example.com", memberRole);
        createMemberIfNotFound("mike.johnson", "Mike Johnson", "mike@example.com", memberRole);

        // 4. Seed Sessions and Notes
        User trainer = userRepository.findByUsername("john.smith").orElseThrow();
        User emma = userRepository.findByUsername("emma.davis").orElseThrow();
        User sarah = userRepository.findByUsername("sarah.wilson").orElseThrow();
        User mike = userRepository.findByUsername("mike.johnson").orElseThrow();

        // Assign customers to trainer if not already assigned
        // Assign customers to trainer if not already assigned
        // Commented out to prevent PersistentObjectException (detached entity) on
        // startup
        /*
         * if (trainer.getCustomers().isEmpty()) {
         * trainer.getCustomers().add(emma);
         * trainer.getCustomers().add(sarah);
         * trainer.getCustomers().add(mike);
         * userRepository.save(trainer);
         * }
         */

        if (ptSessionRepository.findByTrainerId(trainer.getUserId()).isEmpty()) {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime todayStart = now.toLocalDate().atStartOfDay();

            // -- Today's Completed Sessions (For Earnings) --
            createSession(trainer, emma, todayStart.plusHours(9), 60, SessionStatus.COMPLETED, 50);
            createSession(trainer, sarah, todayStart.plusHours(11), 60, SessionStatus.COMPLETED, 50);
            createSession(trainer, mike, todayStart.plusHours(14), 45, SessionStatus.COMPLETED, 40);

            // -- Upcoming Sessions --
            createSession(trainer, emma, todayStart.plusHours(16), 60, SessionStatus.SCHEDULED, 0); // PM session
            createSession(trainer, sarah, todayStart.plusDays(1).plusHours(10), 60, SessionStatus.SCHEDULED, 0); // Tomorrow

            // -- Past/Other Status (For Attendance Rate) --
            createSession(trainer, mike, todayStart.minusDays(1).plusHours(10), 60, SessionStatus.CANCELLED, 0);
            createSession(trainer, emma, todayStart.minusDays(2).plusHours(9), 60, SessionStatus.COMPLETED, 50);

            System.out.println("Seeded PT Sessions for John Smith");
        }

        if (progressNoteRepository.count() == 0) {
            createNote(trainer, emma, "Emma is making great progress on her squat form. Increased weight by 5kg.");
            createNote(trainer, sarah, "Focusing on flexibility this week. Hamstrings are tight.");
            createNote(trainer, mike, "Missed last session due to work. Need to reschedule.");
            System.out.println("Seeded Progress Notes");
        }

        // 4.5 Seed Memberships
        MembershipPackage premiumPkg = createPackageIfNotFound("Premium Monthly", 100.0, 30);
        MembershipPackage standardPkg = createPackageIfNotFound("Standard Monthly", 50.0, 30);

        // Emma: Active, Premium
        createMembershipIfNotFound(emma, premiumPkg, MembershipStatus.ACTIVE,
                java.time.LocalDate.now().minusDays(10), java.time.LocalDate.now().plusDays(20));

        // Sarah: Active (Expiring), Standard
        createMembershipIfNotFound(sarah, standardPkg, MembershipStatus.ACTIVE,
                java.time.LocalDate.now().minusDays(25), java.time.LocalDate.now().plusDays(5));

        // Mike: Inactive (Expired), Standard
        createMembershipIfNotFound(mike, standardPkg, MembershipStatus.EXPIRED,
                java.time.LocalDate.now().minusDays(60), java.time.LocalDate.now().minusDays(30));

        // Assign customers to trainer
        // Ensure collections are initialized
        if (trainer.getCustomers() == null)
            trainer.setCustomers(new HashSet<>());

        // Add if not present
        boolean changed = false;
        if (!trainer.getCustomers().contains(emma)) {
            trainer.getCustomers().add(emma);
            changed = true;
        }
        if (!trainer.getCustomers().contains(sarah)) {
            trainer.getCustomers().add(sarah);
            changed = true;
        }
        if (!trainer.getCustomers().contains(mike)) {
            trainer.getCustomers().add(mike);
            changed = true;
        }

        if (changed) {
            userRepository.save(trainer);
            System.out.println("Assigned members to Trainer John Smith");
        }

        // 5. Seed Trainer Classes
        // Clear existing to ensure fresh seed for testing
        trainerClassAttendeeRepository.deleteAll();
        trainerClassRepository.deleteAll();

        if (true) {
            LocalDateTime now = LocalDateTime.now();

            // 5.1 Completed Morning Yoga (Group)
            TrainerClass yoga = createClass(trainer, "Sunrise Yoga Flow",
                    now.toLocalDate(), java.time.LocalTime.of(7, 0), java.time.LocalTime.of(8, 0), 60,
                    "Studio B", ClassType.GROUP, ClassStatus.COMPLETED, 15, 15, true,
                    "Focus on flexibility and breathing");
            addAttendees(yoga, AttendeeStatus.CONFIRMED, emma, sarah, mike);

            // 5.2 In-Progress HIIT (Group)
            // Determine time so it appears ACTIVE roughly around "now" if possible, or just
            // mock it as IN_PROGRESS
            TrainerClass hiit = createClass(trainer, "High Intensity Burn",
                    now.toLocalDate(), java.time.LocalTime.of(12, 0), java.time.LocalTime.of(13, 0), 60,
                    "Main Gym", ClassType.GROUP, ClassStatus.IN_PROGRESS, 25, 20, true, "Bring water and towel");
            addAttendees(hiit, AttendeeStatus.CONFIRMED, emma, sarah);
            addAttendees(hiit, AttendeeStatus.PENDING, mike);

            // 5.3 Upcoming PT Session (PT) - Today PM
            TrainerClass ptSarah = createClass(trainer, "PT - Sarah Connor",
                    now.toLocalDate(), java.time.LocalTime.of(14, 30), java.time.LocalTime.of(15, 30), 60,
                    "PT Zone", ClassType.PT, ClassStatus.UPCOMING, 1, 1, false, "Leg day focus - Post injury check");
            addAttendees(ptSarah, AttendeeStatus.CONFIRMED, sarah);

            // 5.4 Upcoming Group Class (Pending/Open) - Today Eve
            createClass(trainer, "Evening Spin",
                    now.toLocalDate(), java.time.LocalTime.of(17, 30), java.time.LocalTime.of(18, 15), 45,
                    "Cycle Studio", ClassType.GROUP, ClassStatus.UPCOMING, 20, 18, true, null);

            // 5.5 Cancelled Class
            createClass(trainer, "Zumba Advanced",
                    now.toLocalDate(), java.time.LocalTime.of(19, 0), java.time.LocalTime.of(20, 0), 60,
                    "Studio A", ClassType.GROUP, ClassStatus.CANCELLED, 30, 5, true, "Instructor unwell");

            // 5.6 Tomorrow Power Lifting
            createClass(trainer, "Power Lifting",
                    now.plusDays(1).toLocalDate(), java.time.LocalTime.of(9, 0), java.time.LocalTime.of(10, 30), 90,
                    "Weight Room", ClassType.GROUP, ClassStatus.UPCOMING, 10, 8, true, null);

            System.out.println("Seeded Trainer Classes");
        }
    }

    private Role createRoleIfNotFound(String name) {
        // Check if role exists in repository based on name logic
        // Assuming roleRepository has findByRoleName or similar?
        // Let's implement a safe check as standard JPA usage
        // Note: RoleRepository might not have findByRoleName exposed by default if it's
        // basic JpaRepository
        // But assuming standard naming convention. If not, we might need to fix it.
        // Actually, let's look at Role.java, it has roleName.
        // I'll assume findAll and stream for safety if custom method missing, or
        // better, try safe implementation.

        return roleRepository.findAll().stream()
                .filter(r -> r.getRoleName().equals(name))
                .findFirst()
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setRoleName(name);
                    return roleRepository.save(role);
                });
    }

    private void createMemberIfNotFound(String username, String fullName, String email, Role role) {
        if (!userRepository.findByUsername(username).isPresent()) {
            User member = new User();
            member.setUsername(username);
            member.setFullName(fullName);
            member.setEmail(email);
            member.setPassword(passwordEncoder.encode("password123")); // All members use password123
            member.setRoles(new HashSet<>(Collections.singletonList(role)));
            member.setStatus("Active");
            userRepository.save(member);
            System.out.println("✅ Seeded Member: " + username + " / password123");
        }
    }

    private void createSession(User trainer, User member, LocalDateTime time, Integer duration, SessionStatus status,
            Integer price) {
        PTSession session = new PTSession();
        session.setTrainer(trainer);
        session.setMember(member);
        session.setSessionDate(time);
        session.setDurationMinutes(duration);
        session.setStatus(status);
        session.setIsRecurring(false);
        // Note: PTSession doesn't have a 'price' field in the entity I viewed.
        // Earnings are likely calculated dynamically (Time * Rate) or fixed rate.
        // I will ignore price for now as it's not in the entity.

        ptSessionRepository.save(session);
    }

    private void createNote(User trainer, User member, String content) {
        ProgressNote note = new ProgressNote(trainer, member, content);
        progressNoteRepository.save(note);
    }

    private TrainerClass createClass(User trainer, String title, java.time.LocalDate date,
            java.time.LocalTime start, java.time.LocalTime end, Integer duration,
            String room, ClassType type, ClassStatus status,
            Integer capacity, Integer enrolled, Boolean recurring, String notes) {
        TrainerClass c = new TrainerClass();
        c.setTrainer(trainer);
        c.setTitle(title);
        c.setClassDate(date);
        c.setStartTime(start);
        c.setEndTime(end);
        c.setDuration(duration);
        c.setRoom(room);
        c.setType(type);
        c.setStatus(status);
        c.setCapacity(capacity);
        c.setEnrolled(enrolled);
        c.setRecurring(recurring);
        c.setNotes(notes);
        return trainerClassRepository.save(c);
    }

    private void addAttendees(TrainerClass c, AttendeeStatus status, User... members) {
        for (User m : members) {
            TrainerClassAttendee attendee = new TrainerClassAttendee(c.getId(), m.getUserId(), status);
            trainerClassAttendeeRepository.save(attendee);
        }
    }

    private MembershipPackage createPackageIfNotFound(String name, Double price, Integer days) {
        return membershipPackageRepository.findAll().stream()
                .filter(p -> p.getPackageName().equals(name))
                .findFirst()
                .orElseGet(() -> {
                    MembershipPackage pkg = new MembershipPackage();
                    pkg.setPackageName(name);
                    pkg.setPrice(price);
                    pkg.setDurationDays(days);
                    pkg.setIsActive(true);
                    return membershipPackageRepository.save(pkg);
                });
    }

    private void createMembershipIfNotFound(User user, MembershipPackage pkg, MembershipStatus status,
            java.time.LocalDate start, java.time.LocalDate end) {
        if (membershipRepository.findByUserUserId(user.getUserId()).isEmpty()) {
            Membership m = new Membership();
            m.setUser(user);

            // Get or create Gym
            Gym gym = gymRepository.findAll().stream().findFirst().orElseGet(() -> {
                Gym newGym = new Gym();
                newGym.setName("AthlonX Main");
                newGym.setAddress("123 Fitness Blvd");
                newGym.setPhone("555-0199");
                newGym.setEmail("info@athlonx.com");
                return gymRepository.save(newGym);
            });
            m.setGym(gym);

            m.setMembershipPackage(pkg);
            m.setStatus(status);
            m.setStartDate(start);
            m.setEndDate(end);
            membershipRepository.save(m);
            System.out.println("Seeded Membership for " + user.getFullName());
        }
    }
}
