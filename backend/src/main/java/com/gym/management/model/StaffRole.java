package com.gym.management.model;

/**
 * Roles that staff members can have within a gym
 */
public enum StaffRole {
    OWNER,        // Full control, can delete gym
    ADMIN,        // Full management access
    TRAINER,      // Can manage PT sessions and classes
    RECEPTIONIST  // Can manage check-ins and basic member info
}
