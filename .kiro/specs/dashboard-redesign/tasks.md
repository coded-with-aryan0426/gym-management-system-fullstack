# Implementation Plan - Dashboard UI Redesign

## Phase 1: Design System and Base Components

- [x] 1. Create Design System CSS Variables




  - Define color palette as CSS custom properties (primary, secondary, neutral, semantic colors)
  - Define typography scale (font-sizes, font-weights, line-heights)
  - Define spacing scale (8px grid: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px)
  - Define border-radius scale (4px, 8px, 12px, 16px, 9999px)
  - Define elevation/shadow tokens (elevation-1 through elevation-4)
  - Create CSS file: `frontend/src/styles/design-system.css`
  - _Requirements: 7.1, 7.2, 7.3_

- [ ]* 1.1 Write Property Test for Design System Colors
  - **Property 1: Color Palette Compliance**
  - **Validates: Requirements 7.1**
  - Verify all components use colors from the defined palette



- [x] 2. Create Base Component Library


  - Implement Button component with variants (primary, secondary, ghost, destructive)
  - Implement Badge component for count display
  - Implement Input component with focus ring and error states
  - Implement Card component with elevation and hover states
  - Create component files in `frontend/src/components/base/`
  - _Requirements: 7.4, 7.5_

- [ ]* 2.1 Write Property Test for Button Variants
  - **Property 2: Button Variant Styling**
  - **Validates: Requirements 7.4**
  - Verify each button variant has correct styling





- [ ] 3. Create Utility Components
  - Implement Skeleton loader component with shimmer animation
  - Implement Empty state component with icon and message
  - Implement Error message component with retry button
  - Implement Loading spinner component
  - Create files in `frontend/src/components/utilities/`
  - _Requirements: 3.2, 3.3, 3.4, 5.1, 5.2_

- [ ]* 3.1 Write Property Test for Loading States
  - **Property 3: Loading State Visibility**
  - **Validates: Requirements 5.1**
  - Verify skeleton loaders appear during data loading



## Phase 2: Header and Layout

- [ ] 4. Create Header Component
  - Implement fixed header bar with logo, app name, avatar, and logout button
  - Add avatar hover tooltip with user information
  - Implement logout functionality (clear session, redirect to login)
  - Create file: `frontend/src/components/Header.jsx`
  - Add header styling with elevation-2 shadow
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x]* 4.1 Write Property Test for Header Persistence


  - **Property 4: Header Remains Visible**
  - **Validates: Requirements 1.4**
  - Verify header stays visible across all views



- [x] 5. Create Main Layout Component


  - Implement layout wrapper with header and content area
  - Add responsive padding and max-width constraints
  - Create file: `frontend/src/components/Layout.jsx`
  - _Requirements: 1.1, 6.1, 6.2, 6.3_

- [ ] 6. Create Responsive Grid System
  - Implement 2×2 grid for desktop (1200px+)
  - Implement 2×1 grid for tablet (768px-1199px)
  - Implement 1 column for mobile (< 768px)
  - Use CSS Grid with media queries
  - Create file: `frontend/src/styles/grid.css`
  - _Requirements: 6.1, 6.2, 6.3, 6.4_



- [ ]* 6.1 Write Property Test for Grid Layout
  - **Property 5: Grid Layout Consistency**
  - **Validates: Requirements 6.1, 6.2, 6.3**
  - Verify correct number of columns at each breakpoint

## Phase 3: Role Panels

- [ ] 7. Create Role Panel Component
  - Implement panel card with title, count badge, and content area
  - Add hover styling (elevation-3, scale, cursor)
  - Add selected styling (primary border, background)
  - Add click handler to select panel and load data
  - Create file: `frontend/src/components/RolePanel.jsx`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 7.1 Write Property Test for Panel Count Accuracy
  - **Property 6: Count Badge Matches API Data**
  - **Validates: Requirements 2.2**
  - Verify badge count matches number of users from API

- [ ] 8. Create Panel Content Table
  - Implement table with columns: Name, Email, Actions
  - Add row styling with alternating colors (optional)
  - Add row height: 48px, font-size: 14px
  - Add scroll behavior for overflow content
  - Create file: `frontend/src/components/PanelTable.jsx`
  - _Requirements: 3.1, 3.5_

- [ ]* 8.1 Write Property Test for Table Column Presence
  - **Property 7: Required Columns Present**
  - **Validates: Requirements 3.1**
  - Verify all required columns are rendered

- [ ] 9. Create Panel Grid Container
  - Implement container that renders four role panels (Owner, Trainer, Staff, Customer)
  - Manage selected panel state
  - Handle panel click events
  - Create file: `frontend/src/components/PanelGrid.jsx`
  - _Requirements: 2.1, 2.4_

- [x] 9.1 Write Property Test for Panel Selection State






  - **Property 8: Panel Selection Persistence**
  - **Validates: Requirements 2.5**
  - Verify selected panel styling persists until another panel is selected

## Phase 4: Detail Views and Modals

- [ ] 10. Create Detail View Modal Component
  - Implement modal with overlay, header, content, and footer
  - Add close button and ESC key handler
  - Add overlay click to close
  - Implement fade in/out animation (200ms)
  - Create file: `frontend/src/components/DetailModal.jsx`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 8.3, 8.4_

