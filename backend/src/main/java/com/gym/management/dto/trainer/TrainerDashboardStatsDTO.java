package com.gym.management.dto.trainer;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerDashboardStatsDTO {
    private String trainerName;
    private Double todayEarnings;
    private Double monthEarnings;
    private Integer completedToday;
    private Integer totalToday;
    private Double attendanceRate;
    private Integer activeMembers;
    private Integer totalMembers;
    private List<TrainerSessionDTO> sessions;
    private List<DashboardAlertDTO> alerts;
    
    // Charts
    private List<ChartDataDTO> weeklyActivity;
    private List<ChartDataDTO> monthlyEarningsHistory;
    private List<ChartDataDTO> sessionDistribution;
}
