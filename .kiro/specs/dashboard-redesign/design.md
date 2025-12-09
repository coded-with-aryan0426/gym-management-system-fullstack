# Design Document - Dashboard UI Redesign

## Overview

This design document specifies a complete redesign of the Gym Management System dashboard, including the header bar, 2×2 role panel grid, detail views, loading states, responsive layouts, and a comprehensive design system. The dashboard serves as the main interface for gym managers to view and manage users across different roles.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Header Bar                             │
│  [Logo] [App Name]          [Avatar] [Logout]              │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard Container                      │
│  ┌──────────────────────┬──────────────────────┐            │
│  │   Owner Panel        │   Trainer Panel      │            │
│  │   Count: 2           │   Count: 3           │            │
│  │   [List/Table]       │   [List/Table]       │            │
│  └──────────────────────┴──────────────────────┘            │
│  ┌──────────────────────┬──────────────────────┐            │
│  │   Staff Panel        │   Customer Panel     │            │
│  │   Count: 2           │   Count: 5           │            │
│  │   [List/Table]       │   [List/Table]       │            │
│  └──────────────────────┴──────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Header Bar Component

**Layout:**
- Fixed position at top (height: 64px)
- Horizontal flex layout with space-between alignment
- Background: Primary color or neutral-900
- Shadow: elevation-2 (subtle drop shadow)

**Left Section:**
- Logo (32×32px)
- App name text (font-size: 20px, font-weight: 600)
- Spacing between logo and text: 12px

**Right Section:**
- Admin avatar (40×40px, circular)
- Logout button (secondary variant)
- Spacing between elements: 16px

**States:**
- Default: Normal appearance
- Hover (avatar): Show tooltip with user info
- Hover (logout): Button highlight
- Active: Logout button pressed state

### 2. Role Panels (2×2 Grid)

**Grid Layout:**
- Desktop: 2 columns × 2 rows
- Tablet: 2 columns × 2 rows (adjusted spacing)
- Mobile: 1 column × 4 rows
- Gap/Gutter: 24px (desktop), 16px (tablet), 12px (mobile)
- Padding: 24px (desktop), 16px (tablet), 12px (mobile)
- Max-width per panel: 500px (desktop)

**Panel Card Structure:**
- Border-radius: 12px
- Background: neutral-50 or white
- Border: 1px solid neutral-200
- Elevation: elevation-1 (subtle shadow)
- Min-height: 300px
- Padding: 20px

**Panel Header:**
- Title: Role name (font-size: 18px, font-weight: 600)
- Count badge: Positioned top-right
- Badge styling: Primary background, white text, border-radius: 20px, padding: 4px 12px

**Panel States:**
- Default: Normal styling
- Hover: elevation-3, scale(1.02), cursor: pointer
- Selected: Primary border (2px), background-color: primary-50
- Loading: Opacity 0.6, disabled interactions
- Empty: Centered empty state icon and message
- Error: Red border, error message with retry button

**Panel Content:**
- Table or list layout
- Columns: Name, Email, Actions
- Row height: 48px
- Font-size: 14px
- Alternating row colors (optional): neutral-50 and white
- Scroll behavior: Vertical scroll if content exceeds 300px height

### 3. Detail View (Modal/Side-Panel)

**Layout Options:**
- Modal: Centered overlay with 90% max-width (desktop), full-width (mobile)
- Side-panel: Right-aligned, 40% width (desktop), full-width (mobile)

**Modal Structure:**
- Overlay: Semi-transparent black (opacity: 0.5)
- Content background: white
- Border-radius: 12px
- Elevation: elevation-4 (prominent shadow)
- Padding: 24px

**Header:**
- Title: User name and role
- Close button: Top-right corner (X icon)
- Divider line below header

**Content:**
- User information section (name, email, role, created date)
- Nested table for relationships (customers for trainer, trainers for customer, etc.)
- Nested table styling: Indented, lighter background, smaller font

**Footer:**
- Action buttons (Edit, Delete, Close)
- Button spacing: 12px

**Close Behavior:**
- Click close button: Fade out and remove
- Click overlay: Close modal
- Press ESC key: Close modal
- Animation: Fade in/out (200ms), slide in from right (300ms)

### 4. Loading States

