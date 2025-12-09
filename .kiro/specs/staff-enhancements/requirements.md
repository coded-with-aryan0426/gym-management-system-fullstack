# Requirements Document - Staff Management Enhancements

## Introduction

This document specifies enhancements to the Staff Management feature to provide better role selection, customer assignment capabilities, and detailed staff information display.

## Glossary

- **Staff**: Gym employees including trainers, desk managers, and maintenance personnel
- **Trainer**: A staff member who provides personal training services to customers
- **Customer Assignment**: The process of linking customers to their personal trainers
- **PT Session**: Personal Training session scheduled between a trainer and customer
- **Staff Detail Modal**: The popup window showing comprehensive staff member information

## Requirements

### Requirement 1

**User Story:** As a gym administrator, I want to select a specific role when creating staff members, so that I can accurately categorize employees.

#### Acceptance Criteria

1. WHEN creating a new staff member THEN the system SHALL display a role selection dropdown
2. WHEN the role dropdown is displayed THEN the system SHALL show options for Trainer, Staff, and Desk Manager
3. WHEN a role is selected THEN the system SHALL assign that role to the new user upon creation
4. WHEN no role is selected THEN the system SHALL default to "Staff" role

### Requirement 2

**User Story:** As a gym administrator, I want to assign and remove customers from trainers, so that I can manage personal training relationships.

#### Acceptance Criteria

1. WHEN viewing a trainer's details THEN the system SHALL display a list of assigned customers
2. WHEN viewing a trainer's details THEN the system SHALL display an "Add Customer" button
3. WHEN clicking "Add Customer" THEN the system SHALL show a list of available customers not yet assigned to this trainer
4. WHEN selecting a customer to add THEN the system SHALL create the trainer-customer relationship
5. WHEN viewing assigned customers THEN the system SHALL display a "Remove" button next to each customer
6. WHEN clicking "Remove" on a customer THEN the system SHALL remove the trainer-customer relationship after confirmation

### Requirement 3

**User Story:** As a gym administrator, I want to view detailed staff information in a larger modal, so that I can see all relevant details at once.

#### Acceptance Criteria

1. WHEN clicking on a staff member THEN the system SHALL open a larger detail modal
2. WHEN the detail modal opens THEN the system SHALL display full name, email, role, and contact information
3. WHEN viewing a trainer's modal THEN the system SHALL display assigned customers with their details
4. WHEN viewing a trainer's modal THEN the system SHALL display upcoming PT session schedule
5. WHEN the modal is displayed THEN the system SHALL be at least 800px wide for better readability

### Requirement 4

**User Story:** As a gym administrator, I want to see PT session information for trainers, so that I can understand their schedule and availability.

#### Acceptance Criteria

1. WHEN viewing a trainer's details THEN the system SHALL display a PT Sessions section
2. WHEN PT sessions are displayed THEN the system SHALL show customer name, date, and time for each session
3. WHEN no PT sessions exist THEN the system SHALL display "No upcoming sessions scheduled"
4. WHEN PT sessions are displayed THEN the system SHALL sort them by date and time (earliest first)
