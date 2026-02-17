import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import ContactInfoPanel from './ContactInfoPanel';
import { useChat } from '../../contexts/ChatContext';
import '../../styles/Chat.css';

/**
 * Main Chat Layout - 3-panel design inspired by WhatsApp/Slack
 * - Left: Conversation sidebar with search and filters
 * - Center: Active chat window
 * - Right: Contact info panel (togglable)
 */
const ChatLayout: React.FC = () => {
    const { activeConversation, setActiveConversation, conversations } = useChat();
    const [showContactPanel, setShowContactPanel] = useState(false);
    const location = useLocation();

    // Handle navigation from other pages (e.g. MyMembers)
    useEffect(() => {
        const state = location.state as { activeConversationId?: number } | null;
        if (state?.activeConversationId && conversations.length > 0) {
            const targetConv = conversations.find(c => c.conversationId === state.activeConversationId);
            if (targetConv) {
                setActiveConversation(targetConv);
                // Clear state to prevent re-setting on refresh/navigation? 
                // Actually React Router handles state per navigation, so it's fine.
                // But maybe we want to avoid resetting if user changes chat manually?
                // For now, simple is fine.

                // Clear state so it doesn't persist if we navigate away and back without specific intent?
                // history.replace(location.pathname, {}); // Optional polish
            }
        }
    }, [location.state, conversations, setActiveConversation]);

    return (
        <div className={`chat-layout ${activeConversation ? 'chat-layout--conversation-active' : ''}`}>
            {/* Sidebar */}
            <ChatSidebar />

            {/* Main Chat Window */}
            <ChatWindow
                onToggleContactPanel={() => setShowContactPanel(!showContactPanel)}
            />

            {/* Contact Info Panel */}
            <ContactInfoPanel
                isOpen={showContactPanel}
                onClose={() => setShowContactPanel(false)}
            />
        </div>
    );
};

export default ChatLayout;
