# 05: Super Admin System Errors Plan (Creator Edition)

## 1. Ultimate Goal
Transform `SAErrors.tsx` into a real-time command center mimicking Sentry or Datadog. As the developer, you shouldn't have to SSH into a Linux server and run `tail -f logs/debug.log` to see why a user's app just crashed. The UI must aggressively capture and organize both frontend and backend panics instantly.

## 2. Advanced Creator & Business Insights (What's Missing)
*   **The "Blast Radius" Indicator:**
    *   For every unique error (e.g., `NullPointerException at Checkout`), show a badge calculating how many *distinct users* and *distinct gyms* experienced this exact stack trace today.
    *   *UI Execution:* A pill next to the error title: `[🔥 IMPACT: 42 Users across 3 Gyms]`.
*   **"AI Stacktrace Summarizer" (Optional Hook):**
    *   Reading 100 lines of Java stack traces is tedious. Add a magic wand icon: "Explain this Crash". It sends the stack trace to an LLM endpoint which returns a 1-sentence plain English summary: *"The database sequence for Booking IDs ran out of numbers."*

## 3. UI/UX Interactive Micro-Details & Layout
*   **Error Feed Badges:**
    *   `FATAL`: Deep red background, pulsing animation (`@keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 70% { box-shadow: 0 0 0 6px rgba(239,68,68,0); } }`). 
    *   `ERROR`: Standard red badge.
    *   `WARN`: Amber/Yellow badge `#F59E0B`.
*   **Stack Trace Accordion (The Console Look):**
    *   Clicking an error row expands an accordion smoothly.
    *   Inside, render the raw Java/Node stack trace in a `<pre><code className="language-java">` block equipped with `Prism.js` syntax highlighting over a pitch-black `#000000` background.
*   **"Copy Trace" & "Mark Resolved" Actions:**
    *   *Copy Icon:* `Copy`. Uses `navigator.clipboard.writeText(...)`. Icon swaps instantly to a green `Check` mark for 2 seconds.
    *   *Resolve Icon:* `CheckCircle2` (Green). Clicking strikes through the error title, fades the row's opacity to `0.4`, and slides it out of the active feed using Framer Motion.

## 4. Frontend Implementation & State Management Gaps
*   **Client-Side React Crash Catching (The Missing Link):**
    *   Currently, if the frontend React DOM crashes, the screen goes white and you (the creator) never know about it.
    *   *Fix:* The top-level `App.tsx` MUST wrap the entire routing tree in an `ErrorBoundary`. 
    *   In `componentDidCatch(error, info)`, it fires an un-authenticated POST request to `/api/v1/telemetry/client-error` including the user's OS (`navigator.userAgent`), window size, and the React component stack. The Super Admin error feed then displays these client-side bugs alongside backend database bugs.

## 5. Backend Architectural Gaps & Implementation
*   **Global Exception Interception (The Gap):**
    *   *Fix:* Implement a Spring `@ControllerAdvice`.
    *   Override methods for `Exception.class`. When an unhandled 500 Internal Server Error occurs, the Advice must catch it, extract the stack trace via `ExceptionUtils.getStackTrace(e)`, grab the requested URL, grab the user's JWT ID (if present to determine Blast Radius), and save all of this asynchronously (`@Async`) to the `system_error_logs` table.
    *   *CRITICAL SECURITY:* Strip all plaintext passwords, Authorization headers, or credit card PAN numbers from the HTTP request payloads *before* logging them to the DB.

## 6. Database Strategy & Extreme Performance
*   **Storage Ballooning Crash (The 50KB Rule):**
    *   Storing 50KB stack traces for 10,000 errors a day will crash the Neon PostgreSQL database storage within a month, taking down the entire Titan platform.
    *   *Fix:* The `system_error_logs` table MUST have a strict data retention policy.
    *   *Implementation:* A nightly Spring Boot `@Scheduled` cron job executes: `DELETE FROM system_error_logs WHERE created_at < NOW() - INTERVAL '30 days' AND status = 'RESOLVED';`
    *   Create a partial index: `CREATE INDEX idx_errors_resolved_old ON system_error_logs (created_at) WHERE status = 'RESOLVED';` to make pruning instantaneous.
