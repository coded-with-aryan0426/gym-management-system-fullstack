package com.gym.management.repository;

import com.gym.management.model.LoginHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {

    List<LoginHistory> findTop20ByUserUserIdOrderByLoginTimeDesc(Long userId);

    List<LoginHistory> findByUserUserIdAndSuccessOrderByLoginTimeDesc(Long userId, Boolean success);

    Page<LoginHistory> findByUserUserId(Long userId, Pageable pageable);

    @Query("SELECT l FROM LoginHistory l WHERE l.user.userId = :userId AND l.loginTime > :since ORDER BY l.loginTime DESC")
    List<LoginHistory> findRecentByUserSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    Long countByUserUserIdAndSuccessAndLoginTimeAfter(Long userId, Boolean success, LocalDateTime after);

    @Modifying
    @Transactional
    @Query("DELETE FROM LoginHistory l WHERE l.loginTime < :cutoff")
    void cleanupOldHistory(@Param("cutoff") LocalDateTime cutoff);
}
