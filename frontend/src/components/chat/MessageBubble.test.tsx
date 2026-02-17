import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MessageBubble from './MessageBubble';
import { ChatMessage } from '../../services/chatApi';
import '@testing-library/jest-dom';

// Mock useAuth
vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 100, fullName: 'Test User' }
    })
}));

describe('MessageBubble', () => {
    const mockMessage: ChatMessage = {
        messageId: 1,
        conversationId: 1,
        senderId: 100,
        content: 'Hello World',
        contentType: 'TEXT',
        createdAt: new Date().toISOString(),
        reactions: []
    };

    const mockHandlers = {
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onReact: vi.fn(),
        onRemoveReaction: vi.fn()
    };

    it('renders message content', () => {
        render(
            <MessageBubble 
                message={mockMessage} 
                isMyMessage={true} 
                {...mockHandlers} 
            />
        );
        expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('shows edited status', () => {
        const editedMessage = { ...mockMessage, isEdited: true };
        render(
            <MessageBubble 
                message={editedMessage} 
                isMyMessage={true} 
                {...mockHandlers} 
            />
        );
        expect(screen.getByText('(edited)')).toBeInTheDocument();
    });
});
