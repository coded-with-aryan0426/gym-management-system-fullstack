import React, { useState } from 'react';
import { 
    Search, Send, Paperclip, MoreVertical, Phone, Video, 
    ChevronDown, Check, CheckCheck
} from 'lucide-react';
import './TrainerMessages.css';

interface Conversation {
    id: number;
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
    unread: number;
    online: boolean;
}

interface Message {
    id: number;
    sender: 'me' | 'them';
    text: string;
    time: string;
    status: 'sent' | 'delivered' | 'read';
}

const TrainerMessages: React.FC = () => {
    const [selectedChat, setSelectedChat] = useState<number>(1);
    const [messageText, setMessageText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const conversations: Conversation[] = [
        { id: 1, name: 'Sarah Wilson', avatar: 'SW', lastMessage: 'Thanks for the workout plan!', time: '2m ago', unread: 2, online: true },
        { id: 2, name: 'Mike Johnson', avatar: 'MJ', lastMessage: 'Can we reschedule tomorrow?', time: '15m ago', unread: 0, online: false },
        { id: 3, name: 'Emma Davis', avatar: 'ED', lastMessage: 'See you at 3pm!', time: '1h ago', unread: 0, online: true },
        { id: 4, name: 'James Wilson', avatar: 'JW', lastMessage: 'Great session today!', time: '3h ago', unread: 0, online: false },
        { id: 5, name: 'Lisa Chen', avatar: 'LC', lastMessage: 'What should I eat before...', time: 'Yesterday', unread: 1, online: false },
    ];

    const messages: Message[] = [
        { id: 1, sender: 'them', text: 'Hi! I wanted to ask about my workout schedule for next week.', time: '10:30 AM', status: 'read' },
        { id: 2, sender: 'me', text: 'Of course! I was just about to send you the updated plan.', time: '10:32 AM', status: 'read' },
        { id: 3, sender: 'them', text: 'That would be great! Also, should I increase my protein intake?', time: '10:35 AM', status: 'read' },
        { id: 4, sender: 'me', text: 'Yes, I recommend adding 20g more protein per day. Focus on lean sources like chicken, fish, or plant-based options if you prefer.', time: '10:38 AM', status: 'delivered' },
        { id: 5, sender: 'them', text: 'Thanks for the workout plan!', time: '10:40 AM', status: 'read' },
    ];

    const selectedConversation = conversations.find(c => c.id === selectedChat);

    const handleSend = () => {
        if (messageText.trim()) {
            setMessageText('');
        }
    };

    return (
        <div className="trainer-messages">
            <div className="trainer-messages__sidebar">
                <div className="trainer-messages__sidebar-header">
                    <h2>Messages</h2>
                    <button className="trainer-messages__filter-btn">
                        All <ChevronDown size={14} />
                    </button>
                </div>

                <div className="trainer-messages__search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="trainer-messages__conversations">
                    {conversations.map(conv => (
                        <button
                            key={conv.id}
                            className={`trainer-messages__conversation ${selectedChat === conv.id ? 'trainer-messages__conversation--active' : ''}`}
                            onClick={() => setSelectedChat(conv.id)}
                        >
                            <div className="trainer-messages__avatar">
                                {conv.avatar}
                                {conv.online && <span className="trainer-messages__online-dot" />}
                            </div>
                            <div className="trainer-messages__conv-info">
                                <div className="trainer-messages__conv-header">
                                    <span className="trainer-messages__conv-name">{conv.name}</span>
                                    <span className="trainer-messages__conv-time">{conv.time}</span>
                                </div>
                                <div className="trainer-messages__conv-preview">
                                    <span className="trainer-messages__conv-message">{conv.lastMessage}</span>
                                    {conv.unread > 0 && (
                                        <span className="trainer-messages__unread-badge">{conv.unread}</span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="trainer-messages__chat">
                {selectedConversation && (
                    <>
                        <div className="trainer-messages__chat-header">
                            <div className="trainer-messages__chat-user">
                                <div className="trainer-messages__avatar trainer-messages__avatar--large">
                                    {selectedConversation.avatar}
                                    {selectedConversation.online && <span className="trainer-messages__online-dot" />}
                                </div>
                                <div className="trainer-messages__user-info">
                                    <h3>{selectedConversation.name}</h3>
                                    <span>{selectedConversation.online ? 'Online' : 'Offline'}</span>
                                </div>
                            </div>
                            <div className="trainer-messages__chat-actions">
                                <button className="trainer-messages__action-btn"><Phone size={18} /></button>
                                <button className="trainer-messages__action-btn"><Video size={18} /></button>
                                <button className="trainer-messages__action-btn"><MoreVertical size={18} /></button>
                            </div>
                        </div>

                        <div className="trainer-messages__chat-body">
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`trainer-messages__message trainer-messages__message--${msg.sender}`}
                                >
                                    <div className="trainer-messages__message-content">
                                        <p>{msg.text}</p>
                                        <div className="trainer-messages__message-meta">
                                            <span>{msg.time}</span>
                                            {msg.sender === 'me' && (
                                                <span className="trainer-messages__message-status">
                                                    {msg.status === 'read' ? <CheckCheck size={14} /> : <Check size={14} />}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="trainer-messages__chat-input">
                            <button className="trainer-messages__attach-btn">
                                <Paperclip size={18} />
                            </button>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button 
                                className="trainer-messages__send-btn"
                                onClick={handleSend}
                                disabled={!messageText.trim()}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TrainerMessages;
