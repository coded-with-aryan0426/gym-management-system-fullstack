package com.gym.management.repository;

import com.gym.management.entity.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

/**
 * Repository for Outbox Events
 */
@Repository
public interface OutboxEventRepository extends JpaRepository<OutboxEvent, Long> {

    /**
     * Find all unpublished events ordered by creation time
     * Used by OutboxProcessor to publish pending events
     */
    @Query("SELECT e FROM OutboxEvent e WHERE e.publishedAt IS NULL ORDER BY e.createdAt ASC")
    List<OutboxEvent> findUnpublishedEvents();

    /**
     * Find unpublished events with retry limit not exceeded
     * Max 10 retries to prevent infinite loops
     */
    @Query("SELECT e FROM OutboxEvent e WHERE e.publishedAt IS NULL AND e.retryCount < 10 ORDER BY e.createdAt ASC")
    List<OutboxEvent> findRetryableEvents();

    /**
     * Find events by tenant for isolation verification
     */
    List<OutboxEvent> findByTenantId(Long tenantId);

    /**
     * Clean up old published events (retention policy)
     * Delete events published more than 7 days ago
     */
    @Query("DELETE FROM OutboxEvent e WHERE e.publishedAt IS NOT NULL AND e.publishedAt < ?1")
    void deletePublishedBefore(Instant cutoffDate);
}
