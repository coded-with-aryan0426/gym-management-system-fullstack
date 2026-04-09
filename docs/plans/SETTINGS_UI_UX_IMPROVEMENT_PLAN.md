# Settings Page - Comprehensive UI/UX Improvement Plan

**Document Version:** 1.0  
**Date:** March 31, 2026  
**Scope:** Trainer Settings, Member Settings, Owner Settings  
**Priority:** High

---

## Executive Summary

This document outlines a complete UI/UX redesign for the Settings pages across all three user portals (Trainer, Member, Owner). The current implementation suffers from:

1. **Visual Inconsistency**: Inconsistent label text spacing, misaligned sections, and non-uniform button styling
2. **Poor Visual Hierarchy**: Lack of clear separation between subsections and form groups
3. **Typography Issues**: Inconsistent font sizes, weights, and spacing across sections
4. **Color Scheme Misalignment**: Sections blend together without visual differentiation
5. **Responsive Design Gaps**: Mobile experience degradation with stacked layouts
6. **Light Mode Support**: Missing comprehensive light mode color palette
7. **API Error Handling**: Unhandled API failures causing silent error states

---

## Current Issues Analysis

### **Error Messages Reported**
- ❌ "Failed to update profile"
- ❌ "Failed to save client preferences"
- ❌ "Failed to update availability"
- ❌ "Failed to save notification preferences"

### **Root Cause Analysis**

#### API Endpoint Mismatches
The TrainerSettings component makes requests to endpoints that may not exist or have incorrect paths:

```tsx
// Current endpoints (potentially incorrect):
await api.put("/api/trainer/profile", profile)
await api.put("/api/trainer/settings/notifications", notifications)
await api.put("/api/trainer/settings/availability", { slots: availability })
await api.put("/api/trainer/settings/client-preferences", {...})
```

**Issues:**
1. **Endpoint paths** may not match backend route definitions
2. **Request payload structure** may not align with API expectations
3. **Error handling** is minimal—errors log to toast but don't provide debugging info
4. **No retry logic** for transient failures
5. **Missing request validation** before sending to API

---

## UI/UX Problems Identified

### 1. **Typography Inconsistency**
| Element | Current | Issue |
|---------|---------|-------|
| Section Titles | 14px, 600wt | Not prominent enough |
| Form Labels | 11px, 600wt | Too small, hard to read |
| Field Descriptions | Varies | Inconsistent sizing |
| Subsection Headers | 10px, 700wt uppercase | Difficult to scan |

**Solution:**
- Establish a clear typographic scale: 16px (H1), 14px (H2), 13px (body), 12px (secondary)
- Use consistent font weights: 700 (headers), 600 (labels), 400 (body)
- Add 1.5 line-height for better readability

### 2. **Spacing & Padding Issues**
| Component | Current | Issue |
|-----------|---------|-------|
| Section headers | 10px 14px | Too tight, cramped feel |
| Form groups | 12px 14px gap | Inconsistent padding |
| Field rows | 5px 10px | No breathing room |
| Toggle rows | 1rem padding | Inconsistent with other elements |

**Solution:**
- Use an 8px/16px/24px spacing system consistently
- Apply 16px padding to major section headers
- Use 12px gaps between form groups
- Add 8px vertical margins between fields

### 3. **Color Palette Misalignment**
| Element | Dark Mode | Light Mode | Issue |
|---------|-----------|-----------|-------|
| Section backgrounds | `rgba(255,255,255,0.02)` | White | Low contrast, blends together |
| Borders | `rgba(255,255,255,0.08)` | `#CBD5E1` | Subtle but indistinguishable |
| Form backgrounds | `rgba(255,255,255,0.03)` | White | No visual separation |
| Text colors | Varies | Missing coverage | Inconsistent hierarchy |

**Solution:**
- Define distinct background layers:
  - Primary background: `#0a0a0a` (dark), `#f8fafc` (light)
  - Secondary (cards): `#141414` (dark), `#ffffff` (light)
  - Tertiary (nested): `#1a1a1a` (dark), `#f1f5f9` (light)
  - Accent overlay: `#2a2a2a` (dark), `#eff6ff` (light)
