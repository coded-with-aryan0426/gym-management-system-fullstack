package com.gym.management.repository;

import com.gym.management.model.MemberPoints;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MemberPointsRepository extends JpaRepository<MemberPoints, Long> {
    List<MemberPoints> findByMemberId(Long memberId);
    List<MemberPoints> findByGymId(Long gymId);
    List<MemberPoints> findByMemberUserId(Long memberUserId);
}