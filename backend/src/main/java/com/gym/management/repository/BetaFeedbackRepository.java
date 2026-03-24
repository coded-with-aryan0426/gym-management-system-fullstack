package com.gym.management.repository;

import com.gym.management.model.BetaFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BetaFeedbackRepository extends JpaRepository<BetaFeedback, Long> {

    List<BetaFeedback> findByStatus(String status);

    List<BetaFeedback> findByPageRouteContaining(String pageRoute);

    List<BetaFeedback> findByTesterEmail(String email);

    List<BetaFeedback> findBySeverity(String severity);

    List<BetaFeedback> findBySubmittedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT bf FROM BetaFeedback bf WHERE bf.severity = :severity ORDER BY bf.submittedAt DESC")
    List<BetaFeedback> findBySeverityOrdered(@Param("severity") String severity);

    @Query(value = "SELECT severity, COUNT(*) as count FROM beta_feedback GROUP BY severity", nativeQuery = true)
    List<Object[]> countBySeverity();

    @Query(value = "SELECT status, COUNT(*) as count FROM beta_feedback GROUP BY status", nativeQuery = true)
    List<Object[]> countByStatus();

    @Query(value = "SELECT category, COUNT(*) as count FROM beta_feedback GROUP BY category", nativeQuery = true)
    List<Object[]> countByCategory();

    @Query(value = "SELECT page_route, COUNT(*) as count FROM beta_feedback GROUP BY page_route ORDER BY count DESC", nativeQuery = true)
    List<Object[]> countByPageRoute();

    @Query("SELECT COUNT(bf) FROM BetaFeedback bf WHERE bf.status = 'NEW' OR bf.status = 'ACKNOWLEDGED' OR bf.status = 'IN_PROGRESS'")
    long countOpenFeedback();

    @Query("SELECT COUNT(bf) FROM BetaFeedback bf WHERE bf.status = 'RESOLVED'")
    long countResolvedFeedback();

    @Query("SELECT COUNT(bf) FROM BetaFeedback bf WHERE bf.severity = 'BUG'")
    long countBugFeedback();

    @Query("SELECT COUNT(bf) FROM BetaFeedback bf WHERE bf.severity = 'UI_ISSUE'")
    long countUIIssueFeedback();

    @Query("SELECT COUNT(bf) FROM BetaFeedback bf WHERE bf.severity = 'SUGGESTION'")
    long countSuggestionFeedback();

    @Query("SELECT COUNT(bf) FROM BetaFeedback bf WHERE bf.severity = 'IMPROVEMENT'")
    long countImprovementFeedback();

    @Query("SELECT COUNT(bf) FROM BetaFeedback bf WHERE bf.severity = 'QUESTION'")
    long countQuestionFeedback();
}
