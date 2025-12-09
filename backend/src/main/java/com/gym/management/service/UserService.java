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

    public User getUserById(Long id) {
        Objects.requireNonNull(id, "User ID must not be null");
        return userRepository.findById(id).orElse(null);
    }

    public User createUser(User user) {
        // Look up actual Role entities from the database based on role names
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            Set<Role> actualRoles = new HashSet<>();
            for (Role role : user.getRoles()) {
                Role dbRole = null;
                if (role.getRoleName() != null) {
                    dbRole = roleRepository.findByRoleName(role.getRoleName());
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
            }
        }

        // Save user with roles
        userRepository.save(user);
        return user;
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
