package com.gym.subscription.enums;

public enum SubscriptionStatus {
    TRIALING("trialing"),
    ACTIVE("active"),
    PAST_DUE("past_due"),
    CANCELLED("cancelled"),
    EXPIRED("expired"),
    PAUSED("paused"),
    PENDING("pending");

    private final String value;

    SubscriptionStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static SubscriptionStatus fromValue(String value) {
        for (SubscriptionStatus status : SubscriptionStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown subscription status: " + value);
    }
}
