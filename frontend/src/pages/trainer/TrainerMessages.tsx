import React, { useState, useEffect } from 'react';
import { Search, Send, MoreVertical, Phone, Video, Image, Paperclip, Smile, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import './Trainer.css';

interface Message {
    id: number;
    senderId: number;
    text: string;
    timestamp: Date;
    isRead: boolean;
    isMe: boolean;
}

interface Conversation {
    id: number;
    memberId: number;
    name: string;
    avatarInitials: string;
    avatarColor: string;
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
    status: 'online' | 'offline' | 'away';
    messages: Message[];
}

const TrainerMessages: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [isMobileListVisible, setIsMobileListVisible] = useState(true);

    useEffect(() => {
        // Mock Data
        const mockConversations: Conversation[] = [
            {
                id: 1,
                memberId: 101,
                name: 'Sarah Wilson',
                avatarInitials: 'SW',
                avatarColor: 'bg-indigo-600',
                lastMessage: 'Thanks for the session today!',
                lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
                unreadCount: 2,
                status: 'online',
                messages: [
                    { id: 1, senderId: 101, text: 'Hi Coach, are we still on for tomorrow?', timestamp: new Date(Date.now() - 1000 * 60 * 60), isRead: true, isMe: false },
                    { id: 2, senderId: 999, text: 'Yes! 9 AM as usual.', timestamp: new Date(Date.now() - 1000 * 60 * 55), isRead: true, isMe: true },
                    { id: 3, senderId: 101, text: 'Great. Also, my knee feels much better.', timestamp: new Date(Date.now() - 1000 * 60 * 10), isRead: false, isMe: false },
                    { id: 4, senderId: 101, text: 'Thanks for the session today!', timestamp: new Date(Date.now() - 1000 * 60 * 5), isRead: false, isMe: false },
                ]
            },
            {
                id: 2,
                memberId: 102,
                name: 'Michael Chen',
                avatarInitials: 'MC',
                avatarColor: 'bg-emerald-600',
                lastMessage: 'Can you send me the diet plan?',
                lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
                unreadCount: 0,
                status: 'offline',
                messages: [
                    { id: 1, senderId: 102, text: 'Hey, I hit a PR on deadlift!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25), isRead: true, isMe: false },
                    { id: 2, senderId: 999, text: 'That\'s awesome! How much?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24.5), isRead: true, isMe: true },
                    { id: 3, senderId: 102, text: '315lbs! Finally.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24.2), isRead: true, isMe: false },
                    { id: 4, senderId: 102, text: 'Can you send me the diet plan?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), isRead: true, isMe: false },
                ]
            },
            {
                id: 3,
                memberId: 103,
                name: 'David Lee',
                avatarInitials: 'DL',
                avatarColor: 'bg-amber-600',
                lastMessage: 'I need to reschedule.',
                lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 48),
                unreadCount: 0,
                status: 'away',
                messages: [
                    { id: 1, senderId: 103, text: 'I need to reschedule.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), isRead: true, isMe: false },
                ]
            }
        ];
        setConversations(mockConversations);
    }, []);

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversationId) return;

        const updatedConversations = conversations.map(c => {
            if (c.id === activeConversationId) {
                return {
                    ...c,
                    lastMessage: newMessage,
                    lastMessageTime: new Date(),
                    messages: [
                        ...c.messages,
                        {
                            id: Date.now(),
                            senderId: 999, // Me
                            text: newMessage,
                            timestamp: new Date(),
                            isRead: true,
                            isMe: true
                        }
                    ]
                };
            }
            return c;
        });

        setConversations(updatedConversations);
        setNewMessage('');
    };

    const handleConversationClick = (id: number) => {
        setActiveConversationId(id);
        setIsMobileListVisible(false);
        // Mark as read logic would go here
        setConversations(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
    };

    return (
        <div className="trainer-dashboard h-[calc(100vh-100px)] flex flex-col fade-in">
            <PageHeader
                title="Messages"
                subtitle="Chat with your assigned members"
            />

            <div className="flex-grow flex bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mt-6 shadow-2xl">
                {/* Sidebar (Conversation List) */}
                <div className={`w-full md:w-80 lg:w-96 border-r border-zinc-800 flex flex-col ${isMobileListVisible ? 'block' : 'hidden md:flex'}`}>
                    <div className="p-4 border-b border-zinc-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto">
                        {conversations.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => handleConversationClick(conv.id)}
                                className={`p-4 flex gap-3 cursor-pointer transition-colors border-b border-zinc-800/50 hover:bg-zinc-800/50 ${activeConversationId === conv.id ? 'bg-zinc-800 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="relative">
                                    <div className={`w-12 h-12 rounded-full ${conv.avatarColor} flex items-center justify-center text-white font-bold`}>
                                        {conv.avatarInitials}
                                    </div>
                                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900 ${conv.status === 'online' ? 'bg-green-500' :
                                            conv.status === 'away' ? 'bg-amber-500' : 'bg-zinc-500'
                                        }`}></div>
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className={`font-semibold truncate ${activeConversationId === conv.id ? 'text-white' : 'text-zinc-300'}`}>{conv.name}</h3>
                                        <span className="text-xs text-zinc-500 whitespace-nowrap">
                                            {conv.lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-white font-medium' : 'text-zinc-500'}`}>
                                        {conv.unreadCount > 0 && <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>}
                                        {conv.isMe && <span className="text-zinc-600">You: </span>}
                                        {conv.lastMessage}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`flex-grow flex flex-col bg-zinc-900 ${!isMobileListVisible ? 'block' : 'hidden md:flex'}`}>
                    {activeConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-16 px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIsMobileListVisible(true)}
                                        className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div className={`w-10 h-10 rounded-full ${activeConversation.avatarColor} flex items-center justify-center text-white font-bold text-sm`}>
                                        {activeConversation.avatarInitials}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm">{activeConversation.name}</h3>
                                        <span className="text-xs text-green-500 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                            {activeConversation.status === 'online' ? 'Active now' : 'Offline'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-zinc-400">
                                    <button className="hover:text-white transition-colors"><Phone size={20} /></button>
                                    <button className="hover:text-white transition-colors"><Video size={20} /></button>
                                    <button className="hover:text-white transition-colors"><MoreVertical size={20} /></button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-zinc-950/30">
                                {activeConversation.messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${msg.isMe
                                                ? 'bg-indigo-600 text-white rounded-br-sm'
                                                : 'bg-zinc-800 text-zinc-200 rounded-bl-sm border border-zinc-700'
                                            }`}>
                                            <p className="text-sm">{msg.text}</p>
                                            <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${msg.isMe ? 'text-indigo-200' : 'text-zinc-500'}`}>
                                                {msg.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                                {msg.isMe && (
                                                    msg.isRead ? <CheckCheck size={12} /> : <Check size={12} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-zinc-900 border-t border-zinc-800">
                                <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-4xl mx-auto">
                                    <div className="flex gap-2 pb-3 text-zinc-400">
                                        <button type="button" className="p-2 hover:bg-zinc-800 rounded-full transition-colors"><Paperclip size={20} /></button>
                                        <button type="button" className="p-2 hover:bg-zinc-800 rounded-full transition-colors"><Image size={20} /></button>
                                    </div>
                                    <div className="flex-grow bg-zinc-950 border border-zinc-800 rounded-xl flex items-center p-1 focus-within:border-indigo-500 transition-colors">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-grow bg-transparent border-none px-4 py-3 text-white focus:ring-0 placeholder-zinc-500 text-sm"
                                        />
                                        <button type="button" className="p-2 text-zinc-400 hover:text-white transition-colors">
                                            <Smile size={20} />
                                        </button>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Send size={20} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                            <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6">
                                <MessageSquare size={40} className="text-zinc-600" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Your Messages</h2>
                            <p className="text-zinc-500 max-w-md">
                                Select a conversation from the sidebar to start chatting with your members or team.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainerMessages;
