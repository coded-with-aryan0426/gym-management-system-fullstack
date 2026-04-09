# AthlonX Dashboard Design System v1.0

Professional UI/UX standards for gym management platform dashboards.

## 📋 Table of Contents

1. [Design Tokens](#design-tokens)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Accessibility](#accessibility)
7. [Responsive Design](#responsive-design)
8. [Implementation Guidelines](#implementation-guidelines)

---

## Design Tokens

### Token Categories

All design tokens are defined as CSS custom properties in `src/styles/variables.css` and dashboard-specific tokens in `src/styles/dashboard/dashboard-core.css`.

#### Color System

**Dark Mode (Default)**
- `--dash-bg-page`: #060609 (Page background)
- `--dash-bg-card`: #0f0f18 (Card/Panel background)
- `--dash-border`: rgba(255, 255, 255, 0.07) (Primary border)
- `--dash-text`: #f0f0f8 (Primary text)
- `--dash-text-secondary`: rgba(255, 255, 255, 0.72) (Secondary text)

**Light Mode**
- `--dash-bg-page`: #f5f5f9
- `--dash-bg-card`: rgba(255, 255, 255, 0.98)
- `--dash-border`: rgba(0, 0, 0, 0.08)
- `--dash-text`: #111827

#### Brand Colors

- **Primary (Crimson)**: #DC2626 with hover state #B91C1C
- **Blue**: #3B82F6 (Info, charts)
- **Green**: #10B981 (Success, positive metrics)
- **Violet**: #8B5CF6 (Secondary accent)
- **Amber**: #F59E0B (Warning, pending)
- **Rose**: #F43F5E (Error, negative)
- **Cyan**: #06B6D4 (Highlight)

---

## Color Palette

### Semantic Colors

| Purpose | Color | Usage |
|---------|-------|-------|
| Success | Green (#10B981) | Completed sessions, positive trends |
| Warning | Amber (#F59E0B) | Pending actions, alerts |
| Error | Rose (#F43F5E) | Failed actions, negative metrics |
| Info | Blue (#3B82F6) | Information, neutral actions |
| Primary | Crimson (#DC2626) | Primary actions, main branding |

### Usage Guidelines

- **Primary Actions**: Use Crimson (#DC2626) for main call-to-action buttons
- **Data Visualization**: Use distinct colors (Blue, Green, Violet) for chart series
- **Status Indicators**: 
  - Completed/Active = Green
  - In Progress = Blue or Cyan
  - Pending = Amber
  - Failed = Rose

---

## Typography

### Font Family
```css
--dash-font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--dash-font-mono: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
```

### Font Sizes (Base: 1rem = 16px)

| Class | Size | Usage |
|-------|------|-------|
| `--dash-fs-xs` | 0.625rem (10px) | Labels, badges |
| `--dash-fs-sm` | 0.75rem (12px) | Secondary text |
| `--dash-fs-base` | 0.875rem (14px) | Body text |
| `--dash-fs-md` | 1rem (16px) | Normal text |
| `--dash-fs-lg` | 1.125rem (18px) | Subheadings |
| `--dash-fs-xl` | 1.25rem (20px) | Card titles |
| `--dash-fs-2xl` | 1.5rem (24px) | Section headers |
| `--dash-fs-3xl` | 1.875rem (30px) | Page titles |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Normal | 400 | Body text |
| Medium | 500 | Labels |
| Semibold | 600 | Headings, emphasis |
| Bold | 700 | Card titles |
| Extrabold | 800 | KPI values |

### Line Heights

- **Tight**: 1.2 (Headings)
- **Normal**: 1.5 (Body text)
- **Relaxed**: 1.75 (Descriptions)

---

## Spacing & Layout

### Spacing Scale (Base Unit: 4px)

```css
--dash-space-1: 0.25rem (4px)
--dash-space-2: 0.5rem (8px)
--dash-space-3: 0.75rem (12px)
--dash-space-4: 1rem (16px)
--dash-space-5: 1.25rem (20px)
--dash-space-6: 1.5rem (24px)
--dash-space-8: 2rem (32px)
--dash-space-10: 2.5rem (40px)
--dash-space-12: 3rem (48px)
```

### Layout Patterns

**Page Padding**
- Desktop: 24px (`--dash-space-6`)
- Mobile: 16px (`--dash-space-4`)

**Component Spacing**
- Card padding: 16px
- Section gap: 20px
- Grid gap: 8px

**12-Column Grid System**
```html
<div class="dash__grid">
  <div class="dash__col-6">Half width</div>
  <div class="dash__col-6">Half width</div>
</div>
```

---

## Components

### Card Component

```html
<div class="dash__card">
  <div class="dash__card__head">
    <div class="dash__card__icon dash__card__icon--blue">
      <Icon size={24} />
    </div>
    <h3 class="dash__card__title">Card Title</h3>
  </div>
  <div class="dash__card__body">
    <!-- Content -->
  </div>
</div>
```

**Modifiers**:
- `.dash__card--active`: Active/focused state
- `.dash__card--animated`: Fade-in animation

### KPI Card Component

```html
<div class="dash__kpi dash__kpi--blue">
  <div class="dash__kpi__header">
    <div class="dash__kpi__icon dash__kpi__icon--blue">
      <Icon size={20} />
    </div>
    <span class="dash__kpi__trend dash__kpi__trend--up">
      <TrendingUp size={12} />
      +25%
    </span>
  </div>
  <div class="dash__kpi__body">
    <span class="dash__kpi__value">4,250</span>
    <span class="dash__kpi__label">Active Members</span>
  </div>
</div>
```

**Color Variants**: `--blue`, `--green`, `--violet`, `--amber`, `--rose`, `--cyan`

### Button Component

```html
<!-- Primary -->
<button class="dash__btn dash__btn--primary">Save Changes</button>

<!-- Secondary -->
<button class="dash__btn dash__btn--secondary">Cancel</button>

<!-- Ghost -->
<button class="dash__btn dash__btn--ghost">Learn More</button>

<!-- Sizes -->
<button class="dash__btn dash__btn--sm">Small</button>
<button class="dash__btn dash__btn--lg">Large</button>
```

### Badge Component

```html
<span class="dash__badge dash__badge--success">Active</span>
<span class="dash__badge dash__badge--warning">Pending</span>
<span class="dash__badge dash__badge--error">Failed</span>
<span class="dash__badge dash__badge--info">Info</span>
```

### Progress Bar Component

```html
<div class="dash__progress">
  <div class="dash__progress__bar">
    <div class="dash__progress__fill dash__progress__fill--green" style="width: 75%"></div>
  </div>
  <div class="dash__progress__label">
    <span>Progress</span>
    <span>75%</span>
  </div>
</div>
```

---

## Accessibility

### WCAG 2.1 AA Compliance

All components meet WCAG 2.1 Level AA accessibility standards.

### Color Contrast Ratios

- **Primary text on background**: 7:1 (Exceeds AAA)
- **Secondary text**: 4.5:1 (Meets AA)
- **UI components**: 3:1 (Meets AA)

### Keyboard Navigation

All interactive elements are keyboard accessible:

```html
<div 
  role="button"
  tabIndex={0}
  aria-label="Click to view details"
  onKeyPress={(e) => {
    if (e.key === 'Enter') {
      // Handle action
    }
  }}
>
  Clickable Element
</div>
```

### ARIA Attributes

**Live Regions**:
```html
<div role="status" aria-live="polite" aria-label="Updates">
  New session added
</div>
```

**Semantic Structure**:
```html
<section aria-label="Key Performance Indicators">
  <article role="article" aria-label="Today's earnings: ₹150">
    <!-- KPI content -->
  </article>
</section>
```

**Focus States**:
```css
.dash__card:focus-visible {
  outline: 2px solid var(--dash-border-focus);
  outline-offset: 2px;
}
```

### High Contrast Mode Support

Automatically activated when `prefers-contrast: more`:
- Increased text opacity
- Thicker borders
- Bolder fonts

### Reduced Motion Support

Respects `prefers-reduced-motion: reduce`:
- Animations disabled
- Transitions minimized
- Scroll behavior unchanged

---

## Responsive Design

### Breakpoints

| Breakpoint | Width | Device |
|------------|-------|--------|
| xs | 320px | Mobile small |
| sm | 480px | Mobile large |
| md | 768px | Tablet |
| lg | 1024px | Desktop small |
| xl | 1280px | Desktop |
| 2xl | 1440px | Desktop large |

### Mobile-First Approach

```css
/* Base styles (Mobile) */
.dash-trainer__layout {
  grid-template-columns: 1fr;
}

/* Tablet and up */
@media (min-width: 768px) {
  .dash-trainer__layout {
    grid-template-columns: 1fr 300px;
  }
}
```

### Touch Device Optimizations

```css
@media (hover: none) {
  /* Remove hover effects on touch devices */
  .dash__card:hover {
    transform: none;
  }
}
```

### Responsive Grid Classes

```html
<!-- Responsive column spans -->
<div class="dash__grid">
  <div class="dash__col-12 dash-md:col-6 dash-lg:col-4">
    Full width on mobile, half on tablet, third on desktop
  </div>
</div>
```

---

## Implementation Guidelines

### Component Implementation Pattern

1. **Import CSS Files** (in order):
```javascript
import '../../styles/dashboard/dashboard-core.css';
import '../../styles/dashboard/dashboard-trainers.css';
```

2. **Structure with BEM Naming**:
```html
<div class="dash-trainer__container">
  <div class="dash-trainer__header">
    <h1 class="dash-trainer__header__title">Title</h1>
  </div>
</div>
```

3. **Apply Semantic HTML**:
```html
<section aria-label="Dashboard Section">
  <h2>Section Title</h2>
  <article role="article">Content</article>
</section>
```

4. **Add Interactive States**:
```html
<div 
  class="dash__card"
  tabIndex={0}
  role="button"
  aria-label="Description"
>
  Content
</div>
```

### Best Practices

#### Color Usage
- ✅ Use semantic colors (Success = Green, Error = Rose)
- ✅ Provide alternative indicators beyond color (icons, text)
- ✅ Test contrast ratios with accessibility tools
- ❌ Don't rely on color alone for information

#### Spacing
- ✅ Use spacing scale variables (`--dash-space-*`)
- ✅ Maintain consistent gaps between related items
- ✅ Use `gap` property instead of margins
- ❌ Don't use arbitrary pixel values

#### Typography
- ✅ Use semantic font sizes (sm, md, lg, xl)
- ✅ Maintain line-height for readability (1.5 for body)
- ✅ Use font-weight hierarchy for emphasis
- ❌ Don't exceed 2-3 font sizes on a single page

#### Components
- ✅ Use existing dashboard components
- ✅ Apply consistent styling through CSS classes
- ✅ Include ARIA labels for accessibility
- ❌ Don't create new components if existing ones exist

### Animation Guidelines

**Use Cases**:
- Page load: Slide-in animations (150-200ms)
- Hover effects: Scale/color transitions (150ms)
- Status changes: Fade transitions (200ms)

**Implementation**:
```css
/* Slide in animation */
@keyframes dash-slide-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dash__card--animated {
  animation: dash-slide-in var(--dash-duration-normal) var(--dash-ease-out);
}
```

### Dark Mode Implementation

```javascript
// Automatic based on system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Manual toggle
document.documentElement.setAttribute('data-theme', 'light');
```

---

## Trainer Dashboard Specific

### Layout Structure

```
┌─────────────────────────────────────┐
│ Header (Welcome + Date/Time)         │
├─────────────────────────────────────┤
│ KPI Grid (4 columns)                 │
├────────────────────┬─────────────────┤
│                    │                 │
│ Main Content       │ Sidebar         │
│ (Schedule + Charts)│ (Actions)       │
│                    │                 │
└────────────────────┴─────────────────┘
```

### Responsive Behavior

- **Desktop (1440px+)**: Full 4-column KPI grid, 2-column layout
- **Tablet (768px-1023px)**: 2-column KPI grid, stacked layout
- **Mobile (< 768px)**: Single-column everything, optimized spacing

### KPI Animation Sequence

KPI cards animate on load with staggered timing:
```
Card 1: 0ms
Card 2: 50ms
Card 3: 100ms
Card 4: 150ms
```

---

## Testing Checklist

- [ ] Visual design matches mockups
- [ ] Components render correctly on all breakpoints
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader announces all interactive elements
- [ ] Colors have sufficient contrast (7:1 for text)
- [ ] Animations respect prefers-reduced-motion
- [ ] Touch targets are minimum 44x44px
- [ ] Responsive images load efficiently
- [ ] No console errors or warnings
- [ ] Performance: Lighthouse score > 90

---

## Resources

- **Design Tokens**: `src/styles/variables.css`
- **Dashboard Core**: `src/styles/dashboard/dashboard-core.css`
- **Trainer Dashboard**: `src/styles/dashboard/dashboard-trainers.css`
- **Accessibility**: WCAG 2.1 AA, ARIA Authoring Practices
- **Typography**: Inter font family (system fallbacks)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-31 | Initial release with comprehensive design system |

---

## Support

For design system questions or updates:
1. Review this document and existing components
2. Check `dashboard-core.css` for available tokens
3. Test components against accessibility guidelines
4. Submit design improvements as pull requests

