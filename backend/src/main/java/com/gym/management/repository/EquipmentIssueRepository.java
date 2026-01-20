package com.gym.management.repository;

import com.gym.management.model.EquipmentIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentIssueRepository extends JpaRepository<EquipmentIssue, Long> {
    List<EquipmentIssue> findByEquipmentId(Long equipmentId);
    List<EquipmentIssue> findByStatus(EquipmentIssue.IssueStatus status);
}