- Use distinct border colors with proper contrast ratios

### 4. **Section Separation & Visual Hierarchy**
| Feature | Current | Issue |
|---------|---------|-------|
| Section dividers | 1px subtle border | Barely visible |
| Form group headers | Minimal styling | Low visual weight |
| Subsection nesting | No visual cues | Unclear structure |
| Card elevation | No elevation | Flat appearance |

**Solution:**
- Add distinct background colors for each section
- Use colored left borders with icons (already present)
- Implement subtle shadows for elevation differentiation
- Add horizontal dividers between logical groups

### 5. **Button Styling Inconsistency**
| Button Type | Current | Issue |
|-------------|---------|-------|
| Save button | Gradient + shadow | Inconsistent across sections |
| Cancel button | Transparent + border | Not prominent enough |
| Secondary buttons | No standard | Multiple styles |
| Toggle switches | 32x18px | Size varies in context |

**Solution:**
- Define button size system: 12px (small), 14px (medium), 16px (large)
- Create standard button states: default, hover, active, disabled
- Use consistent shadows for elevation
- Standardize toggle switch appearance

### 6. **Light Mode Support Gaps**
| Component | Dark Mode | Light Mode | Gap |
|-----------|-----------|-----------|-----|
| Labels | Clearly visible | Mixed visibility | ❌ |
| Form groups | Dark backgrounds | White backgrounds blend | ❌ |
| Hover states | Subtle light overlay | Inconsistent | ❌ |
| Borders | Subtle whites | Too subtle | ❌ |
| Text contrast | ~4.5:1 | Variable | ❌ |

**Solution:**
- Implement complete light mode palette in Settings.css
- Ensure WCAG AA contrast ratios (4.5:1 minimum)
- Add distinct background colors for light mode sections
- Test all interactive states in light mode

---

## Improvement Plan - Phase 1: Foundation (Critical)

### 1.1 Fix API Error Handling
**File:** `frontend/src/pages/trainer/TrainerSettings.tsx`

```tsx
// CURRENT (Lines 221-228)
const handleSaveProfile = async () => {
  setSaving(true)
  try {
    await api.put("/api/trainer/profile", profile)
    toast.success("Profile updated successfully")
  } catch { toast.error("Failed to update profile") }
  finally { setSaving(false) }
}

// IMPROVED
const handleSaveProfile = async () => {
  setSaving(true)
  try {
    const response = await api.put("/api/trainer/profile", {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      specialization: profile.specialization,
      experience: profile.experience,
      bio: profile.bio,
      certifications: profile.certifications,
    })
    if (response.status === 200 || response.status === 201) {
      toast.success("Profile updated successfully")
      setSavedSection('profile')
      setTimeout(() => setSavedSection(null), 2000)
    }
  } catch (error) {
    console.error("Profile update error:", error)
    toast.error(
      error?.response?.data?.message || 
      "Failed to update profile. Please try again."
    )
  } finally { setSaving(false) }
}
```

**Actions:**
- [ ] Verify backend endpoint paths match frontend requests
- [ ] Add request body validation before API calls
- [ ] Implement exponential backoff retry logic
- [ ] Add detailed error logging for debugging
- [ ] Create error boundary with fallback UI

### 1.2 Implement Unified Typography System
**File:** `frontend/src/pages/Settings/Settings.css`

**Add to CSS root variables:**
```css
:root {
  /* Typography Scale */
  --settings-type-h1: 1.25rem; /* 20px */
  --settings-type-h2: 1rem;    /* 16px */
  --settings-type-h3: 0.875rem; /* 14px */
  --settings-type-body: 0.8125rem; /* 13px */
  --settings-type-small: 0.75rem; /* 12px */
  --settings-type-xs: 0.6875rem; /* 11px */
  
  --settings-font-weight-bold: 700;
  --settings-font-weight-semibold: 600;
  --settings-font-weight-medium: 500;
  --settings-font-weight-regular: 400;
  
  --settings-line-height-tight: 1.2;
  --settings-line-height-normal: 1.5;
  --settings-line-height-relaxed: 1.75;
  
  /* Spacing Scale (8px base) */
  --settings-spacing-xs: 0.25rem;  /* 4px */
  --settings-spacing-sm: 0.5rem;   /* 8px */
  --settings-spacing-md: 1rem;     /* 16px */
  --settings-spacing-lg: 1.5rem;   /* 24px */
  --settings-spacing-xl: 2rem;     /* 32px */
  --settings-spacing-2xl: 3rem;    /* 48px */
}
```

