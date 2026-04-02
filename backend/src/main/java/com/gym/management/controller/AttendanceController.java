package com.gym.management.controller;

import com.gym.management.model.CheckIn;
import com.gym.management.model.CheckInMethod;
import com.gym.management.model.User;
import com.gym.management.repository.UserRepository;
import com.gym.management.service.AttendanceService;
import com.gym.management.service.AttendanceService.CheckInResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.gym.management.security.CustomUserDetails;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175" })
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private UserRepository userRepository;

    // ── OWNER/ADMIN Endpoints ─────────────────────────────────────────────────

    @GetMapping("/today")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getTodayAttendance(
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        List<Map<String, Object>> result = attendanceService.getTodayAttendance(null, role, page, size);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/live")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getLiveAttendance(@RequestParam(required = false) String role) {
        List<Map<String, Object>> members = attendanceService.getLiveAttendance(null, role);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("currentCount", members.size());
        result.put("members", members);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/trends")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAttendanceTrends(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String role) {
        LocalDate effectiveFrom = from != null ? from : LocalDate.now().minusDays(30);
        LocalDate effectiveTo = to != null ? to : LocalDate.now();
        return ResponseEntity.ok(attendanceService.getTrends(null, effectiveFrom, effectiveTo, role));
    }

    @GetMapping("/heatmap")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAttendanceHeatmap(
            @RequestParam(defaultValue = "8") int weeks,
            @RequestParam(required = false) String role) {
        return ResponseEntity.ok(attendanceService.getHeatmap(null, weeks, role));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getAttendanceStats(@RequestParam(required = false) String role) {
        return ResponseEntity.ok(attendanceService.getStats(null, role));
    }

    @PostMapping("/check-in")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> checkIn(@RequestBody Map<String, Object> body) {
        Long userId = body.get("userId") != null ? Long.valueOf(body.get("userId").toString()) : null;
        String methodStr = body.get("method") != null ? body.get("method").toString() : "MANUAL";
        CheckInMethod method = CheckInMethod.valueOf(methodStr);
        String deviceInfo = body.get("deviceInfo") != null ? body.get("deviceInfo").toString() : null;
        String ipAddress = body.get("ipAddress") != null ? body.get("ipAddress").toString() : null;
        Long operatorUserId = body.get("operatorUserId") != null
                ? Long.valueOf(body.get("operatorUserId").toString()) : null;
        String notes = body.get("notes") != null ? body.get("notes").toString() : null;

        CheckInResult result = attendanceService.validateAndCheckIn(
                userId, null, method, deviceInfo, ipAddress, operatorUserId, notes);

        if (!result.success()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "success", false,
                    "message", result.message(),
                    "checkIn", result.checkIn()
            ));
        }
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", result.message(),
                "checkIn", toCheckInMap(result.checkIn())
        ));
    }

    @PutMapping("/check-out/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> checkOut(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        Long operatorUserId = body != null && body.get("operatorUserId") != null
                ? Long.valueOf(body.get("operatorUserId").toString()) : null;

        CheckInResult result = attendanceService.checkOut(id, operatorUserId);
        if (!result.success()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "success", false,
                    "message", result.message()
            ));
        }
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", result.message(),
                "checkIn", toCheckInMap(result.checkIn())
        ));
    }

    // ── MEMBER Endpoints ───────────────────────────────────────────────────

    @PostMapping("/me/check-in")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<?> selfCheckIn(@RequestBody(required = false) Map<String, Object> body,
                                         @RequestHeader(value = "X-Forwarded-For", required = false) String forwardedFor) {
        Long userId = getCurrentUserId();
        String ip = forwardedFor != null ? forwardedFor.split(",")[0].trim()
                : (body != null && body.get("ipAddress") != null ? body.get("ipAddress").toString() : null);
        String deviceInfo = body != null && body.get("deviceInfo") != null
                ? body.get("deviceInfo").toString() : null;

        CheckInResult result = attendanceService.validateAndCheckIn(
                userId, null, CheckInMethod.SELF, deviceInfo, ip, null, null);

        if (!result.success()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "success", false,
                    "message", result.message(),
                    "checkIn", result.checkIn() != null ? toCheckInMap(result.checkIn()) : null
            ));
        }
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", result.message(),
                "checkIn", toCheckInMap(result.checkIn())
        ));
    }

    @GetMapping("/me/history")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<List<Map<String, Object>>> getMyHistory(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Long userId = getCurrentUserId();
        if (from == null) from = LocalDate.now().minusDays(30);
        if (to == null) to = LocalDate.now();
        return ResponseEntity.ok(attendanceService.getMemberHistory(userId, from, to));
    }

    @GetMapping("/me/streak")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<Map<String, Object>> getMyStreak() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(attendanceService.getMemberStreak(userId));
    }

    // ── TRAINER Endpoints ───────────────────────────────────────────────────

    @GetMapping("/trainer/members")
    @PreAuthorize("hasRole('TRAINER')")
    public ResponseEntity<List<Map<String, Object>>> getTrainerMembersAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Long trainerId = getCurrentUserId();
        if (from == null) from = LocalDate.now().minusDays(30);
        if (to == null) to = LocalDate.now();
        return ResponseEntity.ok(attendanceService.getTrainerMembersAttendance(trainerId, from, to));
    }

    @GetMapping("/trainer/member/{memberId}/history")
    @PreAuthorize("hasRole('TRAINER')")
    public ResponseEntity<List<Map<String, Object>>> getTrainerMemberHistory(
            @PathVariable Long memberId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (from == null) from = LocalDate.now().minusDays(30);
        if (to == null) to = LocalDate.now();
        return ResponseEntity.ok(attendanceService.getMemberHistory(memberId, from, to));
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || "anonymousUser".equals(auth.getPrincipal())) {
            throw new RuntimeException("Authentication required");
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof CustomUserDetails cud) {
            Long id = cud.getId();
            if (id == null) {
                throw new RuntimeException("User ID not found in authentication context");
            }
            return id;
        }
        if (principal instanceof User u) {
            return u.getUserId();
        }
        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return user.getUserId();
    }

    private Map<String, Object> toCheckInMap(CheckIn c) {
        if (c == null) return null;
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("checkInId", c.getCheckInId());
        map.put("userId", c.getUser() != null ? c.getUser().getUserId() : null);
        map.put("memberId", c.getUser() != null ? c.getUser().getUserId() : null);
        map.put("memberName", c.getUser() != null ? c.getUser().getFullName() : null);
        map.put("email", c.getUser() != null ? c.getUser().getEmail() : null);
        map.put("checkInTime", c.getCheckInTime());
        map.put("checkOutTime", c.getCheckOutTime());
        map.put("status", c.getStatus() != null ? c.getStatus().name() : null);
        map.put("checkInMethod", c.getCheckInMethod() != null ? c.getCheckInMethod().name() : null);
        map.put("method", c.getCheckInMethod() != null ? c.getCheckInMethod().name() : null);
        map.put("deviceInfo", c.getDeviceInfo());
        map.put("ipAddress", c.getIpAddress());
        map.put("operatorUserId", c.getOperatorUserId());
        map.put("notes", c.getNotes());
        map.put("gymId", c.getGymId());
        if (c.getCheckInTime() != null && c.getCheckOutTime() != null) {
            long mins = java.time.temporal.ChronoUnit.MINUTES.between(c.getCheckInTime(), c.getCheckOutTime());
            map.put("durationMinutes", mins);
        }
        return map;
    }
}
