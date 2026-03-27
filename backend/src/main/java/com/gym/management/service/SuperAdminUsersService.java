package com.gym.management.service;

import com.gym.management.model.User;
import com.gym.management.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SuperAdminUsersService {

    private final UserRepository userRepository;

    public SuperAdminUsersService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<Map<String, Object>> getUsers(String search, String roleFilter) {
        List<User> users;
        
        if (roleFilter != null && !roleFilter.isEmpty() && !"all".equalsIgnoreCase(roleFilter)) {
            if (search != null && !search.isEmpty()) {
                Pageable pageable = PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "userId"));
                users = userRepository.findByRoleNameAndSearchPaginated(roleFilter, search, pageable).getContent();
            } else {
                Pageable pageable = PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "userId"));
                users = userRepository.findByRoleNamePaginated(roleFilter, pageable).getContent();
            }
        } else {
            if (search != null && !search.isEmpty()) {
                String searchLower = search.toLowerCase();
                users = userRepository.findAll().stream()
                    .filter(u -> u != null && u.getFullName() != null && u.getEmail() != null)
                    .filter(u -> u.getFullName().toLowerCase().contains(searchLower) ||
                                 u.getEmail().toLowerCase().contains(searchLower))
                    .limit(100)
                    .collect(Collectors.toList());
            } else {
                users = userRepository.findAll(PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "userId"))).getContent();
            }
        }

        if (users == null) {
            return Collections.emptyList();
        }

        return users.stream().map(this::mapUserToDto).collect(Collectors.toList());
    }

    private Map<String, Object> mapUserToDto(User user) {
        if (user == null) {
            return Collections.emptyMap();
        }

        Map<String, Object> dto = new HashMap<>();
        dto.put("id", user.getUserId());
        dto.put("name", user.getFullName() != null ? user.getFullName() : "N/A");
        dto.put("email", user.getEmail() != null ? user.getEmail() : "N/A");
        dto.put("phone", user.getPhoneNumberPersisted() != null ? user.getPhoneNumberPersisted() : "N/A");

        // Extract primary role with null safety
        String role = "USER";
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            try {
                var roleEntity = user.getRoles().iterator().next();
                if (roleEntity != null && roleEntity.getRoleName() != null) {
                    role = roleEntity.getRoleName();
                }
            } catch (Exception e) {
                role = "USER";
            }
        }
        dto.put("role", role);

        dto.put("status", user.getIsDeleted() != null && user.getIsDeleted() ? "inactive" : "active");
        
        // Format join date
        if (user.getCreatedAt() != null) {
            dto.put("joinDate", user.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE));
        } else {
            dto.put("joinDate", "N/A");
        }
        
        // Last login - if available (mocking Never since field doesn't exist)
        dto.put("lastLogin", "Never");
        
        // Mock some fields for now (can be enhanced later)
        dto.put("loginStreak", 0);
        dto.put("totalLogins", 0);
        dto.put("riskScore", 0);
        dto.put("twoFA", false);
        dto.put("emailVerified", false);
        
        return dto;
    }

    private String formatRelativeTime(LocalDateTime dateTime) {
        if (dateTime == null) return "Never";
        
        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(dateTime, now).toMinutes();
        
        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + " min ago";
        
        long hours = minutes / 60;
        if (hours < 24) return hours + " hr ago";
        
        long days = hours / 24;
        if (days == 1) return "Yesterday";
        if (days < 7) return days + " days ago";
        
        long weeks = days / 7;
        if (weeks < 4) return weeks + " week" + (weeks > 1 ? "s" : "") + " ago";
        
        long months = days / 30;
        return months + " month" + (months > 1 ? "s" : "") + " ago";
    }

    public Map<String, Object> getUserTelemetry(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return Collections.emptyMap();
        }

        User user = userOpt.get();
        Map<String, Object> telemetry = new HashMap<>();
        
        // Basic user info
        telemetry.put("id", user.getUserId());
        telemetry.put("name", user.getFullName());
        telemetry.put("email", user.getEmail());
        
        // Mock device/activity data for now
        telemetry.put("device", "Web Browser");
        telemetry.put("browser", "Chrome");
        telemetry.put("os", "Unknown");
        telemetry.put("ip", "xxx.xxx.xxx.xxx");
        telemetry.put("country", "India");
        
        // Mock login history (last 7 days)
        List<Map<String, Object>> loginHistory = new ArrayList<>();
        String[] days = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        for (String day : days) {
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("d", day);
            dayData.put("v", (int)(Math.random() * 5));
            loginHistory.add(dayData);
        }
        telemetry.put("loginHistory", loginHistory);
        
        // Mock activity timeline
        List<Map<String, Object>> activityTimeline = new ArrayList<>();
        Map<String, Object> activity1 = new HashMap<>();
        activity1.put("action", "Account created");
        activity1.put("detail", "User registered");
        activity1.put("time", user.getCreatedAt() != null ? formatRelativeTime(user.getCreatedAt()) : "Unknown");
        activity1.put("type", "admin");
        activityTimeline.add(activity1);
        
        telemetry.put("activityTimeline", activityTimeline);
        telemetry.put("permissions", new ArrayList<>());
        
        return telemetry;
    }
}
