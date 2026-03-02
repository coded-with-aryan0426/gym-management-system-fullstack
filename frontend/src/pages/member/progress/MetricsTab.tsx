import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { memberProgressApi } from '../../services/api';
import { Scale, Activity, Zap, Ruler, Calendar, TrendingDown, TrendingUp } from 'lucide-react';

interface MetricData {
    recordDate: string;
    weight: number;
    bodyFat: number;
    muscleMass: number;
    chest: number;
    waist: number;
    arms: number;
    legs: number;
    hips: number;
    shoulders: number;
}

interface MeasurementData {
    recordDate: string;
    chest: number;
    waist: number;
    arms: number;
    legs: number;
    hips: number;
    shoulders: number;
}

const MetricsTab: React.FC<{ timeRange: string }> = ({ timeRange }) => {
    const { user } = useAuth();
    const memberId = Number(user?.userId || user?.id);
    
    const [metrics, setMetrics] = useState<MetricData[]>([]);
    const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            if (!memberId) return;
            
            try {
                setLoading(true);
                const [metricsData, measurementsData] = await Promise.all([
                    memberProgressApi.getMetrics(memberId),
                    memberProgressApi.getMeasurements(memberId)
                ]);
                
                // Sort by date and format
                const formattedMetrics = metricsData
                    .sort((a: any, b: any) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime())
                    .map((m: any) => ({
                        ...m,
                        formattedDate: new Date(m.recordDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    }));
                
                setMetrics(formattedMetrics);
                setMeasurements(measurementsData);
            } catch (error) {
                console.error('Error fetching metrics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [memberId, timeRange]);

    const CustomTooltip = ({ active, payload, label, unit }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-chart-tooltip">
                    <p className="tooltip-date">{label}</p>
                    <p className="tooltip-value">
                        <span className="dot" style={{ backgroundColor: payload[0].stroke }}></span>
                        {payload[0].value} {unit}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="metrics-loading">
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <Activity size={24} />
                </motion.div>
                <span>Loading metrics...</span>
            </div>
        );
    }

    const lastWeight = metrics.length > 0 ? metrics[metrics.length - 1].weight : null;
    const prevWeight = metrics.length > 1 ? metrics[metrics.length - 2].weight : null;
    const weightTrend = lastWeight && prevWeight ? lastWeight - prevWeight : 0;

    return (
        <motion.div className="metrics-tab" variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
        }}>
            <div className="metrics-grid">
                {/* Weight Chart */}
                <div className="metric-card chart-card">
                    <div className="metric-card__header">
                        <div className="metric-card__title">
                            <Scale size={20} className="text-blue-500" />
                            <h3>Weight Progress</h3>
                        </div>
                        <div className="metric-card__actions">
                            <div className="metric-summary">
                                <span className="metric-value">{lastWeight ?? '--'} <small>kg</small></span>
                                {weightTrend !== 0 && (
                                    <span className={`metric-trend ${weightTrend <= 0 ? 'down' : 'up'}`}>
                                        {weightTrend <= 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                                        {Math.abs(weightTrend).toFixed(1)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="metric-chart-container">
                        {metrics.length === 0 ? (
                            <div className="empty-chart">
                                <Calendar size={32} opacity={0.5} />
                                <p>No weight data yet</p>
                                <span>Start logging your weight to see progress</span>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={metrics}>
                                    <defs>
                                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis 
                                        dataKey="formattedDate" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                                        dy={10}
                                    />
                                    <YAxis 
                                        hide 
                                        domain={['dataMin - 2', 'dataMax + 2']} 
                                    />
                                    <Tooltip content={<CustomTooltip unit="kg" />} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="weight" 
                                        stroke="#3b82f6" 
                                        strokeWidth={2}
                                        fillOpacity={1} 
                                        fill="url(#colorWeight)" 
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Body Fat Chart */}
                <div className="metric-card chart-card">
                    <div className="metric-card__header">
                        <div className="metric-card__title">
                            <Activity size={20} className="text-purple-500" />
                            <h3>Body Fat %</h3>
                        </div>
                        <div className="metric-card__actions">
                            <span className="metric-value">{metrics.length > 0 ? metrics[metrics.length - 1].bodyFat : '--'}<small>%</small></span>
                        </div>
                    </div>
                    <div className="metric-chart-container">
                        {metrics.length === 0 ? (
                            <div className="empty-chart">
                                <Activity size={32} opacity={0.5} />
                                <p>No body fat data yet</p>
                                <span>Log your body fat percentage to track progress</span>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={metrics}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis 
                                        dataKey="formattedDate" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                                        dy={10}
                                    />
                                    <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                                    <Tooltip content={<CustomTooltip unit="%" />} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="bodyFat" 
                                        stroke="#a855f7" 
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#a855f7', strokeWidth: 2, stroke: '#1a1a1a' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                        animationDuration={1500}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Muscle Mass Chart */}
                <div className="metric-card chart-card">
                    <div className="metric-card__header">
                        <div className="metric-card__title">
                            <Zap size={20} className="text-orange-500" />
                            <h3>Muscle Mass</h3>
                        </div>
                        <div className="metric-card__actions">
                            <span className="metric-value">{metrics.length > 0 ? metrics[metrics.length - 1].muscleMass : '--'}<small>kg</small></span>
                        </div>
                    </div>
                    <div className="metric-chart-container">
                        {metrics.length === 0 ? (
                            <div className="empty-chart">
                                <Zap size={32} opacity={0.5} />
                                <p>No muscle mass data yet</p>
                                <span>Track your muscle mass to see gains</span>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={metrics}>
                                    <defs>
                                        <linearGradient id="colorMuscle" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis 
                                        dataKey="formattedDate" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                                        dy={10}
                                    />
                                    <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                                    <Tooltip content={<CustomTooltip unit="kg" />} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="muscleMass" 
                                        stroke="#f97316" 
                                        strokeWidth={2}
                                        fillOpacity={1} 
                                        fill="url(#colorMuscle)" 
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Measurements Grid */}
                <div className="metric-card metric-card--wide">
                    <div className="metric-card__header">
                        <div className="metric-card__title">
                            <Ruler size={20} className="text-emerald-500" />
                            <h3>Body Measurements</h3>
                        </div>
                        <div className="metric-card__actions">
                            <span className="last-updated">
                                Last updated: {measurements.length > 0 ? new Date(measurements[measurements.length - 1].recordDate).toLocaleDateString() : 'Never'}
                            </span>
                        </div>
                    </div>
                    <div className="measurements-grid">
                        {measurements.length === 0 ? (
                            <div className="empty-measurements">
                                <Ruler size={48} opacity={0.2} />
                                <h3>No measurements yet</h3>
                                <p>Start logging your body measurements to track changes</p>
                            </div>
                        ) : (
                            ['Chest', 'Waist', 'Arms', 'Legs', 'Hips', 'Shoulders'].map((item) => {
                                const key = item.toLowerCase() as keyof MeasurementData;
                                const value = measurements[measurements.length - 1][key];
                                return (
                                    <div className="measurement-item" key={item}>
                                        <div className="measurement-label">
                                            <span className="measurement-name">{item}</span>
                                            <span className="measurement-unit">cm</span>
                                        </div>
                                        <div className="measurement-value">{value || '--'}</div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MetricsTab;