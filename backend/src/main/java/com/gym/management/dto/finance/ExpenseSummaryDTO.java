package com.gym.management.dto.finance;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import com.gym.management.model.ExpenseCategory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseSummaryDTO {
    private BigDecimal totalExpenses;
    private BigDecimal thisMonth;
    private BigDecimal lastMonth;
    private BigDecimal thisYear;
    private BigDecimal projectedMonthly;
    private Map<ExpenseCategory, BigDecimal> byCategory;
    private List<FinancialTransactionDTO> recentExpenses;
    private BigDecimal percentageChange;
    private int transactionCount;
    private BigDecimal pendingPayments;
    private int pendingCount;
}
