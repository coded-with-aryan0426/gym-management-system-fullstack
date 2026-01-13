package com.gym.management.config;

import com.gym.management.model.*;
import com.gym.management.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

/**
 * Seeds data for Development environment.
 * Ensures we have a Gym, Users, and proper Role Assignments for testing Chat.
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DevDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final GymRepository gymRepository;
    private final UserGymRoleRepository userGymRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("🌱 Starting Dev Data Seeding...");

        // 1. Ensure Dev Gym Exists
        Gym devGym = seedGym();

        // 2. Ensure Roles Exist (Basic check)
        seedRoles();

        // 3. Seed Users and Assignments
        User owner = seedUser("owner@dev.com", "Dev Owner", "OWNER");
        User trainer = seedUser("trainer@dev.com", "Dev Trainer", "TRAINER");
        User member1 = seedUser("member1@dev.com", "Alice Member", "MEMBER");
        User member2 = seedUser("member2@dev.com", "Bob Member", "MEMBER");

        // 4. Assign Gym Roles
        assignGymRole(owner, devGym, GymRole.OWNER);
        assignGymRole(trainer, devGym, GymRole.TRAINER);
        assignGymRole(member1, devGym, GymRole.MEMBER);
        assignGymRole(member2, devGym, GymRole.MEMBER); // Important: Need at least 2 members to chat

        // 5. Assign Customers to Trainer (for "My Members" view)
        assignCustomerToTrainer(trainer, member1);
        assignCustomerToTrainer(trainer, member2);

        log.info("✅ Dev Data Seeding Completed!");
    }

    private void assignCustomerToTrainer(User trainer, User customer) {
        // Since we are in a transaction, entities should be attached.
        // But to be safe and ensure EAGER collection is loaded/initialized:
        if (trainer.getCustomers() == null) {
            trainer.setCustomers(new java.util.HashSet<>());
        }

        // efficient check avoiding full equal/hashcode if possible, or just add
        boolean alreadyAssigned = trainer.getCustomers().stream()
                .anyMatch(c -> c.getUserId().equals(customer.getUserId()));

        if (!alreadyAssigned) {
            trainer.getCustomers().add(customer);
            userRepository.save(trainer);
            log.info("Assigned member {} to trainer {}", customer.getFullName(), trainer.getFullName());
        }
    }

    private Gym seedGym() {
        // findByNameContainingIgnoreCase returns a List<Gym>, not Optional<Gym>
        var gyms = gymRepository.findByNameContainingIgnoreCase("AthlonX Dev");
        if (!gyms.isEmpty()) {
            return gyms.get(0);
        }
        Gym gym = new Gym();
        gym.setName("AthlonX Dev Gym");
        gym.setAddress("123 Dev Street, Localhost");
        gym.setEmail("contact@devgym.local");
        gym.setPhone("555-0100");
        gym.setIsPublic(true);
        // gym.setStatus("ACTIVE"); // Field does not exist in Gym entity
        gym.setCreatedAt(LocalDateTime.now());
        gym.setInviteCode("DEV123");
        return gymRepository.save(gym);
    }

    private void seedRoles() {
        // Just ensuring they exist in DB, usually Flyway handles this but good to be
        // safe
        createRoleIfMissing("OWNER");
        createRoleIfMissing("TRAINER");
        createRoleIfMissing("MEMBER");
        createRoleIfMissing("ADMIN");
        createRoleIfMissing("CUSTOMER");
    }

    private void createRoleIfMissing(String roleName) {
        if (roleRepository.findByRoleName(roleName) == null) {
            Role role = new Role();
            role.setRoleName(roleName);
            roleRepository.save(role);
        }
    }

    private User seedUser(String email, String fullName, String roleName) {
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            return existing.get();
        }

        User user = new User();
        user.setEmail(email);
        user.setUsername(email.split("@")[0]);
        user.setFullName(fullName);
        user.setPassword(passwordEncoder.encode("password")); // Default password
        user.setCreatedAt(LocalDateTime.now());
        user.setStatus("ACTIVE");
        user.setIsFirstLogin(false);
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setAccountNonLocked(true);

        // Assign Global Role
        Role role = roleRepository.findByRoleName(roleName);
        if (role != null) {
            user.setRoles(Set.of(role));
        }

        log.info("Creating user: {}", email);
        return userRepository.save(user);
    }

    private void assignGymRole(User user, Gym gym, GymRole role) {
        if (userGymRoleRepository.existsByUserUserIdAndGymGymIdAndRoleAndStatus(
                user.getUserId(), gym.getGymId(), role, RoleStatus.ACTIVE)) {
            return;
        }

        UserGymRole assignment = new UserGymRole();
        assignment.setUser(user);
        assignment.setGym(gym);
        assignment.setRole(role);
        assignment.setStatus(RoleStatus.ACTIVE);
        assignment.setGrantedAt(LocalDateTime.now());

        // Use user as grantor (self-granted for dev seed)
        assignment.setGrantedBy(user);

        log.info("Assigning role {} to {} at {}", role, user.getFullName(), gym.getName());
        userGymRoleRepository.save(assignment);
    }
}
