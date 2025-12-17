import React, { useState } from 'react';
import { Card } from '../../../components/ui';
import './FinancialChart.css';

interface FinancialChartProps {
    data: any[]; // In a real app, this would be a specific TimeSeries interface
    period: 'day' | 'week' | 'month';
    onPeriodChange: (p: 'day' | 'week' | 'month') => void;
}

const FinancialChart: React.FC<FinancialChartProps> = ({ data, period, onPeriodChange }) => {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    // Mock chart generation (replace with flexible SVG logic or chart library in prod)
    // For this prototype, we'll draw a responsive SVG path

    // Y-Axis scale: 0 to Max Value
    // X-Axis scale: distrib over width

    return (
        <Card className="financial-chart-card">
            <div className="financial-chart__header">
                <div className="financial-chart__title-group">
                    <h3 className="financial-chart__title">Revenue vs Expenses</h3>
                    <span className="financial-chart__subtitle">Net Profit Analysis</span>
                </div>
                <div className="financial-chart__controls">
                    <div className="period-toggle">
                        {(['day', 'week', 'month'] as const).map((p) => (
                            <button
                                key={p}
                                className={`period-btn ${period === p ? 'active' : ''}`}
                                onClick={() => onPeriodChange(p)}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="financial-chart__visual">
                <svg viewBox="0 0 800 250" className="chart-svg">
                    <defs>
                        <linearGradient id="gradRevenue" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-emerald)" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="var(--color-emerald)" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="gradExpense" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-crimson)" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="var(--color-crimson)" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    {[0, 25, 50, 75, 100].map((y, i) => (
                        <line key={i} x1="0" y1={y * 2.5} x2="800" y2={y * 2.5} stroke="var(--border-primary)" strokeDasharray="4" />
                    ))}

                    {/* Areas */}
                    <path d="M0,250 L0,150 Q100,100 200,120 T400,100 T600,80 T800,60 L800,250 Z" fill="url(#gradRevenue)" />
                    <path d="M0,250 L0,200 Q100,210 200,190 T400,180 T600,160 T800,170 L800,250 Z" fill="url(#gradExpense)" />

                    {/* Lines */}
                    <path
                        d="M0,150 Q100,100 200,120 T400,100 T600,80 T800,60"
                        fill="none"
                        stroke="var(--color-emerald)"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                    <path
                        d="M0,200 Q100,210 200,190 T400,180 T600,160 T800,170"
                        fill="none"
                        stroke="var(--color-crimson)"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />

                    {/* Net Profit Overlay (Blue Dashed) - Requested by User */}
                    <path
                        d="M0,180 Q100,155 200,155 T400,140 T600,120 T800,115"
                        fill="none"
                        stroke="var(--color-blue)"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                        strokeLinecap="round"
                    />

                    {/* Interactive Points (Mock) */}
                    {[0, 200, 400, 600, 800].map((x, i) => (
                        <circle
                            key={i}
                            cx={x}
                            cy={150 - (i * 20)} // Mock y
                            r="6"
                            fill="var(--bg-secondary)"
                            stroke="var(--color-emerald)"
                            strokeWidth="2"
                            className="chart-point"
                        />
                    ))}
                </svg>

                {/* Floating Tooltip (Static for visual proof, dynamic in real impl) */}
                <div className="chart-tooltip" style={{ left: '50%', top: '30%' }}>
                    <div className="tooltip-date">Nov 15, 2024</div>
                    <div className="tooltip-row">
                        <span className="dot revenue"></span> Revenue: ₹45,000
                    </div>
                    <div className="tooltip-row">
                        <span className="dot expense"></span> Expense: ₹12,000
                    </div>
                    <div className="tooltip-row">
                        <span className="dot" style={{ background: 'var(--color-blue)' }}></span> Net Profit: ₹33,000
                    </div>
                    <div className="tooltip-profit text-emerald">+ 24% vs last week</div>
                </div>

                {/* Decision Banner - Actionable Insight */}
                <div className="chart-decision-banner">
                    <div className="decision-insight">
                        <span className="decision-indicator decision-indicator--positive">✓</span>
                        <span className="decision-text">Profit margin up <strong>6%</strong></span>
                    </div>
                    <div className="decision-divider"></div>
                    <div className="decision-driver">
                        <span className="decision-label">Driver:</span>
                        <span className="decision-value">Membership renewals</span>
                    </div>
                    <div className="decision-divider"></div>
                    <div className="decision-action">
                        <span className="decision-label">Action:</span>
                        <span className="decision-value decision-value--action">Push renewal reminders</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default FinancialChart;
