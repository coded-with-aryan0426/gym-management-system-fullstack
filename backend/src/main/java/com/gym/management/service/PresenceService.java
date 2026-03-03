package com.gym.management.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * In-memory presence tracking.
 * Tracks which users are currently connected via WebSocket.
 */
@Service
public class PresenceService {

    // userId -> last-seen timestamp
    private final ConcurrentHashMap<Long, Instant> onlineUsers = new ConcurrentHashMap<>();

    public void setOnline(Long userId) {
        onlineUsers.put(userId, Instant.now());
    }

    public void setOffline(Long userId) {
        onlineUsers.remove(userId);
    }

    public boolean isOnline(Long userId) {
        return onlineUsers.containsKey(userId);
    }

    /**
     * Returns a map of userId -> isOnline for the given list of user IDs.
     */
    public Map<Long, Boolean> getPresenceMap(List<Long> userIds) {
        return userIds.stream()
                .collect(Collectors.toMap(
                        id -> id,
                        id -> onlineUsers.containsKey(id)
                ));
    }
}
