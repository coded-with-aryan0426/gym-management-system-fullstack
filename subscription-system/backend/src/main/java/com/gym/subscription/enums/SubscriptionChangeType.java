package com.gym.subscription.enums;

public enum SubscriptionChangeType {
    CREATED("created"),
    UPGRADED("upgraded"),
    DOWNGRADED("downgraded"),
    RENEWED("renewed"),
    CANCELLED("cancelled"),
    EXPIRED("expired"),
    REACTIVATED("reactivated"),
    TRIAL_STARTED("trial_started"),
    TRIAL_ENDED("trial_ended"),
    GRACE_PERIOD_STARTED("grace_period_started"),
    MANUAL_OVERRIDE("manual_override");

    private final String value;

    SubscriptionChangeType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static SubscriptionChangeType fromValue(String value) {
        for (SubscriptionChangeType type : SubscriptionChangeType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown change type: " + value);
    }
}
