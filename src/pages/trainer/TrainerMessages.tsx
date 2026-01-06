import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
    Search, Send, Paperclip, MoreVertical, Phone, Video, 
    ChevronDown, Check, CheckCheck, Plus, Image, FileText, 
    Dumbbell, Calendar, X, Download, Play, Pause, Mic, 
    Smile, Star, Pin, Archive, Trash2, Bell, BellOff,
    Clock, User, Target, TrendingUp, File, Link, Copy,
    ChevronRight, Filter, MessageSquare, Users, Settings,
    Camera, MapPin, Heart, Bookmark, Share2, BarChart2, Zap
} from 'lucide-react';
import './TrainerMessages.css';

interface Attachment {
    id: number;
    type: 'image' | 'video' | 'document' | 'workout' | 'meal-plan' | 'progress' | 'voice';
    name: string;
    url?: string;
    thumbnail?: string;
    size?: string;
    duration?: string;
    data?: any;
}

interface Message {
    id: number;
    sender: 'me' | 'them';
    text?: string;
    time: string;
    date: string;
    status: 'sending' | 'sent' | 'delivered' | 'read';
    type: 'text' | 'attachment' | 'workout-plan' | 'meal-plan' | 'progress-update' | 'session-request' | 'voice';
    attachment?: Attachment;
    reactions?: string[];
    replyTo?: number;
    isEdited?: boolean;
    isPinned?: boolean;
}

interface Conversation {
    id: number;
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
    unread: number;
    online: boolean;
    typing?: boolean;
    memberSince: string;
    goal: string;
    nextSession?: string;
    isPinned?: boolean;
    isMuted?: boolean;
    tags?: string[];
}

