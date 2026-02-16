import React from 'react';
import ChatLayout from '../../components/chat/ChatLayout';

/**
 * Member Messages Page
 * Uses the shared ChatLayout with 3-panel design (sidebar, chat window, contact info).
 * All messaging logic (conversations, sending, real-time updates) is handled
 * by ChatContext and the ChatLayout sub-components.
 */
const MemberMessages: React.FC = () => {
    return <ChatLayout />;
};

export default MemberMessages;
