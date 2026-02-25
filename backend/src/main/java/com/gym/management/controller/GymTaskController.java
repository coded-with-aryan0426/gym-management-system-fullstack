package com.gym.management.controller;

import com.gym.management.model.GymTask;
import com.gym.management.service.GymTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175" })
public class GymTaskController {

    @Autowired
    private GymTaskService gymTaskService;

    @GetMapping
    public ResponseEntity<List<GymTask>> getAllTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category) {
        if (status != null) {
            return ResponseEntity.ok(gymTaskService.getTasksByStatus(status));
        }
        if (category != null) {
            return ResponseEntity.ok(gymTaskService.getTasksByCategory(category));
        }
        return ResponseEntity.ok(gymTaskService.getAllTasks());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(gymTaskService.getTaskStats());
    }

    @PostMapping
    public ResponseEntity<GymTask> createTask(@RequestBody GymTask task) {
        return ResponseEntity.ok(gymTaskService.createTask(task));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GymTask> updateTask(@PathVariable Long id, @RequestBody GymTask task) {
        return ResponseEntity.ok(gymTaskService.updateTask(id, task));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<GymTask> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(gymTaskService.updateTaskStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        gymTaskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    /** Public seed endpoint — inserts 20 dummy tasks covering all field combinations. */
    @PostMapping("/seed")
    public ResponseEntity<Map<String, Object>> seedTasks() {
        return ResponseEntity.ok(gymTaskService.seedDummyTasks());
    }
}
