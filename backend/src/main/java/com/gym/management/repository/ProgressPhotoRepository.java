package com.gym.management.repository;

import com.gym.management.model.ProgressPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgressPhotoRepository extends JpaRepository<ProgressPhoto, Long> {
    List<ProgressPhoto> findByUserUserIdOrderByRecordDateDesc(Long userId);
    List<ProgressPhoto> findByUserUserIdOrderByRecordDateAsc(Long userId);
}