**Actions:**
- [ ] Apply `--settings-type-*` variables to all text elements
- [ ] Replace hardcoded font sizes with variables
- [ ] Update all spacing with consistent scale
- [ ] Test readability at different font sizes

### 1.3 Define Complete Light Mode Palette
**File:** `frontend/src/pages/Settings/Settings.css` (Lines 28-44)

**Add comprehensive light mode rules:**
```css
:root.theme-light,
[data-theme="light"] {
  /* Primary Colors */
  --settings-bg: #f8fafc;
  --settings-card-bg: #ffffff;
  --settings-card-bg-hover: #f1f5f9;
  
  /* Layered Backgrounds */
  --settings-bg-layer-0: #ffffff;
  --settings-bg-layer-1: #f8fafc;
  --settings-bg-layer-2: #f1f5f9;
  --settings-bg-accent: #eff6ff;
  
  /* Borders - with proper contrast */
  --settings-border: #cbd5e1;
  --settings-border-subtle: #e2e8f0;
  --settings-border-strong: #94a3b8;
  
  /* Text Colors - WCAG AA compliant */
  --settings-text-primary: #0f172a;    /* ~13:1 on white */
  --settings-text-secondary: #334155;  /* ~9.5:1 on white */
  --settings-text-tertiary: #64748b;   /* ~5.5:1 on white */
  --settings-text-muted: #94a3b8;      /* ~4.5:1 on white */
  
  /* Section Backgrounds (distinct layers) */
  --settings-section-bg-primary: #ffffff;
  --settings-section-bg-secondary: #f8fafc;
  --settings-section-bg-tertiary: #f1f5f9;
  
  /* Shadows - subtle for light mode */
  --settings-shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.05);
  --settings-shadow-md: 0 1px 3px rgba(15, 23, 42, 0.1), 0 1px 2px rgba(15, 23, 42, 0.06);
  --settings-shadow-lg: 0 2px 8px rgba(15, 23, 42, 0.12), 0 1px 3px rgba(15, 23, 42, 0.06);
  
  /* Interactive Backgrounds */
  --settings-nav-hover-bg: rgba(15, 23, 42, 0.04);
  --settings-nav-active-bg: rgba(226, 232, 240, 0.8);
}
```

**Actions:**
- [ ] Apply layered backgrounds to distinct sections
- [ ] Validate all color contrasts with WCAG checker
- [ ] Test hover/active states in light mode
- [ ] Ensure form inputs are visible

### 1.4 Fix Section Separation with Colors
**File:** `frontend/src/pages/Settings/Settings.css` (Line 614-629)

```css
/* Dark Mode - Section styling */
.settings-section {
  background: var(--settings-card-bg);
  border: 1px solid var(--settings-border);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--settings-shadow);
  
  /* Add left accent border with distinct colors */
  border-left: 4px solid var(--section-accent, var(--settings-accent-red));
  
  /* Add subtle background variation */
  position: relative;
}

.settings-section::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    var(--section-accent)10% 0%,
    transparent 30%
  );
  pointer-events: none;
  z-index: 0;
}

/* Light Mode - Enhanced section styling */
:root.theme-light .settings-section,
[data-theme="light"] .settings-section,
body.light-mode .settings-section {
  background: var(--settings-section-bg-primary);
  border: 2px solid var(--settings-border-subtle);
  border-left: 4px solid var(--section-accent, #dc2626);
  box-shadow: var(--settings-shadow-md);
}

:root.theme-light .settings-section::before,
[data-theme="light"] .settings-section::before,
body.light-mode .settings-section::before {
  display: none; /* Unnecessary in light mode */
}
```

