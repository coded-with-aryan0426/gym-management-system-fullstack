# AthlonX Dashboard CSS Architecture

## Overview

This document describes the unified CSS framework for AthlonX dashboards, providing consistent styling across owner, trainer, and member portals while allowing role-specific customization.

## File Structure

```
frontend/src/styles/dashboard/
├── dashboard-core.css       # Master framework (~35KB)
├── dashboard-owners.css     # Owner extensions (~23KB)
├── dashboard-trainers.css   # Trainer extensions (~16KB)
└── dashboard-members.css    # Member extensions (~18KB)
```

## Design Tokens

All design tokens use CSS custom properties with the `--dash-` prefix for easy identification and theming.

### Colors

```css
/* Brand Colors */
--dash-brand-primary: #DC2626;        /* AthlonX Crimson */
--dash-brand-primary-hover: #B91C1C;
--dash-brand-primary-light: rgba(220, 38, 38, 0.12);

/* Accent Palette */
--dash-blue: #3B82F6;
--dash-green: #10B981;
--dash-violet: #8B5CF6;
--dash-amber: #F59E0B;
--dash-rose: #F43F5E;
--dash-cyan: #06B6D4;
--dash-indigo: #6366F1;
--dash-teal: #14B8A6;

/* Surfaces (Dark Mode Default) */
--dash-bg-page: #060609;
--dash-bg-elevated: #0a0a10;
--dash-bg-card: #0f0f18;
--dash-bg-card-hover: #141420;

/* Text Hierarchy */
--dash-text: #f0f0f5;
--dash-text-secondary: #94949f;
--dash-text-tertiary: #6b6b75;
--dash-text-muted: #4a4a52;
```

### Typography Scale

```css
--dash-fs-xs: 0.6875rem;   /* 11px */
--dash-fs-sm: 0.8125rem;   /* 13px */
--dash-fs-base: 0.9375rem; /* 15px */
--dash-fs-md: 1rem;        /* 16px */
--dash-fs-lg: 1.125rem;    /* 18px */
--dash-fs-xl: 1.25rem;     /* 20px */
--dash-fs-2xl: 1.5rem;     /* 24px */
--dash-fs-3xl: 1.875rem;   /* 30px */
```

### Spacing Scale (4px base)

```css
--dash-space-1: 4px;
--dash-space-2: 8px;
--dash-space-3: 12px;
--dash-space-4: 16px;
--dash-space-5: 20px;
--dash-space-6: 24px;
--dash-space-8: 32px;
--dash-space-10: 40px;
--dash-space-12: 48px;
```

## BEM Naming Convention

All classes follow BEM methodology with the `dash-` prefix:

```
.dash-{block}__{element}--{modifier}
```

### Examples

```css
.dash-card                    /* Block */
.dash-card__header            /* Element */
.dash-card--elevated          /* Modifier */
.dash-trainer__kpi--sessions  /* Role-specific */
```

## Core Components

### 1. Cards (`.dash-card`)

```html
<div class="dash-card">
  <div class="dash-card__header">
    <h3 class="dash-card__title">Title</h3>
    <span class="dash-badge dash-badge--success">Active</span>
  </div>
  <div class="dash-card__body">
    Content here
  </div>
</div>
```

Modifiers:
- `.dash-card--elevated` - Higher elevation with shadow
- `.dash-card--interactive` - Hover effects
- `.dash-card--bordered` - Visible border

### 2. KPI Cards (`.dash-kpi`)

```html
<div class="dash-kpi">
  <div class="dash-kpi__header">
    <div class="dash-kpi__icon dash-kpi__icon--blue">
      <svg>...</svg>
    </div>
    <span class="dash-kpi__trend dash-kpi__trend--up">
      +12%
    </span>
  </div>
  <div class="dash-kpi__body">
    <span class="dash-kpi__value">$12,450</span>
    <span class="dash-kpi__label">Revenue</span>
  </div>
</div>
```

### 3. Badges (`.dash-badge`)

```html
<span class="dash-badge dash-badge--success">Active</span>
<span class="dash-badge dash-badge--warning">Pending</span>
<span class="dash-badge dash-badge--danger">Expired</span>
<span class="dash-badge dash-badge--primary">New</span>
```

### 4. Buttons (`.dash-btn`)

```html
<button class="dash-btn dash-btn--primary">Primary</button>
<button class="dash-btn dash-btn--secondary">Secondary</button>
<button class="dash-btn dash-btn--ghost">Ghost</button>
<button class="dash-btn dash-btn--sm">Small</button>
```

### 5. Lists (`.dash-list`)

