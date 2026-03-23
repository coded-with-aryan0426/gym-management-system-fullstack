package com.gym.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for financial data with role-based field filtering.
 * TRAINER role receives limited financial data (only their own revenue).
 * ADMIN/OWNER roles receive complete financial data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialDataDTO {
    
    // Fields visible to ALL roles (when accessing their own data)
    private Long id;
    private String transactionType;
    private LocalDateTime transactionDate;
    private String description;
    
    // Fields visible to TRAINER (their own data only)
    private BigDecimal trainerRevenue;
    private BigDecimal trainerCommission;
    private Integer sessionsCount;
    
    // Fields visible ONLY to ADMIN/OWNER (global financial data)
    private BigDecimal totalRevenue;
    private BigDecimal totalExpenses;
    private BigDecimal netProfit;
    private BigDecimal membershipRevenue;
    private BigDecimal ptRevenue;
    private BigDecimal otherRevenue;
    
    // Metadata
    private String dataScope; // "TRAINER_SCOPED" or "GLOBAL"
    private Long scopedToUserId; // Which user this data is scoped to
    
    /**
     * Create DTO with TRAINER scope (limited data)
     */
    public static FinancialDataDTO createTrainerScoped(
            Long trainerId, 
            BigDecimal revenue, 
            BigDecimal commission, 
            Integer sessions) {
        return FinancialDataDTO.builder()
                .trainerRevenue(revenue)
                .trainerCommission(commission)
                .sessionsCount(sessions)
                .dataScope("TRAINER_SCOPED")
                .scopedToUserId(trainerId)
                .build();
    }
    
    /**
     * Create DTO with ADMIN/OWNER scope (full data)
     */
    public static FinancialDataDTO createGlobalScoped(
            BigDecimal totalRevenue,
            BigDecimal totalExpenses,
            BigDecimal netProfit) {
        return FinancialDataDTO.builder()
                .totalRevenue(totalRevenue)
                .totalExpenses(totalExpenses)
                .netProfit(netProfit)
                .dataScope("GLOBAL")
                .build();
    }
}
