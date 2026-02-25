import React, { useMemo } from 'react';
import './FinancialHealthScore.css';

interface FinancialHealthScoreProps {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    pendingPayments: number;
    revenueChange: number;
}

const FinancialHealthScore: React.FC<FinancialHealthScoreProps> = ({
    totalRevenue, totalExpenses, netProfit, profitMargin, pendingPayments, revenueChange
}) => {
    const { score, grade, color, metrics } = useMemo(() => {
        let s = 50;

        if (profitMargin > 30) s += 30;
        else if (profitMargin > 20) s += 25;
        else if (profitMargin > 10) s += 18;
        else if (profitMargin > 0) s += 10;
        else s -= 15;

        if (revenueChange > 15) s += 20;
        else if (revenueChange > 5) s += 12;
        else if (revenueChange > 0) s += 5;
        else s -= 10;

        const pendingRatio = totalRevenue > 0 ? (pendingPayments / totalRevenue) * 100 : 0;
        if (pendingRatio > 30) s -= 15;
        else if (pendingRatio > 15) s -= 8;
        else if (pendingRatio < 5) s += 5;

        s = Math.max(0, Math.min(100, s));

        let g = 'F'; let c = '#EF4444';
        if (s >= 85) { g = 'A+'; c = '#10B981'; }
        else if (s >= 75) { g = 'A';  c = '#10B981'; }
        else if (s >= 65) { g = 'B+'; c = '#3B82F6'; }
        else if (s >= 55) { g = 'B';  c = '#3B82F6'; }
        else if (s >= 45) { g = 'C';  c = '#F59E0B'; }
        else if (s >= 35) { g = 'D';  c = '#F97316'; }

        const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;

        const mets = [
            {
                label: 'Profit Margin',
                value: `${profitMargin}%`,
                score: Math.min(100, Math.max(0, profitMargin > 0 ? (profitMargin / 30) * 100 : 0)),
                type: profitMargin > 20 ? 'good' : profitMargin > 0 ? 'warning' : 'bad'
            },
            {
                label: 'Revenue Growth',
                value: `${revenueChange > 0 ? '+' : ''}${revenueChange}%`,
                score: Math.min(100, Math.max(0, 50 + revenueChange * 2)),
                type: revenueChange > 5 ? 'good' : revenueChange >= 0 ? 'warning' : 'bad'
            },
            {
                label: 'Expense Ratio',
                value: `${expenseRatio.toFixed(0)}%`,
                score: Math.min(100, Math.max(0, 100 - expenseRatio)),
                type: expenseRatio < 60 ? 'good' : expenseRatio < 80 ? 'warning' : 'bad'
            },
            {
                label: 'Collections',
                value: pendingRatio < 5 ? 'Clean' : `${pendingRatio.toFixed(0)}% pending`,
                score: Math.min(100, Math.max(0, 100 - pendingRatio * 2)),
                type: pendingRatio < 5 ? 'good' : pendingRatio < 20 ? 'warning' : 'bad'
            },
        ] as const;

        return { score: s, grade: g, color: c, metrics: mets };
    }, [totalRevenue, totalExpenses, netProfit, profitMargin, pendingPayments, revenueChange]);

    const circumference = 2 * Math.PI * 44;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="health-score">
            <div className="hs-header">
                <span className="hs-title">Financial Health</span>
                <span className="hs-grade" style={{ background: `${color}20`, color, borderColor: `${color}40` }}>
                    {grade}
                </span>
            </div>

            <div className="hs-body">
                {/* Score ring */}
                <div className="hs-ring-wrap">
                    <svg className="hs-ring" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                        <circle
                            cx="50" cy="50" r="44"
                            fill="none"
                            stroke={color}
                            strokeWidth="7"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            transform="rotate(-90 50 50)"
                            style={{ transition: 'stroke-dashoffset 1s ease' }}
                        />
                    </svg>
                    <div className="hs-ring-label">
                        <span className="hs-score-num" style={{ color }}>{score}</span>
                        <span className="hs-score-denom">/100</span>
                    </div>
                </div>

                {/* Metric bars */}
                <div className="hs-metrics">
                    {metrics.map((m, i) => (
                        <div key={i} className="hs-metric">
                            <div className="hs-metric-top">
                                <span className="hs-metric-label">{m.label}</span>
                                <span className={`hs-metric-val hs-metric-val--${m.type}`}>{m.value}</span>
                            </div>
                            <div className="hs-bar-track">
                                <div
                                    className={`hs-bar-fill hs-bar-fill--${m.type}`}
                                    style={{ width: `${m.score}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FinancialHealthScore;
