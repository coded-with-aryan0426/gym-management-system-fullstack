package com.gym.management.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberDTO {
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String planName;
    private String planDuration; // e.g., "1 Month", "1 Year"
    private String status;
    private LocalDate checkInDate; // Last visit date
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate joinDate;
    private LocalDateTime createdAt; // For "today first" sorting

    // Status color helper for frontend (optional, but keeping it clean in backend)
    public String getStatusColor() {
        if ("Active".equalsIgnoreCase(status))
            return "green";
        if ("Expired".equalsIgnoreCase(status))
            return "red";
        if ("Pending".equalsIgnoreCase(status))
            return "amber";
        return "gray";
    }
}
