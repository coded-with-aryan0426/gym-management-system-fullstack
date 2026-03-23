package com.gym.management.controller;

import com.gym.management.dto.StaffPerformanceDTO;
import com.gym.management.dto.AttendanceRecordDTO;
import com.gym.management.dto.StaffShiftDTO;
import com.gym.management.service.StaffPerformanceService;
import com.gym.management.service.StaffShiftService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class StaffPerformanceController {

    @Autowired
    private StaffPerformanceService staffPerformanceService;

    @Autowired
    private StaffShiftService staffShiftService;

    @GetMapping("/{staffId}/performance")
    public ResponseEntity<StaffPerformanceDTO> getPerformance(
            @PathVariable Long staffId,
            @RequestParam(required = false) String month) {
        
        String recordMonth = month != null ? month : 
            YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        
        StaffPerformanceDTO performance = staffPerformanceService.getPerformanceMetrics(staffId, recordMonth);
        return ResponseEntity.ok(performance);
    }

    @GetMapping("/{staffId}/attendance")
    public ResponseEntity<StaffPerformanceDTO> getAttendance(
            @PathVariable Long staffId,
            @RequestParam(required = false) String month) {
        
        String recordMonth = month != null ? month : 
            YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        
        StaffPerformanceDTO performance = staffPerformanceService.getPerformanceMetrics(staffId, recordMonth);
        return ResponseEntity.ok(performance);
    }

    @PostMapping("/{staffId}/attendance")
    public ResponseEntity<StaffPerformanceDTO> recordAttendance(
            @PathVariable Long staffId,
            @Valid @RequestBody AttendanceRecordDTO dto) {
        
        StaffPerformanceDTO updated = staffPerformanceService.updateAttendance(
            staffId, dto.getDate(), dto.getStatus());
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{staffId}/shifts")
    public ResponseEntity<List<StaffShiftDTO>> getShifts(
            @PathVariable Long staffId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<StaffShiftDTO> shifts = staffShiftService.getShifts(staffId, startDate, endDate);
        return ResponseEntity.ok(shifts);
    }

    @PostMapping("/shifts")
    public ResponseEntity<StaffShiftDTO> assignShift(@Valid @RequestBody StaffShiftDTO dto) {
        try {
            StaffShiftDTO created = staffShiftService.assignShift(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/shifts/{shiftId}")
    public ResponseEntity<Void> deleteShift(@PathVariable Long shiftId) {
        staffShiftService.deleteShift(shiftId);
        return ResponseEntity.noContent().build();
    }
}