**Actions:**
- [ ] Enhance left border colors with section accents
- [ ] Add subtle gradient backgrounds per section
- [ ] Ensure visual separation without layout changes

### 1.5 Standardize Button Styling
**File:** `frontend/src/pages/Settings/Settings.css`

**Create standardized button classes:**
```css
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Settings Buttons - Unified System */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

.settings-btn {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 600;
  font-size: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  letter-spacing: -0.01em;
}

/* Primary Button */
.settings-btn--primary {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: white;
  padding: 8px 14px;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
}

.settings-btn--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(220, 38, 38, 0.4);
}

.settings-btn--primary:active:not(:disabled) {
  transform: translateY(0px);
}

.settings-btn--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Saved State */
.settings-btn--saved {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
}

/* Secondary Button */
.settings-btn--secondary {
  background: transparent;
  border: 1px solid var(--settings-border);
  color: var(--settings-text-secondary);
  padding: 8px 14px;
}

.settings-btn--secondary:hover {
  background: var(--settings-nav-hover-bg);
  border-color: var(--settings-text-secondary);
  color: var(--settings-text-primary);
}

/* Ghost Button */
.settings-btn--ghost {
  background: transparent;
  color: var(--settings-text-secondary);
  padding: 6px 12px;
}

.settings-btn--ghost:hover {
  background: var(--settings-nav-hover-bg);
  color: var(--settings-text-primary);
}

/* Light Mode */
:root.theme-light .settings-btn--primary,
[data-theme="light"] .settings-btn--primary,
body.light-mode .settings-btn--primary {
  box-shadow: 0 1px 3px rgba(220, 38, 38, 0.2);
}

:root.theme-light .settings-btn--secondary,
[data-theme="light"] .settings-btn--secondary,
body.light-mode .settings-btn--secondary {
  border-color: #cbd5e1;
}
```

**Actions:**
- [ ] Replace inline button styles with `.settings-btn-*` classes
- [ ] Standardize padding and sizing
- [ ] Test hover/active states
- [ ] Apply to all buttons in the page

---

## Improvement Plan - Phase 2: UI Refinement (High Priority)

### 2.1 Fix Form Group Styling
**File:** `frontend/src/pages/Settings/Settings.css` (Lines 766-790)

```css
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Form Groups - Improved Spacing & Hierarchy */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: var(--settings-bg-layer-1);
  border: 1px solid var(--settings-border-subtle);
  border-radius: 10px;
  padding: 0;
  overflow: hidden;
  transition: all 0.2s ease;
}

.form-group:hover {
  border-color: var(--settings-border);
  background: var(--settings-bg-layer-2);
}

.form-group__header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--settings-text-primary);
  font-size: var(--settings-type-xs);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: var(--settings-font-weight-semibold);
  padding: 12px 14px;
  background: var(--settings-bg-layer-2);
  border-bottom: 1px solid var(--settings-border-subtle);
  margin: 0;
}

.form-group__content {
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 12px;
  padding: 12px 14px;
}
```

**Light Mode:**
```css
:root.theme-light .form-group,
[data-theme="light"] .form-group,
body.light-mode .form-group {
  background: #ffffff;
  border-color: #e2e8f0;
}

:root.theme-light .form-group:hover,
[data-theme="light"] .form-group:hover,
body.light-mode .form-group:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

:root.theme-light .form-group__header,
[data-theme="light"] .form-group__header,
body.light-mode .form-group__header {
  background: #f1f5f9;
  color: #334155;
  border-color: #e2e8f0;
}
```

**Actions:**
- [ ] Apply layered backgrounds
- [ ] Improve padding consistency
- [ ] Enhance hover states
- [ ] Test readability in light mode

### 2.2 Standardize Field Styling
**File:** `frontend/src/pages/Settings/Settings.css` (Lines 967-1011)

