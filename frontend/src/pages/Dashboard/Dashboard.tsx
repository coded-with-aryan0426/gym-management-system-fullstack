import React, { useEffect, useState } from 'react';
import { MetricCard, Card, Avatar } from '../../components/ui';
import api from '../../services/api';
import './Dashboard.css';

interface DashboardMetrics {
  todayRevenue: number;
  revenueChange: number;
  liveCheckIns: number;
  newSignups: number;
  signupsGoal: number;
  criticalTasks: number;
}

interface FloorStatus {
  memberId: number;
  memberName: string;
  timeIn: string;
  status: 'check-in' | 'access denied' | 'status';
}

interface ClassManifest {
  time: string;
  name: string;
  trainer: string;
  capacity: number;
  enrolled: number;
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    todayRevenue: 12450,
    revenueChange: 8.5,
    liveCheckIns: 42,
    newSignups: 115,
    signupsGoal: 115,
    criticalTasks: 3,
  });

  const [floorStatus] = useState<FloorStatus[]>([
    { memberId: 1, memberName: 'Sarah Connor', timeIn: '8:00 AM', status: 'check-in' },
    { memberId: 2, memberName: 'John Wick', timeIn: '7:30 AM', status: 'access denied' },
    { memberId: 3, memberName: 'Elena Fisher', timeIn: '6:00 PM', status: 'status' },
  ]);

  const [classManifest] = useState<ClassManifest[]>([
    { time: '06:00 AM', name: 'HIIT Burn', trainer: 'Mike T.', capacity: 20, enrolled: 19 },
    { time: '07:30 AM', name: 'Yoga Flow', trainer: 'Anya S.', capacity: 15, enrolled: 12 },
    { time: '08:00 AM', name: 'Spin Cycle', trainer: 'Chris E.', capacity: 20, enrolled: 10 },
  ]);

  const [_loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load real data from API
      const stats = await api.getStats();
      setMetrics({
        todayRevenue: stats.totalRevenue || 12450,
        revenueChange: 8.5,
        liveCheckIns: stats.activeMembers || 42,
        newSignups: stats.totalMembers || 115,
        signupsGoal: 115,
        criticalTasks: stats.pendingSessions || 3,
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getCapacityPercent = (enrolled: number, capacity: number) => {
    return Math.round((enrolled / capacity) * 100);
  };

  const getCapacityColor = (percent: number) => {
    if (percent >= 90) return 'var(--color-crimson)';
    if (percent >= 70) return 'var(--color-amber)';
    return 'var(--color-emerald)';
  };

  return (
    <div className="dashboard">
      {/* Page Title */}
      <div className="dashboard__header">
        <h1 className="dashboard__title">Tactical Canvas</h1>
      </div>

      {/* Metrics Row */}
      <div className="dashboard__metrics">
        <MetricCard
          title="Today's Revenue"
          value={formatCurrency(metrics.todayRevenue)}
          trend={{ value: `${metrics.revenueChange}% vs yesterday`, direction: 'up' }}
        />
        <MetricCard
          title="Live Check-ins"
          value={metrics.liveCheckIns}
          subtitle="Currently on premises"
        />
        <MetricCard
          title="New Signups (MTD)"
          value={metrics.newSignups}
          subtitle={`Goal: ${metrics.signupsGoal}`}
        />
        <MetricCard
          title="Critical Tasks"
          value={metrics.criticalTasks}
          variant="warning"
          subtitle="Requires attention"
        />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard__grid">
        {/* Live Floor Status */}
        <Card
          title="Live Floor Status"
          action={<button className="card-action-btn">•••</button>}
          className="dashboard__floor-status"
        >
          <table className="floor-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Time in</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {floorStatus.map((item) => (
                <tr key={item.memberId}>
                  <td>
                    <div className="floor-member">
                      <Avatar name={item.memberName} size="sm" />
                      <span>{item.memberName}</span>
                    </div>
                  </td>
                  <td>{item.timeIn}</td>
                  <td>
                    <span className={`floor-status floor-status--${item.status.replace(' ', '-')}`}>
                      • {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Today's Class Manifest */}
        <Card
          title="Today's Class Manifest"
          action={<button className="card-action-btn">•••</button>}
          className="dashboard__class-manifest"
        >
          <div className="class-list">
            {classManifest.map((cls, index) => (
              <div key={index} className="class-item">
                <div className="class-info">
                  <span className="class-time">{cls.time} - {cls.name}</span>
                  <span className="class-trainer">(Trainer: {cls.trainer})</span>
                </div>
                <div className="class-capacity">
                  <span className="class-capacity-label">Capacity</span>
                  <span className="class-capacity-value">{getCapacityPercent(cls.enrolled, cls.capacity)}%</span>
                </div>
                <div
                  className="class-capacity-bar"
                  style={{
                    '--capacity-percent': `${getCapacityPercent(cls.enrolled, cls.capacity)}%`,
                    '--capacity-color': getCapacityColor(getCapacityPercent(cls.enrolled, cls.capacity))
                  } as React.CSSProperties}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Financial Performance Trend */}
        <Card
          title="Financial Performance Trend"
          subtitle="Revenue Last 30 Days"
          action={<button className="card-action-btn">•••</button>}
          className="dashboard__financial-trend"
        >
          <div className="chart-placeholder">
            <div className="chart-legend">
              <span className="chart-legend-item chart-legend-item--memberships">● Memberships</span>
              <span className="chart-legend-item chart-legend-item--pos">● POS/Retail</span>
            </div>
            <div className="chart-area">
              {/* Placeholder for chart - would use Chart.js or Recharts */}
              <svg viewBox="0 0 400 120" className="chart-svg">
                <path
                  d="M0,100 L30,90 L60,80 L90,85 L120,70 L150,75 L180,60 L210,50 L240,55 L270,40 L300,45 L330,30 L360,35 L400,20"
                  fill="none"
                  stroke="var(--color-crimson)"
                  strokeWidth="2"
                />
                <path
                  d="M0,110 L30,105 L60,100 L90,102 L120,98 L150,100 L180,95 L210,92 L240,94 L270,88 L300,90 L330,85 L360,88 L400,80"
                  fill="none"
                  stroke="var(--color-emerald)"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </Card>

        {/* Staff & Facility Alerts */}
        <Card
          title="Staff & Facility Alerts"
          action={<button className="card-action-btn">•••</button>}
          className="dashboard__alerts"
        >
          <div className="alert-list">
            <div className="alert-item alert-item--warning">
              <span className="alert-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L1 21h22L12 2zm0 3.83L19.53 19H4.47L12 5.83zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
                </svg>
              </span>
              <div className="alert-content">
                <span className="alert-title">Treadmill #4 reported broken</span>
                <span className="alert-time">10 issues ago</span>
              </div>
            </div>
            <div className="alert-item alert-item--info">
              <span className="alert-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <div className="alert-content">
                <span className="alert-title">Trainer John D. called in sick</span>
                <span className="alert-time">2 months ago</span>
              </div>
            </div>
            <div className="alert-item alert-item--warning">
              <span className="alert-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </span>
              <div className="alert-content">
                <span className="alert-title">Low inventory: Protein Bars</span>
                <span className="alert-time">2 month ago</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
