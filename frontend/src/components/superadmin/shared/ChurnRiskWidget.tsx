import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, Mail, Clock } from 'lucide-react';
import { DataTable, type Column } from './DataTable';
import './ChurnRiskWidget.css';

export interface ChurnRiskGym {
  gymId: number;
  gymName: string;
  previousWeekDau: number;
  currentWeekDau: number;
  dropPercent: number;
  lastOwnerLogin: string;
  ownerEmail: string;
  city?: string;
}

interface ChurnRiskWidgetProps {
  gyms: ChurnRiskGym[];
  onContactOwner?: (gym: ChurnRiskGym) => void;
  maxDisplay?: number;
  isLoading?: boolean;
  className?: string;
}

export const ChurnRiskWidget: React.FC<ChurnRiskWidgetProps> = ({
  gyms,
  onContactOwner,
  maxDisplay = 5,
  isLoading = false,
  className = ''
}) => {
  const columns: Column<ChurnRiskGym>[] = [
    {
      key: 'gymName',
      label: 'Gym',
      sortable: true,
      render: (_, row) => (
        <div className="churn-risk-cell">
          <div className="churn-risk-cell__name">{row.gymName}</div>
          {row.city && <div className="churn-risk-cell__city">{row.city}</div>}
        </div>
      )
    },
    {
      key: 'dropPercent',
      label: 'DAU Drop',
      sortable: true,
      render: (value) => (
        <div className="churn-risk-drop">
          <TrendingDown size={12} className="churn-risk-drop__icon" />
          <span className="churn-risk-drop__value">{value.toFixed(1)}%</span>
        </div>
      )
    },
    {
      key: 'currentWeekDau',
      label: 'Current',
      render: (_, row) => (
        <span className="churn-risk-stat">{row.currentWeekDau}</span>
      )
    },
    {
      key: 'lastOwnerLogin',
      label: 'Last Login',
      render: (value) => (
        <div className="churn-risk-login">
          <Clock size={10} />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        onContactOwner ? (
          <button
            className="churn-risk-contact-btn"
            onClick={() => onContactOwner(row)}
            title={`Contact ${row.ownerEmail}`}
          >
            <Mail size={12} />
            Contact
          </button>
        ) : null
      )
    }
  ];

  if (isLoading) {
    return (
      <div className={`churn-risk-widget ${className}`}>
        <div className="churn-risk-widget__loading">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="churn-risk-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (gyms.length === 0) {
    return (
      <div className={`churn-risk-widget ${className}`}>
        <div className="churn-risk-widget__empty">
          <div className="churn-risk-widget__empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span>No gyms at risk</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`churn-risk-widget ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="churn-risk-widget__header">
        <div className="churn-risk-widget__icon">
          <AlertTriangle size={14} />
        </div>
        <span className="churn-risk-widget__title">Flight Risk Gyms</span>
        <span className="churn-risk-widget__count">{gyms.length}</span>
      </div>
      <div className="churn-risk-widget__subtitle">
        DAU dropped &gt;30% this week
      </div>
      <DataTable
        data={gyms.slice(0, maxDisplay)}
        columns={columns}
        variant="compact"
        pageSize={maxDisplay}
        hoverable
      />
    </motion.div>
  );
};

export default ChurnRiskWidget;
