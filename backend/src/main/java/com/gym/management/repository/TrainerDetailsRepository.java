package com.gym.management.repository;

import com.gym.management.model.TrainerDetails;
import com.gym.management.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrainerDetailsRepository extends JpaRepository<TrainerDetails, Long> {
    Optional<TrainerDetails> findByUser(User user);
}
