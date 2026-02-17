package com.gym.management.service;

import com.gym.management.model.User;
import com.gym.management.model.UserBlock;
import com.gym.management.repository.UserBlockRepository;
import com.gym.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for user blocking functionality.
 * Blocks are silent - the blocked user is not notified.
 * Blocking is bidirectional for communication - if either user blocked the
 * other,
 * no messages can be exchanged.
 */
@Service
public class BlockingService {

    @Autowired
    private UserBlockRepository userBlockRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Block a user. The blocker will no longer see the blocked user in chat lists,
     * and no communication will be possible.
     */
    @Transactional
    public void blockUser(Long blockerId, Long blockedId, String reason) {
        if (blockerId.equals(blockedId)) {
            throw new IllegalArgumentException("Cannot block yourself");
        }

        // Check if already blocked
        if (userBlockRepository.findBlock(blockerId, blockedId).isPresent()) {
            return; // Already blocked, no-op
        }

        User blocker = userRepository.findById(blockerId)
                .orElseThrow(() -> new RuntimeException("Blocker user not found"));
        User blocked = userRepository.findById(blockedId)
                .orElseThrow(() -> new RuntimeException("Blocked user not found"));

        UserBlock block = new UserBlock();
        block.setId(new UserBlock.BlockId(blockerId, blockedId));
        block.setBlocker(blocker);
        block.setBlocked(blocked);
        block.setReason(reason);

        userBlockRepository.save(block);
    }

    /**
     * Unblock a user.
     */
    @Transactional
    public void unblockUser(Long blockerId, Long blockedId) {
        userBlockRepository.findBlock(blockerId, blockedId)
                .ifPresent(userBlockRepository::delete);
    }

    /**
     * Check if communication is blocked between two users (bidirectional).
     * Returns true if EITHER user has blocked the other.
     */
    public boolean isBlocked(Long user1Id, Long user2Id) {
        return userBlockRepository.isBlockedBidirectional(user1Id, user2Id);
    }

    /**
     * Check if a specific user is blocked by the blocker.
     */
    public boolean hasBlocked(Long blockerId, Long blockedId) {
        return userBlockRepository.findBlock(blockerId, blockedId).isPresent();
    }

    /**
     * Get list of users blocked by a specific user.
     */
    @Transactional(readOnly = true)
    public List<User> getBlockedUsers(Long userId) {
        return userBlockRepository.findBlockedByUser(userId).stream()
                .map(UserBlock::getBlocked)
                .collect(Collectors.toList());
    }

    /**
     * Get list of blocked user IDs (for efficient filtering).
     */
    public List<Long> getBlockedUserIds(Long userId) {
        return userBlockRepository.findBlockedUserIds(userId);
    }

    /**
     * Get all block records for a user (for admin audit).
     */
    @Transactional(readOnly = true)
    public List<UserBlock> getBlocksForUser(Long userId) {
        return userBlockRepository.findBlockedByUser(userId);
    }
}
