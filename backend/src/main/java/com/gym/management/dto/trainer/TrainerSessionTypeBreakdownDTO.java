package com.gym.management.dto.trainer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for Session Type Breakdown (pie chart data)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerSessionTypeBreakdownDTO {

    private List<TypeBreakdown> types;
    private int totalSessions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TypeBreakdown {
        private String type; // "Personal Training", "Group Classes", etc.
        private int count;
        private int percent; // Sum must = 100
        private String color; // Hex color for UI
    }
}