const TrainerMessages: React.FC = () => {
    const [selectedChat, setSelectedChat] = useState<number>(1);
    const [messageText, setMessageText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [showMemberInfo, setShowMemberInfo] = useState(false);
    const [showWorkoutBuilder, setShowWorkoutBuilder] = useState(false);
    const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'pinned'>('all');
    const [isRecording, setIsRecording] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const chatBodyRef = useRef<HTMLDivElement>(null);

    const conversations: Conversation[] = [
        { 
            id: 1, 
            name: 'Sarah Wilson', 
            avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=DC2626&color=fff', 
            lastMessage: 'Thanks for the workout plan!', 
            time: '2m ago', 
            unread: 2, 
            online: true,
            memberSince: 'Jan 2024',
            goal: 'Build muscle & strength',
            nextSession: 'Today, 3:00 PM',
            isPinned: true,
            tags: ['VIP', 'Strength']
        },
        { 
            id: 2, 
            name: 'Mike Johnson', 
            avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=3B82F6&color=fff', 
            lastMessage: 'Can we reschedule tomorrow?', 
            time: '15m ago', 
            unread: 0, 
            online: false,
            typing: true,
            memberSince: 'Feb 2024',
            goal: 'Weight loss',
            tags: ['Weight Loss']
        },
        { 
            id: 3, 
            name: 'Emma Davis', 
            avatar: 'https://ui-avatars.com/api/?name=Emma+Davis&background=10B981&color=fff', 
            lastMessage: 'See you at 3pm!', 
            time: '1h ago', 
            unread: 0, 
            online: true,
            memberSince: 'Dec 2023',
            goal: 'Overall fitness',
            nextSession: 'Tomorrow, 10:00 AM',
            tags: ['Cardio']
        },
        { 
            id: 4, 
            name: 'James Wilson', 
            avatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=F59E0B&color=fff', 
            lastMessage: 'Great session today!', 
            time: '3h ago', 
            unread: 0, 
            online: false,
            memberSince: 'Mar 2024',
            goal: 'Rehabilitation',
            isPinned: true,
            tags: ['Rehab']
        },
        { 
            id: 5, 
            name: 'Lisa Chen', 
            avatar: 'https://ui-avatars.com/api/?name=Lisa+Chen&background=8B5CF6&color=fff', 
            lastMessage: 'What should I eat before...', 
            time: 'Yesterday', 
            unread: 1, 
            online: false,
            memberSince: 'Jan 2024',
            goal: 'Nutrition & fitness',
            isMuted: true,
            tags: ['Nutrition']
        },
        { 
            id: 6, 
            name: 'David Brown', 
            avatar: 'https://ui-avatars.com/api/?name=David+Brown&background=EC4899&color=fff', 
            lastMessage: 'Perfect, I\'ll do that routine', 
            time: '2 days ago', 
            unread: 0, 
            online: false,
            memberSince: 'Nov 2023',
            goal: 'Marathon training',
            tags: ['Endurance']
        },
    ];

    const [messagesData, setMessagesData] = useState<Record<number, Message[]>>({
        1: [
            { id: 1, sender: 'them', text: 'Hi! I wanted to ask about my workout schedule for next week.', time: '10:30 AM', date: 'Today', status: 'read', type: 'text' },
            { id: 2, sender: 'me', text: 'Of course! I was just about to send you the updated plan.', time: '10:32 AM', date: 'Today', status: 'read', type: 'text' },
            { id: 3, sender: 'me', type: 'workout-plan', time: '10:33 AM', date: 'Today', status: 'read', attachment: {
                id: 1,
                type: 'workout',
                name: 'Week 12 - Upper Body Focus',
                data: {
                    duration: '45 min',
                    exercises: 6,
                    focus: 'Upper Body',
                    difficulty: 'Intermediate'
                }
            }},
            { id: 4, sender: 'them', text: 'That would be great! Also, should I increase my protein intake?', time: '10:35 AM', date: 'Today', status: 'read', type: 'text' },
            { id: 5, sender: 'me', text: 'Yes, I recommend adding 20g more protein per day. Focus on lean sources like chicken, fish, or plant-based options if you prefer.', time: '10:38 AM', date: 'Today', status: 'read', type: 'text' },
            { id: 6, sender: 'me', type: 'meal-plan', time: '10:39 AM', date: 'Today', status: 'delivered', attachment: {
                id: 2,
                type: 'meal-plan',
                name: 'High Protein Meal Plan',
                data: {
                    calories: '2200',
                    protein: '150g',
                    days: 7
                }
            }},
            { id: 7, sender: 'them', text: 'Thanks for the workout plan!', time: '10:40 AM', date: 'Today', status: 'read', type: 'text', reactions: ['❤️'] },
            { id: 8, sender: 'them', type: 'progress-update', time: '10:42 AM', date: 'Today', status: 'read', attachment: {
                id: 3,
                type: 'progress',
                name: 'Weekly Progress',
                data: {
                    weight: '78 kg',
                    change: '-2 kg',
                    workouts: 5,
                    streak: 12
                }
            }},
        ],
        2: [
            { id: 1, sender: 'them', text: 'Hey coach, I\'m feeling a bit under the weather today.', time: '9:00 AM', date: 'Today', status: 'read', type: 'text' },
            { id: 2, sender: 'me', text: 'No worries Mike! Rest is important. Let\'s reschedule.', time: '9:15 AM', date: 'Today', status: 'read', type: 'text' },
            { id: 3, sender: 'them', text: 'Can we reschedule tomorrow?', time: '9:20 AM', date: 'Today', status: 'read', type: 'text' },
        ]
    });

    const messages = messagesData[selectedChat] || [];
    const selectedConversation = conversations.find(c => c.id === selectedChat);

    const filteredConversations = useMemo(() => {
        let filtered = conversations;
        
        if (filterTab === 'unread') {
            filtered = filtered.filter(c => c.unread > 0);
        } else if (filterTab === 'pinned') {
            filtered = filtered.filter(c => c.isPinned);
        }
        
        if (searchQuery) {
            filtered = filtered.filter(c => 
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        return filtered.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return 0;
        });
    }, [conversations, filterTab, searchQuery]);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (messageText.trim()) {
            const newMessage: Message = {
                id: messages.length + 1,
                sender: 'me',
                text: messageText,
                time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
                date: 'Today',
                status: 'sending',
                type: 'text'
            };
            setMessagesData(prev => ({
                ...prev,
                [selectedChat]: [...(prev[selectedChat] || []), newMessage]
            }));
            setMessageText('');
            setTimeout(() => {
                setMessagesData(prev => ({
                    ...prev,
                    [selectedChat]: prev[selectedChat].map(m => 
                        m.id === newMessage.id ? { ...m, status: 'delivered' } : m
                    )
                }));
            }, 1000);
        }
    };

    const sendWorkoutPlan = () => {
        const newMessage: Message = {
            id: messages.length + 1,
            sender: 'me',
            type: 'workout-plan',
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            date: 'Today',
            status: 'sending',
            attachment: {
                id: Date.now(),
                type: 'workout',
                name: 'Custom Workout Plan',
                data: {
                    duration: '45 min',
                    exercises: 6,
                    focus: 'Full Body',
                    difficulty: 'Intermediate'
                }
            }
        };
        setMessagesData(prev => ({
            ...prev,
            [selectedChat]: [...(prev[selectedChat] || []), newMessage]
        }));
        setShowWorkoutBuilder(false);
        setShowAttachMenu(false);
    };

    const sendSessionRequest = () => {
        const newMessage: Message = {
            id: messages.length + 1,
            sender: 'me',
            type: 'session-request',
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            date: 'Today',
            status: 'sending',
            attachment: {
                id: Date.now(),
                type: 'document',
                name: 'Session Request',
                data: {
                    date: 'March 28, 2024',
                    time: '3:00 PM',
                    type: 'PT Session',
                    duration: '60 min'
                }
            }
        };
        setMessagesData(prev => ({
            ...prev,
            [selectedChat]: [...(prev[selectedChat] || []), newMessage]
        }));
        setShowAttachMenu(false);
    };

    const renderMessage = (msg: Message) => {
        if (msg.type === 'workout-plan' && msg.attachment) {
            return (
                <div className="trainer-messages__special-message trainer-messages__workout-card">
                    <div className="trainer-messages__workout-header">
                        <Dumbbell size={16} />
                        <span>Workout Plan</span>
                    </div>
                    <h4>{msg.attachment.name}</h4>
                    <div className="trainer-messages__workout-details">
                        <span><Clock size={12} /> {msg.attachment.data?.duration}</span>
                        <span><Target size={12} /> {msg.attachment.data?.exercises} exercises</span>
                        <span><Zap size={12} /> {msg.attachment.data?.difficulty}</span>
                    </div>
                    <div className="trainer-messages__workout-actions">
                        <button className="trainer-messages__workout-btn trainer-messages__workout-btn--primary">
                            <Play size={12} /> View Plan
                        </button>
                        <button className="trainer-messages__workout-btn">
                            <Download size={12} /> Export
                        </button>
                    </div>
                </div>
            );
        }

        if (msg.type === 'meal-plan' && msg.attachment) {
            return (
                <div className="trainer-messages__special-message trainer-messages__meal-card">
                    <div className="trainer-messages__meal-header">
                        <span className="trainer-messages__meal-icon">🥗</span>
                        <span>Meal Plan</span>
                    </div>
                    <h4>{msg.attachment.name}</h4>
                    <div className="trainer-messages__meal-details">
                        <div className="trainer-messages__meal-stat">
                            <span className="trainer-messages__meal-stat-value">{msg.attachment.data?.calories}</span>
                            <span className="trainer-messages__meal-stat-label">calories/day</span>
                        </div>
                        <div className="trainer-messages__meal-stat">
                            <span className="trainer-messages__meal-stat-value">{msg.attachment.data?.protein}</span>
                            <span className="trainer-messages__meal-stat-label">protein</span>
                        </div>
                        <div className="trainer-messages__meal-stat">
                            <span className="trainer-messages__meal-stat-value">{msg.attachment.data?.days}</span>
                            <span className="trainer-messages__meal-stat-label">days</span>
                        </div>
                    </div>
                    <button className="trainer-messages__meal-btn">
                        <FileText size={12} /> View Full Plan
                    </button>
                </div>
            );
        }

        if (msg.type === 'progress-update' && msg.attachment) {
            return (
                <div className="trainer-messages__special-message trainer-messages__progress-card">
                    <div className="trainer-messages__progress-header">
                        <TrendingUp size={16} />
                        <span>Progress Update</span>
                    </div>
                    <div className="trainer-messages__progress-stats">
                        <div className="trainer-messages__progress-stat">
                            <span className="trainer-messages__progress-value">{msg.attachment.data?.weight}</span>
                            <span className="trainer-messages__progress-label">Weight</span>
                            <span className="trainer-messages__progress-change trainer-messages__progress-change--positive">
                                {msg.attachment.data?.change}
                            </span>
                        </div>
                        <div className="trainer-messages__progress-stat">
                            <span className="trainer-messages__progress-value">{msg.attachment.data?.workouts}</span>
                            <span className="trainer-messages__progress-label">Workouts</span>
                        </div>
                        <div className="trainer-messages__progress-stat">
                            <span className="trainer-messages__progress-value">{msg.attachment.data?.streak}</span>
                            <span className="trainer-messages__progress-label">Day Streak 🔥</span>
                        </div>
                    </div>
                    <button className="trainer-messages__progress-btn">
                        <BarChart2 size={12} /> View Full Report
                    </button>
                </div>
            );
        }

        if (msg.type === 'session-request' && msg.attachment) {
            return (
                <div className="trainer-messages__special-message trainer-messages__session-card">
                    <div className="trainer-messages__session-header">
                        <Calendar size={16} />
                        <span>Session Request</span>
                    </div>
                    <h4>{msg.attachment.data?.type}</h4>
                    <div className="trainer-messages__session-details">
                        <span><Calendar size={12} /> {msg.attachment.data?.date}</span>
                        <span><Clock size={12} /> {msg.attachment.data?.time}</span>
                        <span><Target size={12} /> {msg.attachment.data?.duration}</span>
                    </div>
                    {msg.sender === 'them' ? (
                        <div className="trainer-messages__session-actions">
                            <button className="trainer-messages__session-btn trainer-messages__session-btn--accept">
                                <Check size={12} /> Accept
                            </button>
                            <button className="trainer-messages__session-btn trainer-messages__session-btn--decline">
                                <X size={12} /> Decline
                            </button>
                        </div>
                    ) : (
                        <div className="trainer-messages__session-status">
                            <Clock size={12} /> Awaiting response
                        </div>
                    )}
                </div>
            );
        }

        return <p>{msg.text}</p>;
    };

    const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

    return (
        <div className="trainer-messages">
            <div className={`trainer-messages__sidebar ${showMemberInfo ? 'trainer-messages__sidebar--collapsed' : ''}`}>
                <div className="trainer-messages__sidebar-header">
                    <div className="trainer-messages__sidebar-title">
                        <h2>Messages</h2>
                        {totalUnread > 0 && (
                            <span className="trainer-messages__total-unread">{totalUnread}</span>
                        )}
                    </div>
                    <button className="trainer-messages__new-chat-btn">
                        <Plus size={16} />
                    </button>
                </div>

                <div className="trainer-messages__search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="trainer-messages__filter-tabs">
                    <button 
                        className={`trainer-messages__filter-tab ${filterTab === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterTab('all')}
                    >
                        All
                    </button>
                    <button 
                        className={`trainer-messages__filter-tab ${filterTab === 'unread' ? 'active' : ''}`}
                        onClick={() => setFilterTab('unread')}
                    >
                        Unread
                        {totalUnread > 0 && <span>{totalUnread}</span>}
                    </button>
                    <button 
                        className={`trainer-messages__filter-tab ${filterTab === 'pinned' ? 'active' : ''}`}
                        onClick={() => setFilterTab('pinned')}
                    >
                        Pinned
                    </button>
                </div>

                <div className="trainer-messages__conversations">
                    {filteredConversations.map(conv => (
                        <button
                            key={conv.id}
                            className={`trainer-messages__conversation ${selectedChat === conv.id ? 'trainer-messages__conversation--active' : ''}`}
                            onClick={() => setSelectedChat(conv.id)}
                        >
                            <div className="trainer-messages__avatar">
                                <img src={conv.avatar} alt={conv.name} />
                                {conv.online && <span className="trainer-messages__online-dot" />}
                            </div>
                            <div className="trainer-messages__conv-info">
                                <div className="trainer-messages__conv-header">
                                    <span className="trainer-messages__conv-name">
                                        {conv.isPinned && <Pin size={10} className="trainer-messages__pin-icon" />}
                                        {conv.name}
                                        {conv.isMuted && <BellOff size={10} className="trainer-messages__muted-icon" />}
                                    </span>
                                    <span className="trainer-messages__conv-time">{conv.time}</span>
                                </div>
                                <div className="trainer-messages__conv-preview">
                                    <span className="trainer-messages__conv-message">
                                        {conv.typing ? (
                                            <span className="trainer-messages__typing">
                                                <span></span><span></span><span></span>
                                            </span>
                                        ) : conv.lastMessage}
                                    </span>
                                    {conv.unread > 0 && (
                                        <span className="trainer-messages__unread-badge">{conv.unread}</span>
                                    )}
                                </div>
                                {conv.tags && conv.tags.length > 0 && (
                                    <div className="trainer-messages__conv-tags">
                                        {conv.tags.map(tag => (
                                            <span key={tag} className="trainer-messages__conv-tag">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}

                    {filteredConversations.length === 0 && (
                        <div className="trainer-messages__no-results">
                            <MessageSquare size={24} />
                            <p>No conversations found</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="trainer-messages__chat">
                {selectedConversation ? (
                    <>
                        <div className="trainer-messages__chat-header">
                            <div className="trainer-messages__chat-user" onClick={() => setShowMemberInfo(!showMemberInfo)}>
                                <div className="trainer-messages__avatar trainer-messages__avatar--large">
                                    <img src={selectedConversation.avatar} alt={selectedConversation.name} />
                                    {selectedConversation.online && <span className="trainer-messages__online-dot" />}
                                </div>
                                <div className="trainer-messages__user-info">
                                    <h3>{selectedConversation.name}</h3>
                                    <span className={selectedConversation.online ? 'online' : ''}>
                                        {selectedConversation.online ? 'Online' : 'Last seen recently'}
                                    </span>
                                </div>
                            </div>
                            <div className="trainer-messages__chat-actions">
                                <button className="trainer-messages__action-btn" title="Voice Call">
                                    <Phone size={18} />
                                </button>
                                <button className="trainer-messages__action-btn" title="Video Call">
                                    <Video size={18} />
                                </button>
                                <button className="trainer-messages__action-btn" title="Schedule Session">
                                    <Calendar size={18} />
                                </button>
                                <button 
                                    className={`trainer-messages__action-btn ${showMemberInfo ? 'active' : ''}`}
                                    onClick={() => setShowMemberInfo(!showMemberInfo)}
                                    title="Member Info"
                                >
                                    <User size={18} />
                                </button>
                                <button className="trainer-messages__action-btn" title="More Options">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="trainer-messages__chat-body" ref={chatBodyRef}>
                            {messages.map((msg, index) => {
                                const showDate = index === 0 || messages[index - 1]?.date !== msg.date;
                                return (
                                    <React.Fragment key={msg.id}>
                                        {showDate && (
                                            <div className="trainer-messages__date-divider">
                                                <span>{msg.date}</span>
                                            </div>
                                        )}
                                        <div className={`trainer-messages__message trainer-messages__message--${msg.sender}`}>
                                            <div className="trainer-messages__message-content">
                                                {renderMessage(msg)}
                                                <div className="trainer-messages__message-meta">
                                                    <span>{msg.time}</span>
                                                    {msg.isEdited && <span className="trainer-messages__edited">edited</span>}
                                                    {msg.sender === 'me' && (
                                                        <span className={`trainer-messages__message-status trainer-messages__message-status--${msg.status}`}>
                                                            {msg.status === 'read' ? <CheckCheck size={14} /> : 
                                                             msg.status === 'delivered' ? <CheckCheck size={14} /> : 
                                                             msg.status === 'sent' ? <Check size={14} /> :
                                                             <Clock size={12} />}
                                                        </span>
                                                    )}
                                                </div>
                                                {msg.reactions && msg.reactions.length > 0 && (
                                                    <div className="trainer-messages__reactions">
                                                        {msg.reactions.map((r, i) => (
                                                            <span key={i} className="trainer-messages__reaction">{r}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        <div className="trainer-messages__chat-input-container">
                            {showAttachMenu && (
                                <div className="trainer-messages__attach-menu">
                                    <button onClick={() => { setShowWorkoutBuilder(true); setShowAttachMenu(false); }}>
                                        <div className="trainer-messages__attach-icon trainer-messages__attach-icon--workout">
                                            <Dumbbell size={18} />
                                        </div>
                                        <span>Workout Plan</span>
                                    </button>
                                    <button onClick={() => setShowAttachMenu(false)}>
                                        <div className="trainer-messages__attach-icon trainer-messages__attach-icon--meal">
                                            <span>🥗</span>
                                        </div>
                                        <span>Meal Plan</span>
                                    </button>
                                    <button onClick={sendSessionRequest}>
                                        <div className="trainer-messages__attach-icon trainer-messages__attach-icon--session">
                                            <Calendar size={18} />
                                        </div>
                                        <span>Schedule Session</span>
                                    </button>
                                    <button onClick={() => setShowAttachMenu(false)}>
                                        <div className="trainer-messages__attach-icon trainer-messages__attach-icon--progress">
                                            <TrendingUp size={18} />
                                        </div>
                                        <span>Progress Check</span>
                                    </button>
                                    <button onClick={() => setShowAttachMenu(false)}>
                                        <div className="trainer-messages__attach-icon trainer-messages__attach-icon--image">
                                            <Image size={18} />
                                        </div>
                                        <span>Photo/Video</span>
                                    </button>
                                    <button onClick={() => setShowAttachMenu(false)}>
                                        <div className="trainer-messages__attach-icon trainer-messages__attach-icon--file">
                                            <FileText size={18} />
                                        </div>
                                        <span>Document</span>
                                    </button>
                                </div>
                            )}

                            <div className="trainer-messages__chat-input">
                                <button 
                                    className={`trainer-messages__attach-btn ${showAttachMenu ? 'active' : ''}`}
                                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                                >
                                    {showAttachMenu ? <X size={18} /> : <Plus size={18} />}
                                </button>
                                <div className="trainer-messages__input-wrapper">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    />
                                    <button 
                                        className="trainer-messages__emoji-btn"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    >
                                        <Smile size={18} />
                                    </button>
                                </div>
                                {messageText.trim() ? (
                                    <button 
                                        className="trainer-messages__send-btn"
                                        onClick={handleSend}
                                    >
                                        <Send size={18} />
                                    </button>
                                ) : (
                                    <button 
                                        className={`trainer-messages__voice-btn ${isRecording ? 'recording' : ''}`}
                                        onClick={() => setIsRecording(!isRecording)}
                                    >
                                        <Mic size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="trainer-messages__no-chat">
                        <MessageSquare size={48} />
                        <h3>Select a conversation</h3>
                        <p>Choose a member to start chatting</p>
                    </div>
                )}
            </div>

            {showMemberInfo && selectedConversation && (
                <div className="trainer-messages__member-panel">
                    <div className="trainer-messages__member-header">
                        <h3>Member Info</h3>
                        <button onClick={() => setShowMemberInfo(false)}>
                            <X size={18} />
                        </button>
                    </div>
                    <div className="trainer-messages__member-profile">
                        <div className="trainer-messages__member-avatar">
                            <img src={selectedConversation.avatar} alt={selectedConversation.name} />
                            {selectedConversation.online && <span className="trainer-messages__online-dot trainer-messages__online-dot--large" />}
                        </div>
                        <h2>{selectedConversation.name}</h2>
                        <span className={`trainer-messages__member-status ${selectedConversation.online ? 'online' : ''}`}>
                            {selectedConversation.online ? 'Online now' : 'Offline'}
                        </span>
                        <div className="trainer-messages__member-actions">
                            <button><Phone size={14} /> Call</button>
                            <button><Video size={14} /> Video</button>
                            <button><Calendar size={14} /> Book</button>
                        </div>
                    </div>
                    <div className="trainer-messages__member-details">
                        <div className="trainer-messages__member-detail">
                            <span className="trainer-messages__detail-label">Member Since</span>
                            <span className="trainer-messages__detail-value">{selectedConversation.memberSince}</span>
                        </div>
                        <div className="trainer-messages__member-detail">
                            <span className="trainer-messages__detail-label">Goal</span>
                            <span className="trainer-messages__detail-value">{selectedConversation.goal}</span>
                        </div>
                        {selectedConversation.nextSession && (
                            <div className="trainer-messages__member-detail trainer-messages__member-detail--highlight">
                                <span className="trainer-messages__detail-label">Next Session</span>
                                <span className="trainer-messages__detail-value">{selectedConversation.nextSession}</span>
                            </div>
                        )}
                    </div>
                    <div className="trainer-messages__member-quick-actions">
                        <h4>Quick Actions</h4>
                        <button><Dumbbell size={14} /> Send Workout Plan</button>
                        <button><FileText size={14} /> Send Meal Plan</button>
                        <button><TrendingUp size={14} /> Request Progress Update</button>
                        <button><Star size={14} /> Add Note</button>
                    </div>
                    <div className="trainer-messages__member-media">
                        <h4>Shared Media</h4>
                        <div className="trainer-messages__media-grid">
                            <div className="trainer-messages__media-item"></div>
                            <div className="trainer-messages__media-item"></div>
                            <div className="trainer-messages__media-item"></div>
                            <div className="trainer-messages__media-item trainer-messages__media-more">+12</div>
                        </div>
                    </div>
                    <div className="trainer-messages__member-settings">
                        <button><Bell size={14} /> {selectedConversation.isMuted ? 'Unmute' : 'Mute'}</button>
                        <button><Pin size={14} /> {selectedConversation.isPinned ? 'Unpin' : 'Pin'}</button>
                        <button><Archive size={14} /> Archive</button>
                        <button className="danger"><Trash2 size={14} /> Delete Chat</button>
                    </div>
                </div>
            )}

            {showWorkoutBuilder && (
                <div className="trainer-messages__modal-overlay" onClick={() => setShowWorkoutBuilder(false)}>
                    <div className="trainer-messages__workout-modal" onClick={e => e.stopPropagation()}>
                        <div className="trainer-messages__workout-modal-header">
                            <h2>Send Workout Plan</h2>
                            <button onClick={() => setShowWorkoutBuilder(false)}><X size={18} /></button>
                        </div>
                        <div className="trainer-messages__workout-modal-body">
                            <div className="trainer-messages__workout-templates">
                                <h4>Quick Templates</h4>
                                <div className="trainer-messages__template-grid">
                                    <button className="trainer-messages__template-card">
                                        <Dumbbell size={20} />
                                        <span>Upper Body</span>
                                    </button>
                                    <button className="trainer-messages__template-card">
                                        <Dumbbell size={20} />
                                        <span>Lower Body</span>
                                    </button>
                                    <button className="trainer-messages__template-card">
                                        <Dumbbell size={20} />
                                        <span>Full Body</span>
                                    </button>
                                    <button className="trainer-messages__template-card">
                                        <Zap size={20} />
                                        <span>HIIT</span>
                                    </button>
                                </div>
                            </div>
                            <div className="trainer-messages__workout-form">
                                <div className="trainer-messages__form-field">
                                    <label>Plan Name</label>
                                    <input type="text" placeholder="e.g., Week 12 - Upper Body Focus" />
                                </div>
                                <div className="trainer-messages__form-row">
                                    <div className="trainer-messages__form-field">
                                        <label>Duration</label>
                                        <select>
                                            <option>30 min</option>
                                            <option>45 min</option>
                                            <option>60 min</option>
                                            <option>90 min</option>
                                        </select>
                                    </div>
                                    <div className="trainer-messages__form-field">
                                        <label>Difficulty</label>
                                        <select>
                                            <option>Beginner</option>
                                            <option>Intermediate</option>
                                            <option>Advanced</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="trainer-messages__form-field">
                                    <label>Notes (Optional)</label>
                                    <textarea placeholder="Add any specific instructions..."></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="trainer-messages__workout-modal-footer">
                            <button className="trainer-messages__modal-cancel" onClick={() => setShowWorkoutBuilder(false)}>
                                Cancel
                            </button>
                            <button className="trainer-messages__modal-send" onClick={sendWorkoutPlan}>
                                <Send size={14} /> Send Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainerMessages;
