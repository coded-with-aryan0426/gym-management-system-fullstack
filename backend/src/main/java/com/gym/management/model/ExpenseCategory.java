package com.gym.management.model;

public enum ExpenseCategory {
    RENT("Rent"),
    UTILITIES("Utilities"),
    STAFF_SALARY("Staff Salary"),
    TRAINER_PAYROLL("Trainer Payroll"),
    EQUIPMENT("Equipment"),
    EQUIPMENT_MAINTENANCE("Equipment Maintenance"),
    FACILITY_MAINTENANCE("Facility Maintenance"),
    SUPPLIES("Supplies"),
    MARKETING("Marketing"),
    INSURANCE("Insurance"),
    PROFESSIONAL_FEES("Professional Fees"),
    BANK_CHARGES("Bank Charges"),
    TAXES("Taxes"),
    RENT_EQUIPMENT("Rented Equipment"),
    SECURITY("Security"),
    CLEANING("Cleaning"),
    SOFTWARE_SUBSCRIPTION("Software Subscription"),
    TRAINING("Training"),
    TRAVEL("Travel"),
    OTHER("Other Expense");

    private final String displayName;

    ExpenseCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
