package com.gym.subscription.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionMetricsDTO {
    private long totalActiveSubscriptions;
    private long totalTrialingSubscriptions;
    private long totalExpiredSubscriptions;
    private long totalCancelledSubscriptions;
    private BigDecimal monthlyRecurringRevenue;
    private BigDecimal annualRecurringRevenue;
    private BigDecimal averageRevenuePerUser;
    private BigDecimal churnRate;
    private long newSubscriptionsThisMonth;
    private long cancellationsThisMonth;
    private Map<String, Long> subscriptionsByPlan;
    private Map<String, Long> subscriptionsByStatus;
}
