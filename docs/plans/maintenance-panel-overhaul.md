# Maintenance Panel Overhaul

## Overview
Refactor the `MaintenancePanel.tsx` component to achieve a "Hyper-Premium SaaS" aesthetic (Reference: Linear/Vercel). The current implementation is functional but lacks visual depth, premium interactions, and modern architectural separation.

## Project Type
**WEB** (React/Toyota Design System)

## Phase 1: The Design Audit (Critique)

### 1. Analysis of Current State
- **File Size:** ~700 lines (Monolith) indicates need for component splitting.
- **Visuals:** Standard "Bootstrap-like" layout. Generic standard browser scrollbars.
- **Interactions:** Basic `onClick` without physical feedback (scale/spring).
- **Typography:** Standard sizes, lacks "Editorial" hierarchy.

### 2. Identified Weaknesses (The "Average" Traps)
1.  **Tab Navigation:** Uses standard conditional rendering.
    *   *Critique:* Jarring instant switches. No "slide" interaction.
    *   *Fix:* `framer-motion` `AnimatePresence` with localized spring transitions.
2.  **Information Density:** Data is presented in flat cards using simple grids.
    *   *Critique:* Feels like a database admin panel, not a product.
    *   *Fix:* "Bento" style info-fragmentation or "Asymmetric Staggered" layout.
3.  **Visual Feedback:** Buttons and rows are static.
    *   *Critique:* Dead UI.
    *   *Fix:* Micro-interactions on *every* hover capable element.

## Phase 2: Architecture Plan

### Component Split
- `MaintenancePanel` (Container/Orchestrator)
  - `MaintenanceHeader` (Sticky, frosted glass)
  - `MaintenanceStats` (Premium KPI display)
  - `MaintenanceHistory` (Virtual list with skeleton states)
  - `MaintenanceSchedule` (Custom calendar implementation, dropping `react-big-calendar` default styles entirely for custom CSS-grid)

## Phase 3: Socratic Gate (User Input Required)
Before Implementation, we must define the "Soul" of the design.

**Missing Information:**
- **Exact Palette:** "Premium" is vague. Do we want "Dark Mode Minimalist" (Monochrome + 1 accent) or "High contrast swiss"?
- **Motion Intensity:** Fast/Professional (700ms spring) or Slow/Cinematic (1.2s ease)?

## Phase 4: Verification
- [ ] No Purple used.
- [ ] No default scrollbars.
- [ ] Animation present on mount.
