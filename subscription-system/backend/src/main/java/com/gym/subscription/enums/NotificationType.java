package com.gym.subscription.enums;

public enum NotificationType {
    TRIAL_STARTED("trial_started"),
    TRIAL_EXPIRING("trial_expiring"),
    TRIAL_EXPIRED("trial_expired"),
    SUBSCRIPTION_CREATED("subscription_created"),
    SUBSCRIPTION_RENEWED("subscription_renewed"),
    SUBSCRIPTION_CANCELLED("subscription_cancelled"),
    SUBSCRIPTION_EXPIRED("subscription_expired"),
    SUBSCRIPTION_UPGRADED("subscription_upgraded"),
    SUBSCRIPTION_DOWNGRADED("subscription_downgraded"),
    PAYMENT_FAILED("payment_failed"),
    PAYMENT_RECOVERED("payment_recovered"),
    GRACE_PERIOD_STARTED("grace_period_started"),
    LICENSE_REVOKED("license_revoked"),
    LICENSE_ACTIVATED("license_activated"),
    REFUND_ISSUED("refund_issued");

    private final String value;

    NotificationType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static NotificationType fromValue(String value) {
        for (NotificationType type : NotificationType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown notification type: " + value);
    }
}
