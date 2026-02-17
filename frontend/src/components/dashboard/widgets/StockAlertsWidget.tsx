import React from 'react';
import { Package } from 'lucide-react';
import WidgetPanel from '../shared/WidgetPanel';
import type { StockItem } from '../types';

interface StockAlertsWidgetProps {
    alerts: StockItem[];
    variants?: any;
    className?: string;
}

const StockAlertsWidget: React.FC<StockAlertsWidgetProps> = ({ alerts, variants, className }) => {
    return (
        <WidgetPanel
            title="Stock Alerts"
            icon={Package}
            className="dash-section--stock"
            variants={variants}
        >
            {alerts.map((item, idx) => (
                <div key={idx} className="stock-row">
                    <div className={`stock-row__icon ${item.level < 20 ? 'stock-row__icon--low' : ''}`}>
                        <Package size={16} />
                    </div>
                    <div className="stock-row__info">
                        <span className="stock-row__name">{item.name}</span>
                        <div className="stock-row__bar">
                            <div
                                className={`stock-row__fill ${item.level < 20 ? 'stock-row__fill--low' : ''}`}
                                style={{ width: `${item.level}%` }}
                            />
                        </div>
                    </div>
                    <span className={`stock-row__percent ${item.level < 20 ? 'stock-row__percent--low' : ''}`}>
                        {item.level}%
                    </span>
                </div>
            ))}
        </WidgetPanel>
    );
};

export default StockAlertsWidget;
