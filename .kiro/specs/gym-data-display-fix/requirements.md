# Requirements Document - Gym Management Data Display Fix

## Introduction

The Gym Management System has a backend with user data stored in an Oracle database and a frontend React application. Currently, data is not displaying in the frontend despite the database containing valid data. This document specifies the requirements to diagnose and fix the data flow from backend to frontend.

## Glossary

- **Backend**: Spring Boot REST API running on port 8080
- **Frontend**: React application that consumes the backend API
- **Database**: Oracle database containing users, roles, and relationships
- **API Endpoint**: HTTP endpoint exposed by the backend (e.g., `/api/stats`, `/api/users`)
- **CORS**: Cross-Origin Resource Sharing - mechanism allowing frontend to call backend
- **Stats**: Aggregated counts of users by role (owners, trainers, staff, customers)

## Requirements

### Requirement 1

**User Story:** As a developer, I want the backend to be running and accessible, so that the frontend can retrieve data.

#### Acceptance Criteria

1. WHEN the backend application starts THEN the Spring Boot server SHALL listen on port 8080
2. WHEN a request is made to `/api/stats` THEN the system SHALL return a JSON response with user counts by role
3. WHEN a request is made to `/api/users?role=TRAINER` THEN the system SHALL return a list of users with that role
4. WHEN the backend receives requests from the frontend THEN the system SHALL allow cross-origin requests via CORS

### Requirement 2

**User Story:** As a frontend user, I want to see user statistics and lists, so that I can view gym management data.

#### Acceptance Criteria

1. WHEN the Dashboard component loads THEN the system SHALL fetch stats from `/api/stats` endpoint
2. WHEN stats are received THEN the system SHALL display counts for owners, trainers, staff, and customers
3. WHEN a user clicks a stat card THEN the system SHALL fetch and display the list of users for that role
4. WHEN users are displayed THEN the system SHALL show full name and email for each user

### Requirement 3

**User Story:** As a system administrator, I want to verify the database connection, so that I can ensure data is properly stored.

#### Acceptance Criteria

1. WHEN the backend starts THEN the system SHALL successfully connect to the Oracle database
2. WHEN the database is queried THEN the system SHALL retrieve user records with their associated roles
3. WHEN user data is retrieved THEN the system SHALL include user_id, username, full_name, and email fields
4. WHEN role mappings are queried THEN the system SHALL return the correct role associations for each user

