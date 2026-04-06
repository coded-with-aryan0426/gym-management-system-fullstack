package com.gym.management.model;

public enum PaymentGateway {
    STRIPE("Stripe"),
    RAZORPAY("Razorpay"),
    PAYPAL("PayPal"),
    SQUARE("Square"),
    PLAID("Plaid"),
    MANUAL("Manual");

    private final String displayName;

    PaymentGateway(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
