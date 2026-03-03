import React, { useState } from 'react';
import { Dumbbell, FileText } from 'lucide-react';
import ChatLayout from '../../components/chat/ChatLayout';
import ActionBar, { ActionItem } from '../../components/chat/ActionBar';
import WorkoutPlanModal from '../../components/chat/WorkoutPlanModal';
import ProgressNoteModal from '../../components/chat/ProgressNoteModal';
import './TrainerMessages.css';

type ModalType = 'workout' | 'notes' | null;

const TRAINER_ACTIONS: ActionItem[] = [
    {
        id: 'workout',
        label: 'Share Workout Plan',
        icon: Dumbbell,
        color: '#10b981',
        bg: 'rgba(16,185,129,0.12)',
        border: 'rgba(16,185,129,0.25)',
        description: 'Send a custom workout plan to this member',
    },
    {
        id: 'notes',
        label: 'Share Progress Note',
        icon: FileText,
        color: '#6366f1',
        bg: 'rgba(99,102,241,0.12)',
        border: 'rgba(99,102,241,0.25)',
        description: 'Share a progress note from your records',
    },
];

const TrainerMessages: React.FC = () => {
    const [openModal, setOpenModal] = useState<ModalType>(null);

    return (
        <div className="tm-wrapper">
            <ChatLayout />

            <ActionBar
                triggerIcon={Dumbbell}
                triggerLabel="Trainer Actions"
                actions={TRAINER_ACTIONS}
                onAction={(id) => setOpenModal(id as ModalType)}
            />

            {openModal === 'workout' && (
                <WorkoutPlanModal onClose={() => setOpenModal(null)} />
            )}
            {openModal === 'notes' && (
                <ProgressNoteModal onClose={() => setOpenModal(null)} />
            )}
        </div>
    );
};

export default TrainerMessages;
