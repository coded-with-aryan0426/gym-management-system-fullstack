package com.gym.management.model;

/**
 * Enum for authentication providers.
 * Tracks how a user originally registered or last logged in.
 */
public enum AuthProvider {
    LOCAL, // Traditional email + password
    GOOGLE // Google OAuth
}
