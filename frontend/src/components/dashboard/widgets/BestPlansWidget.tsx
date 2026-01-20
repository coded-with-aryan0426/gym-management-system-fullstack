import React from 'react';
import { CreditCard, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WidgetPanel from '../shared/WidgetPanel';
import type { MembershipPlan } from '../types';

interface BestPlansWidgetProps {
    plans: MembershipPlan[];
    variants?: any;
    className?: string;
}

const BestPlansWidget: React.FC<BestPlansWidgetProps> = ({ plans, variants, className }) => {
    const navigate = useNavigate();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
        }).format(value)
    }

    return (
        <WidgetPanel
            title="Best Selling Plans"
            icon={CreditCard}
            onAction={() => navigate('/financials')}
            actionLabel="Financials"
            className="dash-section--plans"
            variants={variants}
        >
            {plans.map((plan, idx) => (
                <div key={idx} className="plan-row">
                    <div className={`plan-row__rank rank--${idx + 1}`}>{idx + 1}</div>
                    <div className="plan-row__info">
                        <span className="plan-row__name">{plan.name}</span>
                        <span className="plan-row__sold">{plan.sold} sold</span>
                    </div>
                    <span className="plan-row__revenue">{formatCurrency(plan.revenue)}</span>
                </div>
            ))}
        </WidgetPanel>
    );
};

export default BestPlansWidget;
