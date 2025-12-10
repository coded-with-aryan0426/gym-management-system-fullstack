package com.gym.management.repository;

import com.gym.management.model.Membership;
import com.gym.management.model.MembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {
    
    List<Membership> findByUserUserId(Long userId);
    
    List<Membership> findByUserUserIdAndStatus(Long userId, MembershipStatus status);
    
    List<Membership> findByGymGymIdAndStatus(Long gymId, MembershipStatus status);
    
    List<Membership> findByGymGymId(Long gymId);
    
    Optional<Membership> findByGymGymIdAndUserUserId(Long gymId, Long userId);
    
    boolean existsByGymGymIdAndUserUserId(Long gymId, Long userId);
}
