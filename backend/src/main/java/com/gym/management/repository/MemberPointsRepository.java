package com.gym.management.repository;

import com.gym.management.model.MemberPoints;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MemberPointsRepository extends JpaRepository<MemberPoints, Long> {
    List<MemberPoints> findByMemberUserId(Long memberId);
}
