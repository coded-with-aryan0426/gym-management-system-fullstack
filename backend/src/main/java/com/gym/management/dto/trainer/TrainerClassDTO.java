package com.gym.management.dto.trainer;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class TrainerClassDTO {
    private Long id;
    private String title;
    private String startTime;
    private String endTime;
    private Integer duration;
    private String day;
    private String date;
    private String room;
    private Integer enrolled;
    private Integer capacity;
    private String status; // upcoming, in-progress, completed, cancelled
    private Attendees attendees;
    private String type; // group, pt
    private Boolean recurring;
    private String notes;

    @Data
    @Builder
    public static class Attendees {
        private Integer confirmed;
        private Integer pending;
        private Integer absent;
    }

    // Create request DTO
    @Data
    public static class CreateRequest {
        private String title;
        private String date; // YYYY-MM-DD
        private String startTime; // HH:mm
        private String endTime; // HH:mm
        private Integer duration;
        private String room;
        private Integer capacity;
        private String type; // group, pt
        private Boolean recurring;
        private String notes;
    }

    // Status update request
    @Data
    public static class StatusRequest {
        private String status; // upcoming, in-progress, completed, cancelled
    }

    // Attendance update request
    @Data
    public static class AttendanceRequest {
        private List<AttendeeUpdate> attendees;
    }

    @Data
    public static class AttendeeUpdate {
        private Long memberId;
        private String status; // CONFIRMED, PENDING, ABSENT
    }
}
