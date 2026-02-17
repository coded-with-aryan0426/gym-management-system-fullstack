package com.gym.management.model;

/**
 * Granular permissions for fine-grained access control.
 * Each permission represents a specific action that can be performed.
 */
public enum Permission {
    
    // User Management
    USER_VIEW("View user profiles"),
    USER_CREATE("Create new users"),
    USER_UPDATE("Update user information"),
    USER_DELETE("Delete users"),
    USER_ASSIGN_ROLES("Assign roles to users"),
    
    // Gym Management
    GYM_VIEW("View gym information"),
    GYM_CREATE("Create new gyms"),
    GYM_UPDATE("Update gym settings"),
    GYM_DELETE("Delete gyms"),
    GYM_MANAGE_SETTINGS("Manage gym configuration"),
    
    // Member Management
    MEMBER_VIEW("View member information"),
    MEMBER_CREATE("Register new members"),
    MEMBER_UPDATE("Update member details"),
    MEMBER_DELETE("Remove members"),
    MEMBER_MANAGE_MEMBERSHIP("Manage member subscriptions"),
    
    // Trainer Management
    TRAINER_VIEW("View trainer information"),
    TRAINER_CREATE("Hire new trainers"),
    TRAINER_UPDATE("Update trainer details"),
    TRAINER_DELETE("Remove trainers"),
    TRAINER_ASSIGN_CUSTOMERS("Assign customers to trainers"),
    
    // Training Sessions
    SESSION_VIEW("View training sessions"),
    SESSION_CREATE("Schedule new sessions"),
    SESSION_UPDATE("Modify session details"),
    SESSION_DELETE("Cancel sessions"),
    SESSION_MANAGE_OWN("Manage own training sessions"),
    
    // Staff Management
    STAFF_VIEW("View staff information"),
    STAFF_CREATE("Hire new staff"),
    STAFF_UPDATE("Update staff details"),
    STAFF_DELETE("Remove staff"),
    STAFF_MANAGE_SHIFTS("Manage staff schedules"),
    
    // Performance & Analytics
    PERFORMANCE_VIEW("View performance reports"),
    PERFORMANCE_MANAGE("Manage performance data"),
    ANALYTICS_VIEW("View analytics dashboard"),
    REPORTS_GENERATE("Generate reports"),
    
    // Financial Management
    BILLING_VIEW("View billing information"),
    BILLING_MANAGE("Manage billing and payments"),
    PAYMENTS_PROCESS("Process payments"),
    REFUNDS_PROCESS("Process refunds"),
    
    // System Administration
    SYSTEM_SETTINGS("Manage system settings"),
    SYSTEM_BACKUP("Perform system backups"),
    AUDIT_VIEW("View audit logs"),
    MAINTENANCE_MODE("Toggle maintenance mode"),
    
    // Communication
    NOTIFICATIONS_SEND("Send notifications"),
    EMAIL_SEND("Send emails"),
    ANNOUNCEMENTS_CREATE("Create announcements"),
    
    // Equipment Management
    EQUIPMENT_VIEW("View equipment inventory"),
    EQUIPMENT_CREATE("Add new equipment"),
    EQUIPMENT_UPDATE("Update equipment details"),
    EQUIPMENT_DELETE("Remove equipment"),
    EQUIPMENT_MAINTENANCE("Schedule maintenance");

    private final String description;

    Permission(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
