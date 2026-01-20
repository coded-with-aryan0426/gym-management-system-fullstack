package com.gym.management.controller;

import com.gym.management.model.Equipment;
import com.gym.management.model.EquipmentIssue;
import com.gym.management.model.EquipmentMaintenance;
import com.gym.management.service.EquipmentIssueService;
import com.gym.management.service.EquipmentService;
import com.gym.management.service.MaintenanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class EquipmentController {

    @Autowired
    private EquipmentService equipmentService;

    @Autowired
    private MaintenanceService maintenanceService;

    @Autowired
    private EquipmentIssueService issueService;

    // --- OWNER Endpoints ---

    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/owner/equipment")
    public ResponseEntity<List<Equipment>> getAllEquipment() {
        return ResponseEntity.ok(equipmentService.getAllEquipment());
    }

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/owner/equipment")
    public ResponseEntity<Equipment> addEquipment(@RequestBody Equipment equipment) {
        return ResponseEntity.ok(equipmentService.addEquipment(equipment));
    }

    @PreAuthorize("hasRole('OWNER')")
    @PutMapping("/owner/equipment/{id}")
    public ResponseEntity<Equipment> updateEquipment(@PathVariable Long id, @RequestBody Equipment equipment) {
        return ResponseEntity.ok(equipmentService.updateEquipment(id, equipment));
    }

    @PreAuthorize("hasRole('OWNER')")
    @DeleteMapping("/owner/equipment/{id}")
    public ResponseEntity<Void> deleteEquipment(@PathVariable Long id) {
        equipmentService.deleteEquipment(id);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/owner/equipment/{id}/maintenance")
    public ResponseEntity<List<EquipmentMaintenance>> getMaintenanceHistory(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.getMaintenanceHistory(id));
    }

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/owner/equipment/{id}/maintenance")
    public ResponseEntity<EquipmentMaintenance> logMaintenance(@PathVariable Long id, @RequestBody EquipmentMaintenance maintenance) {
        // Ensure equipment ID is set correctly
        Equipment equipment = equipmentService.getEquipmentById(id);
        maintenance.setEquipment(equipment);
        return ResponseEntity.ok(maintenanceService.logMaintenance(maintenance));
    }

    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/owner/equipment/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(equipmentService.getEquipmentStats());
    }

    // --- TRAINER Endpoints ---

    @PreAuthorize("hasAnyRole('OWNER', 'TRAINER')")
    @GetMapping("/trainer/equipment")
    public ResponseEntity<List<Equipment>> getEquipmentForTrainer() {
        return ResponseEntity.ok(equipmentService.getAllEquipment());
    }

    @PreAuthorize("hasRole('TRAINER')")
    @PostMapping("/trainer/equipment/{id}/report-issue")
    public ResponseEntity<EquipmentIssue> reportIssue(@PathVariable Long id, @RequestBody EquipmentIssue issue) {
        Equipment equipment = equipmentService.getEquipmentById(id);
        issue.setEquipment(equipment);
        // User (reportedBy) should be set from SecurityContext, but for now we might need to handle it or pass it in body if simple
        // In a real app, we extract user from token. Assuming it's passed or handled in service for now.
        return ResponseEntity.ok(issueService.reportIssue(issue));
    }
}
