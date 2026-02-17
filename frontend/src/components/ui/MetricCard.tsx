import type React from "react"
import "./MetricCard.css"

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: string
    direction: "up" | "down" | "neutral"
  }
  progress?: {
    current: number
    goal: number
  }
  icon?: React.ReactNode
  variant?: "default" | "warning" | "success" | "danger"
  className?: string
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  progress,
  // icon is accepted for API compatibility but not rendered
  icon: _icon,
  variant = "default",
  className = "",
}) => {
  const progressPercent = progress ? Math.min((progress.current / progress.goal) * 100, 100) : 0

  return (
    <div className={`metric-card metric-card--${variant} ${className}`}>
      <div className="metric-card__header">
        <span className="metric-card__title">{title}</span>
        {variant === "warning" && (
          <svg className="metric-card__alert-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L1 21h22L12 2zm0 3.83L19.53 19H4.47L12 5.83zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
          </svg>
        )}
      </div>

      <div className="metric-card__value-row">
        <span className="metric-card__value">{value}</span>
        {trend && (
          <span className={`metric-card__trend metric-card__trend--${trend.direction}`}>
            {trend.direction === "up" && "↑"}
            {trend.direction === "down" && "↓"}
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <div className="metric-card__subtitle">{subtitle}</div>}

      {progress && (
        <div className="metric-card__progress">
          <div
            className="metric-card__progress-bar"
            style={{ "--progress-width": `${progressPercent}%` } as React.CSSProperties}
          />
        </div>
      )}
    </div>
  )
}

export default MetricCard
