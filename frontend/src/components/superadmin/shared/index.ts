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

export { ConfirmModal } from './ConfirmModal';
export type { ConfirmModalProps, ConfirmModalAction, ConfirmModalVariant } from './ConfirmModal';

export { ActivityStreamTerminal } from './ActivityStreamTerminal';
export type { ActivityEvent, ActivityEventType } from './ActivityStreamTerminal';

export { CommandPalette } from './CommandPalette';
export type { Command, CommandType } from './CommandPalette';

export { ApiLatencyWidget, DbConnectionsWidget, RedisHitRatioWidget } from './TelemetryWidgets';
export type { TelemetryMetric } from './TelemetryWidgets';

export { FeatureFlagsPills } from './FeatureFlagsPills';
export type { FeatureFlag } from './FeatureFlagsPills';

export { ChurnRiskWidget } from './ChurnRiskWidget';
export type { ChurnRiskGym } from './ChurnRiskWidget';

export { GymHealthScore } from './GymHealthScore';

export { RevenueLeakageBadge } from './RevenueLeakageBadge';

export { InlineSparkline } from './InlineSparkline';

export { OwnerActivityStatus } from './OwnerActivityStatus';

export { EngagementBadge } from './EngagementBadge';

export { CrossGymAffiliation } from './CrossGymAffiliation';
export type { GymAffiliation } from './CrossGymAffiliation';

export { GhostAccountsFilter } from './GhostAccountsFilter';
export type { GhostAccount } from './GhostAccountsFilter';

export { ActivityHeatmap } from './ActivityHeatmap';
export type { ActivityDay } from './ActivityHeatmap';

export { RevenueMetricCard } from './RevenueMetricCard';

export { LedgerMismatchAlert } from './LedgerMismatchAlert';

export { GymPayoutLedger } from './GymPayoutLedger';

export { TransactionForensicDrawer } from './TransactionForensicDrawer';
export type { TransactionForensicData, TransactionEvent } from './TransactionForensicDrawer';

export { BlastRadiusIndicator } from './BlastRadiusIndicator';
export type { BlastRadiusData } from './BlastRadiusIndicator';

export { ErrorStackTraceAccordion } from './ErrorStackTraceAccordion';
export type { StackFrame } from './ErrorStackTraceAccordion';

export { RealTimeErrorFeed } from './RealTimeErrorFeed';
export type { RealTimeError, ErrorSeverity } from './RealTimeErrorFeed';

export { ToggleSwitch } from './ToggleSwitch';
export type { ToggleSwitchProps } from './ToggleSwitch';

export { PercentageRolloutSlider } from './PercentageRolloutSlider';
export type { PercentageRolloutSliderProps, RolloutStrategy } from './PercentageRolloutSlider';

export { CriticalFlagConfirmModal } from './CriticalFlagConfirmModal';
export type { CriticalFlagConfirmModalProps } from './CriticalFlagConfirmModal';

export { ImpactCounter } from './ImpactCounter';
export type { ImpactCounterProps } from './ImpactCounter';
