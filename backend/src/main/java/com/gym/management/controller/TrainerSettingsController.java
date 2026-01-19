package com.gym.management.controller;

import com.gym.management.dto.TrainerSettingsDTO;
import com.gym.management.model.User;
import com.gym.management.security.CustomUserDetails;
import com.gym.management.service.TrainerSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trainer/settings")
public class TrainerSettingsController {

    @Autowired
    private TrainerSettingsService settingsService;

    @GetMapping
    public ResponseEntity<TrainerSettingsDTO> getSettings(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(settingsService.getSettings(userDetails.getUser().getUserId()));
    }

    @PutMapping
    public ResponseEntity<TrainerSettingsDTO> updateSettings(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody TrainerSettingsDTO settingsDTO) {
        return ResponseEntity.ok(settingsService.updateSettings(userDetails.getUser().getUserId(), settingsDTO));
    }
}
