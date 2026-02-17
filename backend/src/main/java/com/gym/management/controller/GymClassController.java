package com.gym.management.controller;

import com.gym.management.dto.ClassBookingDTO;
import com.gym.management.dto.GymClassDTO;
import com.gym.management.service.GymClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classes")
@CrossOrigin(origins = "*")
public class GymClassController {

    @Autowired
    private GymClassService gymClassService;

    @GetMapping
    public ResponseEntity<List<GymClassDTO>> getAvailableClasses(
            @RequestParam(required = false) Long memberId) {
        List<GymClassDTO> classes = gymClassService.getAvailableClasses(memberId);
        return ResponseEntity.ok(classes);
    }

    @GetMapping("/today")
    public ResponseEntity<List<GymClassDTO>> getTodaysClasses(
            @RequestParam(required = false) Long memberId) {
        List<GymClassDTO> classes = gymClassService.getTodaysClasses(memberId);
        return ResponseEntity.ok(classes);
    }

    @GetMapping("/member/{memberId}/bookings")
    public ResponseEntity<List<ClassBookingDTO>> getMemberBookings(@PathVariable Long memberId) {
        List<ClassBookingDTO> bookings = gymClassService.getMemberBookings(memberId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/member/{memberId}/bookings/count")
    public ResponseEntity<Map<String, Long>> getMemberBookingsCount(@PathVariable Long memberId) {
        Long count = gymClassService.getMemberBookingsCount(memberId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PostMapping("/{classId}/book")
    public ResponseEntity<?> bookClass(
            @PathVariable Long classId,
            @RequestParam Long memberId) {
        try {
            ClassBookingDTO booking = gymClassService.bookClass(classId, memberId);
            return ResponseEntity.status(HttpStatus.CREATED).body(booking);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to book class: " + e.getMessage()));
        }
    }

    @DeleteMapping("/bookings/{bookingId}")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long bookingId,
            @RequestParam Long memberId) {
        try {
            gymClassService.cancelBooking(bookingId, memberId);
            return ResponseEntity.ok(Map.of("message", "Booking cancelled successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to cancel booking: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createClass(@RequestBody GymClassDTO dto) {
        try {
            GymClassDTO created = gymClassService.createClass(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create class: " + e.getMessage()));
        }
    }
}
