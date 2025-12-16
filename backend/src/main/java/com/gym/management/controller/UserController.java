package com.gym.management.controller;

import com.gym.management.model.User;
import com.gym.management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // Allow all origins for v1 simplicity
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public List<User> getUsers(@RequestParam(required = false) String role) {
        if (role != null) {
            return userService.getUsersByRole(role.toUpperCase());
        }
        return userService.getAllUsers();
    }

    @GetMapping("/members")
    public ResponseEntity<?> getMembers() {
        try {
            return ResponseEntity.ok(userService.getAllMembers());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", e.getMessage(), "type", e.getClass().getName()));
        }
    }

    @GetMapping("/search")
    public List<User> searchUsers(
            @RequestParam String role,
            @RequestParam String q) {
        return userService.searchUsers(role.toUpperCase(), q);
    }

    @GetMapping("/{id:\\d+}")
    public User getUser(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @GetMapping("/{id}/customers")
    public ResponseEntity<Set<User>> getCustomers(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return (user != null)
                ? ResponseEntity.ok(user.getCustomers())
                : ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/trainers")
    public ResponseEntity<Set<User>> getTrainers(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return (user != null)
                ? ResponseEntity.ok(user.getTrainers())
                : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            User created = userService.createUser(user);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating user: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            User updated = userService.updateUser(id, user);
            if (updated != null) {
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating user: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    // Assign customer to trainer
    @PostMapping("/{trainerId}/customers/{customerId}")
    public ResponseEntity<User> assignCustomerToTrainer(
            @PathVariable Long trainerId,
            @PathVariable Long customerId) {
        User trainer = userService.assignCustomerToTrainer(trainerId, customerId);
        return trainer != null
                ? ResponseEntity.ok(trainer)
                : ResponseEntity.notFound().build();
    }

    // Remove customer from trainer
    @DeleteMapping("/{trainerId}/customers/{customerId}")
    public ResponseEntity<User> removeCustomerFromTrainer(
            @PathVariable Long trainerId,
            @PathVariable Long customerId) {
        User trainer = userService.removeCustomerFromTrainer(trainerId, customerId);
        return trainer != null
                ? ResponseEntity.ok(trainer)
                : ResponseEntity.notFound().build();
    }
}
