package com.gym.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String avatarId;
    private LocalDateTime createdAt;
    private LocalDate leavingDate;
    private String status;
    private Set<String> roles;
}
