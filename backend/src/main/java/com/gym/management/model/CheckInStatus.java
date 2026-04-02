package com.gym.management.model;

public enum CheckInStatus {
    ACTIVE,
    CHECKED_OUT,
    CHECKED_IN;

    public static CheckInStatus fromString(String value) {
        if (value == null) return null;
        String normalized = value.trim().toUpperCase().replace("-", "_").replace(" ", "_");
        try {
            return CheckInStatus.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
