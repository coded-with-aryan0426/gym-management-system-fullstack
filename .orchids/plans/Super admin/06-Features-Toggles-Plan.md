# 06: Super Admin Features & Toggles Plan (Creator Edition)

## 1. Ultimate Goal
Transform `SAFeatureFlags.tsx` from simple boolean toggles into a mission-critical **Emergency Kill Switch** and **Gradual Rollout Center**. As the creator, if a newly deployed feature (e.g., AI Workout Generator) starts bankrupting your OpenAI API credits, you must be able to turn it off globally for all users instantly without a Vercel redeployment.

## 2. Advanced Creator & Business Insights (What's Missing)
*   **The "Blast Radius" Live Counter:**
    *   Below each toggle, a live ticking number (e.g., "Active Users Impacted: 1,402") gives context on exactly how many people this switch will immediately break or fix based on current active sessions.
*   **Phased Rollout / Canary Releases:**
    *   A simple ON/OFF switch is too dangerous for major features. 
    *   *Detail:* Expand the toggle to allow "Percentage Rollout" (e.g., a slider set to 15%). The backend uses a deterministic hash of the user's ID against the percentage to decide if they get the feature.
    *   *Targeted Rollout:* A "Beta Tester Only" mode, which targets specific `gym_id`s rather than random users.

## 3. UI/UX Interactive Micro-Details & Layout
*   **iOS-Style State Toggles:**
    *   *Rest (Off):* Background `#374151` (Dark Gray), Thumb circle at `translateX(2px)` with a subtle inner shadow.
    *   *Hover:* Thumb circle projects a slight drop shadow. Cursor becomes `pointer`.
    *   *Click (On):* Smooth spring animation. Thumb translates to `translateX(22px)`. Background transitions to `#10B981` (Green) over `0.2s ease-in-out`.
*   **Global Kill Confirmation Modal (The Safety Net):**
    *   If you toggle a `CRITICAL` flag (e.g., `REQUIRE_PAYMENT_METHOD_FOR_SIGNUP` = false), a standard toggle is intercepted by a `<ConfirmDestructiveModal>`.
    *   *UI Focus:* A red `<AlertTriangle />` pulses. The background dims dramatically. You must explicitly click "Yes, Alter Platform-Wide Logic" to proceed. This prevents accidental catastrophic clicks.

## 4. Frontend Implementation & State Management Gaps
*   **State Optimism vs Safety (The Lie):** 
    *   When a switch is flipped, the UI should immediately *Optimistically Update* to the new state so it feels fast. 
    *   *Fix:* It MUST revert visually and throw a red toast if the backend responds with a `500` error, ensuring the creator isn't lied to about the actual platform state.
*   **Frontend Client Sync (The Desync Gap):**
    *   How do regular users currently logged in know the AI feature was just turned off?
    *   *Fix:* The main frontend app (outside Super Admin) must short-poll the flags endpoint `/api/v1/features` every 3 minutes, pulling the payload into a global Zustand/Redux store.

## 5. Backend Architectural Gaps & Implementation
*   **The DB Cache Bottleneck:**
    *   Pitching a DB query every time the app evaluates `if (featureFlagsService.isEnabled("AI_CHAT"))` will murder the database under high load.
    *   *Fix:* The backend MUST cache these in memory (L1) using Caffeine and Redis (L2). 
    *   The Super Admin `PUT` endpoint updates the Postgres DB AND instantly publishes a Redis Pub/Sub message or invalidates the Redis cache key globally, ensuring all backend instances immediately stop serving the feature.

## 6. Database Strategy & Extreme Performance
*   **Schema & Audit Lock:**
    *   `feature_flags` table (flag_key PK, is_enabled BOOLEAN, rollout_percentage INT, target_gym_ids JSONB, description TEXT, updated_by VARCHAR, updated_at TIMESTAMP).
    *   *Gap:* No application logic should ever `DELETE` a feature flag from the database—only update states. Unused flags should be deprecated only via raw SQL migrations after the codebase entirely rips out the `if(flag)` dead code.
