package com.gym.management.model;

/**
 * Status of a member's membership at a gym
 */
public enum MembershipStatus {
    PENDING,    // Awaiting gym approval
    ACTIVE,     // Currently active membership
    EXPIRED,    // Membership period ended
    CANCELLED   // Manually cancelled
}
