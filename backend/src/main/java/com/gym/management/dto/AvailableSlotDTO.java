package com.gym.management.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO representing an available time slot for PT sessions
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailableSlotDTO {

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;
    private Boolean isAvailable;
    private String unavailableReason; // e.g., "Trainer has another session", "Blackout day", "Outside gym hours"
}
