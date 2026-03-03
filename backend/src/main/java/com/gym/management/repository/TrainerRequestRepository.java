package com.gym.management.repository;

import com.gym.management.model.TrainerRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainerRequestRepository extends JpaRepository<TrainerRequest, Long> {

    /** All pending requests for a trainer */
    List<TrainerRequest> findByTrainerUserIdAndStatusOrderByCreatedAtDesc(
            Long trainerId, TrainerRequest.Status status);

    /** All requests sent by a member */
    List<TrainerRequest> findByMemberUserIdAndStatusOrderByCreatedAtDesc(
            Long memberId, TrainerRequest.Status status);

    /** Check if a member already has an active/pending request to a trainer */
    Optional<TrainerRequest> findByMemberUserIdAndTrainerUserIdAndStatus(
            Long memberId, Long trainerId, TrainerRequest.Status status);

    /** All requests (any status) sent by this member to any trainer */
    @Query("SELECT r FROM TrainerRequest r WHERE r.member.userId = :memberId ORDER BY r.createdAt DESC")
    List<TrainerRequest> findAllByMember(@Param("memberId") Long memberId);
}
