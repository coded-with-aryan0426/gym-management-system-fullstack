package com.gym.management.dto.trainer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for system-generated achievements
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerAchievementDTO {

    private String icon; // Trophy, Star, Flame, Medal, Crown
    private String label; // "100 Sessions Milestone"
    private String date; // "Mar 15"
    private String color; // Hex color
    private String type; // milestone, streak, rating, ranking
}
