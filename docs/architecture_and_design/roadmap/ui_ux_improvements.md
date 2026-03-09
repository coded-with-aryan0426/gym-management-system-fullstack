# Titan Design Protocol: The "Invisible" SaaS Interface

## 1. Executive Vision: "The Invisible Interface"
The goal of the Titan Protocol is to create a UI so intuitive that *training is unnecessary*. We are moving from a "Feature-Centric" design (showing what the app *can do*) to a "Role-Centric" design (facilitating what the user *needs to do*).

**Core Philosophy:**
*   **Admin**: "I need control." -> **High Density, Data-Rich, Bird’s-Eye View.**
*   **Trainer**: "I need flow." -> **Mobile-First, Action-Oriented, Frictionless.**
*   **Member**: "I need motivation." -> **Visual, Gamified, Apple-Like Polish.**

---

## 2. 🏗️ Global Design Architecture ("Titan Core")

To achieve White-Label capability, we must abstract *style* from *structure*.

### 2.1 The Variable-First Color System
We will replace all hardcoded hex values with semantic CSS variables.

| Variable | Role | Default (Crimson) | White-Label Usage |
| :--- | :--- | :--- | :--- |
| `--brand-primary` | Main Brand Color | `#DC2626` | Client's Logo Color |
| `--brand-surface` | Subtle Backgrounds | `#1A1A1A` | Darkened Primary |
| `--status-success` | Positive Actions | `#10B981` | (Fixed Utility) |
| `--surface-ground` | App Background | `#0A0A0A` | (Fixed Theme) |
| `--surface-card` | Content Containers | `#141414` | (Fixed Theme) |

**Implementation Rule**: No component shall contain a `#` hex code. All colors comes from `var(--...)`.

### 2.2 Typography Hierarchy
We use **Inter** for UI and **Plus Jakarta Sans** for Headings.

*   **Display XL** (`text-4xl`): Key Metrics (e.g., "₹1.2M").
*   **Heading L** (`text-xl`): Page Titles.
*   **Body M** (`text-sm`): Standard text.
*   **Mono S** (`font-mono text-xs`): IDs, Transaction Hashes, Timestamps.

---

## 3. 👥 Role-Specific Deep Dive

### 🦅 Role A: The Admin ("The Tower")
**Persona**: Gym Owner / Manager. Using Desktop/Tablet.
**Goal**: Rapid decision-making.

#### 3.1 Dashboard Overhaul
*   **Current Issue**: Cards are too large, padding is excessive (`p-6`), data is sparse.
*   **Titan Upgrade**:
    *   **Data Density**: Reduce padding to `p-4`. Use a 4-column grid for KPIs.
    *   **Sparklines**: Add mini-charts (using `recharts`) to every KPI card to show 7-day trends immediately.
    *   **"Morning Brief" Widget**: A simplified text lists: "3 Trainers Late", "5 Memberships Expiring Today".

#### 3.2 The "Titan Table" (Member Management)
*   **Current Issue**: Hard to scan. Actions hidden in dropdowns.
*   **Titan Upgrade**:
    *   **Zebra Striping**: Alternating row backgrounds (`bg-white/5` on even rows).
    *   **Sticky Header**: Column names must never scroll out of view.
    *   **Quick Actions**: Hovering a row reveals immediate actions: [Message] [View] [Ban].
    *   **Batch Operations**: Checkbox column to "Email Selected" or "Suspend Selected".

---

### ⚡ Role B: The Trainer ("The Field")
**Persona**: Personal Trainer. Using Mobile while standing on gym floor.
**Goal**: Logging sessions without breaking eye contact with client.

#### 3.3 The "Live Session" View
*   **Current Issue**: Trainer has to navigate away to see notes or previous stats.
*   **Titan Upgrade**:
    *   **Floating Action Button (FAB)**: A fixed "+ Note" button always accessible during active sessions.
    *   **Heads-Up Display (HUD)**: The top bar should show *Current Client Name*, *Time Remaining*, and *Next Client*.
    *   **One-Tap Logging**: Presets for "completed", "no-show", "late".

#### 3.4 Schedule Flow
*   **Current Issue**: Month view is useless on mobile.
*   **Titan Upgrade**:
    *   **Agenda View**: Default to a vertical "Timeline" list for mobile.
    *   **Conflict Detection**: Visual red line if sessions overlap or travel time is insufficient.

---

### 🏆 Role C: The Member ("The Mirror")
**Persona**: Gym Goer. Using Mobile after a workout.
**Goal**: Feeling good about progress. Booking the next class.

#### 3.5 The "Apple Health" Aesthetic
*   **Current Issue**: Layout is a bit generic. The "Membership Card" dominates the screen.
*   **Titan Upgrade**:
    *   **Rings**: Re-implement the "Activity Rings" (Attendance, Calories, Streak) as the hero element.
    *   **Haptic Feedback**: Use `navigator.vibrate` on mobile when a user completes a streak or books a class.
    *   **Skeleton Loading**: Massive "shimmer" effect while data loads to feel premium.

#### 3.6 Frictionless Booking
*   **Current Issue**: Booking requires multiple clicks.
*   **Titan Upgrade**:
    *   **"Book Again"**: One-tap button to book the same class/time as last week.
    *   **Waitlist Logic**: Clear "Join Waitlist" UI with "You are #3 in line" messaging.

---

## 4. 🧩 Shared Component Specifications

To maintain consistency, we will act like a LEGO builder.

### 4.1 `TitanModal`
*   **Backdrop**: `backdrop-blur-sm` (always blurred background).
*   **Animation**: Scale up from 95% to 100% opacity.
*   **Keyboard**: `ESC` key always closes.

### 4.2 `TitanToast` (Notifications)
*   **Position**: Bottom-Right (Desktop), Top-Center (Mobile).
*   **Stacking**: New notifications push old ones down.
*   **Styling**: Glassmorphism (`bg-black/80`), thin border (`border-white/10`).

### 4.3 `TitanInput`
*   **State**: Focus ring must be `--brand-primary`.
*   **Error**: Inline error message below input, shake animation on submit.
*   **Icons**: Integrated leading/trailing icons (e.g., Email icon inside the field).

---

## 5. 📅 Implementation Roadmap

### Phase 1: The "Clean Slate" (Week 1)
*   [ ] **Refactor Auth**: Rewrite `LoginPage.tsx` to remove inline styles.
*   [ ] **Global CSS**: Define the `--brand-*` variables.
*   [ ] **Layout Merge**: Create `MasterLayout.tsx` and move `CommandRail` permission logic upwards.

### Phase 2: The "Admin Power-Up" (Week 2)
*   [ ] **Data Tables**: Build the reusable `TitanTable` component.
*   [ ] **Dashboard Density**: Redesign Admin Dashboard with 4-column grid.

### Phase 3: The "Mobile Polish" (Week 3)
*   [ ] **Trainer Mobile View**: Implement "Agenda View" for schedule.
*   [ ] **Member Animations**: optimize `framer-motion` to reduce bundle size.

### Phase 4: White-Label Engine (Week 4)
*   [ ] **Theme Context**: Build the logic to fetch/apply colors from the backend.
*   [ ] **Logo Replacement**: Allow dynamic logo loading.

---

## 6. Security UX Intersections
*   **Rate Limiting UI**: If a user hits 429, show a friendly "Cool down, Titan. Try again in {s} seconds" message, not a raw error.
*   **Session Timeout**: A modal warning "Session expiring in 60s" allows users to extend without losing work.

This document serves as the **Design Bible** for the next 4 weeks of development.