**Skeleton Loaders:**
- Placeholder height: Match actual content height
- Background: neutral-200
- Animation: Shimmer effect (left to right, 1.5s duration)
- Border-radius: 4px
- Spacing: Match actual content spacing

**Shimmer Animation:**
```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
```

**Loading Indicators:**
- Spinner: Centered, 32px diameter
- Text: "Loading..." below spinner
- Color: Primary color

### 5. Empty States

**Empty State Card:**
- Centered content
- Icon: 64px, neutral-300 color
- Title: "No {Role} found"
- Description: "There are no users in this category yet"
- Optional action button: "Add {Role}"

### 6. Error States

**Error Message:**
- Background: error-50 (light red)
- Border: 2px solid error-500
- Padding: 16px
- Border-radius: 8px
- Icon: Error icon (24px)
- Text: Error message (font-size: 14px)
- Action: Retry button (secondary variant)

## Design System

### Color Palette

**Primary Colors:**
- Primary-50: #f0f9ff
- Primary-100: #e0f2fe
- Primary-500: #0ea5e9 (Sky Blue)
- Primary-600: #0284c7
- Primary-900: #0c2d6b

**Secondary Colors:**
- Secondary-50: #f5f3ff
- Secondary-500: #a78bfa (Purple)
- Secondary-600: #9333ea

**Neutral Colors:**
- Neutral-50: #f9fafb
- Neutral-100: #f3f4f6
- Neutral-200: #e5e7eb
- Neutral-300: #d1d5db
- Neutral-500: #6b7280
- Neutral-700: #374151
- Neutral-900: #111827

**Semantic Colors:**
- Success-500: #10b981 (Green)
- Error-500: #ef4444 (Red)
- Warning-500: #f59e0b (Amber)
- Info-500: #3b82f6 (Blue)

### Typography

**Font Family:**
- Primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- Monospace: 'Fira Code', monospace

**Font Sizes (rem-based, 1rem = 16px):**
- H1: 2rem (32px), font-weight: 700
- H2: 1.5rem (24px), font-weight: 700
- H3: 1.25rem (20px), font-weight: 600
- Body-lg: 1rem (16px), font-weight: 400
- Body: 0.875rem (14px), font-weight: 400
- Body-sm: 0.75rem (12px), font-weight: 400
- Label: 0.875rem (14px), font-weight: 600

**Line Heights:**
- Headings: 1.2
- Body: 1.5
- Compact: 1.25

### Spacing Scale (8px Grid)

- 0: 0px
- 1: 4px
- 2: 8px
- 3: 12px
- 4: 16px
- 5: 20px
- 6: 24px
- 7: 28px
- 8: 32px
- 10: 40px
- 12: 48px
- 16: 64px

### Border Radius Scale

- None: 0px
- sm: 4px
- md: 8px
- lg: 12px
- xl: 16px
- full: 9999px

### Elevation / Shadow Tokens

**Elevation-1 (Subtle):**
```css
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
```

**Elevation-2 (Raised):**
```css
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
```

**Elevation-3 (Hover):**
```css
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
```

