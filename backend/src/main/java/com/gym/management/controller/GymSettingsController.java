package com.gym.management.controller;

import com.gym.management.dto.GymHoursDTO;
import com.gym.management.dto.PTConfigDTO;
import com.gym.management.dto.BlackoutDayDTO;
import com.gym.management.service.GymSettingsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class GymSettingsController {

    @Autowired
    private GymSettingsService gymSettingsService;

    @GetMapping("")
    public ResponseEntity<Map<String, String>> getAllSettings() {
        return ResponseEntity.ok(gymSettingsService.getAllSettings());
    }

    @PutMapping("")
    public ResponseEntity<Void> updateAllSettings(@RequestBody Map<String, Object> settings) {
        gymSettingsService.updateAllSettings(settings);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/gym-hours")
    public ResponseEntity<List<GymHoursDTO>> getGymHours() {
        List<GymHoursDTO> hours = gymSettingsService.getGymHours();
        return ResponseEntity.ok(hours);
    }

    @PutMapping("/gym-hours")
    public ResponseEntity<GymHoursDTO> updateGymHours(@Valid @RequestBody GymHoursDTO dto) {
        GymHoursDTO updated = gymSettingsService.updateGymHours(dto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/pt-config")
    public ResponseEntity<PTConfigDTO> getPTConfig() {
        PTConfigDTO config = gymSettingsService.getPTConfiguration();
        return ResponseEntity.ok(config);
    }

    @PutMapping("/pt-config")
    public ResponseEntity<PTConfigDTO> updatePTConfig(@Valid @RequestBody PTConfigDTO dto) {
        PTConfigDTO updated = gymSettingsService.updatePTConfiguration(dto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/blackout-days")
    public ResponseEntity<List<BlackoutDayDTO>> getBlackoutDays() {
        List<BlackoutDayDTO> blackoutDays = gymSettingsService.getBlackoutDays();
        return ResponseEntity.ok(blackoutDays);
    }

    @PostMapping("/blackout-days")
    public ResponseEntity<BlackoutDayDTO> addBlackoutDay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String reason) {
        try {
            BlackoutDayDTO created = gymSettingsService.addBlackoutDay(date, reason);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/blackout-days")
    public ResponseEntity<Void> deleteBlackoutDay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        gymSettingsService.deleteBlackoutDay(date);
        return ResponseEntity.noContent().build();
    }
}
