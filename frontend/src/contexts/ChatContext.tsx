import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import * as chatApi from '../services/chatApi';
import type { Conversation, ChatMessage, BlockedUser, ChatUser } from '../services/chatApi';

// Re-export types for use in components
export type { Conversation, ChatMessage, BlockedUser, ChatUser };

interface ChatContextType {
    // State
    conversations: Conversation[];
    activeConversation: Conversation | null;
    messages: ChatMessage[];
    connected: boolean;
    loading: boolean;
    blockedUsers: BlockedUser[];
    availableUsers: ChatUser[];

    // Actions
    setActiveConversation: (conversation: Conversation | null) => void;
    sendMessage: (content: string, type?: string, payload?: any) => void;
    loadConversations: () => Promise<void>;
    startPrivateChat: (targetUserId: number) => Promise<void>;

    // Blocking
    blockUser: (userId: number, reason?: string) => Promise<void>;
    unblockUser: (userId: number) => Promise<void>;
    isUserBlocked: (userId: number) => boolean;

    // User Discovery
    loadAvailableUsers: () => Promise<void>;
    searchUsers: (query: string) => Promise<ChatUser[]>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const token = user?.token;

    // Core chat state
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);

    // Blocking state
    const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);

    // User discovery state
    const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([]);

    const stompClientRef = useRef<Client | null>(null);
    const subscriptionRef = useRef<any>(null);

    // ==================== INITIALIZATION ====================

    useEffect(() => {
        if (user && token) {
            loadConversations();
            loadBlockedUsers();
            connectWebSocket();
        }
        return () => {
            disconnectWebSocket();
        };
    }, [user, token]);

    // ==================== LOAD MESSAGES ON CONVERSATION CHANGE ====================

    useEffect(() => {
        if (activeConversation) {
            loadMessages(activeConversation.conversationId);
            subscribeToConversation(activeConversation.conversationId);
        }
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
            }
        };
    }, [activeConversation?.conversationId, connected]);

    // ==================== WEBSOCKET ====================

    const connectWebSocket = useCallback(() => {
        if (!token || stompClientRef.current?.active) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8081/ws'),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            debug: () => {
                // Debug logging disabled in production
            },
            onConnect: () => {
                setConnected(true);
                console.log('✅ Connected to WebSocket');
            },
            onDisconnect: () => {
                setConnected(false);
                console.log('❌ Disconnected from WebSocket');
            },
            onStompError: (frame) => {
                console.error('STOMP Error:', frame.headers['message']);
            },
            reconnectDelay: 5000,
        });

        client.activate();
        stompClientRef.current = client;
    }, [token]);

    const disconnectWebSocket = useCallback(() => {
        if (stompClientRef.current) {
            stompClientRef.current.deactivate();
            stompClientRef.current = null;
            setConnected(false);
        }
    }, []);

    const subscribeToConversation = useCallback((conversationId: number) => {
        if (!stompClientRef.current?.connected) return;

        // Unsubscribe from previous
        if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
        }

        subscriptionRef.current = stompClientRef.current.subscribe(
            `/topic/conversation/${conversationId}`,
            (message) => {
                const newMessage: ChatMessage = JSON.parse(message.body);
                setMessages(prev => [...prev, newMessage]);
            }
        );
    }, []);

    // ==================== CONVERSATION APIs ====================

    const loadConversations = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const data = await chatApi.getConversations();
            setConversations(data || []);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const loadMessages = useCallback(async (conversationId: number) => {
        if (!token) return;
        try {
            const data = await chatApi.getMessages(conversationId);
            // Reverse to show oldest first
            setMessages((data || []).reverse());
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    }, [token]);

    const sendMessage = useCallback((content: string, type: string = 'TEXT', payload: any = null) => {
        if (!stompClientRef.current?.connected || !activeConversation) {
            console.error("Cannot send: not connected or no active conversation");
            return;
        }

        const chatMessage = {
            conversationId: activeConversation.conversationId,
            senderId: user?.id,
            content: content,
            contentType: type,
            payload: payload ? JSON.stringify(payload) : null
        };

        stompClientRef.current.publish({
            destination: "/app/chat.sendMessage",
            body: JSON.stringify(chatMessage)
        });
    }, [activeConversation, user?.id]);

    const startPrivateChat = useCallback(async (targetUserId: number) => {
        if (!token) return;
        try {
            const conversation = await chatApi.startPrivateChat(targetUserId);
            // Add to list if not exists
            setConversations(prev => {
                const exists = prev.find(c => c.conversationId === conversation.conversationId);
                if (exists) return prev;
                return [conversation, ...prev];
            });
            setActiveConversation(conversation);
        } catch (error) {
            console.error('Failed to start chat:', error);
            throw error;
        }
    }, [token]);

    // ==================== BLOCKING APIs ====================

    const loadBlockedUsers = useCallback(async () => {
        if (!token) return;
        try {
            const data = await chatApi.getBlockedUsers();
            setBlockedUsers(data || []);
        } catch (error) {
            console.error('Failed to load blocked users:', error);
        }
    }, [token]);

    const blockUser = useCallback(async (userId: number, reason?: string) => {
        try {
            await chatApi.blockUser(userId, reason);
            // Reload blocked users and conversations
            await loadBlockedUsers();
            await loadConversations();
        } catch (error) {
            console.error('Failed to block user:', error);
            throw error;
        }
    }, [loadBlockedUsers, loadConversations]);

    const unblockUser = useCallback(async (userId: number) => {
        try {
            await chatApi.unblockUser(userId);
            setBlockedUsers(prev => prev.filter(u => u.userId !== userId));
        } catch (error) {
            console.error('Failed to unblock user:', error);
            throw error;
        }
    }, []);

    const isUserBlocked = useCallback((userId: number): boolean => {
        return blockedUsers.some(u => u.userId === userId);
    }, [blockedUsers]);

    // ==================== USER DISCOVERY APIs ====================

    const loadAvailableUsers = useCallback(async () => {
        if (!token) return;
        try {
            const data = await chatApi.getAvailableChatUsers();
            setAvailableUsers(data || []);
        } catch (error) {
            console.error('Failed to load available users:', error);
        }
    }, [token]);

    const searchUsers = useCallback(async (query: string): Promise<ChatUser[]> => {
        if (!token || !query.trim()) return [];
        try {
            return await chatApi.searchUsers(query);
        } catch (error) {
            console.error('Failed to search users:', error);
            return [];
        }
    }, [token]);

    // ==================== CONTEXT VALUE ====================

    const value: ChatContextType = {
        // State
        conversations,
        activeConversation,
        messages,
        connected,
        loading,
        blockedUsers,
        availableUsers,
        // Actions
        setActiveConversation,
        sendMessage,
        loadConversations,
        startPrivateChat,
        // Blocking
        blockUser,
        unblockUser,
        isUserBlocked,
        // User Discovery
        loadAvailableUsers,
        searchUsers,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
