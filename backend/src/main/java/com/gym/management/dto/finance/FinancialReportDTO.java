package com.gym.management.dto.finance;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class FinancialReportDTO {
    private Long gymId;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netProfit;
    private BigDecimal profitMargin;
    private BigDecimal totalTaxLiability;
    private long transactionCount;
    private String reportType;
    private List<FinancialTransactionDTO> transactions;
    private LocalDate generatedAt;
}