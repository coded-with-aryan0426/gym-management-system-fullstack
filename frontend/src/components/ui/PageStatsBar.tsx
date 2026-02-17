"use client"

import type React from "react"
import "./PageStatsBar.css"

interface StatItem {
    key: string
    label: string
    value: string | number
    variant?: "default" | "active" | "inactive" | "warning" | "new"
    icon?: React.ReactNode
}

interface PageStatsBarProps {
    stats: StatItem[]
    activePercent?: number
    showProgress?: boolean
    variant?: "members" | "trainers" | "classes"
    title?: string
    loading?: boolean
    error?: string | null
}

const PageStatsBar: React.FC<PageStatsBarProps> = ({
    stats,
    activePercent,
    showProgress = false,
    variant = "members",
    title,
    loading = false,
    error = null
}) => {
    const getVariantClass = (statVariant?: string) => {
        switch (statVariant) {
            case "active": return "page-stats__item--active"
            case "inactive": return "page-stats__item--inactive"
            case "warning": return "page-stats__item--warning"
            case "new": return "page-stats__item--new"
            default: return ""
        }
    }

    const hasError = Boolean(error)
    const displayStats = (loading || hasError)
        ? stats.map((s) => ({ ...s, value: "—" }))
        : stats

    const progressPercent = (!showProgress || activePercent === undefined || loading || hasError) ? 0 : activePercent
    const progressText = hasError ? "Stats unavailable" : loading ? "Loading…" : `${activePercent}% active`

    return (
        <div className={`page-stats-bar page-stats-bar--${variant}`}>
            {title && <div className="page-stats__title">{title}</div>}

            <div className="page-stats__items">
                {displayStats.map((stat) => (
                    <div
                        key={stat.key}
                        className={`page-stats__item ${getVariantClass(stat.variant)}`}
                    >
                        {stat.icon && <span className="page-stats__icon">{stat.icon}</span>}
                        <div className="page-stats__content">
                            <span className="page-stats__value">{stat.value}</span>
                            <span className="page-stats__label">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {showProgress && activePercent !== undefined && (
                <div className="page-stats__progress">
                    <div className="page-stats__progress-bar">
                        <div
                            className="page-stats__progress-fill"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <span className="page-stats__progress-text">{progressText}</span>
                </div>
            )}
        </div>
    )
}

export default PageStatsBar
