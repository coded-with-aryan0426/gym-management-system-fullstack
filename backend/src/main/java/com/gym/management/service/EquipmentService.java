package com.gym.management.service;

import com.gym.management.model.Equipment;
import com.gym.management.repository.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EquipmentService {

    @Autowired
    private EquipmentRepository equipmentRepository;

    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findByIsDeletedFalse();
    }

    public Equipment getEquipmentById(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
    }

    @Transactional
    public Equipment addEquipment(Equipment equipment) {
        equipment.setDeleted(false);
        if (equipment.getStatus() == null) {
            equipment.setStatus(Equipment.EquipmentStatus.ACTIVE);
        }
        return equipmentRepository.save(equipment);
    }

    @Transactional
    public Equipment updateEquipment(Long id, Equipment details) {
        Equipment equipment = getEquipmentById(id);

        equipment.setName(details.getName());
        equipment.setCategory(details.getCategory());
        equipment.setBrand(details.getBrand());
        equipment.setModel(details.getModel());
        equipment.setLocation(details.getLocation());
        equipment.setStatus(details.getStatus());
        equipment.setCondition(details.getCondition());
        equipment.setQuantity(details.getQuantity());
        equipment.setPurchaseDate(details.getPurchaseDate());
        equipment.setPurchaseCost(details.getPurchaseCost());
        equipment.setVendorName(details.getVendorName());
        equipment.setWarrantyExpiryDate(details.getWarrantyExpiryDate());
        equipment.setIcon(details.getIcon());

        return equipmentRepository.save(equipment);
    }

    @Transactional
    public void deleteEquipment(Long id) {
        Equipment equipment = getEquipmentById(id);
        equipment.setDeleted(true);
        equipmentRepository.save(equipment);
    }

    public Map<String, Object> getEquipmentStats() {
        List<Equipment> all = equipmentRepository.findByIsDeletedFalse();

        long total = all.size();
        long active = all.stream().filter(e -> e.getStatus() == Equipment.EquipmentStatus.ACTIVE).count();
        long maintenance = all.stream().filter(e -> e.getStatus() == Equipment.EquipmentStatus.MAINTENANCE).count();
        long outOfOrder = all.stream().filter(e -> e.getStatus() == Equipment.EquipmentStatus.OUT_OF_ORDER).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("active", active);
        stats.put("maintenance", maintenance);
        stats.put("outOfOrder", outOfOrder);

        return stats;
    }
}
