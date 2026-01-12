package com.gym.management.repository;

import com.gym.management.model.ProgressNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgressNoteRepository extends JpaRepository<ProgressNote, Long> {

    List<ProgressNote> findByMemberUserIdOrderByCreatedAtDesc(Long memberId);

    @Query("SELECT pn FROM ProgressNote pn WHERE pn.trainer.userId = :trainerId ORDER BY pn.createdAt DESC")
    List<ProgressNote> findByTrainerId(@Param("trainerId") Long trainerId);

    @Query("SELECT pn FROM ProgressNote pn WHERE pn.trainer.userId = :trainerId AND pn.member.userId = :memberId ORDER BY pn.createdAt DESC")
    List<ProgressNote> findByTrainerAndMember(@Param("trainerId") Long trainerId, @Param("memberId") Long memberId);
}