```html
<ul class="dash-list">
  <li class="dash-list__item">
    <div class="dash-list__avatar">JD</div>
    <div class="dash-list__content">
      <span class="dash-list__title">John Doe</span>
      <span class="dash-list__subtitle">Member since 2024</span>
    </div>
  </li>
</ul>
```

## Grid System

### 12-Column Grid

```html
<div class="dash-grid">
  <div class="dash-col-6">Half width</div>
  <div class="dash-col-6">Half width</div>
</div>
```

### Responsive Rows

```html
<div class="dash-row dash-row--2">
  <!-- Two equal columns -->
</div>

<div class="dash-row dash-row--3">
  <!-- Three equal columns -->
</div>
```

## Fixed-Height Card System

To maintain consistent dashboard layouts, cards have fixed heights:

```css
/* Owner Dashboard */
.dash__finance-card { height: 320px; }
.dash__members-card { height: 280px; }

/* Trainer Dashboard */
.dash-trainer__card--schedule { height: 400px; }
.dash-trainer__card--clients { height: 320px; }

/* Member Dashboard */
.dash-member__card--membership { height: 280px; }
.dash-member__card--classes { height: 340px; }
```

### Scrollable Lists

```css
.dash-trainer__schedule__list--scroll,
.dash-member__classes__list--scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: thin;
}
```

## Responsive Breakpoints

```css
/* Mobile first */
@media (min-width: 576px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1440px) { /* 2xl */ }
```

## Utility Classes

### Display
- `.dash-flex`, `.dash-grid`, `.dash-block`, `.dash-hidden`

### Alignment
- `.dash-items-center`, `.dash-justify-between`

### Spacing
- `.dash-gap-2`, `.dash-gap-3`, `.dash-gap-4`
- `.dash-p-2`, `.dash-p-3`, `.dash-p-4`
- `.dash-m-auto`

### Text
- `.dash-text-center`, `.dash-text-right`
- `.dash-text-sm`, `.dash-text-lg`
- `.dash-font-bold`, `.dash-font-semibold`

## Theme Support

### Dark Mode (Default)

The framework defaults to dark mode. Light mode is activated via:

```html
<div class="dash dash--light">
  <!-- Light mode content -->
</div>

<!-- Or via data attribute -->
<div data-theme="light">
  <!-- Light mode content -->
</div>
```

### Role-Specific Themes

Each dashboard role has its own theme modifier:

```html
<div class="dash dash--owner">   <!-- Owner portal -->
<div class="dash dash--trainer"> <!-- Trainer portal -->
<div class="dash dash--member">  <!-- Member portal -->
```

## Usage Examples

### Importing CSS

```tsx
// TrainerDashboard.tsx
import '../../styles/dashboard/dashboard-core.css';
import '../../styles/dashboard/dashboard-trainers.css';
import './TrainerDashboard.css'; // Local overrides

// MemberDashboard.tsx
import '../../styles/dashboard/dashboard-core.css';
import '../../styles/dashboard/dashboard-members.css';
import './MemberDashboard.css'; // Local overrides
```

### Complete Dashboard Example

```tsx
<div className="dash dash--trainer">
  {/* Header */}
  <header className="dash-trainer__header">
    <h1 className="dash-trainer__header__title">
      Good Morning, <span style={{ color: 'var(--dash-brand-primary)' }}>John</span>
    </h1>
  </header>

  {/* KPI Grid */}
  <section className="dash-trainer__kpi-grid">
    <div className="dash-trainer__kpi dash-trainer__kpi--sessions">
      {/* KPI content */}
    </div>
  </section>

  {/* Main Layout */}
  <div className="dash-trainer__layout">
    <div className="dash-trainer__main">
      {/* Main content cards */}
    </div>
    <div className="dash-trainer__sidebar">
      {/* Sidebar cards */}
    </div>
  </div>
</div>
```

## Performance Considerations

1. **CSS Splitting**: Import only role-specific CSS (core + role file)
2. **Critical CSS**: Core layout/typography loads first
3. **File Size Budget**:
   - dashboard-core.css: ~35KB
   - Role-specific: ~15-20KB each
4. **Lazy Loading**: Non-critical animations load async

## Accessibility

- All color combinations meet WCAG 2.1 AA contrast ratios
- Focus indicators use `--dash-focus-ring` variable
- Touch targets meet 44x44px minimum
- Keyboard navigation supported for all interactive elements

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Migration Guide

### From Old Owner Dashboard

Replace:
```css
.dash__card → .dash-card
.dash__header → .dash-card__header
--bg-card → --dash-bg-card
```

### From Old Trainer Theme

Replace:
```css
.t-* classes → .dash-trainer__*
--t-* vars → --dash-*
```

### From Old Member Theme

Replace:
```css
--macos-* vars → --dash-*
.member-* classes → .dash-member__*
```
