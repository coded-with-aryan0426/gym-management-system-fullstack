# Implementation Plan

- [x] 1. Set up React project structure and dependencies




  - [x] 1.1 Initialize React project with TypeScript using Vite

    - Create `frontend` folder with Vite React TypeScript template
    - Install dependencies: react-router-dom, axios
    - Configure TypeScript and ESLint
    - _Requirements: 6.1_


  - [x] 1.2 Set up project folder structure
    - Create directories: components, pages, services, utils, types, assets
    - Create index files for each directory
    - _Requirements: 6.1_
  - [x] 1.3 Configure testing framework
    - Install Jest, React Testing Library, fast-check
    - Configure Jest for TypeScript and React
    - _Requirements: 6.1_

- [x] 2. Implement shared components and utilities



  - [x] 2.1 Create TypeScript type definitions

    - Define User, Role, MembershipPlan, GymSettings interfaces
    - Define component prop interfaces
    - Define API response types
    - _Requirements: 1.2, 2.1, 3.1_

  - [x] 2.2 Implement StatusBadge component

    - Create StatusBadge component with active/expired variants
    - Apply green color for active, orange for expired
    - _Requirements: 2.5, 3.5_
  - [ ]* 2.3 Write property test for StatusBadge
    - **Property 3: Status Badge Color Mapping**
    - **Validates: Requirements 2.5, 3.5**

  - [x] 2.4 Implement UserCard component

    - Create card layout with avatar, name, email, role/plan, status
    - Support both staff (role) and member (plan) display modes
    - _Requirements: 1.2, 2.1, 2.4, 3.1, 3.4_
  - [ ]* 2.5 Write property test for UserCard rendering
    - **Property 1: User Card Data Rendering**
    - **Validates: Requirements 1.2, 2.1, 3.1**

  - [x] 2.6 Implement SearchBar component

    - Create search input with placeholder and onChange handler
    - _Requirements: 2.3, 3.3_

  - [x] 2.7 Implement search filter utility function

    - Create function to filter users by name or email (case-insensitive)
    - _Requirements: 2.3, 3.3_
  - [ ]* 2.8 Write property test for search filter
    - **Property 2: Search Filter Correctness**
    - **Validates: Requirements 2.3, 3.3**

  - [x] 2.9 Implement CategoryCard component

    - Create card with icon, title, count, user list, View All and Add New buttons
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [x] 2.10 Implement Modal component

    - Create reusable modal with header, body, and footer slots
    - Support open/close state management
    - _Requirements: 1.5, 2.2, 3.2_

  - [x] 2.11 Implement form components

    - Create TextInput, Toggle, Button components
    - Support validation states and error messages
    - _Requirements: 4.2, 4.3, 4.4, 4.6, 4.7_
  - [ ]* 2.12 Write property test for form cancel behavior
    - **Property 5: Form Cancel Reverts State**
    - **Validates: Requirements 4.7**

- [x] 3. Implement API service layer


  - [x] 3.1 Create API service with axios


    - Configure base URL for Spring Boot backend
    - Implement getUsers, getUserById, createUser, updateUser, deleteUser
    - Implement getStats, getSettings, updateSettings
    - _Requirements: 6.1, 6.5_

  - [x] 3.2 Implement loading and error state handling

    - Create custom hook useApi for managing loading/error states
    - Display loading indicator during requests
    - Display error message with retry on failure
    - _Requirements: 6.2, 6.3, 6.4_
  - [ ]* 3.3 Write property test for API error display
    - **Property 6: API Error Display**
    - **Validates: Requirements 6.3**
  - [ ]* 3.4 Write property test for API data rendering
    - **Property 7: API Data Rendering**
    - **Validates: Requirements 6.4**

- [x] 4. Implement navigation and layout
  - [x] 4.1 Implement Navbar component
    - Create top navigation bar with logo, nav links, logout button
    - Highlight active navigation link
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ]* 4.2 Write property test for navigation active state
    - **Property 4: Navigation Active State**
    - **Validates: Requirements 5.4**
  - [x] 4.3 Configure React Router
    - Set up routes for Dashboard, Staff, Members, Settings
    - Implement route guards and redirects
    - _Requirements: 5.4, 5.5_
  - [x] 4.4 Create main App layout
    - Wrap pages with Navbar component
    - Set up outlet for page content
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 5. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Dashboard page



  - [x] 6.1 Create Dashboard page component

    - Fetch stats data from API on mount
    - Display four CategoryCard components for Owners, Trainers, Staff, Customers
    - Display QuickActions panel on right side
    - _Requirements: 1.1, 1.2, 1.4_

  - [x] 6.2 Implement QuickActions component
    - Create panel with Add Member, Schedule Class, Manage Billing, Manage Staff, Manage Payment buttons
    - Wire up button click handlers

    - _Requirements: 1.4_
  - [x] 6.3 Wire up Dashboard navigation
    - Implement View All click to navigate to corresponding page
    - Implement Add New click to open modal form
    - _Requirements: 1.3, 1.5_

- [x] 7. Implement Staff page



  - [x] 7.1 Create Staff page component

    - Fetch staff users from API on mount
    - Display grid of UserCard components
    - Include Add New Staff button and SearchBar
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 7.2 Implement staff search functionality

    - Filter displayed staff by search query
    - Update grid in real-time as user types

    - _Requirements: 2.3_


  - [x] 7.3 Implement Add Staff form
    - Create form with name, email, role, password fields
    - Submit to API and refresh list on success
    - _Requirements: 2.2_

- [x] 8. Implement Members page


  - [x] 8.1 Create Members page component


    - Fetch member users from API on mount
    - Display grid of UserCard components with plan info
    - Include Add New Member button and SearchBar
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 8.2 Implement member search functionality
    - Filter displayed members by search query
    - Update grid in real-time as user types
    - _Requirements: 3.3_
  - [x] 8.3 Implement Add Member form
    - Create form with name, email, plan selection, password fields
    - Submit to API and refresh list on success
    - _Requirements: 3.2_

- [x] 9. Implement Settings page
  - [x] 9.1 Create Settings page layout
    - Create four-section layout: General Settings, Profile, Notifications, Billing
    - Fetch current settings from API on mount
    - _Requirements: 4.1_
  - [x] 9.2 Implement General Settings section
    - Create editable fields for Gym Name, Address, Contact Email
    - _Requirements: 4.2_
  - [x] 9.3 Implement Profile section
    - Display avatar with upload functionality
    - Add password change form
    - _Requirements: 4.3_
  - [x] 9.4 Implement Notifications section
    - Create toggle switches for Email Alerts and SMS Alerts
    - _Requirements: 4.4_
  - [x] 9.5 Implement Billing section
    - Display masked credit card number
    - Show plan selection options
    - _Requirements: 4.5_
  - [x] 9.6 Implement Save/Cancel functionality
    - Save button persists changes to API and shows confirmation
    - Cancel button reverts to original values
    - _Requirements: 4.6, 4.7_

- [x] 10. Add styling and polish


  - [x] 10.1 Create global CSS styles


    - Define color palette matching mockups (blue header, green/orange badges)
    - Set up typography and spacing variables
    - _Requirements: 2.5, 3.5, 5.1_

  - [x] 10.2 Style all components
    - Apply card shadows and rounded corners
    - Style buttons, inputs, and toggles
    - Ensure responsive grid layout

    - _Requirements: 1.1, 2.1, 3.1, 4.1_
  - [x] 10.3 Add placeholder avatars
    - Create default avatar for users without photos
    - _Requirements: 1.2, 2.1, 3.1_


- [x] 11. Final Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.
