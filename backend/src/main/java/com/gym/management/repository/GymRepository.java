package com.gym.management.repository;

import com.gym.management.model.Gym;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GymRepository extends JpaRepository<Gym, Long> {
    
    Optional<Gym> findByInviteCode(String inviteCode);
    
    List<Gym> findByIsPublicTrue();
    
    List<Gym> findByNameContainingIgnoreCase(String name);
    
    boolean existsByInviteCode(String inviteCode);
}
