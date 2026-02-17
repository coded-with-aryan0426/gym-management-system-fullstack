package com.gym.management.controller;

import com.gym.management.dto.MemberProfileUpdateDTO;
import com.gym.management.dto.MemberSettingsDTO;
import com.gym.management.service.MemberProfileService;
import com.gym.management.service.MemberSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/member/settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MEMBER')")
public class MemberSettingsController {

    private final MemberSettingsService memberSettingsService;
    private final MemberProfileService memberProfileService;

    private final com.gym.management.service.UserService userService;

    @PostMapping("/{userId}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long userId, @RequestBody com.gym.management.dto.UpdatePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Passwords do not match"));
        }
        try {
            userService.changePassword(userId, request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(java.util.Map.of("message", "Password updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{userId}/sessions")
    public ResponseEntity<?> getSessions(@PathVariable Long userId) {
        // Placeholder for session management
        return ResponseEntity.ok(java.util.List.of(
            java.util.Map.of(
                "id", "current",
                "device", "Current Device",
                "location", "Unknown",
                "lastActive", java.time.LocalDateTime.now(),
                "isCurrent", true
            )
        ));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<MemberSettingsDTO> getSettings(@PathVariable Long userId) {
        return ResponseEntity.ok(memberSettingsService.getMemberSettings(userId));
    }

    @PatchMapping("/{userId}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long userId, @RequestBody MemberProfileUpdateDTO dto) {
        memberProfileService.updateMemberProfile(userId, dto);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{userId}/preferences")
    public ResponseEntity<?> updatePreferences(@PathVariable Long userId, @RequestBody MemberSettingsDTO.MemberPreferenceDTO dto) {
        memberSettingsService.updatePreferences(userId, dto);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{userId}/notifications")
    public ResponseEntity<?> updateNotifications(@PathVariable Long userId, @RequestBody MemberSettingsDTO.NotificationSettingDTO dto) {
        memberSettingsService.updateNotifications(userId, dto);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{userId}/privacy")
    public ResponseEntity<?> updatePrivacy(@PathVariable Long userId, @RequestBody MemberSettingsDTO.PrivacySettingDTO dto) {
        memberSettingsService.updatePrivacy(userId, dto);
        return ResponseEntity.ok().build();
    }
}
