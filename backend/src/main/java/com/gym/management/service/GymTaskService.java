package com.gym.management.service;

import com.gym.management.model.GymTask;
import com.gym.management.repository.GymTaskRepository;
import com.gym.management.seeder.GymTaskDataSeeder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class GymTaskService {

    @Autowired
    private GymTaskRepository gymTaskRepository;

    @Autowired
    private GymTaskDataSeeder gymTaskDataSeeder;

    private static final Long DEFAULT_GYM_ID = 1L;

    public List<GymTask> getAllTasks() {
        return gymTaskRepository.findByGymIdOrderByCreatedAtDesc(DEFAULT_GYM_ID);
    }

    public List<GymTask> getTasksByStatus(String status) {
        return gymTaskRepository.findByGymIdAndStatusOrderByCreatedAtDesc(DEFAULT_GYM_ID, status);
    }

    public List<GymTask> getTasksByCategory(String category) {
        return gymTaskRepository.findByGymIdAndCategoryOrderByCreatedAtDesc(DEFAULT_GYM_ID, category);
    }

    public GymTask createTask(GymTask task) {
        task.setGymId(DEFAULT_GYM_ID);
        return gymTaskRepository.save(task);
    }

    public GymTask updateTask(Long taskId, GymTask updatedTask) {
        GymTask task = gymTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));

        task.setTitle(updatedTask.getTitle());
        if (updatedTask.getDescription() != null) task.setDescription(updatedTask.getDescription());
        if (updatedTask.getStatus() != null) {
            task.setStatus(updatedTask.getStatus());
            if ("DONE".equals(updatedTask.getStatus()) && task.getCompletedAt() == null) {
                task.setCompletedAt(LocalDateTime.now());
            } else if (!"DONE".equals(updatedTask.getStatus())) {
                task.setCompletedAt(null);
            }
        }
        if (updatedTask.getPriority() != null) task.setPriority(updatedTask.getPriority());
        if (updatedTask.getCategory() != null) task.setCategory(updatedTask.getCategory());
        if (updatedTask.getDueDate() != null) task.setDueDate(updatedTask.getDueDate());
        if (updatedTask.getAssignedTo() != null) task.setAssignedTo(updatedTask.getAssignedTo());

        return gymTaskRepository.save(task);
    }

    public GymTask updateTaskStatus(Long taskId, String status) {
        GymTask task = gymTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        task.setStatus(status);
        if ("DONE".equals(status) && task.getCompletedAt() == null) {
            task.setCompletedAt(LocalDateTime.now());
        } else if (!"DONE".equals(status)) {
            task.setCompletedAt(null);
        }
        return gymTaskRepository.save(task);
    }

    public void deleteTask(Long taskId) {
        gymTaskRepository.deleteById(taskId);
    }

    public Map<String, Object> getTaskStats() {
        long total = gymTaskRepository.countByGymIdAndStatus(DEFAULT_GYM_ID, "TODO")
                + gymTaskRepository.countByGymIdAndStatus(DEFAULT_GYM_ID, "IN_PROGRESS")
                + gymTaskRepository.countByGymIdAndStatus(DEFAULT_GYM_ID, "DONE");
        long todo = gymTaskRepository.countByGymIdAndStatus(DEFAULT_GYM_ID, "TODO");
        long inProgress = gymTaskRepository.countByGymIdAndStatus(DEFAULT_GYM_ID, "IN_PROGRESS");
        long done = gymTaskRepository.countByGymIdAndStatus(DEFAULT_GYM_ID, "DONE");
        long urgent = gymTaskRepository.countUrgentTasks(DEFAULT_GYM_ID);
        List<GymTask> overdue = gymTaskRepository.findOverdueTasks(DEFAULT_GYM_ID, LocalDate.now());

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("todo", todo);
        stats.put("inProgress", inProgress);
        stats.put("done", done);
        stats.put("urgent", urgent);
        stats.put("overdue", overdue.size());
        return stats;
    }

    /** Insert 20 dummy tasks covering every field / priority / status / category combination. */
    public Map<String, Object> seedDummyTasks() {
        int inserted = gymTaskDataSeeder.seed();
        Map<String, Object> result = new HashMap<>();
        result.put("inserted", inserted);
        result.put("message", "Seeded " + inserted + " dummy tasks successfully.");
        return result;
    }
}
