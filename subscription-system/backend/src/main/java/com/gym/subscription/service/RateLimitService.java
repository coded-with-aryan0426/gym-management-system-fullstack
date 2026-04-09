package com.gym.subscription.service;

import com.gym.subscription.entity.TrialRateLimit;
import com.gym.subscription.entity.UserSubscription;
import com.gym.subscription.enums.SubscriptionStatus;
import com.gym.subscription.repository.TrialRateLimitRepository;
import com.gym.subscription.repository.UserSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimitService {

    private final TrialRateLimitRepository rateLimitRepository;
    private final UserSubscriptionRepository subscriptionRepository;

    private static final int TRIAL_API_WINDOW_MINUTES = 60;
    private static final int TRIAL_API_LIMIT = 100;
    private static final int PAID_API_WINDOW_MINUTES = 60;
    private static final int PAID_API_LIMIT = 1000;

    public boolean isRateLimited(String userId, String endpoint) {
        UserSubscription subscription = subscriptionRepository
                .findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElse(null);

        boolean isTrialing = subscription != null &&
                            subscription.getStatus() == SubscriptionStatus.TRIALING;

        int limit = isTrialing ? TRIAL_API_LIMIT : PAID_API_LIMIT;
        int windowMinutes = isTrialing ? TRIAL_API_WINDOW_MINUTES : PAID_API_WINDOW_MINUTES;

        TrialRateLimit rateLimit = rateLimitRepository
                .findByUserIdAndEndpoint(userId, endpoint)
                .orElse(null);

        if (rateLimit == null) {
            rateLimit = TrialRateLimit.builder()
                    .endpoint(endpoint)
                    .requestCount(0)
                    .windowStart(LocalDateTime.now())
                    .windowEnd(LocalDateTime.now().plusMinutes(windowMinutes))
                    .build();
        }

        if (rateLimit.isWindowExpired()) {
            rateLimit.resetWindow(windowMinutes);
        }

        rateLimit.incrementCount();
        rateLimitRepository.save(rateLimit);

        boolean limited = rateLimit.getRequestCount() > limit;

        if (limited) {
            log.warn("Rate limit exceeded for user: {}, endpoint: {}, count: {}",
                    userId, endpoint, rateLimit.getRequestCount());
        }

        return limited;
    }

    public RateLimitStatus getRateLimitStatus(String userId, String endpoint) {
        UserSubscription subscription = subscriptionRepository
                .findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElse(null);

        boolean isTrialing = subscription != null &&
                            subscription.getStatus() == SubscriptionStatus.TRIALING;

        int limit = isTrialing ? TRIAL_API_LIMIT : PAID_API_LIMIT;

        TrialRateLimit rateLimit = rateLimitRepository
                .findByUserIdAndEndpoint(userId, endpoint)
                .orElse(null);

        if (rateLimit == null || rateLimit.isWindowExpired()) {
            return RateLimitStatus.builder()
                    .limit(limit)
                    .remaining(limit)
                    .resetAt(LocalDateTime.now().plusMinutes(isTrialing ? TRIAL_API_WINDOW_MINUTES : PAID_API_WINDOW_MINUTES))
                    .limited(false)
                    .build();
        }

        return RateLimitStatus.builder()
                .limit(limit)
                .remaining(Math.max(0, limit - rateLimit.getRequestCount()))
                .resetAt(rateLimit.getWindowEnd())
                .limited(rateLimit.getRequestCount() > limit)
                .build();
    }

    public void resetRateLimit(String userId, String endpoint) {
        rateLimitRepository.findByUserIdAndEndpoint(userId, endpoint)
                .ifPresent(rateLimit -> {
                    rateLimit.setRequestCount(0);
                    rateLimit.setWindowStart(LocalDateTime.now());
                    rateLimitRepository.save(rateLimit);
                });
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class RateLimitStatus {
        private int limit;
        private int remaining;
        private LocalDateTime resetAt;
        private boolean limited;
    }
}
