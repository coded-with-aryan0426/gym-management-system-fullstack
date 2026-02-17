# Package Card UI Refactor Spec

## Why

The current "Packages" view in the PT Sessions module uses a vertical layout that consumes excessive vertical space. Users want a more compact, space-efficient design where the session list is displayed alongside the summary statistics, reducing the overall card height and making better use of screen width.

## What Changes

* **Refactor** **`pt-package-card`** **Layout**:

  * Convert to a horizontal grid layout on desktop.

  * Create a "Summary" section (left) containing the Header, Stats, and Progress Bar.

  * Move the "Sessions List" (right) to sit alongside the summary.

* **Responsiveness**:

  * Maintain a stacked vertical layout on mobile devices (< 768px).

* **UI Improvements**:

  * Improve spacing and alignment for a cleaner look.

  * Ensure the new layout is visually balanced.

## Impact

* **Affected Code**:

  * `frontend/src/pages/PTSessions/PTSessions.tsx`: Structural changes to wrap summary elements.

  * `frontend/src/pages/PTSessions/PTSessions.css`: New grid styles and responsive media queries.

## MODIFIED Requirements

### Requirement: Package Card Layout

The package card SHALL display the member summary and session list side-by-side on desktop screens to maximize space efficiency.

#### Scenario: Desktop View

* **WHEN** the viewport width is > 768px

* **THEN** the card displays two columns:

  * Left: Avatar, Name, Progress Ring, Stats, Progress Bar.

  * Right: List of recent sessions.

#### Scenario: Mobile View

* **WHEN** the viewport width is <= 768px

* **THEN** the card stacks the summary and session list vertically.

