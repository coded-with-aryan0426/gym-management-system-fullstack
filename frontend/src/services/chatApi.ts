/**
 * Chat API Service
 * Typed API methods for all chat-related backend endpoints
 */

const API_BASE = 'http://localhost:8081/api/chat';

// ==================== TYPES ====================

export interface ChatUser {
    userId: number;
    fullName: string;
    username: string;
    avatarId?: string;
    role: string;
    gymId?: number;
    online?: boolean;
    lastSeen?: string;
}

export interface Participant {
    userId: number;
    fullName: string;
    avatarId?: string;
    role?: string;
}

export interface Conversation {
    conversationId: number;
    type: 'PRIVATE' | 'GROUP';
    title?: string;
    metadata?: string;
    participants: Participant[];
    updatedAt: string;
    unreadCount?: number;
}

export interface ChatMessage {
    messageId: number;
    conversationId: number;
    senderId: number;
    senderName?: string;
    senderAvatarId?: string;
    content: string;
    contentType: 'TEXT' | 'IMAGE' | 'WORKOUT_PLAN' | 'DIET_PLAN' | 'VOICE_NOTE';
    payload?: string;
    createdAt: string;
    isSystemMessage?: boolean;
}

export interface BlockedUser {
    userId: number;
    fullName: string;
    avatarId?: string;
}

export interface BlockStatus {
    isBlocked: boolean;
    hasBlocked: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

// ==================== HELPER ====================

const getAuthHeaders = (): HeadersInit => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return {};

    try {
        const user = JSON.parse(userStr);
        return {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
        };
    } catch {
        return {};
    }
};

const handleResponse = async <T>(response: Response): Promise<T> => {
    const data: ApiResponse<T> = await response.json();
    if (!data.success) {
        throw new Error(data.message || 'API request failed');
    }
    return data.data;
};

// ==================== CONVERSATION APIs ====================

export const getConversations = async (page = 0, size = 20): Promise<Conversation[]> => {
    const response = await fetch(
        `${API_BASE}/conversations?page=${page}&size=${size}`,
        { headers: getAuthHeaders() }
    );
    return handleResponse<Conversation[]>(response);
};

export const getMessages = async (
    conversationId: number,
    page = 0,
    size = 50
): Promise<ChatMessage[]> => {
    const response = await fetch(
        `${API_BASE}/conversations/${conversationId}/messages?page=${page}&size=${size}`,
        { headers: getAuthHeaders() }
    );
    return handleResponse<ChatMessage[]>(response);
};

export const startPrivateChat = async (targetUserId: number): Promise<Conversation> => {
    const response = await fetch(
        `${API_BASE}/private?targetUserId=${targetUserId}`,
        { method: 'POST', headers: getAuthHeaders() }
    );
    return handleResponse<Conversation>(response);
};

// ==================== USER DISCOVERY APIs ====================

export const getAvailableChatUsers = async (): Promise<ChatUser[]> => {
    const response = await fetch(
        `${API_BASE}/users`,
        { headers: getAuthHeaders() }
    );
    return handleResponse<ChatUser[]>(response);
};

export const searchUsers = async (
    query: string,
    gymId?: number,
    role?: string
): Promise<ChatUser[]> => {
    const params = new URLSearchParams({ query });
    if (gymId) params.append('gymId', gymId.toString());
    if (role) params.append('role', role);

    const response = await fetch(
        `${API_BASE}/users/search?${params}`,
        { headers: getAuthHeaders() }
    );
    return handleResponse<ChatUser[]>(response);
};

export const getUsersByRole = async (
    gymId: number,
    role: string
): Promise<ChatUser[]> => {
    const response = await fetch(
        `${API_BASE}/users/byRole?gymId=${gymId}&role=${role}`,
        { headers: getAuthHeaders() }
    );
    return handleResponse<ChatUser[]>(response);
};

// ==================== BLOCKING APIs ====================

export const blockUser = async (userId: number, reason?: string): Promise<void> => {
    const params = new URLSearchParams({ userId: userId.toString() });
    if (reason) params.append('reason', reason);

    const response = await fetch(
        `${API_BASE}/block?${params}`,
        { method: 'POST', headers: getAuthHeaders() }
    );
    await handleResponse<null>(response);
};

export const unblockUser = async (userId: number): Promise<void> => {
    const response = await fetch(
        `${API_BASE}/block?userId=${userId}`,
        { method: 'DELETE', headers: getAuthHeaders() }
    );
    await handleResponse<null>(response);
};

export const getBlockedUsers = async (): Promise<BlockedUser[]> => {
    const response = await fetch(
        `${API_BASE}/blocked`,
        { headers: getAuthHeaders() }
    );
    return handleResponse<BlockedUser[]>(response);
};

export const checkBlocked = async (userId: number): Promise<BlockStatus> => {
    const response = await fetch(
        `${API_BASE}/block/check?userId=${userId}`,
        { headers: getAuthHeaders() }
    );
    return handleResponse<BlockStatus>(response);
};

// ==================== EXPORT ALL ====================

export const chatApi = {
    // Conversations
    getConversations,
    getMessages,
    startPrivateChat,
    // User Discovery
    getAvailableChatUsers,
    searchUsers,
    getUsersByRole,
    // Blocking
    blockUser,
    unblockUser,
    getBlockedUsers,
    checkBlocked,
};

export default chatApi;
