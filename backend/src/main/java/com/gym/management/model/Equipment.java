package com.gym.management.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "equipment")
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "gym_id")
    private Long gymId;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EquipmentCategory category;

    private String icon; // Iconscout icon name

    private String brand;
    private String model;
    private String serialNumber;

    private LocalDate purchaseDate;
    private BigDecimal purchaseCost;
    private LocalDate warrantyExpiryDate;
    private String vendorName;

    private Integer quantity;
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EquipmentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "equipment_condition")
    private EquipmentCondition condition;

    @Enumerated(EnumType.STRING)
    private UsageLevel usageLevel;

    private LocalDate lastMaintenanceDate;
    private LocalDate nextMaintenanceDueDate;

    private boolean isDeleted = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum EquipmentCategory {
        STRENGTH, CARDIO, FUNCTIONAL, YOGA, RECOVERY, OTHER
    }

    public enum EquipmentStatus {
        ACTIVE, MAINTENANCE, OUT_OF_ORDER, RETIRED
    }

    public enum EquipmentCondition {
        NEW, GOOD, FAIR, POOR
    }

    public enum UsageLevel {
        LOW, MEDIUM, HIGH
    }
}
