package com.gym.management.model;

/**
 * Roles that staff members can have within a gym
 */
public enum StaffRole {
    OWNER,          // Full control, can delete gym
    ADMIN,          // Full management access
    TRAINER,        // Can manage PT sessions and classes
    RECEPTIONIST,   // Can manage check-ins and basic member info
    FLOOR_MANAGER,  // Manages gym floor operations
    MAINTENANCE,    // Equipment repair and facility upkeep
    CLEANING,       // Cleaning and hygiene staff
    OPERATIONS,     // General operations and logistics
    SALES           // Membership sales and marketing
}
