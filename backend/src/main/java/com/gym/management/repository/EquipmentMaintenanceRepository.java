package com.gym.management.repository;

import com.gym.management.model.EquipmentMaintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentMaintenanceRepository extends JpaRepository<EquipmentMaintenance, Long> {
    List<EquipmentMaintenance> findByEquipmentId(Long equipmentId);
    
    @Query("SELECT em FROM EquipmentMaintenance em WHERE em.status = 'SCHEDULED' AND em.maintenanceDate <= CURRENT_DATE")
    List<EquipmentMaintenance> findDueMaintenance();
}
