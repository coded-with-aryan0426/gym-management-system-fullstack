# Dashboard Component Implementation Guide

Step-by-step guide for implementing and maintaining dashboard components.

## Quick Start

### 1. Import CSS Files

Always import dashboard CSS in this order:

```typescript
import '../../styles/dashboard/dashboard-core.css';
import '../../styles/dashboard/dashboard-trainers.css'; // or dashboard-members.css
```

### 2. Use BEM Naming Convention

**Block__Element--Modifier**

```html
<!-- Good -->
<div class="dash-trainer__card">
  <h3 class="dash-trainer__card__title">Title</h3>
  <button class="dash-trainer__btn dash-trainer__btn--primary">Action</button>
</div>

<!-- Avoid -->
<div class="trainer-card">
  <h3 class="title">Title</h3>
  <button class="btn primary">Action</button>
</div>
```

### 3. Apply Spacing Using Variables

```typescript
// Good - Uses spacing scale
style={{ padding: 'var(--dash-space-4)', gap: 'var(--dash-space-3)' }}

// Avoid - Hardcoded values
style={{ padding: '16px', gap: '12px' }}
```

---

## Common Components

### Card Component

```typescript
<div className="dash__card" role="article">
  <div className="dash__card__head">
    <div className="dash__card__icon dash__card__icon--blue" aria-hidden="true">
      <Icon size={24} />
    </div>
    <h3 className="dash__card__title">Card Title</h3>
  </div>
  <div className="dash__card__body">
    {/* Content */}
  </div>
</div>
```

**Accessibility**:
- Use semantic HTML roles
- Hide decorative icons with `aria-hidden="true"`
- Add descriptive titles

**Responsive**:
- Cards auto-stack on mobile
- Padding reduces on small screens
- Text sizes scale appropriately

### KPI Card (Trainer)

```typescript
<motion.div
  className="dash-trainer__kpi dash-trainer__kpi--blue"
  role="article"
  aria-label={`${label}: ${value}`}
  tabIndex={0}
>
  <div className="dash-trainer__kpi__header">
    <div className="dash-trainer__kpi__icon dash-trainer__kpi__icon--blue" aria-hidden="true">
      <Icon size={20} />
    </div>
    <span className="dash-trainer__kpi__trend dash-trainer__kpi__trend--up">
      <TrendingUp size={12} />
      +25%
    </span>
  </div>
  <div className="dash-trainer__kpi__body">
    <span className="dash-trainer__kpi__value" role="status">{value}</span>
    <span className="dash-trainer__kpi__label">{label}</span>
  </div>
</motion.div>
```

**Animations**:
- Use Framer Motion for smooth transitions
- Stagger delays for multiple cards
- Respect `prefers-reduced-motion`

**Color Variants**:
- `dash-trainer__kpi--blue`
- `dash-trainer__kpi--green`
- `dash-trainer__kpi--violet`
- `dash-trainer__kpi--amber`

### Button Component

```typescript
<button 
  className="dash__btn dash__btn--primary"
  onClick={handleClick}
  aria-label="Descriptive action"
>
  <Icon size={16} />
  Click Me
</button>
```

**Variants**:
- `dash__btn--primary` (Main actions)
- `dash__btn--secondary` (Alternative actions)
- `dash__btn--ghost` (Subtle actions)
- `dash__btn--link` (Inline links)

**Sizes**:
- `dash__btn--sm` (Small buttons)
- (Default) Normal buttons
- `dash__btn--lg` (Large buttons)

### Badge Component

```typescript
<span className="dash__badge dash__badge--success">
  Active
</span>
```

**Variants**:
- `dash__badge--success` (Green)
- `dash__badge--warning` (Amber)
- `dash__badge--error` (Rose)
- `dash__badge--info` (Blue)
- `dash__badge--neutral` (Gray)

---

## Interactive Elements

### Keyboard Navigation

```typescript
<div
  role="button"
  tabIndex={0}
  aria-label="Click to expand"
  onKeyPress={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleAction();
    }
  }}
  onClick={handleAction}
>
  Clickable Content
</div>
```

### Live Regions (Dynamic Updates)

```typescript
<div 
  role="status" 
  aria-live="polite"
  aria-label="New sessions notification"
>
  {sessionCount} new sessions added
</div>
```

### Focus Management

```typescript
// For modal dialogs or modals
const modalRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  modalRef.current?.focus();
}, [isOpen]);

<div 
  ref={modalRef}
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  tabIndex={-1}
>
  <h2 id="modal-title">Modal Title</h2>
</div>
```

---

## Animations & Transitions

### Built-in Animations

```css
/* Fade in */
animation: dash-fade-in var(--dash-duration-normal) var(--dash-ease-out);

/* Slide in */
animation: dash-slide-in var(--dash-duration-normal) var(--dash-ease-out);

/* Spin (Loading) */
animation: dash-spin 1s linear infinite;

/* Pulse */
animation: dash-trainer-pulse 0.4s var(--dash-ease-out);
```

### Framer Motion Integration

