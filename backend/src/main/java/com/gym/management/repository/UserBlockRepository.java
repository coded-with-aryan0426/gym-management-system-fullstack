package com.gym.management.repository;

import com.gym.management.model.UserBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBlockRepository extends JpaRepository<UserBlock, UserBlock.BlockId> {

    /**
     * Find a specific block record
     */
    @Query("SELECT b FROM UserBlock b WHERE b.blocker.userId = :blockerId AND b.blocked.userId = :blockedId")
    Optional<UserBlock> findBlock(@Param("blockerId") Long blockerId, @Param("blockedId") Long blockedId);

    /**
     * Check if user1 blocked user2 OR user2 blocked user1 (bidirectional check)
     */
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM UserBlock b " +
            "WHERE (b.blocker.userId = :user1Id AND b.blocked.userId = :user2Id) " +
            "OR (b.blocker.userId = :user2Id AND b.blocked.userId = :user1Id)")
    boolean isBlockedBidirectional(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);

    /**
     * Get all users blocked BY a specific user
     */
    @Query("SELECT b FROM UserBlock b WHERE b.blocker.userId = :userId")
    List<UserBlock> findBlockedByUser(@Param("userId") Long userId);

    /**
     * Get all users who blocked a specific user
     */
    @Query("SELECT b FROM UserBlock b WHERE b.blocked.userId = :userId")
    List<UserBlock> findBlockersOfUser(@Param("userId") Long userId);

    /**
     * Get all blocked user IDs for a user (for filtering chat lists)
     */
    @Query("SELECT b.blocked.userId FROM UserBlock b WHERE b.blocker.userId = :userId")
    List<Long> findBlockedUserIds(@Param("userId") Long userId);

    /**
     * Delete a block
     */
    @Query("DELETE FROM UserBlock b WHERE b.blocker.userId = :blockerId AND b.blocked.userId = :blockedId")
    void deleteBlock(@Param("blockerId") Long blockerId, @Param("blockedId") Long blockedId);
}
