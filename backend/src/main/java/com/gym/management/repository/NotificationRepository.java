package com.gym.management.repository;

import com.gym.management.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Main feed: Not archived
    List<Notification> findByUserUserIdAndIsArchivedFalseOrderByCreatedAtDesc(Long userId);

    // Starred feed
    List<Notification> findByUserUserIdAndIsStarredTrueOrderByCreatedAtDesc(Long userId);

    // Archived feed
    List<Notification> findByUserUserIdAndIsArchivedTrueOrderByCreatedAtDesc(Long userId);

    // Unread count (excluding archived)
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.userId = :userId AND n.isRead = false AND n.isArchived = false")
    Long countUnreadByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.userId = :userId")
    Long countByUserId(@Param("userId") Long userId);

    @org.springframework.transaction.annotation.Transactional
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.userId = :userId AND n.isArchived = false")
    void markAllAsReadByUserId(@Param("userId") Long userId);
}
