# Requirements Document

## Introduction

This document specifies the requirements for a new frontend application for the Gym Management System. The frontend will provide a modern, responsive dashboard interface for managing gym owners, trainers, staff, members, and settings. The application will connect to the existing Spring Boot backend API and display data in a visually appealing card-based layout with navigation, search functionality, and quick actions.

## Glossary

- **Frontend**: The React-based web application that users interact with directly
- **Dashboard**: The main landing page showing summary statistics and user lists by role
- **Member**: A gym customer with a subscription plan (Gold, Silver, Platinum)
- **Staff**: Gym employees including trainers, desk managers, and maintenance personnel
- **Role**: User classification (Owner, Trainer, Staff, Customer)
- **Plan**: Membership subscription tier (Gold, Silver, Platinum)
- **Status Badge**: Visual indicator showing Active or Expired membership status
- **User Card**: A visual component displaying user photo, name, role/plan, email, and status
- **Quick Actions**: Shortcut buttons for common administrative tasks

## Requirements

### Requirement 1

**User Story:** As a gym administrator, I want to view a dashboard with summary statistics, so that I can quickly understand the current state of gym membership and staff.

#### Acceptance Criteria

1. WHEN the user navigates to the Dashboard page THEN the Frontend SHALL display four category cards showing counts for Owners, Trainers, Staff, and Customers
2. WHEN the Dashboard loads THEN the Frontend SHALL display a list of users under each category card with their avatar, name, and email
3. WHEN the user clicks "View All" on a category card THEN the Frontend SHALL navigate to the corresponding detailed list page
4. WHEN the Dashboard loads THEN the Frontend SHALL display a Quick Actions panel with buttons for Add Member, Schedule Class, Manage Billing, Manage Staff, and Manage Payment
5. WHEN the user clicks "Add New" under any category THEN the Frontend SHALL open a form to add a new user of that type

### Requirement 2

**User Story:** As a gym administrator, I want to view and manage staff members, so that I can track employee information and roles.

#### Acceptance Criteria

1. WHEN the user navigates to the Staff page THEN the Frontend SHALL display a grid of staff cards with photo, name, role, email, and status badge
2. WHEN the user clicks "Add New Staff" button THEN the Frontend SHALL display a form to create a new staff member
3. WHEN the user types in the search field THEN the Frontend SHALL filter the staff list to show only matching names or emails
4. WHEN displaying a staff member THEN the Frontend SHALL show their role (Head Trainer, Desk Manager, Maintenance) below their name
5. WHEN displaying a staff member THEN the Frontend SHALL show an "Active" status badge in green color

### Requirement 3

**User Story:** As a gym administrator, I want to view and manage gym members, so that I can track membership plans and customer information.

#### Acceptance Criteria

1. WHEN the user navigates to the Members page THEN the Frontend SHALL display a grid of member cards with photo, name, plan type, email, and status badge
2. WHEN the user clicks "Add New Member" button THEN the Frontend SHALL display a form to create a new member
3. WHEN the user types in the search field THEN the Frontend SHALL filter the members list to show only matching names or emails
4. WHEN displaying a member THEN the Frontend SHALL show their plan type (Gold Plan, Silver Plan, Platinum Plan) below their name
5. WHEN displaying a member THEN the Frontend SHALL show status badge as "Active" in green or "Expired" in orange based on membership status

### Requirement 4

**User Story:** As a gym administrator, I want to configure gym settings, so that I can customize the application behavior and manage my profile.

#### Acceptance Criteria

1. WHEN the user navigates to the Settings page THEN the Frontend SHALL display four sections: General Settings, Profile, Notifications, and Billing
2. WHEN viewing General Settings THEN the Frontend SHALL display editable fields for Gym Name, Address, and Contact Email
3. WHEN viewing Profile section THEN the Frontend SHALL display avatar with upload option and password change functionality
4. WHEN viewing Notifications section THEN the Frontend SHALL display toggle switches for Email Alerts and SMS Alerts
5. WHEN viewing Billing section THEN the Frontend SHALL display credit card details and plan selection options
6. WHEN the user clicks "Save Changes" THEN the Frontend SHALL persist all modified settings and display confirmation
7. WHEN the user clicks "Cancel" THEN the Frontend SHALL discard unsaved changes and revert to previous values

### Requirement 5

**User Story:** As a gym administrator, I want consistent navigation across all pages, so that I can easily move between different sections of the application.

#### Acceptance Criteria

1. WHEN viewing any page THEN the Frontend SHALL display a top navigation bar with Dashboard, Staff, Members, and Settings links
2. WHEN viewing any page THEN the Frontend SHALL display a gym logo on the left side of the navigation bar
3. WHEN viewing any page THEN the Frontend SHALL display a Logout button with user avatar on the right side of the navigation bar
4. WHEN the user clicks a navigation link THEN the Frontend SHALL navigate to the corresponding page and highlight the active link
5. WHEN the user clicks Logout THEN the Frontend SHALL end the session and redirect to a login page

### Requirement 6

**User Story:** As a gym administrator, I want the frontend to fetch data from the backend API, so that I can view real-time information about members and staff.

#### Acceptance Criteria

1. WHEN the Frontend loads any page THEN the Frontend SHALL fetch data from the Spring Boot backend REST API
2. WHEN the API request is in progress THEN the Frontend SHALL display a loading indicator
3. IF the API request fails THEN the Frontend SHALL display an error message and provide a retry option
4. WHEN data is successfully fetched THEN the Frontend SHALL render the data in the appropriate UI components
5. WHEN the user performs a create, update, or delete action THEN the Frontend SHALL send the request to the API and refresh the displayed data
