package com.gym.management.repository;

import com.gym.management.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByIsDeletedFalse();
    
    @Query("SELECT e FROM Equipment e WHERE e.isDeleted = false AND e.status = 'ACTIVE'")
    List<Equipment> findAllActive();

    @Query("SELECT e FROM Equipment e WHERE e.isDeleted = false AND e.nextMaintenanceDueDate <= CURRENT_DATE")
    List<Equipment> findOverdueMaintenance();
}
