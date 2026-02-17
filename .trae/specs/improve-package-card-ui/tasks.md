# Tasks

- [x] Task 1: Refactor `PTSessions.tsx` structure
  - [x] Wrap the `header`, `stats`, and `progress-bar` elements inside a new `pt-package-card__summary` container.
  - [x] Ensure `pt-package-card__sessions` remains as a direct child of `pt-package-card` (or sibling to the new summary container).
- [x] Task 2: Update `PTSessions.css` for new layout
  - [x] Apply `display: grid` (or flex) to `.pt-package-card`.
  - [x] Define columns for Summary and Sessions (e.g., `1fr 1fr`).
  - [x] Add a vertical divider style if needed (or just gap).
  - [x] Update responsive styles to revert to block/flex-column on smaller screens.
- [x] Task 3: Polish UI Details
  - [x] Add missing styles for `pt-package-card__session-item` to ensure attractive look.
  - [x] Adjust padding and gaps to ensure a "more less in hight" (compact) feel.
  - [x] Verify the "attractive UI/UX" requirement by checking alignment, shadows, and spacing.
