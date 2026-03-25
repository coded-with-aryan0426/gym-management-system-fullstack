# SuperAdmin Component Library

**Production-ready, reusable components for the SuperAdmin interface.**

All components support dark/light mode, follow the unified design system, and are optimized for performance and accessibility.

---

## 📦 Components Overview

### Core Display Components
- **StatCard** - Compact metric display with trend indicators
- **MetricGrid** - Responsive grid for metric displays
- **TrendIndicator** - Up/down arrows with color coding
- **StatusBadge** - Semantic status indicators

### Chart Components
- **ChartCard** - Wrapper for Recharts with consistent styling

### Table Components
- **DataTable** - Enhanced table with sorting, filtering, pagination

### Interaction Components
- **ActionPanel** - Grouped action buttons with tooltips
- **FilterBar** - Unified filtering interface
- **DetailDrawer** - Side panel for drill-down views

### Utility Hooks
- **useResponsive** - Detect breakpoints
- **useDebounce** - Debounce value changes
- **useLocalStorage** - Persist state
- **useToggle** - Boolean toggle
- **useAsync** - Handle async operations
- **useTheme** - Get current theme
- **useChartResize** - Chart responsiveness

---

## 🎨 StatCard

Displays a metric with optional trend indicator, icon, and expandable breakdown.

### Props

```typescript
interface StatCardProps {
    label: string;
    value: string | number;
    change?: number;                    // Percentage change
    icon?: LucideIcon;
    color?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'teal' | 'emerald';
    variant?: 'compact' | 'expanded' | 'minimal';
    breakdown?: Array<{ label: string; value: string; pct?: number }>;
    onClick?: () => void;
    loading?: boolean;
    trend?: 'up' | 'down' | 'neutral';
}
```

### Usage

```tsx
import { StatCard } from '@/components/superadmin/shared';
import { Users } from 'lucide-react';

<StatCard
    label="Total Users"
    value="1,958"
    change={12.5}
    icon={Users}
    color="blue"
    variant="compact"
    breakdown={[
        { label: 'Active', value: '1,650', pct: 84 },
        { label: 'Inactive', value: '308', pct: 16 }
    ]}
/>
```

### Variants

- **compact** (default): Standard size with icon and trend
- **expanded**: Larger with more padding
- **minimal**: Text-only, no background

---

## 📊 MetricGrid

Responsive grid container for metric cards with automatic column adjustment.

### Props

```typescript
interface MetricGridProps {
    children: React.ReactNode;
    columns?: 2 | 3 | 4;               // Default: 3
    gap?: 'sm' | 'md' | 'lg';          // Default: 'md'
    minCardWidth?: string;              // Default: '240px'
    className?: string;
}
```

### Usage

```tsx
import { MetricGrid, StatCard } from '@/components/superadmin/shared';

<MetricGrid columns={3} gap="md">
    <StatCard label="Users" value="1,958" change={12.5} />
    <StatCard label="Gyms" value="247" change={8.2} />
    <StatCard label="Revenue" value="₹2.4M" change={15.3} />
</MetricGrid>
```

---

## 📈 TrendIndicator

Shows trend direction with arrow and percentage.

### Props

```typescript
interface TrendIndicatorProps {
    value: number;                      // Percentage value
    direction?: 'up' | 'down' | 'neutral';
    size?: 'sm' | 'md' | 'lg';         // Default: 'md'
    showIcon?: boolean;                 // Default: true
    showSign?: boolean;                 // Default: true
    suffix?: string;                    // Default: '%'
    className?: string;
}
```

### Usage

```tsx
import { TrendIndicator } from '@/components/superadmin/shared';

<TrendIndicator value={12.5} />        // +12.5% with green up arrow
<TrendIndicator value={-5.2} />        // -5.2% with red down arrow
<TrendIndicator value={0} />           // 0% with neutral dash
```

---

## 🏷️ StatusBadge

Semantic status indicator with icon and label.

### Props

```typescript
type StatusType = 'success' | 'warning' | 'error' | 'info' | 'pending' | 'active' | 'inactive' | 'neutral';

interface StatusBadgeProps {
    status: StatusType;
    label?: string;                     // Override default label
    size?: 'sm' | 'md' | 'lg';         // Default: 'md'
    variant?: 'solid' | 'outline' | 'subtle';  // Default: 'subtle'
    showIcon?: boolean;                 // Default: true
    className?: string;
}
```