```css
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Field Wrapper - Consistent Spacing */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

.field-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: var(--settings-type-xs);
  font-weight: var(--settings-font-weight-semibold);
  color: var(--settings-text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
  letter-spacing: 0.02em;
}

/* Dense Input Fields */
.dense-input,
.dense-select,
.dense-textarea {
  background: var(--settings-bg-layer-1);
  border: 1px solid var(--settings-border);
  border-radius: 6px;
  padding: 8px 10px;
  color: var(--settings-text-primary);
  font-size: var(--settings-type-small);
  font-family: inherit;
  transition: all 0.15s ease;
  width: 100%;
}

.dense-input:focus,
.dense-select:focus,
.dense-textarea:focus {
  outline: none;
  border-color: #dc2626;
  background: rgba(220, 38, 38, 0.02);
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.12);
  transform: translateY(-1px);
}

.dense-input:hover:not(:focus),
.dense-select:hover:not(:focus),
.dense-textarea:hover:not(:focus) {
  border-color: var(--settings-border);
  background: var(--settings-bg-layer-2);
}

/* Light Mode Fields */
:root.theme-light .dense-input,
:root.theme-light .dense-select,
:root.theme-light .dense-textarea,
[data-theme="light"] .dense-input,
[data-theme="light"] .dense-select,
[data-theme="light"] .dense-textarea,
body.light-mode .dense-input,
body.light-mode .dense-select,
body.light-mode .dense-textarea {
  background: #ffffff;
  border-color: #e2e8f0;
  color: #0f172a;
}

:root.theme-light .dense-input:focus,
:root.theme-light .dense-select:focus,
:root.theme-light .dense-textarea:focus,
[data-theme="light"] .dense-input:focus,
[data-theme="light"] .dense-select:focus,
[data-theme="light"] .dense-textarea:focus,
body.light-mode .dense-input:focus,
body.light-mode .dense-select:focus,
body.light-mode .dense-textarea:focus {
  border-color: #dc2626;
  background: #ffffff;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.08);
}
```

**Actions:**
- [ ] Apply consistent padding and sizing
- [ ] Enhance focus states with proper shadows
- [ ] Test all input types (text, email, number, time, textarea)
- [ ] Verify placeholder text visibility in light mode

### 2.3 Enhance Toggle Switch Styling
**File:** `frontend/src/pages/Settings/Settings.css` (Lines 1087-1119)

```css
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Toggle Switch - Unified Size & State */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

.toggle-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  width: fit-content;
}

.toggle-switch input[type="checkbox"] {
  display: none;
}

.toggle-slider {
  width: 36px;
  height: 20px;
  background: #64748b;
  border-radius: 10px;
  position: relative;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

.toggle-slider::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.toggle-switch input[type="checkbox"]:checked ~ .toggle-slider {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.4);
}

.toggle-switch input[type="checkbox"]:checked ~ .toggle-slider::after {
  transform: translateX(16px);
}

/* Light Mode Toggles */
:root.theme-light .toggle-slider,
[data-theme="light"] .toggle-slider,
body.light-mode .toggle-slider {
  background: #cbd5e1;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}

:root.theme-light .toggle-switch input[type="checkbox"]:checked ~ .toggle-slider,
[data-theme="light"] .toggle-switch input[type="checkbox"]:checked ~ .toggle-slider,
body.light-mode .toggle-switch input[type="checkbox"]:checked ~ .toggle-slider {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}
```

**Actions:**
- [ ] Increase toggle size for better touch targets
- [ ] Enhance animation smoothness
- [ ] Test accessibility with keyboard navigation
- [ ] Add focus indicators for keyboard users

---

## Improvement Plan - Phase 3: Cross-Portal Consistency (Medium Priority)

### 3.1 Create Shared Settings Theme File
**New File:** `frontend/src/styles/settings-theme.css`

This file will be imported by all three portal settings pages (Trainer, Member, Owner):

