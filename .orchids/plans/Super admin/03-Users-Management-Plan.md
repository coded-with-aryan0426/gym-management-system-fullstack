# 03: Super Admin Users Management Plan (Creator Edition)

## 1. Ultimate Goal
Transform `SAUsers.tsx` into an all-seeing global directory capable of instant search, deep behavioral analysis, non-destructive interventions (like password resets), and hard GDPR-compliant deletions. As the creator, you need to see who your "Power Users" are versus who is struggling.

## 2. Advanced Creator & Business Insights (What's Missing)
*   **The "Power User" Hexagon:**
    *   A visual indicator showing a user's engagement level (0-100). Calculated by logins, workouts logged, and class bookings. High scores get a glowing purple hexagon badge. Low scores get a faded gray circle. 
    *   *Why:* Helps you identify evangelists for interviews or beta testing.
*   **Cross-Gym Affiliation Tag:**
    *   If a trainer operates at *multiple* gyms, surface a linked pill icon: `[Titan HQ] [Iron Forge]`. Clicking the pill filters the view to show their specific activities at that location.
*   **"Ghost Accounts" Filter:**
    *   A one-click filter toggle at the top of the table: `[Show Inactive > 90 Days]`. Helps you prune dead weight from the database or target them with re-engagement emails.

## 3. UI/UX Interactive Micro-Details & Layout
*   **Global Search Bar (Command Center Style):**
    *   *Behavior:* Features a `Search` icon (`#888888`), debounced at 400ms.
    *   *Focus State:* The input expands smoothly from 250px to 400px width. The border glows `#8B5CF6` (Purple). 
    *   *Empty State:* If a query yields 0 results, an animated `<UserX />` icon appears with the text: *"No traces found in the Titan Network."*
*   **User Slide-Over Drawer (Deep Dive):**
    *   Clicking a user slides out a 500px right drawer.
    *   *Drawer Content:*
        *   **Header:** Large Avatar (fallback to hashed-color initials), Name, Role Badge, and Account Creation Date.
        *   **Activity Heatmap:** A GitHub-style contribution calendar showing their app usage over the last 365 days.
        *   **Device Fingerprint:** Shows their last login IP, device type (iOS/Web), and app version (crucial for debugging "It's not working" support tickets).
*   **"Force Password Reset" Action:**
    *   *Icon:* `Key` or `MailWarning` (Yellow/Gold `#EAB308`).
    *   *Interaction:* Clicking pops up a Modal `<ResetConfirmModal>` requiring the admin to type `"RESET"`.
    *   *Feedback:* "System reset email dispatched to origin server."

## 4. Frontend Implementation & State Management Gaps
*   **Infinite Scrolling vs Pagination (The Render Trap):**
    *   A standard pagination (Page 1 of 50,000) is slow. Rendering 500 users at once freezes React.
    *   *Fix:* Use `react-window` combined with React Query's `useInfiniteQuery`. As the admin scrolls down the table container, automatically fetch `page=page+1` but only render the 20 rows currently visible in the DOM.

## 5. Backend Architectural Gaps & Implementation
*   **Endpoints:**
    *   `GET /api/v1/superadmin/users?query={string}&role={enum}&cursor={id}`
    *   `GET /api/v1/superadmin/users/{uuid}/telemetry` (Fetches the heatmap and device data for the drawer).
    *   `POST /api/v1/superadmin/users/{uuid}/force-reset`
    *   `DELETE /api/v1/superadmin/users/{uuid}`
*   **Force-Reset Business Logic Gap:**
    *   Normal password resets require a "forgot password" email flow.
    *   *Fix:* The super admin endpoint generates a secure, single-use `JWT` with a 15-minute expiry specifically signed with a different `RESET_SECRET`. It bypasses the old password check and returns the raw reset `/recover?token=xyz` URL to the Super Admin's clipboard, or fires an AWS SES email directly.

## 6. Database Strategy & Extreme Performance
*   **Search Speed Collapse (The ILIKE Trap):**
    *   Doing `WHERE email ILIKE '%aryan%'` on 1,000,000 rows takes 3+ seconds by doing a full table scan.
    *   *Fix:* Apply a PostgreSQL `pg_trgm` GIN index on exactly 3 columns: `first_name`, `last_name`, and `email`.
    *   *Schema:* `CREATE EXTENSION IF NOT EXISTS pg_trgm; CREATE INDEX trgm_users_search ON users USING GIN ((first_name || ' ' || last_name || ' ' || email) gin_trgm_ops);`
    *   This forces instantaneous cross-column fuzzy text searching.
