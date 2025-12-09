package com.gym.management.controller;

import com.gym.management.dto.AuthRequest;
import com.gym.management.dto.AuthResponse;
import com.gym.management.model.Role;
import com.gym.management.model.User;
import com.gym.management.repository.RoleRepository;
import com.gym.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") 
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // In a real app, verify hashed password. Here we compare plaintext as initialized.
            if (user.getPassword().equals(request.getPassword())) {
                String role = user.getRoles().stream()
                        .findFirst()
                        .map(Role::getRoleName)
                        .orElse("CUSTOMER");
                        
                return ResponseEntity.ok(new AuthResponse(user.getUserId(), user.getUsername(), role, "dummy-token"));
            }
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
             return ResponseEntity.badRequest().body("Username already exists");
        }

        // Default role: CUSTOMER
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            Role customerRole = roleRepository.findByRoleName("CUSTOMER");
            user.setRoles(new HashSet<>(Collections.singletonList(customerRole)));
        }

        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }
}