### Usage

```tsx
import { StatusBadge } from '@/components/superadmin/shared';

<StatusBadge status="success" />
<StatusBadge status="error" label="Failed" variant="solid" />
<StatusBadge status="pending" size="sm" />
```

---

## 📉 ChartCard

Wrapper for charts with consistent title, subtitle, actions, and loading states.

### Props

```typescript
interface ChartCardProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    children: React.ReactNode;         // Chart component
    actions?: React.ReactNode;         // Action buttons
    variant?: 'default' | 'compact';   // Default: 'default'
    height?: string | number;          // Default: 300px
    loading?: boolean;
    error?: string;
    className?: string;
}
```

### Usage

```tsx
import { ChartCard } from '@/components/superadmin/shared';
import { BarChart3 } from 'lucide-react';
import { AreaChart, Area } from 'recharts';

<ChartCard
    title="User Growth"
    subtitle="Last 6 months"
    icon={BarChart3}
    height={250}
>
    <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
            <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="#3b82f6" />
        </AreaChart>
    </ResponsiveContainer>
</ChartCard>
```

---

## 📋 DataTable

Enhanced table with sorting, pagination, and row selection.

### Props

```typescript
interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: any, row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (row: T, index: number) => void;
    pageSize?: number;                  // Default: 10
    variant?: 'default' | 'compact' | 'minimal';
    loading?: boolean;
    emptyMessage?: string;
    stickyHeader?: boolean;
    striped?: boolean;                  // Default: true
    hoverable?: boolean;                // Default: true
    className?: string;
}
```

### Usage

```tsx
import { DataTable } from '@/components/superadmin/shared';
import { StatusBadge } from '@/components/superadmin/shared';

const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { 
        key: 'status', 
        label: 'Status', 
        align: 'center',
        render: (value) => <StatusBadge status={value} />
    },
];

<DataTable
    data={users}
    columns={columns}
    onRowClick={(user) => console.log(user)}
    pageSize={20}
    variant="compact"
    stickyHeader
/>
```

---

## 🎬 ActionPanel

Grouped action buttons with loading states and variants.

### Props

```typescript
interface ActionButton {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    disabled?: boolean;
    loading?: boolean;
    tooltip?: string;
}

interface ActionPanelProps {
    actions: ActionButton[];
    layout?: 'horizontal' | 'vertical';  // Default: 'horizontal'
    size?: 'sm' | 'md' | 'lg';          // Default: 'md'
    className?: string;
}
```

### Usage

```tsx
import { ActionPanel } from '@/components/superadmin/shared';
import { Download, RefreshCw, Trash2 } from 'lucide-react';

<ActionPanel
    actions={[
        { label: 'Export', icon: Download, onClick: handleExport, variant: 'primary' },
        { label: 'Refresh', icon: RefreshCw, onClick: handleRefresh, variant: 'secondary' },
        { label: 'Delete', icon: Trash2, onClick: handleDelete, variant: 'danger' },
    ]}
    size="md"
/>
```

---

## 🔍 FilterBar

Unified filtering interface with search, selects, and clear all.

### Props

```typescript
interface FilterConfig {
    type: 'search' | 'select' | 'multiselect';
    label: string;
    placeholder?: string;
    options?: Array<{ label: string; value: string }>;
    value: string | string[];
    onChange: (value: string | string[]) => void;
}

interface FilterBarProps {
    filters: FilterConfig[];
    onClear?: () => void;
    variant?: 'default' | 'compact';
    className?: string;
}
```

### Usage

```tsx
import { FilterBar } from '@/components/superadmin/shared';
import { useState } from 'react';

const [search, setSearch] = useState('');
const [role, setRole] = useState('');

<FilterBar
    filters={[
        { 
            type: 'search', 
            label: 'Search', 
            placeholder: 'Search users...', 
            value: search, 
            onChange: setSearch 
        },
        { 
            type: 'select', 
            label: 'Role', 
            value: role, 
            onChange: setRole,
            options: [
                { label: 'Admin', value: 'admin' },
                { label: 'User', value: 'user' }
            ]
        }
    ]}
    onClear={() => { setSearch(''); setRole(''); }}
/>
```

