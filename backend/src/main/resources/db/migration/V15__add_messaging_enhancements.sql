-- Create message_reactions table
CREATE TABLE message_reactions (
    reaction_id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    emoji VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_reaction_message FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE,
    CONSTRAINT fk_reaction_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT uk_reaction_message_user_emoji UNIQUE (message_id, user_id, emoji)
);

-- Create message_edit_history table
CREATE TABLE message_edit_history (
    history_id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL,
    previous_content TEXT NOT NULL,
    edited_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_history_message FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE
);

-- Add indexes for performance optimization
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

CREATE INDEX idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX idx_message_edit_history_message_id ON message_edit_history(message_id);
