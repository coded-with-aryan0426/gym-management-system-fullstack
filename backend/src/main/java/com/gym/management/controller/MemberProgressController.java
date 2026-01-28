package com.gym.management.controller;

import com.gym.management.dto.progress.*;
import com.gym.management.service.MemberProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/member/progress")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175" })
@PreAuthorize("hasAnyRole('MEMBER', 'CUSTOMER', 'TRAINER', 'OWNER', 'ADMIN')")
public class MemberProgressController {

    @Autowired
    private MemberProgressService progressService;

    @GetMapping("/summary")
    public ResponseEntity<?> getProgressSummary(@RequestParam Long memberId) {
        try {
            ProgressSummaryDTO summary = progressService.getProgressSummary(memberId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/metrics")
    public ResponseEntity<?> getProgressHistory(
            @RequestParam Long memberId,
            @RequestParam(required = false) String timeRange) {
        try {
            List<ProgressMetricDTO> metrics = progressService.getProgressHistory(memberId, timeRange);
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/metrics")
    public ResponseEntity<?> createProgressMetric(
            @RequestParam Long memberId,
            @RequestBody ProgressMetricDTO dto) {
        try {
            ProgressMetricDTO created = progressService.createProgressMetric(memberId, dto);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/metrics/{metricId}")
    public ResponseEntity<?> updateProgressMetric(
            @RequestParam Long memberId,
            @PathVariable Long metricId,
            @RequestBody ProgressMetricDTO dto) {
        try {
            ProgressMetricDTO updated = progressService.updateProgressMetric(memberId, metricId, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/metrics/{metricId}")
    public ResponseEntity<?> deleteProgressMetric(
            @RequestParam Long memberId,
            @PathVariable Long metricId) {
        try {
            progressService.deleteProgressMetric(memberId, metricId);
            return ResponseEntity.ok(Map.of("message", "Progress metric deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/measurements")
    public ResponseEntity<?> getMeasurementHistory(
            @RequestParam Long memberId,
            @RequestParam(required = false) String timeRange) {
        try {
            List<BodyMeasurementDTO> measurements = progressService.getMeasurementHistory(memberId, timeRange);
            return ResponseEntity.ok(measurements);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/measurements")
    public ResponseEntity<?> createBodyMeasurement(
            @RequestParam Long memberId,
            @RequestBody BodyMeasurementDTO dto) {
        try {
            BodyMeasurementDTO created = progressService.createBodyMeasurement(memberId, dto);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/measurements/{measurementId}")
    public ResponseEntity<?> updateBodyMeasurement(
            @RequestParam Long memberId,
            @PathVariable Long measurementId,
            @RequestBody BodyMeasurementDTO dto) {
        try {
            BodyMeasurementDTO updated = progressService.updateBodyMeasurement(memberId, measurementId, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/measurements/{measurementId}")
    public ResponseEntity<?> deleteBodyMeasurement(
            @RequestParam Long memberId,
            @PathVariable Long measurementId) {
        try {
            progressService.deleteBodyMeasurement(memberId, measurementId);
            return ResponseEntity.ok(Map.of("message", "Body measurement deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/goals")
    public ResponseEntity<?> getGoals(@RequestParam Long memberId) {
        try {
            List<MemberGoalDTO> goals = progressService.getGoals(memberId);
            return ResponseEntity.ok(goals);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/goals")
    public ResponseEntity<?> createGoal(
            @RequestParam Long memberId,
            @RequestBody MemberGoalDTO dto) {
        try {
            MemberGoalDTO created = progressService.createGoal(memberId, dto);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/goals/{goalId}")
    public ResponseEntity<?> updateGoal(
            @RequestParam Long memberId,
            @PathVariable Long goalId,
            @RequestBody MemberGoalDTO dto) {
        try {
            MemberGoalDTO updated = progressService.updateGoal(memberId, goalId, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/goals/{goalId}")
    public ResponseEntity<?> deleteGoal(
            @RequestParam Long memberId,
            @PathVariable Long goalId) {
        try {
            progressService.deleteGoal(memberId, goalId);
            return ResponseEntity.ok(Map.of("message", "Goal deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/personal-bests")
    public ResponseEntity<?> getPersonalBests(@RequestParam Long memberId) {
        try {
            List<PersonalBestDTO> pbs = progressService.getPersonalBests(memberId);
            return ResponseEntity.ok(pbs);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/personal-bests")
    public ResponseEntity<?> createOrUpdatePersonalBest(
            @RequestParam Long memberId,
            @RequestBody PersonalBestDTO dto) {
        try {
            PersonalBestDTO pb = progressService.createOrUpdatePersonalBest(memberId, dto);
            return ResponseEntity.ok(pb);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/personal-bests/{pbId}")
    public ResponseEntity<?> deletePersonalBest(
            @RequestParam Long memberId,
            @PathVariable Long pbId) {
        try {
            progressService.deletePersonalBest(memberId, pbId);
            return ResponseEntity.ok(Map.of("message", "Personal best deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/workouts")
    public ResponseEntity<?> getWorkoutLogs(
            @RequestParam Long memberId,
            @RequestParam(required = false) String timeRange) {
        try {
            List<WorkoutLogDTO> logs = progressService.getWorkoutLogs(memberId, timeRange);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/workouts")
    public ResponseEntity<?> createWorkoutLog(
            @RequestParam Long memberId,
            @RequestBody WorkoutLogDTO dto) {
        try {
            WorkoutLogDTO created = progressService.createWorkoutLog(memberId, dto);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/workouts/{logId}")
    public ResponseEntity<?> deleteWorkoutLog(
            @RequestParam Long memberId,
            @PathVariable Long logId) {
        try {
            progressService.deleteWorkoutLog(memberId, logId);
            return ResponseEntity.ok(Map.of("message", "Workout log deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // Photo Endpoints
    @GetMapping("/photos")
    public ResponseEntity<?> getProgressPhotos(@RequestParam Long memberId) {
        try {
            return ResponseEntity.ok(progressService.getProgressPhotos(memberId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/photos")
    public ResponseEntity<?> addProgressPhoto(
            @RequestParam Long memberId,
            @RequestBody ProgressPhotoDTO dto) {
        try {
            return ResponseEntity.ok(progressService.addProgressPhoto(memberId, dto));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/photos/{photoId}")
    public ResponseEntity<?> deleteProgressPhoto(
            @RequestParam Long memberId,
            @PathVariable Long photoId) {
        try {
            progressService.deleteProgressPhoto(memberId, photoId);
            return ResponseEntity.ok(Map.of("message", "Photo deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/photos/upload")
    public ResponseEntity<?> uploadProgressPhoto(
            @RequestParam Long memberId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate recordDate) {
        try {
            return ResponseEntity.ok(progressService.uploadProgressPhoto(memberId, file, description, recordDate));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/photos/file/{filename:.+}")
    public ResponseEntity<org.springframework.core.io.Resource> getProgressPhotoFile(@PathVariable String filename) {
        try {
            java.nio.file.Path filePath = java.nio.file.Paths.get("uploads").resolve(filename).normalize();
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentType = java.nio.file.Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                return ResponseEntity.ok()
                        .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, contentType)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
