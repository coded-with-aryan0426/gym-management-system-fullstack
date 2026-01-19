package com.gym.management.service;

import com.gym.management.model.Conversation;
import com.gym.management.model.Message;
import com.gym.management.model.User;
import com.gym.management.repository.MessageReactionRepository;
import com.gym.management.repository.MessageRepository;
import com.gym.management.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class ChatServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private MessageReactionRepository messageReactionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private ChatService chatService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testEditMessage_Success() {
        Long messageId = 1L;
        Long userId = 100L;
        String oldContent = "Old Content";
        String newContent = "New Content";

        User user = new User();
        user.setUserId(userId);

        Conversation conversation = new Conversation();
        conversation.setConversationId(10L);

        Message message = new Message();
        message.setMessageId(messageId);
        message.setSender(user);
        message.setContent(oldContent);
        message.setConversation(conversation);
        message.setIsDeleted(false);

        when(messageRepository.findById(messageId)).thenReturn(Optional.of(message));
        when(messageRepository.save(any(Message.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Message updated = chatService.editMessage(messageId, userId, newContent);

        assertEquals(newContent, updated.getContent());
        assertFalse(updated.getEditHistory().isEmpty());
        assertEquals(oldContent, updated.getEditHistory().get(0).getPreviousContent());

        verify(messagingTemplate).convertAndSend(eq("/topic/conversation/10"), any(java.util.Map.class));
    }

    @Test
    void testDeleteMessage_Success() {
        Long messageId = 1L;
        Long userId = 100L;

        User user = new User();
        user.setUserId(userId);

        Conversation conversation = new Conversation();
        conversation.setConversationId(10L);

        Message message = new Message();
        message.setMessageId(messageId);
        message.setSender(user);
        message.setContent("Content");
        message.setConversation(conversation);
        message.setIsDeleted(false);

        when(messageRepository.findById(messageId)).thenReturn(Optional.of(message));

        chatService.deleteMessage(messageId, userId);

        assertTrue(message.getIsDeleted());
        assertEquals("This message was deleted", message.getContent());
        
        verify(messageRepository).save(message);
        verify(messagingTemplate).convertAndSend(eq("/topic/conversation/10"), any(java.util.Map.class));
    }
}
