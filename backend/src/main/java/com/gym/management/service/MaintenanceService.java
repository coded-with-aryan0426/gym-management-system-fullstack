package com.gym.management.service;

import com.gym.management.model.Equipment;
import com.gym.management.model.EquipmentMaintenance;
import com.gym.management.repository.EquipmentMaintenanceRepository;
import com.gym.management.repository.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MaintenanceService {

    @Autowired
    private EquipmentMaintenanceRepository maintenanceRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    public List<EquipmentMaintenance> getMaintenanceHistory(Long equipmentId) {
        return maintenanceRepository.findByEquipmentId(equipmentId);
    }

    @Transactional
    public EquipmentMaintenance logMaintenance(EquipmentMaintenance maintenance) {
        // Update equipment status if necessary
        Equipment equipment = equipmentRepository.findById(maintenance.getEquipment().getId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        if (maintenance.getStatus() == EquipmentMaintenance.MaintenanceStatus.SCHEDULED) {
            // Logic for scheduling
        } else if (maintenance.getStatus() == EquipmentMaintenance.MaintenanceStatus.COMPLETED) {
            equipment.setLastMaintenanceDate(maintenance.getMaintenanceDate());
            if (maintenance.getNextDueDate() != null) {
                equipment.setNextMaintenanceDueDate(maintenance.getNextDueDate());
            }
            equipment.setStatus(Equipment.EquipmentStatus.ACTIVE); // Assume active after maintenance
            equipmentRepository.save(equipment);
        }

        return maintenanceRepository.save(maintenance);
    }
}
