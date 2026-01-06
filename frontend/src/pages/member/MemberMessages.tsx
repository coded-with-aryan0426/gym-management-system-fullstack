import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Send, Paperclip, MoreVertical, Phone, Video, 
    ChevronRight, Check, CheckCheck, Plus, Image, FileText, 
    Dumbbell, Calendar, X, Download, Mic, Smile, Pin, 
    Bell, BellOff, Clock, User, Target, TrendingUp, 
    MessageSquare, Star, Heart, HelpCircle, Headphones,
    ArrowLeft, Filter, Zap, Award, Camera, BarChart2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import '../../styles/unified-design-system.css';
import './MemberMessages.css';

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
}

interface Contact {
    id: number;
    name: string;
    avatar: string;
    role: 'trainer' | 'support' | 'nutritionist';
    lastMessage: string;
    time: string;
    unread: number;
    online: boolean;
    typing?: boolean;
    specialty?: string;
    isPinned?: boolean;
    isMuted?: boolean;
}

const MemberMessages: React.FC = () => {
    const [selectedChat, setSelectedChat] = useState<number>(1);
    const [messageText, setMessageText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [showContactInfo, setShowContactInfo] = useState(false);
    const [showSessionRequest, setShowSessionRequest] = useState(false);
    const [filterTab, setFilterTab] = useState<'all' | 'trainers' | 'support'>('all');
    const [isRecording, setIsRecording] = useState(false);
    const chatBodyRef = useRef<HTMLDivElement>(null);

    const contacts: Contact[] = [
        { 
            id: 1, 
            name: 'Coach Marcus', 
            avatar: 'https://ui-avatars.com/api/?name=Marcus+Chen&background=4F46E5&color=fff', 
            role: 'trainer',
            lastMessage: 'Great job on your workout today!', 
            time: '2m ago', 
            unread: 1, 
            online: true,
            specialty: 'Strength & Conditioning',
            isPinned: true
        },
        { 
            id: 2, 
            name: 'Sarah (Nutritionist)', 
            avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=10B981&color=fff', 
            role: 'nutritionist',
            lastMessage: 'Your meal plan is ready!', 
            time: '1h ago', 
            unread: 0, 
            online: true,
            specialty: 'Sports Nutrition',
            typing: true
        },
        { 
            id: 3, 
            name: 'Gym Support', 
            avatar: 'https://ui-avatars.com/api/?name=Support&background=007AFF&color=fff', 
            role: 'support',
            lastMessage: 'Your membership has been renewed', 
            time: '3h ago', 
            unread: 0, 
            online: true,
            specialty: 'Customer Support'
        },
        { 
            id: 4, 
            name: 'Coach Emily', 
            avatar: 'https://ui-avatars.com/api/?name=Emily+Davis&background=EC4899&color=fff', 
            role: 'trainer',
            lastMessage: 'See you at yoga class tomorrow!', 
            time: 'Yesterday', 
            unread: 0, 
            online: false,
            specialty: 'Yoga & Flexibility'
        },
        { 
            id: 5, 
            name: 'Front Desk', 
            avatar: 'https://ui-avatars.com/api/?name=Front+Desk&background=F59E0B&color=fff', 
            role: 'support',
            lastMessage: 'Your guest pass is ready', 
            time: '2 days ago', 
            unread: 0, 
            online: false,
            specialty: 'Reception'
        }
    ];

    const [messagesData, setMessagesData] = useState<Record<number, Message[]>>({
        1: [
            { id: 1, sender: 'them', text: 'Hey! How are you feeling after yesterday\'s session?', time: '10:30 AM', date: 'Today', status: 'read', type: 'text' },
            { id: 2, sender: 'me', text: 'A bit sore but in a good way! Those squats really worked my legs.', time: '10:32 AM', date: 'Today', status: 'read', type: 'text' },
            { id: 3, sender: 'them', text: 'That\'s exactly what we want! I\'ve updated your workout plan for next week with some progression.', time: '10:33 AM', date: 'Today', status: 'read', type: 'text' },
            { id: 4, sender: 'them', type: 'workout-plan', time: '10:34 AM', date: 'Today', status: 'read', attachment: {
                id: 1,
                type: 'workout',
                name: 'Week 5 - Progressive Overload',
                data: {
                    duration: '50 min',
                    exercises: 8,
                    focus: 'Lower Body',
                    difficulty: 'Intermediate'
                }
            }},
            { id: 5, sender: 'me', text: 'This looks challenging! I\'m excited to try it.', time: '10:36 AM', date: 'Today', status: 'read', type: 'text', reactions: ['💪'] },
            { id: 6, sender: 'them', text: 'Great job on your workout today!', time: '4:15 PM', date: 'Today', status: 'read', type: 'text' },
        ],
        2: [
            { id: 1, sender: 'them', text: 'Hi! I\'ve reviewed your food diary and I have some suggestions.', time: '9:00 AM', date: 'Today', status: 'read', type: 'text' },
            { id: 2, sender: 'them', type: 'meal-plan', time: '9:02 AM', date: 'Today', status: 'read', attachment: {
                id: 2,
                type: 'meal-plan',
                name: 'High Protein Meal Plan',
                data: {
                    calories: '2000',
                    protein: '140g',
                    days: 7
                }
            }},
            { id: 3, sender: 'me', text: 'Thank you so much! This looks delicious.', time: '9:15 AM', date: 'Today', status: 'read', type: 'text' },
            { id: 4, sender: 'them', text: 'Your meal plan is ready!', time: '11:00 AM', date: 'Today', status: 'read', type: 'text' },
        ],
        3: [
            { id: 1, sender: 'them', text: 'Hello! Thank you for reaching out. How can I help you today?', time: '2:00 PM', date: 'Yesterday', status: 'read', type: 'text' },
            { id: 2, sender: 'me', text: 'Hi, I wanted to ask about upgrading my membership to Premium.', time: '2:05 PM', date: 'Yesterday', status: 'read', type: 'text' },
            { id: 3, sender: 'them', text: 'Of course! The Premium plan includes 4 PT sessions per month, spa access, and nutrition consultations. Would you like me to process the upgrade?', time: '2:07 PM', date: 'Yesterday', status: 'read', type: 'text' },
            { id: 4, sender: 'me', text: 'Yes please!', time: '2:10 PM', date: 'Yesterday', status: 'read', type: 'text' },
            { id: 5, sender: 'them', text: 'Your membership has been renewed', time: '10:00 AM', date: 'Today', status: 'read', type: 'text' },
        ]
    });

    const messages = messagesData[selectedChat] || [];
    const selectedContact = contacts.find(c => c.id === selectedChat);

    const filteredContacts = useMemo(() => {
        let filtered = contacts;
        
        if (filterTab === 'trainers') {
            filtered = filtered.filter(c => c.role === 'trainer' || c.role === 'nutritionist');
        } else if (filterTab === 'support') {
            filtered = filtered.filter(c => c.role === 'support');
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
    }, [contacts, filterTab, searchQuery]);

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
                    date: 'January 5, 2026',
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
        setShowSessionRequest(false);
        setShowAttachMenu(false);
        toast.success('Session request sent!');
    };

    const sendProgressUpdate = () => {
        const newMessage: Message = {
            id: messages.length + 1,
            sender: 'me',
            type: 'progress-update',
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            date: 'Today',
            status: 'sending',
            attachment: {
                id: Date.now(),
                type: 'progress',
                name: 'My Progress Update',
                data: {
                    weight: '75 kg',
                    change: '-3 kg',
                    workouts: 8,
                    streak: 14
                }
            }
        };
        setMessagesData(prev => ({
            ...prev,
            [selectedChat]: [...(prev[selectedChat] || []), newMessage]
        }));
        setShowAttachMenu(false);
        toast.success('Progress update sent!');
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'trainer': return <Dumbbell size={12} />;
            case 'nutritionist': return <Heart size={12} />;
            case 'support': return <Headphones size={12} />;
            default: return <User size={12} />;
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'trainer': return '#4F46E5';
            case 'nutritionist': return '#10B981';
            case 'support': return '#007AFF';
            default: return '#6B7280';
        }
    };

    const renderMessage = (msg: Message) => {
        if (msg.type === 'workout-plan' && msg.attachment) {
            return (
                <div className="member-msg__special-card member-msg__workout-card">
                    <div className="member-msg__card-header">
                        <Dumbbell size={16} />
                        <span>Workout Plan</span>
                    </div>
                    <h4>{msg.attachment.name}</h4>
                    <div className="member-msg__card-details">
                        <span><Clock size={12} /> {msg.attachment.data?.duration}</span>
                        <span><Target size={12} /> {msg.attachment.data?.exercises} exercises</span>
                        <span><Zap size={12} /> {msg.attachment.data?.difficulty}</span>
                    </div>
                    <div className="member-msg__card-actions">
                        <button className="member-msg__card-btn member-msg__card-btn--primary">
                            View Plan
                        </button>
                        <button className="member-msg__card-btn">
                            <Download size={12} /> Save
                        </button>
                    </div>
                </div>
            );
        }

        if (msg.type === 'meal-plan' && msg.attachment) {
            return (
                <div className="member-msg__special-card member-msg__meal-card">
                    <div className="member-msg__card-header member-msg__card-header--green">
                        <span>🥗</span>
                        <span>Meal Plan</span>
                    </div>
                    <h4>{msg.attachment.name}</h4>
                    <div className="member-msg__meal-stats">
                        <div className="member-msg__meal-stat">
                            <span className="member-msg__meal-stat-value">{msg.attachment.data?.calories}</span>
                            <span className="member-msg__meal-stat-label">cal/day</span>
                        </div>
                        <div className="member-msg__meal-stat">
                            <span className="member-msg__meal-stat-value">{msg.attachment.data?.protein}</span>
                            <span className="member-msg__meal-stat-label">protein</span>
                        </div>
                        <div className="member-msg__meal-stat">
                            <span className="member-msg__meal-stat-value">{msg.attachment.data?.days}</span>
                            <span className="member-msg__meal-stat-label">days</span>
                        </div>
                    </div>
                    <button className="member-msg__card-btn member-msg__card-btn--green">
                        View Full Plan
                    </button>
                </div>
            );
        }

        if (msg.type === 'progress-update' && msg.attachment) {
            return (
                <div className="member-msg__special-card member-msg__progress-card">
                    <div className="member-msg__card-header member-msg__card-header--blue">
                        <TrendingUp size={16} />
                        <span>Progress Update</span>
                    </div>
                    <div className="member-msg__progress-stats">
                        <div className="member-msg__progress-stat">
                            <span className="member-msg__progress-value">{msg.attachment.data?.weight}</span>
                            <span className="member-msg__progress-label">Weight</span>
                            <span className="member-msg__progress-change">{msg.attachment.data?.change}</span>
                        </div>
                        <div className="member-msg__progress-stat">
                            <span className="member-msg__progress-value">{msg.attachment.data?.workouts}</span>
                            <span className="member-msg__progress-label">Workouts</span>
                        </div>
                        <div className="member-msg__progress-stat">
                            <span className="member-msg__progress-value">{msg.attachment.data?.streak}</span>
                            <span className="member-msg__progress-label">Day Streak 🔥</span>
                        </div>
                    </div>
                </div>
            );
        }

        if (msg.type === 'session-request' && msg.attachment) {
            return (
                <div className="member-msg__special-card member-msg__session-card">
                    <div className="member-msg__card-header member-msg__card-header--orange">
                        <Calendar size={16} />
                        <span>Session Request</span>
                    </div>
                    <h4>{msg.attachment.data?.type}</h4>
                    <div className="member-msg__card-details">
                        <span><Calendar size={12} /> {msg.attachment.data?.date}</span>
                        <span><Clock size={12} /> {msg.attachment.data?.time}</span>
                    </div>
                    <div className="member-msg__session-status">
                        <Clock size={12} /> Awaiting confirmation
                    </div>
                </div>
            );
        }

        return <p>{msg.text}</p>;
    };

    const totalUnread = contacts.reduce((sum, c) => sum + c.unread, 0);

    return (
        <div className="member-messages">
            <div className={`member-msg__sidebar ${showContactInfo ? 'member-msg__sidebar--collapsed' : ''}`}>
                <div className="member-msg__sidebar-header">
                    <div className="member-msg__sidebar-title">
                        <h2>Messages</h2>
                        {totalUnread > 0 && (
                            <span className="member-msg__unread-total">{totalUnread}</span>
                        )}
                    </div>
                </div>

                <div className="member-msg__search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="member-msg__filter-tabs">
                    <button 
                        className={`member-msg__filter-tab ${filterTab === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterTab('all')}
                    >
                        All
                    </button>
                    <button 
                        className={`member-msg__filter-tab ${filterTab === 'trainers' ? 'active' : ''}`}
                        onClick={() => setFilterTab('trainers')}
                    >
                        <Dumbbell size={12} />
                        Trainers
                    </button>
                    <button 
                        className={`member-msg__filter-tab ${filterTab === 'support' ? 'active' : ''}`}
                        onClick={() => setFilterTab('support')}
                    >
                        <Headphones size={12} />
                        Support
                    </button>
                </div>

                <div className="member-msg__contacts">
                    {filteredContacts.map(contact => (
                        <motion.button
                            key={contact.id}
                            className={`member-msg__contact ${selectedChat === contact.id ? 'member-msg__contact--active' : ''}`}
                            onClick={() => setSelectedChat(contact.id)}
                            whileHover={{ x: 2 }}
                        >
                            <div className="member-msg__avatar">
                                <img src={contact.avatar} alt={contact.name} />
                                {contact.online && <span className="member-msg__online-dot" />}
                            </div>
                            <div className="member-msg__contact-info">
                                <div className="member-msg__contact-header">
                                    <span className="member-msg__contact-name">
                                        {contact.isPinned && <Pin size={10} className="member-msg__pin-icon" />}
                                        {contact.name}
                                    </span>
                                    <span className="member-msg__contact-time">{contact.time}</span>
                                </div>
                                <div className="member-msg__contact-preview">
                                    <span className="member-msg__contact-message">
                                        {contact.typing ? (
                                            <span className="member-msg__typing">
                                                <span></span><span></span><span></span>
                                            </span>
                                        ) : contact.lastMessage}
                                    </span>
                                    {contact.unread > 0 && (
                                        <span className="member-msg__unread-badge">{contact.unread}</span>
                                    )}
                                </div>
                                <span 
                                    className="member-msg__role-badge"
                                    style={{ background: `${getRoleBadgeColor(contact.role)}20`, color: getRoleBadgeColor(contact.role) }}
                                >
                                    {getRoleIcon(contact.role)}
                                    {contact.role}
                                </span>
                            </div>
                        </motion.button>
                    ))}

                    {filteredContacts.length === 0 && (
                        <div className="member-msg__no-results">
                            <MessageSquare size={24} />
                            <p>No conversations found</p>
                        </div>
                    )}
                </div>

                <div className="member-msg__help-card">
                    <HelpCircle size={18} />
                    <div>
                        <span>Need Help?</span>
                        <p>Contact our 24/7 support</p>
                    </div>
                </div>
            </div>

            <div className="member-msg__chat">
                {selectedContact ? (
                    <>
                        <div className="member-msg__chat-header">
                            <div className="member-msg__chat-user" onClick={() => setShowContactInfo(!showContactInfo)}>
                                <div className="member-msg__avatar member-msg__avatar--large">
                                    <img src={selectedContact.avatar} alt={selectedContact.name} />
                                    {selectedContact.online && <span className="member-msg__online-dot" />}
                                </div>
                                <div className="member-msg__user-info">
                                    <h3>{selectedContact.name}</h3>
                                    <span className={selectedContact.online ? 'online' : ''}>
                                        {selectedContact.typing ? 'typing...' : selectedContact.online ? 'Online' : 'Last seen recently'}
                                    </span>
                                </div>
                            </div>
                            <div className="member-msg__chat-actions">
                                {selectedContact.role === 'trainer' && (
                                    <button 
                                        className="member-msg__action-btn member-msg__action-btn--primary"
                                        onClick={() => setShowSessionRequest(true)}
                                        title="Request Session"
                                    >
                                        <Calendar size={16} />
                                        Book Session
                                    </button>
                                )}
                                <button className="member-msg__action-btn" title="Voice Call">
                                    <Phone size={18} />
                                </button>
                                <button className="member-msg__action-btn" title="Video Call">
                                    <Video size={18} />
                                </button>
                                <button 
                                    className={`member-msg__action-btn ${showContactInfo ? 'active' : ''}`}
                                    onClick={() => setShowContactInfo(!showContactInfo)}
                                    title="Info"
                                >
                                    <User size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="member-msg__chat-body" ref={chatBodyRef}>
                            {messages.map((msg, index) => {
                                const showDate = index === 0 || messages[index - 1]?.date !== msg.date;
                                return (
                                    <React.Fragment key={msg.id}>
                                        {showDate && (
                                            <div className="member-msg__date-divider">
                                                <span>{msg.date}</span>
                                            </div>
                                        )}
                                        <motion.div 
                                            className={`member-msg__message member-msg__message--${msg.sender}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <div className="member-msg__message-content">
                                                {renderMessage(msg)}
                                                <div className="member-msg__message-meta">
                                                    <span>{msg.time}</span>
                                                    {msg.sender === 'me' && (
                                                        <span className={`member-msg__message-status member-msg__message-status--${msg.status}`}>
                                                            {msg.status === 'read' ? <CheckCheck size={14} /> : 
                                                             msg.status === 'delivered' ? <CheckCheck size={14} /> : 
                                                             msg.status === 'sent' ? <Check size={14} /> :
                                                             <Clock size={12} />}
                                                        </span>
                                                    )}
                                                </div>
                                                {msg.reactions && msg.reactions.length > 0 && (
                                                    <div className="member-msg__reactions">
                                                        {msg.reactions.map((r, i) => (
                                                            <span key={i}>{r}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        <div className="member-msg__input-container">
                            <AnimatePresence>
                                {showAttachMenu && (
                                    <motion.div 
                                        className="member-msg__attach-menu"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                    >
                                        {selectedContact.role === 'trainer' && (
                                            <>
                                                <button onClick={() => { setShowSessionRequest(true); setShowAttachMenu(false); }}>
                                                    <div className="member-msg__attach-icon member-msg__attach-icon--orange">
                                                        <Calendar size={18} />
                                                    </div>
                                                    <span>Book Session</span>
                                                </button>
                                                <button onClick={sendProgressUpdate}>
                                                    <div className="member-msg__attach-icon member-msg__attach-icon--blue">
                                                        <TrendingUp size={18} />
                                                    </div>
                                                    <span>Share Progress</span>
                                                </button>
                                            </>
                                        )}
                                        <button onClick={() => { toast.success('Opening camera...'); setShowAttachMenu(false); }}>
                                            <div className="member-msg__attach-icon member-msg__attach-icon--pink">
                                                <Camera size={18} />
                                            </div>
                                            <span>Photo</span>
                                        </button>
                                        <button onClick={() => { toast.success('Opening files...'); setShowAttachMenu(false); }}>
                                            <div className="member-msg__attach-icon member-msg__attach-icon--gray">
                                                <FileText size={18} />
                                            </div>
                                            <span>Document</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="member-msg__input-row">
                                <button 
                                    className={`member-msg__attach-btn ${showAttachMenu ? 'active' : ''}`}
                                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                                >
                                    {showAttachMenu ? <X size={18} /> : <Plus size={18} />}
                                </button>
                                <div className="member-msg__input-wrapper">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    />
                                    <button className="member-msg__emoji-btn">
                                        <Smile size={18} />
                                    </button>
                                </div>
                                {messageText.trim() ? (
                                    <motion.button 
                                        className="member-msg__send-btn"
                                        onClick={handleSend}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Send size={18} />
                                    </motion.button>
                                ) : (
                                    <button 
                                        className={`member-msg__voice-btn ${isRecording ? 'recording' : ''}`}
                                        onClick={() => setIsRecording(!isRecording)}
                                    >
                                        <Mic size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="member-msg__no-chat">
                        <MessageSquare size={48} />
                        <h3>Select a conversation</h3>
                        <p>Choose a contact to start chatting</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showContactInfo && selectedContact && (
                    <motion.div 
                        className="member-msg__info-panel"
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                    >
                        <div className="member-msg__info-header">
                            <h3>Contact Info</h3>
                            <button onClick={() => setShowContactInfo(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="member-msg__info-profile">
                            <div className="member-msg__info-avatar">
                                <img src={selectedContact.avatar} alt={selectedContact.name} />
                                {selectedContact.online && <span className="member-msg__online-dot member-msg__online-dot--large" />}
                            </div>
                            <h2>{selectedContact.name}</h2>
                            <span 
                                className="member-msg__info-role"
                                style={{ background: `${getRoleBadgeColor(selectedContact.role)}20`, color: getRoleBadgeColor(selectedContact.role) }}
                            >
                                {getRoleIcon(selectedContact.role)}
                                {selectedContact.specialty}
                            </span>
                            <span className={`member-msg__info-status ${selectedContact.online ? 'online' : ''}`}>
                                {selectedContact.online ? 'Online now' : 'Offline'}
                            </span>
                        </div>
                        
                        {selectedContact.role === 'trainer' && (
                            <div className="member-msg__info-actions">
                                <button onClick={() => { setShowSessionRequest(true); setShowContactInfo(false); }}>
                                    <Calendar size={14} /> Book Session
                                </button>
                                <button>
                                    <BarChart2 size={14} /> View Progress
                                </button>
                            </div>
                        )}

                        <div className="member-msg__info-section">
                            <h4>Quick Actions</h4>
                            <button><Star size={14} /> Rate {selectedContact.role === 'trainer' ? 'Trainer' : 'Experience'}</button>
                            <button><Bell size={14} /> Notifications</button>
                            <button><Pin size={14} /> Pin Conversation</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showSessionRequest && (
                    <motion.div 
                        className="member-msg__modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowSessionRequest(false)}
                    >
                        <motion.div 
                            className="member-msg__session-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="member-msg__modal-header">
                                <h3><Calendar size={20} /> Request Session</h3>
                                <button onClick={() => setShowSessionRequest(false)}><X size={18} /></button>
                            </div>
                            <div className="member-msg__modal-body">
                                <div className="member-msg__modal-field">
                                    <label>Session Type</label>
                                    <select defaultValue="pt">
                                        <option value="pt">Personal Training (1-on-1)</option>
                                        <option value="group">Small Group Training</option>
                                        <option value="assessment">Fitness Assessment</option>
                                    </select>
                                </div>
                                <div className="member-msg__modal-row">
                                    <div className="member-msg__modal-field">
                                        <label>Preferred Date</label>
                                        <input type="date" defaultValue="2026-01-05" />
                                    </div>
                                    <div className="member-msg__modal-field">
                                        <label>Preferred Time</label>
                                        <select defaultValue="15:00">
                                            <option value="09:00">9:00 AM</option>
                                            <option value="10:00">10:00 AM</option>
                                            <option value="11:00">11:00 AM</option>
                                            <option value="14:00">2:00 PM</option>
                                            <option value="15:00">3:00 PM</option>
                                            <option value="16:00">4:00 PM</option>
                                            <option value="17:00">5:00 PM</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="member-msg__modal-field">
                                    <label>Notes (Optional)</label>
                                    <textarea placeholder="Any specific areas you want to focus on..."></textarea>
                                </div>
                            </div>
                            <div className="member-msg__modal-footer">
                                <button className="member-msg__modal-btn member-msg__modal-btn--secondary" onClick={() => setShowSessionRequest(false)}>
                                    Cancel
                                </button>
                                <button className="member-msg__modal-btn member-msg__modal-btn--primary" onClick={sendSessionRequest}>
                                    <Send size={14} /> Send Request
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MemberMessages;
