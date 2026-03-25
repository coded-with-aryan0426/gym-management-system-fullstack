/**
 * SuperAdmin Shared Components Library
 * 
 * Reusable, production-ready components for the SuperAdmin interface.
 * All components support dark/light mode and follow the unified design system.
 */

// Core Display Components
export { StatCard } from './StatCard';
export type { StatCardProps } from './StatCard';

export { MetricGrid } from './MetricGrid';
export type { MetricGridProps } from './MetricGrid';

export { TrendIndicator } from './TrendIndicator';
export type { TrendIndicatorProps } from './TrendIndicator';

export { StatusBadge } from './StatusBadge';
export type { StatusBadgeProps, StatusType } from './StatusBadge';

// Chart Components
export { ChartCard } from './ChartCard';
export type { ChartCardProps } from './ChartCard';

// Table Components
export { DataTable } from './DataTable';
export type { DataTableProps, Column } from './DataTable';

// Interaction Components
export { ActionPanel } from './ActionPanel';
export type { ActionPanelProps, ActionButton } from './ActionPanel';

export { FilterBar } from './FilterBar';
export type { FilterBarProps, FilterConfig, FilterOption } from './FilterBar';

export { DetailDrawer } from './DetailDrawer';
export type { DetailDrawerProps } from './DetailDrawer';
