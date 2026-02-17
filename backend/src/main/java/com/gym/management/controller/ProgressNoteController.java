package com.gym.management.controller;

import com.gym.management.dto.progress_note.ProgressNoteDTO;
import com.gym.management.security.CustomUserDetails;
import com.gym.management.service.ProgressNoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProgressNoteController {

    @Autowired
    private ProgressNoteService progressNoteService;

    // Get all notes for the logged-in trainer
    @GetMapping("/progress-notes")
    public ResponseEntity<List<ProgressNoteDTO>> getAllNotes(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(progressNoteService.getAllNotesForTrainer(userDetails.getUser().getUserId()));
    }

    // Get notes for a specific member
    @GetMapping({"/members/{memberId}/progress-notes", "/members/{memberId}/notes"})
    public ResponseEntity<?> getMemberNotes(@PathVariable Long memberId) {
        try {
            return ResponseEntity.ok(progressNoteService.getNotesForMember(memberId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error fetching notes: " + e.getMessage());
        }
    }

    // Create a note for a specific member
    @PostMapping("/members/{memberId}/progress-notes")
    public ResponseEntity<ProgressNoteDTO> createNote(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long memberId,
            @RequestBody ProgressNoteDTO noteDTO) {
        return ResponseEntity
                .ok(progressNoteService.createNoteForMember(userDetails.getUser().getUserId(), memberId, noteDTO));
    }

    // Update a note
    @PutMapping("/progress-notes/{noteId}")
    public ResponseEntity<ProgressNoteDTO> updateNote(
            @PathVariable Long noteId,
            @RequestBody ProgressNoteDTO noteDTO) {
        return ResponseEntity.ok(progressNoteService.updateNote(noteId, noteDTO));
    }

    // Delete a note
    @DeleteMapping("/progress-notes/{noteId}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long noteId) {
        progressNoteService.deleteNote(noteId);
        return ResponseEntity.noContent().build();
    }
}