```css
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Shared Settings Theme - All Portals */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

:root {
  --settings-section-accent-profile: #3b82f6;
  --settings-section-accent-specialization: #10b981;
  --settings-section-accent-availability: #06b6d4;
  --settings-section-accent-preferences: #8b5cf6;
  --settings-section-accent-appearance: #a855f7;
  --settings-section-accent-notifications: #f97316;
  --settings-section-accent-security: #ef4444;
  --settings-section-accent-billing: #f59e0b;
  --settings-section-accent-reports: #14b8a6;
}

/* Apply consistent typography across all portals */
.settings-page * {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
}

/* Ensure consistent section styling */
.settings-section {
  --section-accent: var(--settings-section-accent-profile, #3b82f6);
}

.settings-section[data-section="specialization"] {
  --section-accent: var(--settings-section-accent-specialization);
}

.settings-section[data-section="availability"] {
  --section-accent: var(--settings-section-accent-availability);
}

/* ... etc */
```

**Actions:**
- [ ] Create shared CSS file
- [ ] Import in all three settings pages
- [ ] Verify visual consistency
- [ ] Document color assignments

### 3.2 Create Settings Component Library
**New File:** `frontend/src/components/Settings/SettingsSection.tsx`

Componentize reusable settings patterns:

```tsx
interface SettingsSectionProps {
  title: string
  description: string
  icon: React.ComponentType<any>
  accentColor: string
  onSave?: () => Promise<void>
  isSaving?: boolean
  children: React.ReactNode
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  icon: Icon,
  accentColor,
  onSave,
  isSaving,
  children
}) => {
  // Standardized section rendering
}
```

**Actions:**
- [ ] Create reusable components
- [ ] Reduce code duplication
- [ ] Ensure consistent styling across portals
- [ ] Document component API

---

## Improvement Plan - Phase 4: Responsive Design (Medium Priority)

### 4.1 Mobile Layout Adjustments
**File:** `frontend/src/pages/Settings/Settings.css` (Lines 1952-1972)

```css
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .settings-layout {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .settings-sidebar {
    flex-direction: row;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 8px;
  }
  
  .settings-nav-item {
    flex-shrink: 0;
    width: auto;
    white-space: nowrap;
  }
  
  .settings-section__content {
    padding: 12px;
  }
  
  .field-wrapper {
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .settings-section__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .settings-section__actions {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .settings-btn {
    flex: 1;
    min-width: 100%;
  }
}
```

**Actions:**
- [ ] Test on mobile devices (iPhone, Android)
- [ ] Ensure touch targets are at least 44px
- [ ] Verify form inputs are easily tappable
- [ ] Test keyboard navigation on mobile

---

## Improvement Plan - Phase 5: Accessibility (High Priority)

### 5.1 WCAG AA Compliance Checklist
- [ ] All text has sufficient contrast ratio (4.5:1 for body, 3:1 for large text)
- [ ] Focus indicators are visible and clear (2px minimum)
- [ ] All interactive elements are keyboard accessible
- [ ] Form labels are properly associated with inputs
- [ ] Error messages are linked to form fields
- [ ] Color is not the only indicator of state
- [ ] Animations respect `prefers-reduced-motion`

