package com.gym.management.component;

import com.gym.management.model.Equipment;
import com.gym.management.model.Equipment.EquipmentCategory;
import com.gym.management.model.Equipment.EquipmentCondition;
import com.gym.management.model.Equipment.EquipmentStatus;
import com.gym.management.model.Equipment.UsageLevel;
import com.gym.management.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class EquipmentDataSeeder implements CommandLineRunner {

        private final EquipmentRepository equipmentRepository;

        @Override
        public void run(String... args) throws Exception {
                if (equipmentRepository.count() > 5) {
                        log.info("Equipment data exists. Skipping seed.");
                        return;
                }

                log.info("Seeding equipment data...");
                List<Equipment> equipmentList = new ArrayList<>();
                LocalDate now = LocalDate.now();

                // 1. CARDIO
                equipmentList.add(createEquipment("Treadmill Excite Live", EquipmentCategory.CARDIO, "TechnoGym",
                                "Live 5000",
                                "SN-TM-001",
                                now.minusMonths(12), new BigDecimal("4500.00"), now.plusMonths(24), "TechnoGym Direct",
                                1,
                                "Cardio Zone A", EquipmentStatus.ACTIVE, EquipmentCondition.GOOD));

                equipmentList.add(createEquipment("Treadmill Excite Live", EquipmentCategory.CARDIO, "TechnoGym",
                                "Live 5000",
                                "SN-TM-002",
                                now.minusMonths(12), new BigDecimal("4500.00"), now.plusMonths(24), "TechnoGym Direct",
                                1,
                                "Cardio Zone A", EquipmentStatus.ACTIVE, EquipmentCondition.GOOD));

                equipmentList.add(
                                createEquipment("Elliptical Cross Trainer", EquipmentCategory.CARDIO, "Precor",
                                                "EFX 800", "SN-EL-001",
                                                now.minusMonths(18), new BigDecimal("3200.00"), now.plusMonths(18),
                                                "Fitness Depot", 1,
                                                "Cardio Zone B", EquipmentStatus.ACTIVE, EquipmentCondition.FAIR));

                equipmentList.add(
                                createEquipment("Elliptical Cross Trainer", EquipmentCategory.CARDIO, "Precor",
                                                "EFX 800", "SN-EL-002",
                                                now.minusMonths(18), new BigDecimal("3200.00"), now.plusMonths(18),
                                                "Fitness Depot", 1,
                                                "Cardio Zone B", EquipmentStatus.MAINTENANCE, EquipmentCondition.FAIR));

                equipmentList.add(
                                createEquipment("RowErg", EquipmentCategory.CARDIO, "Concept2", "Model D", "SN-RW-001",
                                                now.minusMonths(6), new BigDecimal("1100.00"), now.plusMonths(30),
                                                "Rogue Fitness", 1, "Cardio Zone C",
                                                EquipmentStatus.ACTIVE, EquipmentCondition.NEW));

                equipmentList
                                .add(createEquipment("AirBike", EquipmentCategory.CARDIO, "Assault Fitness", "Classic",
                                                "SN-AB-001",
                                                now.minusMonths(8), new BigDecimal("800.00"), now.plusMonths(4),
                                                "Rogue Fitness", 1,
                                                "Cardio Zone C", EquipmentStatus.ACTIVE, EquipmentCondition.GOOD));

                equipmentList.add(
                                createEquipment("Spin Bike", EquipmentCategory.CARDIO, "Peloton", "Bike+", "SN-SB-001",
                                                now.minusMonths(3), new BigDecimal("2500.00"), now.plusMonths(9),
                                                "Peloton Commercial", 1,
                                                "Cycling Studio", EquipmentStatus.ACTIVE, EquipmentCondition.NEW));

                equipmentList.add(
                                createEquipment("Spin Bike", EquipmentCategory.CARDIO, "Peloton", "Bike+", "SN-SB-002",
                                                now.minusMonths(3), new BigDecimal("2500.00"), now.plusMonths(9),
                                                "Peloton Commercial", 1,
                                                "Cycling Studio", EquipmentStatus.ACTIVE, EquipmentCondition.NEW));

                // 2. STRENGTH
                equipmentList.add(
                                createEquipment("Dumbbell Set (5-50kg)", EquipmentCategory.STRENGTH, "Rogue",
                                                "Rubber Hex", "SN-DB-SET",
                                                now.minusMonths(24), new BigDecimal("3500.00"), null, "Rogue Fitness",
                                                1, "Free Weights Area",
                                                EquipmentStatus.ACTIVE, EquipmentCondition.GOOD));

                equipmentList.add(
                                createEquipment("Olympic Barbell", EquipmentCategory.STRENGTH, "Eleiko", "IWF Training",
                                                "SN-BB-001",
                                                now.minusMonths(12), new BigDecimal("900.00"), now.plusYears(5),
                                                "Eleiko Sport", 1,
                                                "Free Weights Area", EquipmentStatus.ACTIVE, EquipmentCondition.GOOD));

                equipmentList
                                .add(createEquipment("Olympic Barbell", EquipmentCategory.STRENGTH, "Rogue", "Ohio Bar",
                                                "SN-BB-002",
                                                now.minusMonths(6), new BigDecimal("350.00"), now.plusYears(2),
                                                "Rogue Fitness", 1,
                                                "Free Weights Area", EquipmentStatus.ACTIVE, EquipmentCondition.NEW));

                equipmentList.add(
                                createEquipment("Power Rack", EquipmentCategory.STRENGTH, "Hammer Strength", "HD Elite",
                                                "SN-PR-001",
                                                now.minusMonths(24), new BigDecimal("2200.00"), null, "Life Fitness", 1,
                                                "Power Zone",
                                                EquipmentStatus.ACTIVE, EquipmentCondition.GOOD));

                equipmentList
                                .add(createEquipment("Smith Machine", EquipmentCategory.STRENGTH, "Life Fitness",
                                                "Optima", "SN-SM-001",
                                                now.minusMonths(36), new BigDecimal("3000.00"), null, "Life Fitness", 1,
                                                "Machine Zone",
                                                EquipmentStatus.OUT_OF_ORDER, EquipmentCondition.POOR));

                equipmentList.add(
                                createEquipment("Cable Crossover", EquipmentCategory.STRENGTH, "Life Fitness",
                                                "Signature", "SN-CC-001",
                                                now.minusMonths(20), new BigDecimal("4500.00"), now.plusMonths(4),
                                                "Life Fitness", 1,
                                                "Machine Zone", EquipmentStatus.ACTIVE, EquipmentCondition.GOOD));

                equipmentList
                                .add(createEquipment("Leg Press 45", EquipmentCategory.STRENGTH, "Cybex",
                                                "Plate Loaded", "SN-LP-001",
                                                now.minusMonths(15), new BigDecimal("2800.00"), null, "Fitness Depot",
                                                1, "Leg Zone",
                                                EquipmentStatus.ACTIVE, EquipmentCondition.GOOD));

                equipmentList.add(createEquipment("Chest Press Machine", EquipmentCategory.STRENGTH, "TechnoGym",
                                "Selection 900", "SN-CP-001",
                                now.minusMonths(10), new BigDecimal("3800.00"), now.plusMonths(14), "TechnoGym Direct",
                                1,
                                "Machine Zone", EquipmentStatus.ACTIVE, EquipmentCondition.NEW));

                // 3. FUNCTIONAL
                equipmentList.add(createEquipment("Kettlebell Set (8-32kg)", EquipmentCategory.FUNCTIONAL, "Rogue",
                                "Competition", "SN-KB-SET",
                                now.minusMonths(12), new BigDecimal("1200.00"), null, "Rogue Fitness", 1, "Turf Area",
                                EquipmentStatus.ACTIVE, EquipmentCondition.GOOD));

                equipmentList
                                .add(createEquipment("Medicine Ball Set", EquipmentCategory.FUNCTIONAL, "TRX",
                                                "Wall Ball", "SN-MB-SET",
                                                now.minusMonths(6), new BigDecimal("600.00"), null, "TRX Training", 1,
                                                "Turf Area",
                                                EquipmentStatus.ACTIVE, EquipmentCondition.GOOD));

                equipmentList.add(createEquipment("Battle Rope", EquipmentCategory.FUNCTIONAL, "Onnit", "50ft",
                                "SN-BR-001",
                                now.minusMonths(8), new BigDecimal("150.00"), null, "Onnit", 1, "Turf Area",
                                EquipmentStatus.ACTIVE,
                                EquipmentCondition.FAIR));

                equipmentList
                                .add(createEquipment("Plyo Box Set", EquipmentCategory.FUNCTIONAL, "Rogue",
                                                "Foam Games", "SN-PB-SET",
                                                now.minusMonths(12), new BigDecimal("450.00"), null, "Rogue Fitness", 1,
                                                "Turf Area",
                                                EquipmentStatus.ACTIVE, EquipmentCondition.GOOD));

                // 4. RECOVERY / YOGA
                equipmentList.add(createEquipment("Yoga Mats", EquipmentCategory.YOGA, "Lululemon", "The Mat 5mm",
                                "SN-YM-BULK",
                                now.minusMonths(4), new BigDecimal("2000.00"), null, "Lululemon", 20, "Studio 1",
                                EquipmentStatus.ACTIVE, EquipmentCondition.NEW));

                equipmentList
                                .add(createEquipment("Foam Rollers", EquipmentCategory.RECOVERY, "TriggerPoint", "GRID",
                                                "SN-FR-BULK",
                                                now.minusMonths(6), new BigDecimal("400.00"), null, "Amazon Business",
                                                10, "Recovery Zone",
                                                EquipmentStatus.ACTIVE, EquipmentCondition.GOOD));

                equipmentList
                                .add(createEquipment("Massage Gun", EquipmentCategory.RECOVERY, "Hyperice",
                                                "Hypervolt 2", "SN-MG-001",
                                                now.minusMonths(2), new BigDecimal("300.00"), now.plusMonths(10),
                                                "Hyperice", 1,
                                                "Recovery Zone", EquipmentStatus.ACTIVE, EquipmentCondition.NEW));

                equipmentList
                                .add(createEquipment("Sauna Unit", EquipmentCategory.RECOVERY, "Clearlight",
                                                "Sanctuary 2", "SN-SN-001",
                                                now.minusMonths(2), new BigDecimal("6500.00"), now.plusYears(5),
                                                "Clearlight Saunas", 1,
                                                "Locker Room", EquipmentStatus.ACTIVE, EquipmentCondition.NEW));

                equipmentRepository.saveAll(equipmentList);
                log.info("Seeded {} equipment items.", equipmentList.size());
        }

        private Equipment createEquipment(String name, EquipmentCategory category, String brand, String model,
                        String serial, LocalDate purchaseDate, BigDecimal cost, LocalDate warrantyDate,
                        String vendor, Integer quantity, String location, EquipmentStatus status,
                        EquipmentCondition condition) {
                Equipment e = new Equipment();
                e.setName(name);
                e.setCategory(category);
                e.setBrand(brand);
                e.setModel(model);
                e.setSerialNumber(serial);
                e.setPurchaseDate(purchaseDate);
                e.setPurchaseCost(cost);
                e.setWarrantyExpiryDate(warrantyDate);
                e.setVendorName(vendor);
                e.setQuantity(quantity);
                e.setLocation(location);
                e.setStatus(status);
                e.setCondition(condition);

                // Random usage level
                UsageLevel[] levels = UsageLevel.values();
                e.setUsageLevel(levels[new Random().nextInt(levels.length)]);

                // Set maintenance dates based on status
                if (status == EquipmentStatus.MAINTENANCE) {
                        e.setLastMaintenanceDate(LocalDate.now().minusDays(10));
                        e.setNextMaintenanceDueDate(LocalDate.now().plusDays(5));
                } else {
                        e.setLastMaintenanceDate(LocalDate.now().minusMonths(3));
                        e.setNextMaintenanceDueDate(LocalDate.now().plusMonths(3));
                }

                return e;
        }
}
