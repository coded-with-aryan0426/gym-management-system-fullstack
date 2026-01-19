package com.gym.management.dto.trainer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for Performance Metrics section
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerPerformanceMetricsDTO {

    private List<Metric> metrics;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Metric {
        private String label;
        private String icon; // CheckCircle, Target, Clock, Heart, Zap
        private int value;
        private int max;
        private int percent;
        private String color; // Hex color

        // Confidence metadata - honest reporting
        private MetricConfidence confidence; // MEASURED, ESTIMATED
        private String confidenceNote; // e.g., "Based on session completion data"
    }

    public enum MetricConfidence {
        MEASURED, // Real, verifiable data
        ESTIMATED, // Derived or approximated
        INSUFFICIENT_DATA // Not enough data to calculate
    }
}
