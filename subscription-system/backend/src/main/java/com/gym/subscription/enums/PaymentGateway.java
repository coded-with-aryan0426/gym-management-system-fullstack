package com.gym.subscription.enums;

public enum PaymentGateway {
    STRIPE("stripe"),
    PAYPAL("paypal"),
    PADDLE("paddle"),
    RAZORPAY("razorpay");

    private final String value;

    PaymentGateway(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static PaymentGateway fromValue(String value) {
        for (PaymentGateway gateway : PaymentGateway.values()) {
            if (gateway.value.equalsIgnoreCase(value)) {
                return gateway;
            }
        }
        throw new IllegalArgumentException("Unknown payment gateway: " + value);
    }
}
