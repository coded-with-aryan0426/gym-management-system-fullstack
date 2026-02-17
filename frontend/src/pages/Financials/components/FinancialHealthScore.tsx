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
    const { score, grade, color, insights } = useMemo(() => {
        let s = 50; // Base score

        // Profitability (0-30 points)
        if (profitMargin > 30) s += 30;
        else if (profitMargin > 20) s += 25;
        else if (profitMargin > 10) s += 18;
        else if (profitMargin > 0) s += 10;
        else s -= 15;

        // Revenue growth (0-20 points)
        if (revenueChange > 15) s += 20;
        else if (revenueChange > 5) s += 12;
        else if (revenueChange > 0) s += 5;
        else s -= 10;

        // Pending ratio penalty
        const pendingRatio = totalRevenue > 0 ? (pendingPayments / totalRevenue) * 100 : 0;
        if (pendingRatio > 30) s -= 15;
        else if (pendingRatio > 15) s -= 8;
        else if (pendingRatio < 5) s += 5;

        s = Math.max(0, Math.min(100, s));

        let g = 'F';
        let c = '#EF4444';
        if (s >= 85) { g = 'A+'; c = '#10B981'; }
        else if (s >= 75) { g = 'A'; c = '#10B981'; }
        else if (s >= 65) { g = 'B+'; c = '#3B82F6'; }
        else if (s >= 55) { g = 'B'; c = '#3B82F6'; }
        else if (s >= 45) { g = 'C'; c = '#F59E0B'; }
        else if (s >= 35) { g = 'D'; c = '#F97316'; }

        const ins: { text: string; type: 'good' | 'warning' | 'bad' }[] = [];
        if (profitMargin > 20) ins.push({ text: 'Healthy profit margins', type: 'good' });
        else if (profitMargin > 0) ins.push({ text: 'Profit margins could improve', type: 'warning' });
        else ins.push({ text: 'Operating at a loss', type: 'bad' });

        if (pendingRatio > 20) ins.push({ text: `${pendingRatio.toFixed(0)}% revenue is pending collection`, type: 'bad' });
        else if (pendingRatio > 5) ins.push({ text: 'Some payments pending', type: 'warning' });
        else ins.push({ text: 'Collections on track', type: 'good' });

        const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;
        if (expenseRatio < 60) ins.push({ text: 'Expenses well controlled', type: 'good' });
        else if (expenseRatio < 80) ins.push({ text: 'Monitor expense growth', type: 'warning' });
        else ins.push({ text: 'Expenses too high relative to revenue', type: 'bad' });

        return { score: s, grade: g, color: c, insights: ins };
    }, [totalRevenue, totalExpenses, netProfit, profitMargin, pendingPayments, revenueChange]);

    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="health-score">
            <div className="hs-header">
                <h3 className="hs-title">Financial Health</h3>
                <span className="hs-grade" style={{ background: `${color}20`, color, borderColor: `${color}40` }}>{grade}</span>
            </div>

            <div className="hs-gauge-container">
                <svg className="hs-gauge" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <circle
                        cx="60" cy="60" r="52"
                        fill="none"
                        stroke={color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        transform="rotate(-90 60 60)"
                        style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                </svg>
                <div className="hs-score-display">
                    <span className="hs-score-value" style={{ color }}>{score}</span>
                    <span className="hs-score-label">/ 100</span>
                </div>
            </div>

            <div className="hs-insights">
                {insights.map((ins, i) => (
                    <div key={i} className={`hs-insight hs-insight--${ins.type}`}>
                        <span className="hs-insight-icon">
                            {ins.type === 'good' ? '✓' : ins.type === 'warning' ? '!' : '✕'}
                        </span>
                        <span className="hs-insight-text">{ins.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FinancialHealthScore;