```typescript
import { motion } from 'framer-motion';

const VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: delay * 0.1, duration: 0.4 }
  })
};

<motion.div
  initial="hidden"
  animate="visible"
  variants={VARIANTS}
  custom={0}
>
  Animated Content
</motion.div>
```

---

## Responsive Implementation

### Grid System

```typescript
<div className="dash__grid">
  {/* Full width on mobile, half on tablet, third on desktop */}
  <div className="dash__col-12 dash-md:col-6 dash-lg:col-4">
    Content
  </div>
  <div className="dash__col-12 dash-md:col-6 dash-lg:col-4">
    Content
  </div>
  <div className="dash__col-12 dash-md:col-6 dash-lg:col-4">
    Content
  </div>
</div>
```

### Responsive Text

```css
@media (max-width: 768px) {
  .dash-trainer__header__title {
    font-size: var(--dash-fs-xl); /* Smaller on mobile */
  }
}
```

### Conditional Display

```typescript
// Hide on mobile
<div className="dash-md:d-none">
  Desktop only
</div>

// Show only on mobile
<div className="dash-md:d-block">
  Mobile only
</div>
```

---

## Dark & Light Modes

### Color Variables

```css
/* Automatically switches based on system preference */
:root {
  --dash-bg-page: #060609; /* Dark mode */
  --dash-text: #f0f0f8;
}

@media (prefers-color-scheme: light) {
  :root {
    --dash-bg-page: #f5f5f9; /* Light mode */
    --dash-text: #111827;
  }
}
```

### Manual Theme Toggle

```typescript
const toggleTheme = () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
};
```

---

## Performance Optimization

### Image Loading

```typescript
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('./HeavyChart'));

<Suspense fallback={<div className="dash__skeleton" />}>
  <HeavyChart />
</Suspense>
```

### Memoization

```typescript
const MemoizedCard = React.memo(({ data }) => (
  <div className="dash__card">
    {data.title}
  </div>
));
```

### CSS Classes Over Inline Styles

```typescript
// Good - Uses CSS classes
<div className="dash-trainer__kpi dash-trainer__kpi--blue">

// Avoid - Inline styles
<div style={{ 
  background: '#3B82F6', 
  padding: '16px',
  borderRadius: '12px'
}}>
```

---

## Testing Components

### Accessibility Testing

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('KPI card is keyboard accessible', async () => {
  const { container } = render(<KPICard />);
  
  // Test tab navigation
  const card = container.querySelector('[role="article"]');
  card?.focus();
  expect(document.activeElement).toBe(card);
});
```

### Responsive Testing

```typescript
test('displays correctly on mobile', () => {
  render(<TrainerDashboard />);
  
  // Mock viewport
  global.innerWidth = 375;
  
  expect(screen.getByRole('heading')).toHaveClass('dash-trainer__header__title');
});
```

---

## Common Patterns

### Loading State

```typescript
if (loading) {
  return (
    <div className="dash dash--trainer">
      <div className="dash-skeleton__header" />
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="dash-skeleton__card" />
      ))}
    </div>
  );
}
```

### Empty State

```typescript
<div className="dash__empty">
  <div className="dash__empty__icon dash__empty__icon--blue" aria-hidden="true">
    <AlertCircle size={42} />
  </div>
  <h3 className="dash__empty__title">No Data Available</h3>
  <p className="dash__empty__hint">Create your first item to get started</p>
  <button className="dash__btn dash__btn--primary">Create</button>
</div>
```

### Data Grid

```typescript
<div className="dash__list">
  {items.map((item) => (
    <div key={item.id} className="dash__list-item">
      <div className="dash__list-item__avatar" aria-hidden="true">
        {item.initials}
      </div>
      <div className="dash__list-item__content">
        <div className="dash__list-item__title">{item.name}</div>
        <div className="dash__list-item__meta">{item.meta}</div>
      </div>
      <div className="dash__list-item__action">
        {/* Actions */}
      </div>
    </div>
  ))}
</div>
```

---

## Troubleshooting

### Styles Not Applied

1. ✅ Check CSS file imports (order matters)
2. ✅ Verify BEM class names match CSS
3. ✅ Clear browser cache
4. ✅ Check for CSS specificity conflicts

### Animations Jittery

1. ✅ Add `will-change` to CSS class
2. ✅ Use `translate` instead of `left/top`
3. ✅ Check for `prefers-reduced-motion`
4. ✅ Reduce animation complexity

### Accessibility Issues

1. ✅ Add semantic HTML roles
2. ✅ Include `aria-label` for interactive elements
3. ✅ Test with screen reader
4. ✅ Verify color contrast (use WebAIM)

### Responsive Issues

1. ✅ Mobile-first: start with mobile styles
2. ✅ Use `min-width` media queries
3. ✅ Test on actual devices
4. ✅ Check viewport meta tag

---

## Resources

- [Design System Documentation](./DESIGN_SYSTEM.md)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Accessibility Guidelines](https://www.wcag.org/)
- [CSS Variables Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

