package com.gym.management.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple memory-based message broker to carry the greeting messages
        // back to the client on destinations prefixed with "/topic"
        config.enableSimpleBroker("/topic", "/queue");

        // Define the prefix for messages that are bound for @MessageMapping methods
        config.setApplicationDestinationPrefixes("/app");

        // Use /user prefix for private messages (User-specific destinations)
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register the "/ws" endpoint, enabling the SockJS protocol options so that we
        // have a fallback if specific WebSocket protocols are not supported.
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173") // Specific origin for SockJS credentials
                .withSockJS();
    }
}
