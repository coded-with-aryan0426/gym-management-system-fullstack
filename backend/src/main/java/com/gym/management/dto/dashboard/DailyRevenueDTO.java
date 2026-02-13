package com.gym.management.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Daily Revenue Data Transfer Object
 * Used for revenue trend charts and analytics
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyRevenueDTO {
    private LocalDate date;
    private String day; // Mon, Tue, Wed, etc.
    private Double revenue;
    private String source; // membership, pt, classes, supplements, other
}