---

## 📂 DetailDrawer

Side panel for drill-down views with tabs and sections.

### Props

```typescript
interface DetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    width?: string;                     // Default: '480px'
    footer?: React.ReactNode;
    className?: string;
}
```

### Usage

```tsx
import { DetailDrawer } from '@/components/superadmin/shared';
import { useState } from 'react';

const [isOpen, setIsOpen] = useState(false);

<DetailDrawer
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    title="User Details"
    subtitle="ID: 12345"
    width="600px"
    footer={
        <button onClick={() => setIsOpen(false)}>Close</button>
    }
>
    <div>User information here...</div>
</DetailDrawer>
```

---

## 🪝 Utility Hooks

### useResponsive

Detect screen size and breakpoints.

```tsx
import { useResponsive } from '@/components/superadmin/shared/hooks';

const { isMobile, isTablet, isDesktop, width } = useResponsive();

if (isMobile) {
    // Show mobile layout
}
```

### useDebounce

Debounce rapidly changing values (e.g., search input).

```tsx
import { useDebounce } from '@/components/superadmin/shared/hooks';

const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 500);

useEffect(() => {
    // API call with debouncedSearch
}, [debouncedSearch]);
```

### useTheme

Get current theme.

```tsx
import { useTheme } from '@/components/superadmin/shared/hooks';

const theme = useTheme();  // 'dark' | 'light' | 'superadmin'
```

---

## 🎨 Design Principles

### Color System
All components use design tokens from `unified-design-system.css`:
- `--accent-blue`, `--accent-green`, `--accent-red`, etc.
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--bg-elevated`
- `--text-primary`, `--text-secondary`, `--text-tertiary`

### Spacing
Follow the 8px grid:
- `--s-1` (4px), `--s-2` (8px), `--s-3` (12px), `--s-4` (16px)
- `--s-5` (20px), `--s-6` (24px), `--s-8` (32px), `--s-10` (40px)

### Typography
- **Headings**: 18px (large), 15px (medium), 13px (small)
- **Body**: 13-14px
- **Labels**: 12px uppercase with 0.5px letter-spacing
- **Small text**: 11px

### Radius
- `--radius-sm` (8px), `--radius-md` (12px), `--radius-lg` (16px)

---

## ✅ Best Practices

1. **Always import from shared index**:
   ```tsx
   import { StatCard, MetricGrid } from '@/components/superadmin/shared';
   ```

2. **Use semantic colors**:
   ```tsx
   <StatCard color="green" />  // Success
   <StatCard color="red" />    // Error
   <StatCard color="blue" />   // Info
   ```

3. **Leverage loading states**:
   ```tsx
   <StatCard loading={isLoading} />
   <DataTable loading={isLoading} />
   ```

4. **Handle empty states**:
   ```tsx
   <DataTable emptyMessage="No users found" />
   ```

5. **Make components responsive**:
   ```tsx
   const { isMobile } = useResponsive();
   <MetricGrid columns={isMobile ? 1 : 3} />
   ```

---

## 🚀 Performance Tips

- **Memoize expensive renders**:
  ```tsx
  const columns = useMemo(() => [...], []);
  ```

- **Debounce search inputs**:
  ```tsx
  const debouncedSearch = useDebounce(search, 300);
  ```

- **Use loading states** to prevent layout shift

- **Lazy load drawer content** until opened

---

## ♿ Accessibility

All components follow WCAG 2.2 AA standards:

- ✅ Proper color contrast ratios
- ✅ Keyboard navigation support
- ✅ ARIA labels where needed
- ✅ Focus indicators
- ✅ Screen reader compatibility

---

## 📝 Contributing

When creating new components:

1. Follow existing patterns and naming conventions
2. Support dark/light mode using CSS variables
3. Include TypeScript types
4. Add loading and error states
5. Document props and usage
6. Test with keyboard navigation
7. Verify WCAG compliance

---

## 📄 License

Internal use only - SuperAdmin Module
