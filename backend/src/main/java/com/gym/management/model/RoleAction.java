package com.gym.management.model;

/**
 * Actions for role change audit log.
 */
public enum RoleAction {
    ROLE_GRANTED,
    ROLE_REVOKED,
    ROLE_SUSPENDED,
    ROLE_REINSTATED,
    ROLE_SWITCHED,
    APPLICATION_SUBMITTED,
    APPLICATION_APPROVED,
    APPLICATION_REJECTED,
    APPLICATION_WITHDRAWN
}
