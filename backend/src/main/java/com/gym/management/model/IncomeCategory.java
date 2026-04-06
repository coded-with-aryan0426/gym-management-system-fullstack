package com.gym.management.model;

public enum IncomeCategory {
    MEMBERSHIP_FEE("Membership Fee"),
    PT_SESSION("Personal Training Session"),
    CLASS_FEE("Group Class Fee"),
    JOINING_FEE("Joining Fee"),
    PRODUCT_SALE("Product Sale"),
    CONSULTATION_FEE("Consultation Fee"),
    EVENT_FEE("Event Fee"),
    SPONSORSHIP("Sponsorship"),
    OTHER("Other Income");

    private final String displayName;

    IncomeCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
