package com.gym.management.dto.trainer;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardAlertDTO {
    private String id;
    private String type; // MISSED_SESSION, PENDING_NOTE, UNREAD_MESSAGE
    private String message;
    private String memberName;
    private Long memberId;
    private String severity; // high, medium, low
    private String time; // e.g., "2 hours ago"
}
