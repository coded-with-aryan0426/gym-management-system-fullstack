package com.gym.management.repository;

import com.gym.management.model.RoleAction;
import com.gym.management.model.RoleChangeAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RoleChangeAuditRepository extends JpaRepository<RoleChangeAudit, Long> {

    /**
     * Find all audit entries for a user.
     */
    List<RoleChangeAudit> findByUserIdOrderByPerformedAtDesc(Long userId);

    /**
     * Find all audit entries for a gym.
     */
    List<RoleChangeAudit> findByGymIdOrderByPerformedAtDesc(Long gymId);

    /**
     * Find audit entries by action type.
     */
    List<RoleChangeAudit> findByActionOrderByPerformedAtDesc(RoleAction action);

    /**
     * Find audit entries within a time range.
     */
    List<RoleChangeAudit> findByPerformedAtBetweenOrderByPerformedAtDesc(
            LocalDateTime start, LocalDateTime end);

    /**
     * Find audit entries for a user at a specific gym.
     */
    List<RoleChangeAudit> findByUserIdAndGymIdOrderByPerformedAtDesc(Long userId, Long gymId);
}
