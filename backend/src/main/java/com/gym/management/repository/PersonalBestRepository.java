package com.gym.management.repository;

import com.gym.management.model.PersonalBest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonalBestRepository extends JpaRepository<PersonalBest, Long> {

    List<PersonalBest> findByUserUserIdOrderByRecordDateDesc(Long userId);

    Optional<PersonalBest> findByUserUserIdAndExerciseIgnoreCase(Long userId, String exercise);

    @Query("SELECT pb FROM PersonalBest pb WHERE pb.user.userId = :userId AND pb.category = :category ORDER BY pb.recordDate DESC")
    List<PersonalBest> findByUserIdAndCategory(@Param("userId") Long userId, @Param("category") PersonalBest.ExerciseCategory category);

    long countByUserUserId(Long userId);

    @Query("SELECT pb FROM PersonalBest pb WHERE pb.user.userId = :userId ORDER BY pb.weightValue DESC FETCH FIRST :limit ROWS ONLY")
    List<PersonalBest> findTopPersonalBests(@Param("userId") Long userId, @Param("limit") int limit);
}
