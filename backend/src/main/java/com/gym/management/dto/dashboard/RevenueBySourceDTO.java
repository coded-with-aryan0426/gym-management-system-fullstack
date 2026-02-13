package com.gym.management.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Revenue by Source Data Transfer Object
 * Shows revenue breakdown by category
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevenueBySourceDTO {
    private LocalDate period;
    private Double membership;
    private Double ptSessions;
    private Double classes;
    private Double supplements;
    private Double lockers;
    private Double other;
    private Double total;
}