- [ ]* 10.1 Write Property Test for Modal Closure
  - **Property 9: Modal Closes on ESC and Close Button**
  - **Validates: Requirements 4.4**
  - Verify modal closes with ESC key and close button

- [ ] 11. Create Trainer Detail View
  - Display trainer information (name, email, role, created date)
  - Display nested table of assigned customers
  - Add nested table styling with indentation
  - Create file: `frontend/src/components/TrainerDetail.jsx`
  - _Requirements: 4.1, 4.5_

- [ ] 12. Create Customer Detail View
  - Display customer information (name, email, role, created date)
  - Display nested table of assigned trainers
  - Add nested table styling with indentation
  - Create file: `frontend/src/components/CustomerDetail.jsx`
  - _Requirements: 4.2, 4.5_

- [ ] 13. Create Owner Detail View
  - Display owner information (name, email, role, created date)
  - Display nested tables for managed trainers and customers
  - Add nested table styling with indentation
  - Create file: `frontend/src/components/OwnerDetail.jsx`
  - _Requirements: 4.3, 4.5_

- [ ]* 13.1 Write Property Test for Nested Table Indentation
  - **Property 10: Nested Tables Display with Indentation**
  - **Validates: Requirements 4.5**
  - Verify nested data is indented properly

## Phase 5: Loading and Error States

- [ ] 14. Implement Loading State Management
  - Add loading state to panel component
  - Display skeleton loaders while data is loading
  - Disable user interactions during loading
  - Create file: `frontend/src/hooks/useLoading.js`
  - _Requirements: 3.2, 5.1, 5.4_

- [ ]* 14.1 Write Property Test for Interaction Disabling
  - **Property 11: Interactions Disabled During Loading**
  - **Validates: Requirements 5.4**
  - Verify buttons and inputs are disabled during loading

- [ ] 15. Implement Error State Management
  - Add error state to panel component
  - Display error message with retry button
  - Implement retry functionality
  - Create file: `frontend/src/hooks/useError.js`
  - _Requirements: 3.4, 5.2, 5.3_

- [ ]* 15.1 Write Property Test for Error Recovery
  - **Property 12: Error Recovery with Retry**
  - **Validates: Requirements 5.2, 5.3**
  - Verify error message appears and retry works

- [ ] 16. Implement Empty State Display
  - Display empty state when no users exist for a role
  - Show icon, title, and description
  - Add optional "Add" button
  - _Requirements: 3.3_

## Phase 6: Responsive Design and Animations



- [ ] 17. Implement Responsive Breakpoints
  - Add media queries for desktop (1200px+), tablet (768px-1199px), mobile (< 768px)
  - Adjust font sizes, spacing, and layout for each breakpoint
  - Hide non-essential UI elements on mobile
  - Create file: `frontend/src/styles/responsive.css`

  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [ ]* 17.1 Write Property Test for Responsive Transitions
  - **Property 13: Smooth Layout Transitions**
  - **Validates: Requirements 6.4**
  - Verify layout transitions smoothly on viewport resize

- [x] 18. Implement Micro-interactions


  - Add fade animation on panel click (300ms)
  - Add slide animation on modal open (300ms)
  - Add hover effects (color change, scale, shadow)
  - Add smooth data update animations
  - Create file: `frontend/src/styles/animations.css`
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_



- [ ]* 18.1 Write Property Test for Animation Presence
  - **Property 14: Animations Applied on Interactions**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**
  - Verify animations are applied on panel click and modal open

## Phase 7: Integration and Testing

- [ ] 19. Integrate Dashboard Components
  - Combine Header, Layout, PanelGrid, and DetailModal
  - Wire up API calls to fetch user data


  - Implement state management for selected panel and detail view
  - Create file: `frontend/src/components/Dashboard.jsx` (updated)
  - _Requirements: 1.1, 2.1, 2.4, 4.1, 4.2, 4.3_

- [ ] 20. Implement API Integration
  - Connect to `/api/stats` endpoint for role counts
  - Connect to `/api/users?role={role}` endpoint for user lists
  - Connect to `/api/users/{id}/customers` endpoint for trainer customers
  - Handle loading, error, and success states
  - _Requirements: 2.2, 3.1, 4.1, 4.2, 4.3_

- [ ]* 20.1 Write Integration Tests
  - Test full flow: Load dashboard → Click panel → View details → Close modal
  - Test API error handling and retry
  - Test responsive behavior on different screen sizes



- [ ] 21. Checkpoint - Verify All Components Render
  - Ensure all components render without errors
  - Verify layout is correct on desktop, tablet, and mobile
  - Check that all styling is applied correctly
  - Ask the user if questions arise

- [ ]* 21.1 Write Property Test for Design System Compliance
  - **Property 15: All Components Use Design System**
  - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**
  - Verify all components comply with design system

- [ ] 22. Final Testing and Refinement
  - Test all user interactions (click, hover, scroll, resize)
  - Verify animations are smooth and performant
  - Test on real devices (desktop, tablet, mobile)
  - Fix any bugs or styling issues
  - _Requirements: All_

- [ ] 23. Final Checkpoint - Verify Complete Dashboard
  - Ensure all tests pass
  - Verify dashboard displays data correctly
  - Verify all interactions work as expected
  - Ask the user if questions arise

