import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AlertItem {
    id: string | number;
    name: string;
    details: string; // Plan name or Amount
    statusValue: string | number; // Days left or Amount
    type: 'expiring' | 'overdue';
    urgent?: boolean;
}

interface AlertListProps {
    title: string;
    items: AlertItem[];
    icon?: React.ElementType;
    linkTo?: string;
    urgent?: boolean;
}

const AlertList: React.FC<AlertListProps> = ({ 
    title, 
    items, 
    icon: Icon = AlertCircle, 
    linkTo,
    urgent = false
}) => {
    const navigate = useNavigate();
    
    const itemVariants = {
        hidden: { y: 10, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div className={`dash-section ${urgent ? 'dash-section--urgent' : ''}`} variants={itemVariants}>
            <div className="dash-section__header">
                <div className="dash-section__title">
                    <Icon size={18} className={urgent ? 'text-crimson' : ''} />
                    <h2>{title}</h2>
                </div>
                {linkTo && (
                    <button className="dash-section__link" onClick={() => navigate(linkTo)}>
                        View All
                    </button>
                )}
            </div>
            
            <div className="dash-section__content">
                <div className={`alert-group ${urgent ? 'alert-group--urgent' : ''}`}>
                    <div className="alert-group__header">
                        <Icon size={14} />
                        <span>{urgent ? 'Action Required' : 'Upcoming'}</span>
                        <span className={`alert-group__badge ${urgent ? 'alert-group__badge--urgent' : ''}`}>
                            {items.length}
                        </span>
                    </div>
                    
                    {items.length === 0 ? (
                        <div className="empty-state">No alerts at this time</div>
                    ) : (
                        items.map((item, idx) => (
                            <div key={idx} className="alert-row">
                                <span className="alert-row__name">{item.name}</span>
                                <span className="alert-row__details">{item.details}</span>
                                <span className={`alert-row__status ${item.urgent ? 'urgent' : 'warning'}`}>
                                    {item.statusValue}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default AlertList;
