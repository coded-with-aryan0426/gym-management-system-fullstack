package com.gym.management.repository;

import com.gym.management.model.GymTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GymTaskRepository extends JpaRepository<GymTask, Long> {

    List<GymTask> findByGymIdOrderByCreatedAtDesc(Long gymId);

    List<GymTask> findByGymIdAndStatusOrderByCreatedAtDesc(Long gymId, String status);

    List<GymTask> findByGymIdAndPriorityOrderByCreatedAtDesc(Long gymId, String priority);

    List<GymTask> findByGymIdAndCategoryOrderByCreatedAtDesc(Long gymId, String category);

    @Query("SELECT t FROM GymTask t WHERE t.gymId = :gymId AND t.dueDate <= :date AND t.status != 'DONE' ORDER BY t.dueDate ASC")
    List<GymTask> findOverdueTasks(@Param("gymId") Long gymId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(t) FROM GymTask t WHERE t.gymId = :gymId AND t.status = :status")
    long countByGymIdAndStatus(@Param("gymId") Long gymId, @Param("status") String status);

    @Query("SELECT COUNT(t) FROM GymTask t WHERE t.gymId = :gymId AND t.priority = 'URGENT' AND t.status != 'DONE'")
    long countUrgentTasks(@Param("gymId") Long gymId);
}