### 5.2 Color Contrast Validation
**Tool:** Use WCAG Contrast Checker (https://webaim.org/resources/contrastchecker/)

Test the following combinations:
- [ ] Text on primary background
- [ ] Text on secondary background
- [ ] Form inputs on all backgrounds
- [ ] Button text on button backgrounds
- [ ] Labels on section backgrounds

---

## API Error Resolution

### Root Cause: Endpoint Mismatch

The current error messages suggest API endpoints are not matching backend routes. Here are the suspected issues:

| Current Request | Expected Endpoint | Status |
|-----------------|-------------------|--------|
| `PUT /api/trainer/profile` | Should match backend route | ❌ Verify |
| `PUT /api/trainer/settings/notifications` | Check exact path | ❌ Verify |
| `PUT /api/trainer/settings/availability` | Check exact path | ❌ Verify |
| `PUT /api/trainer/settings/client-preferences` | Check exact path | ❌ Verify |

### Solution

1. **Verify Backend Routes**
   - Check `backend/src/routes/trainer.routes.ts` or similar
   - Confirm all endpoints exist and have correct HTTP methods
   - Verify request body expectations

2. **Add Request Logging**
   - Log request body before sending
   - Log response status and data
   - Add request ID for tracing

3. **Improve Error Handling**
   ```tsx
   catch (error: any) {
     const status = error?.response?.status
     const message = error?.response?.data?.message
     console.error(`[${status}] Profile update error:`, message, error)
     toast.error(message || "Failed to update profile")
   }
   ```

4. **Add Network Retry Logic**
   ```tsx
   const retryRequest = async (fn: () => Promise<any>, attempts = 3) => {
     for (let i = 0; i < attempts; i++) {
       try {
         return await fn()
       } catch (error: any) {
         if (i === attempts - 1) throw error
         await new Promise(r => setTimeout(r, 1000 * (i + 1)))
       }
     }
   }
   ```

---

## Implementation Timeline

### Week 1: Critical Fixes
- [ ] **Day 1-2**: Fix API errors, add error logging
- [ ] **Day 2-3**: Implement typography system
- [ ] **Day 3-4**: Add light mode palette
- [ ] **Day 4-5**: Standardize buttons and forms
- [ ] **Day 5**: Testing and validation

### Week 2: UI Refinement
- [ ] **Day 1-2**: Enhance form group styling
- [ ] **Day 2-3**: Improve field styling
- [ ] **Day 3-4**: Fix toggle switches
- [ ] **Day 4-5**: Light mode comprehensive testing

### Week 3: Polish & Testing
- [ ] **Day 1-2**: Mobile responsive testing
- [ ] **Day 2-3**: Accessibility audit (WCAG AA)
- [ ] **Day 3-4**: Cross-browser testing
- [ ] **Day 4-5**: Performance optimization

### Week 4: Cross-Portal Consistency
- [ ] **Day 1-2**: Create shared settings theme
- [ ] **Day 2-3**: Build settings component library
- [ ] **Day 3-4**: Apply to all three portals
- [ ] **Day 4-5**: Final testing and deployment

---

## Success Criteria

✅ All API errors resolved with detailed error logging  
✅ Consistent typography across all sections (visible hierarchy)  
✅ Complete light mode support with WCAG AA contrast  
✅ Uniform button styling with clear states  
✅ Form fields visibly separated with distinct backgrounds  
✅ Mobile responsive with proper touch targets  
✅ All three portals (Trainer, Member, Owner) visually consistent  
✅ Accessibility audit passes WCAG AA standards  
✅ No visual blending between sections  
✅ User can clearly identify and interact with all controls

---

## Rollback Plan

If critical issues arise during implementation:

1. **Quick Revert**: Maintain original CSS in version control
2. **Feature Flags**: Use CSS classes to toggle new styles
3. **A/B Testing**: Deploy to percentage of users initially
4. **Fallback**: Keep old styles available as `.settings-legacy` class

---

## Appendix A: CSS Color Reference

### Dark Mode (Default)
```
Primary: #ffffff (text)
Secondary: #a0a0a0 (text)
Tertiary: #666666 (text)
Background: #0a0a0a
Card: #141414
Border: #1a1a1a
```

### Light Mode
```
Primary: #0f172a (text)
Secondary: #334155 (text)
Tertiary: #64748b (text)
Background: #f8fafc
Card: #ffffff
Border: #cbd5e1
```

---

## Appendix B: Typography Reference

| Usage | Size | Weight | Line Height |
|-------|------|--------|-------------|
| Page Title | 20px | 700 | 1.2 |
| Section Title | 16px | 600 | 1.3 |
| Subsection | 14px | 600 | 1.4 |
| Body Text | 13px | 400 | 1.5 |
| Label | 12px | 600 | 1.4 |
| Small Text | 11px | 500 | 1.5 |
| Tiny Text | 10px | 600 | 1.3 |

---

## Appendix C: Spacing System

All spacing uses 8px base unit:

| Size | Value | Usage |
|------|-------|-------|
| xs | 4px | Icon spacing, tight gaps |
| sm | 8px | Field gaps, small padding |
| md | 16px | Section padding, standard margins |
| lg | 24px | Large section gaps |
| xl | 32px | Page padding |
| 2xl | 48px | Major section spacing |

---

## Document Approval

- **Prepared by**: AI Assistant
- **Date**: March 31, 2026
- **Status**: Ready for Implementation
- **Next Review**: After Phase 1 Completion

