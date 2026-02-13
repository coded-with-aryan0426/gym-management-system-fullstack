package com.gym.management.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Today's Class Data Transfer Object
 * Shows classes happening today
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TodaysClassDTO {
    private Long classId;
    private String name;
    private String type;
    private String trainer;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer enrolled;
    private Integer capacity;
    private String room;
    private String status; // UPCOMING, IN_PROGRESS, COMPLETED
}