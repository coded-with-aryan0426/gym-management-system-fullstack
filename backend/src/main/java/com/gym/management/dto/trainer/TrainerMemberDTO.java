package com.gym.management.dto.trainer;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrainerMemberDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String status; // ACTIVE, INACTIVE
    private String plan; // e.g. "Premium Monthly"
    private int daysLeft; // Days until membership expiry
    private MemberStats stats;
    private String lastSession; // e.g. "2 days ago" or "2023-10-25"
    private String goal; // Fetched from latest progress note or default

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberStats {
        private int classes; // Attended classes count
        private String weight; // Latest weight
        private String pt; // "completed/total" PT sessions or just completed count
    }
}
