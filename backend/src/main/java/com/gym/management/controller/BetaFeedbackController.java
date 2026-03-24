package com.gym.management.controller;

import com.gym.management.dto.beta.BetaFeedbackDTO;
import com.gym.management.dto.beta.FeedbackStatsDTO;
import com.gym.management.dto.beta.UpdateFeedbackStatusRequest;
import com.gym.management.model.BetaFeedback;
import com.gym.management.service.BetaFeedbackService;
import com.gym.management.repository.BetaFeedbackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/beta/feedback")
@RequiredArgsConstructor
@Slf4j
public class BetaFeedbackController {

    private final BetaFeedbackService betaFeedbackService;
    private final BetaFeedbackRepository betaFeedbackRepository;

    /**
     * Submit feedback - accessible to ANY authenticated user
     */
    @PostMapping
    public ResponseEntity<?> submitFeedback(@Valid @RequestBody BetaFeedbackDTO dto) {
        try {
            log.info("Received feedback submission from {}", dto.getTesterEmail());
            BetaFeedbackDTO saved = betaFeedbackService.submitFeedback(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of(
                            "success", true,
                            "message", "Feedback submitted successfully",
                            "data", saved
                    )
            );
        } catch (Exception e) {
            log.error("Error submitting feedback", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of(
                            "success", false,
                            "message", e.getMessage()
                    )
            );
        }
    }

    /**
     * Get all feedback with pagination - SuperAdmin only
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllFeedback(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "submitted_at") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {
        try {
            Sort.Direction sortDir = Sort.Direction.fromString(direction.toUpperCase());
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDir, sortBy));
            Page<BetaFeedbackDTO> feedbackPage = betaFeedbackService.getAllFeedback(pageable);

            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "data", feedbackPage.getContent(),
                            "totalItems", feedbackPage.getTotalElements(),
                            "totalPages", feedbackPage.getTotalPages(),
                            "currentPage", page
                    )
            );
        } catch (Exception e) {
            log.error("Error retrieving feedback", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of(
                            "success", false,
                            "message", e.getMessage()
                    )
            );
        }
    }

    /**
     * Get single feedback item - SuperAdmin only
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getFeedbackById(@PathVariable Long id) {
        try {
            BetaFeedbackDTO feedback = betaFeedbackService.getFeedbackById(id);
            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "data", feedback
                    )
            );
        } catch (Exception e) {
            log.error("Error retrieving feedback", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of(
                            "success", false,
                            "message", e.getMessage()
                    )
            );
        }
    }

    /**
     * Update feedback status - SuperAdmin only
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateFeedbackStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateFeedbackStatusRequest request) {
        try {
            BetaFeedbackDTO updated = betaFeedbackService.updateStatus(id, request);
            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "message", "Feedback status updated",
                            "data", updated
                    )
            );
        } catch (Exception e) {
            log.error("Error updating feedback status", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of(
                            "success", false,
                            "message", e.getMessage()
                    )
            );
        }
    }

    /**
     * Get aggregated statistics - SuperAdmin only
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getStats() {
        try {
            FeedbackStatsDTO stats = betaFeedbackService.getStats();
            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "data", stats
                    )
            );
        } catch (Exception e) {
            log.error("Error retrieving stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of(
                            "success", false,
                            "message", e.getMessage()
                    )
            );
        }
    }

    /**
     * Export feedback as CSV - SuperAdmin only
     */
    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> exportToCSV(
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String pageRoute,
            @RequestParam(required = false) String category) {
        try {
            List<BetaFeedback> feedbackList;

            // Apply filters
            if (severity != null && !severity.isEmpty()) {
                feedbackList = betaFeedbackRepository.findBySeverity(severity);
            } else if (status != null && !status.isEmpty()) {
                feedbackList = betaFeedbackRepository.findByStatus(status);
            } else if (pageRoute != null && !pageRoute.isEmpty()) {
                feedbackList = betaFeedbackRepository.findByPageRouteContaining(pageRoute);
            } else {
                feedbackList = betaFeedbackRepository.findAll();
            }

            String csv = betaFeedbackService.exportToCSV(feedbackList);

            // Generate filename with timestamp
            String filename = "feedback_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss")) + ".csv";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csv);
        } catch (Exception e) {
            log.error("Error exporting feedback", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of(
                            "success", false,
                            "message", e.getMessage()
                    )
            );
        }
    }

    /**
     * Filter feedback by multiple criteria - SuperAdmin only
     */
    @PostMapping("/filter")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> filterFeedback(
            @RequestBody Map<String, Object> filters,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submitted_at"));
            Page<BetaFeedbackDTO> feedbackPage = betaFeedbackService.getFeedbackByFilters(filters, pageable);

            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "data", feedbackPage.getContent(),
                            "totalItems", feedbackPage.getTotalElements(),
                            "totalPages", feedbackPage.getTotalPages(),
                            "currentPage", page
                    )
            );
        } catch (Exception e) {
            log.error("Error filtering feedback", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of(
                            "success", false,
                            "message", e.getMessage()
                    )
            );
        }
    }
}
