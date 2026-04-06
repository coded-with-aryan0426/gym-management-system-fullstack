package com.gym.subscription.service;

import com.gym.subscription.dto.SubscriptionMetricsDTO;
import com.gym.subscription.entity.SubscriptionPayment;
import com.gym.subscription.entity.SubscriptionPlan;
import com.gym.subscription.entity.UserSubscription;
import com.gym.subscription.enums.PaymentStatus;
import com.gym.subscription.enums.SubscriptionStatus;
import com.gym.subscription.repository.SubscriptionChangeRepository;
import com.gym.subscription.repository.SubscriptionPaymentRepository;
import com.gym.subscription.repository.SubscriptionPlanRepository;
import com.gym.subscription.repository.UserSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MetricsService {

    private final UserSubscriptionRepository subscriptionRepository;
    private final SubscriptionPaymentRepository paymentRepository;
    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionChangeRepository changeRepository;

    public SubscriptionMetricsDTO getMetrics() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);

        List<UserSubscription> allSubscriptions = subscriptionRepository.findAll();
        List<SubscriptionPayment> capturedPayments = paymentRepository.findByStatus(PaymentStatus.CAPTURED);
        List<SubscriptionPlan> plans = planRepository.findAll();

        Map<String, Long> subscriptionsByPlan = new HashMap<>();
        Map<String, Long> subscriptionsByStatus = new HashMap<>();

        for (UserSubscription sub : allSubscriptions) {
            String planName = sub.getPlan() != null ? sub.getPlan().getName() : "unknown";
            String status = sub.getStatus().getValue();

            subscriptionsByPlan.merge(planName, 1L, Long::sum);
            subscriptionsByStatus.merge(status, 1L, Long::sum);
        }

        long activeCount = allSubscriptions.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE)
                .count();

        long trialingCount = allSubscriptions.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.TRIALING)
                .count();

        BigDecimal mrr = calculateMRR(plans, capturedPayments);
        BigDecimal arr = mrr.multiply(BigDecimal.valueOf(12));

        BigDecimal arpu = activeCount > 0
                ? mrr.divide(BigDecimal.valueOf(activeCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        long cancellationsThisMonth = changeRepository.findByChangeTypeAndCreatedAtBetween(
                "cancelled", startOfMonth, now).size();

        long newThisMonth = changeRepository.findByChangeTypeAndCreatedAtBetween(
                "created", startOfMonth, now).size();

        BigDecimal churnRate = activeCount > 0
                ? BigDecimal.valueOf(cancellationsThisMonth)
                        .divide(BigDecimal.valueOf(activeCount + cancellationsThisMonth), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        return SubscriptionMetricsDTO.builder()
                .totalActiveSubscriptions(activeCount)
                .totalTrialingSubscriptions(trialingCount)
                .totalExpiredSubscriptions(subscriptionsByStatus.getOrDefault("expired", 0L))
                .totalCancelledSubscriptions(subscriptionsByStatus.getOrDefault("cancelled", 0L))
                .monthlyRecurringRevenue(mrr)
                .annualRecurringRevenue(arr)
                .averageRevenuePerUser(arpu)
                .churnRate(churnRate)
                .newSubscriptionsThisMonth(Math.max(0, newThisMonth - cancellationsThisMonth))
                .cancellationsThisMonth(cancellationsThisMonth)
                .subscriptionsByPlan(subscriptionsByPlan)
                .subscriptionsByStatus(subscriptionsByStatus)
                .build();
    }

    private BigDecimal calculateMRR(List<SubscriptionPlan> plans,
                                   List<SubscriptionPayment> capturedPayments) {
        Map<String, BigDecimal> planPrices = new HashMap<>();
        for (SubscriptionPlan plan : plans) {
            planPrices.put(plan.getId(), plan.getPriceMonthly());
        }

        List<UserSubscription> activeSubscriptions = subscriptionRepository.findByStatus(SubscriptionStatus.ACTIVE);

        BigDecimal total = BigDecimal.ZERO;
        for (UserSubscription sub : activeSubscriptions) {
            if (sub.getPlan() != null) {
                BigDecimal price = planPrices.getOrDefault(sub.getPlan().getId(), BigDecimal.ZERO);

                if (sub.getBillingCycle() != null) {
                    switch (sub.getBillingCycle().toLowerCase()) {
                        case "quarterly" -> price = price.multiply(BigDecimal.valueOf(3));
                        case "yearly" -> price = price.multiply(BigDecimal.valueOf(12));
                    }
                }

                total = total.add(price);
            }
        }

        return total.setScale(2, RoundingMode.HALF_UP);
    }

    public Map<String, Object> getRevenueHistory(int months) {
        LocalDateTime now = LocalDateTime.now();
        Map<String, Object> history = new HashMap<>();

        for (int i = months - 1; i >= 0; i--) {
            YearMonth month = YearMonth.from(now.minusMonths(i));
            LocalDateTime start = month.atDay(1).atStartOfDay();
            LocalDateTime end = month.plusMonths(1).atDay(1).atStartOfDay();

            List<SubscriptionPayment> monthPayments = paymentRepository.findByGatewayAndCreatedAtBetween(
                    "stripe", start, end);

            BigDecimal revenue = monthPayments.stream()
                    .filter(p -> p.getStatus() == PaymentStatus.CAPTURED)
                    .map(SubscriptionPayment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            history.put(month.toString(), revenue);
        }

        return history;
    }
}
