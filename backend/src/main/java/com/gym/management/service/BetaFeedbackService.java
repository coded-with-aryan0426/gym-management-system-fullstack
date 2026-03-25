package com.gym.management.service;

import com.gym.management.dto.beta.BetaFeedbackDTO;
import com.gym.management.dto.beta.FeedbackStatsDTO;
import com.gym.management.dto.beta.UpdateFeedbackStatusRequest;
import com.gym.management.model.BetaFeedback;
import com.gym.management.repository.BetaFeedbackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BetaFeedbackService {

    private final BetaFeedbackRepository betaFeedbackRepository;

    public BetaFeedbackDTO submitFeedback(BetaFeedbackDTO dto) {
        try {
            BetaFeedback feedback = mapDtoToEntity(dto);
            if (feedback.getStatus() == null) {
                feedback.setStatus("NEW");
            }
            if (feedback.getPriorityScore() == null) {
                feedback.setPriorityScore(0);
            }
            if (feedback.getBetaVersion() == null) {
                feedback.setBetaVersion("1.0");
            }
            feedback.setSubmittedAt(LocalDateTime.now());

            BetaFeedback saved = betaFeedbackRepository.save(feedback);
            log.info("Beta feedback submitted by {}: {}", dto.getTesterEmail(), dto.getSubject());
            return mapEntityToDto(saved);
        } catch (Exception e) {
            log.error("Error submitting feedback", e);
            throw new RuntimeException("Failed to submit feedback: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<BetaFeedbackDTO> getAllFeedback(Pageable pageable) {
        Page<BetaFeedback> page = betaFeedbackRepository.findAll(pageable);
        return page.map(this::mapEntityToDto);
    }

    @Transactional(readOnly = true)
    public BetaFeedbackDTO getFeedbackById(Long id) {
        BetaFeedback feedback = betaFeedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found with id: " + id));
        return mapEntityToDto(feedback);
    }

    public BetaFeedbackDTO updateStatus(Long id, UpdateFeedbackStatusRequest request) {
        BetaFeedback feedback = betaFeedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found with id: " + id));

        feedback.setStatus(request.getStatus());
        if (request.getAdminNotes() != null) {
            feedback.setAdminNotes(request.getAdminNotes());
        }
        if (request.getPriorityScore() != null) {
            feedback.setPriorityScore(request.getPriorityScore());
        }

        if ("RESOLVED".equals(request.getStatus())) {
            feedback.setResolvedAt(LocalDateTime.now());
        }

        BetaFeedback updated = betaFeedbackRepository.save(feedback);
        log.info("Feedback {} status updated to: {}", id, request.getStatus());
        return mapEntityToDto(updated);
    }

    @Transactional(readOnly = true)
    public FeedbackStatsDTO getStats() {
        FeedbackStatsDTO stats = new FeedbackStatsDTO();

        stats.setTotalCount(betaFeedbackRepository.count());
        stats.setBugCount(betaFeedbackRepository.countBugFeedback());
        stats.setUiIssueCount(betaFeedbackRepository.countUIIssueFeedback());
        stats.setSuggestionCount(betaFeedbackRepository.countSuggestionFeedback());
        stats.setImprovementCount(betaFeedbackRepository.countImprovementFeedback());
        stats.setQuestionCount(betaFeedbackRepository.countQuestionFeedback());

        stats.setOpenCount(betaFeedbackRepository.countOpenFeedback());
        stats.setResolvedCount(betaFeedbackRepository.countResolvedFeedback());

        stats.setByPage(buildMapFromArray(betaFeedbackRepository.countByPageRoute()));
        stats.setByCategory(buildMapFromArray(betaFeedbackRepository.countByCategory()));
        stats.setBySeverity(buildMapFromArray(betaFeedbackRepository.countBySeverity()));
        stats.setByStatus(buildMapFromArray(betaFeedbackRepository.countByStatus()));

        return stats;
    }

    @Transactional(readOnly = true)
    public Page<BetaFeedbackDTO> getFeedbackByFilters(Map<String, Object> filters, Pageable pageable) {
        List<BetaFeedback> feedbackList = new ArrayList<>(betaFeedbackRepository.findAll());

        if (filters.containsKey("page_route") && filters.get("page_route") != null) {
            String pageRoute = (String) filters.get("page_route");
            feedbackList = feedbackList.stream()
                    .filter(f -> f.getPageRoute().contains(pageRoute))
                    .collect(Collectors.toList());
        }

        if (filters.containsKey("severity") && filters.get("severity") != null) {
            String severity = (String) filters.get("severity");
            feedbackList = feedbackList.stream()
                    .filter(f -> f.getSeverity().equals(severity))
                    .collect(Collectors.toList());
        }

        if (filters.containsKey("status") && filters.get("status") != null) {
            String status = (String) filters.get("status");
            feedbackList = feedbackList.stream()
                    .filter(f -> f.getStatus().equals(status))
                    .collect(Collectors.toList());
        }

        if (filters.containsKey("category") && filters.get("category") != null) {
            String category = (String) filters.get("category");
            feedbackList = feedbackList.stream()
                    .filter(f -> f.getCategory() != null && f.getCategory().equals(category))
                    .collect(Collectors.toList());
        }

        if (filters.containsKey("tester_email") && filters.get("tester_email") != null) {
            String email = (String) filters.get("tester_email");
            feedbackList = feedbackList.stream()
                    .filter(f -> f.getTesterEmail().equals(email))
                    .collect(Collectors.toList());
        }

        feedbackList.sort((a, b) -> b.getSubmittedAt().compareTo(a.getSubmittedAt()));

        List<BetaFeedbackDTO> dtos = feedbackList.stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), dtos.size());
        List<BetaFeedbackDTO> pageContent = dtos.subList(start, end);

        return new PageImpl<>(pageContent, pageable, dtos.size());
    }

    @Transactional(readOnly = true)
    public String exportToCSV(List<BetaFeedback> feedbackList) {
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Submitted At,Tester Name,Tester Role,Page Route,Section,Severity,Category,Subject,Description,Steps to Reproduce,Status,Priority Score,Admin Notes,Resolved At\n");

        for (BetaFeedback feedback : feedbackList) {
            csv.append(String.format(
                    "\"%d\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%d,\"%s\",\"%s\"\n",
                    feedback.getId(),
                    feedback.getSubmittedAt(),
                    escapeCSV(feedback.getTesterName()),
                    feedback.getTesterRole(),
                    escapeCSV(feedback.getPageRoute()),
                    escapeCSV(feedback.getSection()),
                    feedback.getSeverity(),
                    feedback.getCategory(),
                    escapeCSV(feedback.getSubject()),
                    escapeCSV(feedback.getDescription()),
                    escapeCSV(feedback.getStepsToReproduce()),
                    feedback.getStatus(),
                    feedback.getPriorityScore() != null ? feedback.getPriorityScore() : 0,
                    escapeCSV(feedback.getAdminNotes()),
                    feedback.getResolvedAt() != null ? feedback.getResolvedAt().toString() : ""
            ));
        }

        return csv.toString();
    }

    private String escapeCSV(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\n") || value.contains("\"")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private Map<String, Long> buildMapFromArray(List<Object[]> result) {
        Map<String, Long> map = new HashMap<>();
        for (Object[] row : result) {
            map.put(row[0].toString(), ((Number) row[1]).longValue());
        }
        return map;
    }

    private BetaFeedbackDTO mapEntityToDto(BetaFeedback entity) {
        if (entity == null) return null;
        return BetaFeedbackDTO.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .testerName(entity.getTesterName())
                .testerEmail(entity.getTesterEmail())
                .testerRole(entity.getTesterRole())
                .pageRoute(entity.getPageRoute())
                .pageTitle(entity.getPageTitle())
                .section(entity.getSection())
                .browser(entity.getBrowser())
                .screenSize(entity.getScreenSize())
                .severity(entity.getSeverity())
                .category(entity.getCategory())
                .subject(entity.getSubject())
                .description(entity.getDescription())
                .stepsToReproduce(entity.getStepsToReproduce())
                .screenshotUrl(entity.getScreenshotUrl())
                .status(entity.getStatus())
                .adminNotes(entity.getAdminNotes())
                .priorityScore(entity.getPriorityScore())
                .submittedAt(entity.getSubmittedAt())
                .resolvedAt(entity.getResolvedAt())
                .sessionId(entity.getSessionId())
                .betaVersion(entity.getBetaVersion())
                .elementPath(entity.getElementPath())
                .elementSelector(entity.getElementSelector())
                .elementNthChild(entity.getElementNthChild())
                .elementSemanticLabel(entity.getElementSemanticLabel())
                .elementBoundingBox(entity.getElementBoundingBox())
                .build();
    }

    private BetaFeedback mapDtoToEntity(BetaFeedbackDTO dto) {
        if (dto == null) return null;
        return BetaFeedback.builder()
                .id(dto.getId())
                .userId(dto.getUserId())
                .testerName(dto.getTesterName())
                .testerEmail(dto.getTesterEmail())
                .testerRole(dto.getTesterRole())
                .pageRoute(dto.getPageRoute())
                .pageTitle(dto.getPageTitle())
                .section(dto.getSection())
                .browser(dto.getBrowser())
                .screenSize(dto.getScreenSize())
                .severity(dto.getSeverity())
                .category(dto.getCategory())
                .subject(dto.getSubject())
                .description(dto.getDescription())
                .stepsToReproduce(dto.getStepsToReproduce())
                .screenshotUrl(dto.getScreenshotUrl())
                .status(dto.getStatus())
                .adminNotes(dto.getAdminNotes())
                .priorityScore(dto.getPriorityScore())
                .submittedAt(dto.getSubmittedAt())
                .resolvedAt(dto.getResolvedAt())
                .sessionId(dto.getSessionId())
                .betaVersion(dto.getBetaVersion())
                .elementPath(dto.getElementPath())
                .elementSelector(dto.getElementSelector())
                .elementNthChild(dto.getElementNthChild())
                .elementSemanticLabel(dto.getElementSemanticLabel())
                .elementBoundingBox(dto.getElementBoundingBox())
                .build();
    }
}
