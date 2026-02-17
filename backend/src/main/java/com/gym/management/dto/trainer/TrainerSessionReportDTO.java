package com.gym.management.dto.trainer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Session Report table row
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerSessionReportDTO {

    private Long id;
    private String memberName;
    private String memberAvatar; // Initials like "SW" or URL
    private String type; // Session type
    private String date; // "Mar 25, 2024"
    private String time; // "9:00 AM"
    private String duration; // "60 min"
    private String status; // completed, cancelled, no-show, rescheduled
    private Double rating; // 1-5 or null
    private String notes;
}
