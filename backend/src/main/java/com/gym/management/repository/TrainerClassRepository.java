package com.gym.management.repository;

import com.gym.management.model.TrainerClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TrainerClassRepository extends JpaRepository<TrainerClass, Long> {

    List<TrainerClass> findByTrainerUserIdOrderByClassDateAscStartTimeAsc(Long trainerId);

    List<TrainerClass> findByTrainerUserIdAndClassDateBetweenOrderByClassDateAscStartTimeAsc(
            Long trainerId, LocalDate startDate, LocalDate endDate);

    List<TrainerClass> findByTrainerUserIdAndClassDate(Long trainerId, LocalDate classDate);
}
