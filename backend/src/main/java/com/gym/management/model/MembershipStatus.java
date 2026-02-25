package com.gym.management.model;

/**
 * Status of a member's membership at a gym
 */
public enum MembershipStatus {
    PENDING,        // Awaiting gym approval
    ACTIVE,         // Currently active membership
    EXPIRING_SOON,  // Active but crossed 90% duration
    EXPIRED,        // Membership period ended
    CANCELLED       // Manually cancelled
}
