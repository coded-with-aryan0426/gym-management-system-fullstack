package com.gym.management.component;

import com.gym.management.model.*;
import com.gym.management.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;

@Component
public class AppDataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PTSessionRepository ptSessionRepository;
    private final ProgressNoteRepository progressNoteRepository;
    private final PasswordEncoder passwordEncoder;

    public AppDataLoader(UserRepository userRepository,
            RoleRepository roleRepository,
            PTSessionRepository ptSessionRepository,
            ProgressNoteRepository progressNoteRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.ptSessionRepository = ptSessionRepository;
        this.progressNoteRepository = progressNoteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Initialize Roles
        Role trainerRole = createRoleIfNotFound("ROLE_TRAINER");
        Role memberRole = createRoleIfNotFound("ROLE_MEMBER");
        createRoleIfNotFound("ROLE_ADMIN");

        // 2. Create Trainer
        if (!userRepository.findByUsername("john.smith").isPresent()) {
            User trainer = new User();
            trainer.setUsername("john.smith");
            trainer.setFullName("John Smith");
            trainer.setEmail("john.smith@athlonx.com");
            trainer.setPhone("555-0101");
            trainer.setPassword(passwordEncoder.encode("password"));
            trainer.setRoles(new HashSet<>(Collections.singletonList(trainerRole)));
            trainer.setStatus("Active");
            userRepository.save(trainer);
            System.out.println("Seeded Trainer: " + trainer.getUsername());
        }

        // 3. Create Members
        createMemberIfNotFound("emma.davis", "Emma Davis", "emma@example.com", memberRole);
        createMemberIfNotFound("sarah.wilson", "Sarah Wilson", "sarah@example.com", memberRole);
        createMemberIfNotFound("mike.johnson", "Mike Johnson", "mike@example.com", memberRole);

        // 4. Seed Sessions and Notes
        User trainer = userRepository.findByUsername("john.smith").orElseThrow();
        User emma = userRepository.findByUsername("emma.davis").orElseThrow();
        User sarah = userRepository.findByUsername("sarah.wilson").orElseThrow();
        User mike = userRepository.findByUsername("mike.johnson").orElseThrow();

        // Assign customers to trainer if not already assigned
        if (trainer.getCustomers().isEmpty()) {
            trainer.getCustomers().add(emma);
            trainer.getCustomers().add(sarah);
            trainer.getCustomers().add(mike);
            userRepository.save(trainer);
        }

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
            member.setPassword(passwordEncoder.encode("password")); // Default password
            member.setRoles(new HashSet<>(Collections.singletonList(role)));
            member.setStatus("Active");
            userRepository.save(member);
            System.out.println("Seeded Member: " + fullName);
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
}
