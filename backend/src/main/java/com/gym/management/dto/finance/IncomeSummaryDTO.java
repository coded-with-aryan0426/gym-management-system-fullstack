package com.gym.management.dto.finance;

import com.gym.management.model.IncomeCategory;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class IncomeSummaryDTO {
    private Long gymId;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalIncome;
    private BigDecimal thisMonth;
    private BigDecimal lastMonth;
    private Map<IncomeCategory, BigDecimal> byCategory;
    private BigDecimal percentageChange;
    private long transactionCount;
    private List<FinancialTransactionDTO> recentTransactions;
    private String period;
}