**Elevation-4 (Modal):**
```css
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

### Button Variants

**Primary Button:**
- Background: Primary-500
- Text: white
- Padding: 10px 16px
- Border-radius: 8px
- Font-weight: 600
- Hover: Background Primary-600, elevation-2
- Active: Background Primary-700
- Disabled: Opacity 0.5, cursor: not-allowed

**Secondary Button:**
- Background: neutral-200
- Text: neutral-900
- Padding: 10px 16px
- Border-radius: 8px
- Font-weight: 600
- Hover: Background neutral-300, elevation-1
- Active: Background neutral-400

**Ghost Button:**
- Background: transparent
- Text: Primary-500
- Border: 1px solid Primary-500
- Padding: 10px 16px
- Border-radius: 8px
- Hover: Background Primary-50
- Active: Background Primary-100

**Destructive Button:**
- Background: Error-500
- Text: white
- Padding: 10px 16px
- Border-radius: 8px
- Hover: Background Error-600
- Active: Background Error-700

### Input Field Components

**Text Input:**
- Border: 1px solid neutral-300
- Border-radius: 8px
- Padding: 10px 12px
- Font-size: 14px
- Focus: Border-color Primary-500, box-shadow: 0 0 0 3px Primary-100
- Error: Border-color Error-500, box-shadow: 0 0 0 3px Error-100
- Disabled: Background neutral-100, opacity 0.5

**Focus Ring:**
- Outline: 2px solid Primary-500
- Outline-offset: 2px

**Error State:**
- Border: 2px solid Error-500
- Error message: Font-size 12px, color Error-500, margin-top 4px

### Badge & Tag Styles

**Count Badge:**
- Background: Primary-500
- Text: white
- Padding: 4px 12px
- Border-radius: 20px
- Font-size: 12px
- Font-weight: 600

**Status Badge:**
- Padding: 6px 12px
- Border-radius: 16px
- Font-size: 12px
- Font-weight: 500
- Success: Background success-100, text success-700
- Error: Background error-100, text error-700
- Warning: Background warning-100, text warning-700

## Responsive Rules

### Desktop (1200px and above)

- Panel grid: 2 columns × 2 rows
- Gutter: 24px
- Panel max-width: 500px
- Header height: 64px
- Full detail view modal (90% width)
- All UI elements visible

### Tablet (768px - 1199px)

- Panel grid: 2 columns × 2 rows
- Gutter: 16px
- Panel max-width: 100%
- Header height: 56px
- Adjusted font sizes (90% of desktop)
- Detail view: Side-panel (50% width)

### Mobile (< 768px)

- Panel grid: 1 column × 4 rows
- Gutter: 12px
- Panel padding: 12px
- Header height: 48px
- Reduced font sizes (85% of desktop)
- Detail view: Full-width modal
- Hide non-essential UI elements
- Stack all content vertically

### Breakpoints

```css
@media (max-width: 767px) { /* Mobile */ }
@media (min-width: 768px) and (max-width: 1199px) { /* Tablet */ }
@media (min-width: 1200px) { /* Desktop */ }
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Panel Count Accuracy
*For any* role (Owner, Trainer, Staff, Customer), the count badge displayed on the panel should match the number of users returned by the API for that role.

**Validates: Requirements 2.2**

### Property 2: Grid Layout Consistency
*For any* viewport width, the panel grid should display the correct number of columns (2 on desktop/tablet, 1 on mobile) and maintain consistent spacing between panels.

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 3: Detail View Modal Closure
*For any* open detail view modal, pressing ESC key, clicking the close button, or clicking the overlay should close the modal and return focus to the dashboard.

**Validates: Requirements 4.4**

### Property 4: Loading State Visibility
*For any* data loading operation, skeleton loaders or shimmer animations should be visible until the data is fully loaded or an error occurs.

**Validates: Requirements 5.1**

### Property 5: Error State Recovery
*For any* API error, an error message with a retry button should be displayed, and clicking retry should re-attempt the failed request.

**Validates: Requirements 5.2, 5.3**

### Property 6: Responsive Breakpoint Transitions
*For any* viewport resize, the layout should smoothly transition between breakpoints without content loss or layout shift.

**Validates: Requirements 6.4**

### Property 7: Header Persistence
*For any* page or view, the header bar should remain visible and accessible at the top of the screen.

**Validates: Requirements 1.4**

### Property 8: Panel Selection State
*For any* selected panel, the selected styling should be visually distinct from unselected panels and persist until another panel is selected or the view is closed.

**Validates: Requirements 2.5**

## Error Handling

1. **API Failures**: Display error message with retry button
2. **Network Timeouts**: Show timeout message and retry option
3. **Invalid Data**: Display validation error and suggest correction
4. **Session Expiration**: Redirect to login page
5. **Permission Denied**: Show access denied message

## Testing Strategy

### Unit Testing
- Test panel count calculation matches API data
- Test responsive breakpoint calculations
- Test modal open/close logic
- Test loading state transitions
- Test error message display

### Property-Based Testing
- Property 1: Generate random user counts and verify badge accuracy
- Property 2: Generate random viewport widths and verify grid layout
- Property 3: Test modal closure with various input methods
- Property 4: Verify loading states appear during data fetch
- Property 5: Test error recovery with retry mechanism
- Property 6: Test viewport resize transitions
- Property 7: Verify header remains visible across all views
- Property 8: Test panel selection state persistence

### Integration Testing
- Test full flow: Load dashboard → Click panel → View details → Close modal
- Test responsive behavior on actual devices
- Test API integration with real backend
- Test error scenarios with API failures

