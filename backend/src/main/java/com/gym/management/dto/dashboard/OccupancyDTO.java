package com.gym.management.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Gym Occupancy Data Transfer Object
 * Shows current gym occupancy and capacity information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OccupancyDTO {
    private Integer currentCount;
    private Integer maxCapacity;
    private Double percentage;
    private String trend; // rising, falling, stable
}