package com.gym.management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gym.management.model.BirthDateAuditLog;
import java.util.List;

@Repository
public interface BirthDateAuditLogRepository extends JpaRepository<BirthDateAuditLog, Long> {

    List<BirthDateAuditLog> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<BirthDateAuditLog> findByChangedByOrderByCreatedAtDesc(Long changedBy);
}
