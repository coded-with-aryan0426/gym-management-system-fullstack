package com.gym.management.controller;

import com.gym.management.dto.*;
import com.gym.management.service.PTSessionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/pt-sessions")
@CrossOrigin(origins = "*")
public class PTSessionController {

    @Autowired
    private PTSessionService ptSessionService;

    @GetMapping
    public ResponseEntity<List<PTSessionDTO>> getAllSessions() {
        List<PTSessionDTO> sessions = ptSessionService.getAllSessions();
        return ResponseEntity.ok(sessions);
    }

    @PostMapping
    public ResponseEntity<?> createSession(@Valid @RequestBody PTSessionDTO dto) {
        try {
            PTSessionDTO created = ptSessionService.createSession(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Failed to create session: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<PTSessionDTO> updateSession(
            @PathVariable Long id,
            @Valid @RequestBody PTSessionDTO dto) {
        try {
            PTSessionDTO updated = ptSessionService.updateSession(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelSession(@PathVariable Long id) {
        try {
            ptSessionService.cancelSession(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<List<PTSessionDTO>> getTrainerSessions(
            @PathVariable Long trainerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<PTSessionDTO> sessions;
        if (startDate != null && endDate != null) {
            sessions = ptSessionService.getTrainerSessions(trainerId, startDate, endDate);
        } else {
            sessions = ptSessionService.getTrainerSessions(trainerId);
        }
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<PTSessionDTO>> getMemberSessions(
            @PathVariable Long memberId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<PTSessionDTO> sessions;
        if (startDate != null && endDate != null) {
            sessions = ptSessionService.getMemberSessions(memberId, startDate, endDate);
        } else {
            sessions = ptSessionService.getMemberSessions(memberId);
        }
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/available-slots")
    public ResponseEntity<List<AvailableSlotDTO>> getAvailableSlots(
            @RequestParam Long trainerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<AvailableSlotDTO> slots = ptSessionService.getAvailableSlots(trainerId, date);
        return ResponseEntity.ok(slots);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<PTSessionDTO> completeSession(
            @PathVariable Long id,
            @Valid @RequestBody CompleteSessionRequest request) {
        try {
            PTSessionDTO completed = ptSessionService.markSessionComplete(id, request);
            return ResponseEntity.ok(completed);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/recurring")
    public ResponseEntity<List<PTSessionDTO>> createRecurringSessions(
            @Valid @RequestBody RecurringSessionRequest request) {
        try {
            List<PTSessionDTO> sessions = ptSessionService.createRecurringSessions(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(sessions);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<PTSessionDTO> getSession(@PathVariable Long id) {
        try {
            PTSessionDTO session = ptSessionService.getSessionById(id);
            return ResponseEntity.ok(session);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
