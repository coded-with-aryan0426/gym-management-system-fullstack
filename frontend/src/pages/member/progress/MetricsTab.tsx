import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { memberProgressApi } from '../../services/api';

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
                setMetrics(metricsData);
                setMeasurements(measurementsData);
            } catch (error) {
                console.error('Error fetching metrics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [memberId, timeRange]);

    if (loading) {
        return (
            <div className="metrics-loading">
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                </motion.div>
                <span>Loading metrics...</span>
            </div>
        );
    }

    return (
        <motion.div className="metrics-tab" variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
        }}>
            <div className="metrics-grid">
                {/* Weight Chart */}
                <div className="metric-card">
                    <div className="metric-card__header">
                        <div className="metric-card__title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="5" r="3"/>
                                <path d="M6.5 8a6.5 6.5 0 1 0 11 0Z"/>
                            </svg>
                            <h3>Weight Progress</h3>
                        </div>
                        <div className="metric-card__actions">
                            <span className="metric-value">{metrics.length > 0 ? metrics[metrics.length - 1].weight : '--'} kg</span>
                        </div>
                    </div>
                    <div className="metric-chart">
                        {metrics.length === 0 ? (
                            <div className="empty-chart">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 3v18h18"/>
                                    <polyline points="3 9 12 15 15 12 21 18"/>
                                </svg>
                                <p>No weight data yet</p>
                                <span>Start logging your weight to see progress</span>
                            </div>
                        ) : (
                            <div className="chart-placeholder">
                                <div className="chart-line">
                                    {metrics.slice(-10).map((metric, index) => (
                                        <div 
                                            key={index} 
                                            className="chart-point"
                                            style={{ height: `${(metric.weight / Math.max(...metrics.map(m => m.weight))) * 100}%` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Body Fat Chart */}
                <div className="metric-card">
                    <div className="metric-card__header">
                        <div className="metric-card__title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 12h-4l-3-9L9 21l-3-9H2"/>
                            </svg>
                            <h3>Body Fat %</h3>
                        </div>
                        <div className="metric-card__actions">
                            <span className="metric-value">{metrics.length > 0 ? metrics[metrics.length - 1].bodyFat : '--'}%</span>
                        </div>
                    </div>
                    <div className="metric-chart">
                        {metrics.length === 0 ? (
                            <div className="empty-chart">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 3v18h18"/>
                                    <polyline points="3 9 12 15 15 12 21 18"/>
                                </svg>
                                <p>No body fat data yet</p>
                                <span>Log your body fat percentage to track progress</span>
                            </div>
                        ) : (
                            <div className="chart-placeholder">
                                <div className="chart-line">
                                    {metrics.slice(-10).map((metric, index) => (
                                        <div 
                                            key={index} 
                                            className="chart-point"
                                            style={{ height: `${(metric.bodyFat / Math.max(...metrics.map(m => m.bodyFat))) * 100}%` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Muscle Mass Chart */}
                <div className="metric-card">
                    <div className="metric-card__header">
                        <div className="metric-card__title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 12h12"/>
                                <path d="M6 16h12"/>
                                <path d="M6 20h12"/>
                                <path d="M6 8h12"/>
                                <path d="M6 4h12"/>
                            </svg>
                            <h3>Muscle Mass</h3>
                        </div>
                        <div className="metric-card__actions">
                            <span className="metric-value">{metrics.length > 0 ? metrics[metrics.length - 1].muscleMass : '--'} kg</span>
                        </div>
                    </div>
                    <div className="metric-chart">
                        {metrics.length === 0 ? (
                            <div className="empty-chart">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 3v18h18"/>
                                    <polyline points="3 9 12 15 15 12 21 18"/>
                                </svg>
                                <p>No muscle mass data yet</p>
                                <span>Track your muscle mass to see gains</span>
                            </div>
                        ) : (
                            <div className="chart-placeholder">
                                <div className="chart-line">
                                    {metrics.slice(-10).map((metric, index) => (
                                        <div 
                                            key={index} 
                                            className="chart-point"
                                            style={{ height: `${(metric.muscleMass / Math.max(...metrics.map(m => m.muscleMass))) * 100}%` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Measurements Grid */}
                <div className="metric-card metric-card--wide">
                    <div className="metric-card__header">
                        <div className="metric-card__title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                                <line x1="12" y1="22.08" x2="12" y2="12"/>
                            </svg>
                            <h3>Body Measurements</h3>
                        </div>
                        <div className="metric-card__actions">
                            <span className="metric-value">Last updated: {measurements.length > 0 ? new Date(measurements[measurements.length - 1].recordDate).toLocaleDateString() : 'Never'}</span>
                        </div>
                    </div>
                    <div className="measurements-grid">
                        {measurements.length === 0 ? (
                            <div className="empty-measurements">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                                </svg>
                                <h3>No measurements yet</h3>
                                <p>Start logging your body measurements to track changes</p>
                            </div>
                        ) : (
                            <>
                                <div className="measurement-item">
                                    <div className="measurement-label">
                                        <span className="measurement-name">Chest</span>
                                        <span className="measurement-unit">cm</span>
                                    </div>
                                    <div className="measurement-value">{measurements[measurements.length - 1].chest}</div>
                                </div>
                                <div className="measurement-item">
                                    <div className="measurement-label">
                                        <span className="measurement-name">Waist</span>
                                        <span className="measurement-unit">cm</span>
                                    </div>
                                    <div className="measurement-value">{measurements[measurements.length - 1].waist}</div>
                                </div>
                                <div className="measurement-item">
                                    <div className="measurement-label">
                                        <span className="measurement-name">Arms</span>
                                        <span className="measurement-unit">cm</span>
                                    </div>
                                    <div className="measurement-value">{measurements[measurements.length - 1].arms}</div>
                                </div>
                                <div className="measurement-item">
                                    <div className="measurement-label">
                                        <span className="measurement-name">Legs</span>
                                        <span className="measurement-unit">cm</span>
                                    </div>
                                    <div className="measurement-value">{measurements[measurements.length - 1].legs}</div>
                                </div>
                                <div className="measurement-item">
                                    <div className="measurement-label">
                                        <span className="measurement-name">Hips</span>
                                        <span className="measurement-unit">cm</span>
                                    </div>
                                    <div className="measurement-value">{measurements[measurements.length - 1].hips}</div>
                                </div>
                                <div className="measurement-item">
                                    <div className="measurement-label">
                                        <span className="measurement-name">Shoulders</span>
                                        <span className="measurement-unit">cm</span>
                                    </div>
                                    <div className="measurement-value">{measurements[measurements.length - 1].shoulders}</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MetricsTab;