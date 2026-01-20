import React from 'react';
import { Cake, MessageSquare } from 'lucide-react';
import WidgetPanel from '../shared/WidgetPanel';
import type { Birthday } from '../types';

interface BirthdaysWidgetProps {
    birthdays: Birthday[];
    variants?: any;
    className?: string;
}

const BirthdaysWidget: React.FC<BirthdaysWidgetProps> = ({ birthdays, variants, className }) => {
    return (
        <WidgetPanel
            title="Birthdays Today"
            icon={Cake}
            className={`dash-section--birthdays ${className || ''}`}
            variants={variants}
        >
            <div className="birthday-list">
                {birthdays.map((member, idx) => (
                    <div key={idx} className="birthday-row">
                        <div className="birthday-row__avatar">{member.initials}</div>
                        <span className="birthday-row__name">{member.name}</span>
                    </div>
                ))}
            </div>
            <button className="btn-action">
                <MessageSquare size={14} />
                Send Birthday Wishes
            </button>
        </WidgetPanel>
    );
};

export default BirthdaysWidget;
