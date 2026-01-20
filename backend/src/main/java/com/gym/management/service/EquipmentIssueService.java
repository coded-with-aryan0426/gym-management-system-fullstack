package com.gym.management.service;

import com.gym.management.model.EquipmentIssue;
import com.gym.management.repository.EquipmentIssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EquipmentIssueService {

    @Autowired
    private EquipmentIssueRepository issueRepository;

    public List<EquipmentIssue> getIssuesByEquipment(Long equipmentId) {
        return issueRepository.findByEquipmentId(equipmentId);
    }

    public List<EquipmentIssue> getAllIssues() {
        return issueRepository.findAll();
    }

    @Transactional
    public EquipmentIssue reportIssue(EquipmentIssue issue) {
        return issueRepository.save(issue);
    }

    @Transactional
    public EquipmentIssue updateIssueStatus(Long id, EquipmentIssue.IssueStatus status) {
        EquipmentIssue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found"));
        issue.setStatus(status);
        return issueRepository.save(issue);
    }
}
