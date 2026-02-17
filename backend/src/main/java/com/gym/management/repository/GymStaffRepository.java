package com.gym.management.repository;

import com.gym.management.model.GymStaff;
import com.gym.management.model.StaffRole;
import com.gym.management.model.StaffStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GymStaffRepository extends JpaRepository<GymStaff, Long> {
    
    List<GymStaff> findByUserUserIdAndStatus(Long userId, StaffStatus status);
    
    List<GymStaff> findByUserUserId(Long userId);
    
    List<GymStaff> findByGymGymIdAndStatus(Long gymId, StaffStatus status);
    
    Optional<GymStaff> findByGymGymIdAndUserUserId(Long gymId, Long userId);
    
    boolean existsByGymGymIdAndUserUserId(Long gymId, Long userId);
    
    List<GymStaff> findByGymGymIdAndStaffRole(Long gymId, StaffRole staffRole);
}
