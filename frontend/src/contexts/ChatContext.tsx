import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import * as chatApi from '../services/chatApi';
import type { Conversation, ChatMessage, BlockedUser, ChatUser } from '../services/chatApi';
import { getPresence } from '../services/chatApi';

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
    typingUsers: Record<number, number[]>;
    hasMoreMessages: boolean;
    loadingMoreMessages: boolean;
    // U6 — presence: userId -> isOnline
    presenceMap: Record<number, boolean>;
    // U10 — reply-to
    replyToMessage: ChatMessage | null;
    setReplyTo: (message: ChatMessage | null) => void;

    // Actions
    setActiveConversation: (conversation: Conversation | null) => void;
    sendMessage: (content: string, type?: string, payload?: any) => void;
    sendTyping: (isTyping: boolean) => void;
    loadConversations: () => Promise<void>;
    loadMoreMessages: () => Promise<void>;
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

    // Typing state
    const [typingUsers, setTypingUsers] = useState<Record<number, number[]>>({});

    // Pagination state for message infinite scroll
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);

    // U6 — presence map: userId -> isOnline
    const [presenceMap, setPresenceMap] = useState<Record<number, boolean>>({});
    const presenceSubscriptionRef = useRef<any>(null);

    // U10 — reply-to message state
    const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
    const setReplyTo = useCallback((message: ChatMessage | null) => {
        setReplyToMessage(message);
    }, []);

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
            setReplyToMessage(null); // U10 — clear reply-to on conversation switch
        }
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
            }
        };
    }, [activeConversation?.conversationId, connected]);

    // ==================== SORT HELPER ====================

    // Sort conversations newest-first (by lastMessageAt, then updatedAt)
    const sortConversations = (convs: Conversation[]): Conversation[] =>
        [...convs].sort((a, b) => {
            const ta = new Date(a.lastMessageAt ?? a.updatedAt ?? 0).getTime();
            const tb = new Date(b.lastMessageAt ?? b.updatedAt ?? 0).getTime();
            return tb - ta;
        });

    // ==================== WEBSOCKET ====================

    const connectWebSocket = useCallback(() => {
        if (!token || stompClientRef.current?.active) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8081/ws'),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            debug: (str) => {
                console.log(str);
            },
            onConnect: () => {
                setConnected(true);
                console.log('✅ Connected to WebSocket');
                // U6 — subscribe to global presence topic
                presenceSubscriptionRef.current = client.subscribe('/topic/presence', (msg) => {
                    const event = JSON.parse(msg.body);
                    if (event.type === 'PRESENCE') {
                        setPresenceMap(prev => ({ ...prev, [event.userId]: event.online }));
                    }
                });
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

    const handleWebSocketEvent = useCallback((event: any) => {
        switch (event.type) {
            case 'MESSAGE_EDIT':
                setMessages(prev => prev.map(m =>
                    m.messageId === event.messageId
                        ? { ...m, content: event.content, isEdited: true }
                        : m
                ));
                break;
            case 'MESSAGE_DELETE':
                setMessages(prev => prev.map(m =>
                    m.messageId === event.messageId
                        ? { ...m, content: 'This message was deleted', isSystemMessage: true }
                        : m
                ));
                break;
            case 'REACTION_ADD':
                setMessages(prev => prev.map(m => {
                    if (m.messageId === event.messageId) {
                        const exists = m.reactions?.some(r => r.userId === event.userId && r.emoji === event.emoji);
                        if (exists) return m;

                        const newReaction: any = {
                            reactionId: Date.now(),
                            userId: event.userId,
                            userFullName: 'User',
                            emoji: event.emoji,
                            createdAt: new Date().toISOString()
                        };
                        return { ...m, reactions: [...(m.reactions || []), newReaction] };
                    }
                    return m;
                }));
                break;
            case 'REACTION_REMOVE':
                setMessages(prev => prev.map(m => {
                    if (m.messageId === event.messageId) {
                        return {
                            ...m,
                            reactions: (m.reactions || []).filter(r =>
                                !(r.userId === event.userId && r.emoji === event.emoji)
                            )
                        };
                    }
                    return m;
                }));
                break;
            case 'TYPING':
                setTypingUsers(prev => {
                    const convId = event.conversationId;
                    const userIds = prev[convId] || [];
                    if (event.isTyping) {
                        if (!userIds.includes(event.userId)) return { ...prev, [convId]: [...userIds, event.userId] };
                    } else {
                        return { ...prev, [convId]: userIds.filter(id => id !== event.userId) };
                    }
                    return prev;
                });
                break;
            case 'MESSAGES_READ':
                // The other participant read our messages — upgrade all SENT/DELIVERED to READ
                setMessages(prev => prev.map(m =>
                    m.senderId === user?.userId || m.senderId === Number(user?.id)
                        ? { ...m, deliveryStatus: 'READ' as const }
                        : m
                ));
                break;
            case 'PRESENCE':
                // Real-time presence update from backend broadcast
                setPresenceMap(prev => ({ ...prev, [event.userId]: event.online }));
                break;
        }
    }, []);

    const subscribeToConversation = useCallback((conversationId: number) => {
        if (!stompClientRef.current?.connected) return;

        // Unsubscribe from previous
        if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
        }

            console.log(`Subscribing to /topic/conversation/${conversationId}`);
        subscriptionRef.current = stompClientRef.current.subscribe(
            `/topic/conversation/${conversationId}`,
            (message) => {
                console.log("WebSocket received message:", message.body);
                const body = JSON.parse(message.body);
                if (body.type) {
                    handleWebSocketEvent(body);
                } else {
                    const newMessage: ChatMessage = body;
                    setMessages(prev => {
                        console.log("Adding new message to state:", newMessage);
                        if (prev.some(m => m.messageId === newMessage.messageId)) return prev;
                        // If this is our own message and has no deliveryStatus, default to SENT
                        const currentUserId = user?.userId || Number(user?.id);
                        const enriched = newMessage.senderId === currentUserId && !newMessage.deliveryStatus
                            ? { ...newMessage, deliveryStatus: 'SENT' as const }
                            : newMessage;
                        return [...prev, enriched];
                    });
                    // Update the conversation's last-message preview and bubble it to top
                    setConversations(prev => {
                        const updated = prev.map(c => {
                            if (c.conversationId !== newMessage.conversationId) return c;
                            return {
                                ...c,
                                lastMessageContent: newMessage.content,
                                lastMessageType: newMessage.contentType,
                                lastMessageAt: newMessage.createdAt,
                                lastMessageSenderId: newMessage.senderId,
                                updatedAt: newMessage.createdAt,
                            };
                        });
                        return sortConversations(updated);
                    });
                }
            }
        );
    }, [handleWebSocketEvent]);

    // ==================== CONVERSATION APIs ====================

    const loadConversations = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const data = await chatApi.getConversations();
            const sorted = sortConversations(data || []);
            setConversations(sorted);
            // U6 — fetch initial presence for all participants
            const allUserIds = Array.from(new Set(
                sorted.flatMap(c => c.participants?.map((p: any) => Number(p.userId)) || [])
            ));
            if (allUserIds.length) {
                getPresence(allUserIds).then(map => {
                    setPresenceMap(map as Record<number, boolean>);
                }).catch(() => {});
            }
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const loadMessages = useCallback(async (conversationId: number) => {
        if (!token) return;
        try {
            const paged = await chatApi.getMessages(conversationId, 0);
            // Reverse so oldest messages are at top
            setMessages((paged.messages || []).reverse());
            setCurrentPage(0);
            setHasMoreMessages(paged.hasMore);
            // Mark as read — clears unread badge and updates delivery ticks for other participants
            chatApi.markConversationAsRead(conversationId).catch(() => {});
            // Zero out unread count in sidebar immediately
            setConversations(prev => prev.map(c =>
                c.conversationId === conversationId ? { ...c, unreadCount: 0 } : c
            ));
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    }, [token]);

    // B4 — load older messages and prepend them (infinite scroll going up)
    const loadMoreMessages = useCallback(async () => {
        if (!token || !activeConversation || !hasMoreMessages || loadingMoreMessages) return;
        setLoadingMoreMessages(true);
        try {
            const nextPage = currentPage + 1;
            const paged = await chatApi.getMessages(activeConversation.conversationId, nextPage);
            // New page comes in desc order (newest first), reverse to get oldest first, then prepend
            const older = (paged.messages || []).reverse();
            setMessages(prev => [...older, ...prev]);
            setCurrentPage(nextPage);
            setHasMoreMessages(paged.hasMore);
        } catch (error) {
            console.error('Failed to load more messages:', error);
        } finally {
            setLoadingMoreMessages(false);
        }
    }, [token, activeConversation, hasMoreMessages, loadingMoreMessages, currentPage]);

    const sendMessage = useCallback((content: string, type: string = 'TEXT', payload: any = null) => {
        if (!stompClientRef.current?.connected || !activeConversation) {
            console.error("Cannot send: not connected or no active conversation");
            return;
        }

        console.log("Sending status:", stompClientRef.current.connected, activeConversation);
        const chatMessage = {
            conversationId: activeConversation.conversationId,
            senderId: user?.userId || Number(user?.id),
            content: content,
            contentType: type,
            payload: payload ? JSON.stringify(payload) : null,
            // U10 — include reply-to id if set
            replyToMessageId: replyToMessage?.messageId ?? null,
        };
        console.log("Publishing message:", chatMessage);

        stompClientRef.current.publish({
            destination: "/app/chat.sendMessage",
            body: JSON.stringify(chatMessage)
        });
        // Clear reply-to after sending
        setReplyToMessage(null);
    }, [activeConversation, user?.id, replyToMessage]);

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

    const sendTyping = useCallback((isTyping: boolean) => {
        if (!stompClientRef.current?.connected || !activeConversation) return;

        stompClientRef.current.publish({
            destination: "/app/chat.typing",
            body: JSON.stringify({
                conversationId: activeConversation.conversationId,
                isTyping: isTyping
            })
        });
    }, [activeConversation]);

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
        typingUsers,
        hasMoreMessages,
        loadingMoreMessages,
        presenceMap,
        // U10 — reply-to
        replyToMessage,
        setReplyTo,
        // Actions
        setActiveConversation,
        sendMessage,
        sendTyping,
        loadConversations,
        loadMoreMessages,
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
