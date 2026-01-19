package com.gym.management.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ConversationDTO {
    private Long conversationId;
    private String type;
    private String title;
    private String metadata;
    private LocalDateTime updatedAt;
    private List<ParticipantDTO> participants;

    @Data
    public static class ParticipantDTO {
        private Long userId;
        private String fullName;
        private String username;
        private String avatarId;
        private String role;
    }
}
