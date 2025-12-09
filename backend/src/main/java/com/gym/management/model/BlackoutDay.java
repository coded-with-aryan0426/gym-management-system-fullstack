package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

/**
 * Entity representing a blackout day when the gym is closed
 * Maps to blackout_days table in the database
 */
@Entity
@Table(name = "blackout_days")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlackoutDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "blackout_id")
    private Long blackoutId;

    @Column(name = "blackout_date", nullable = false, unique = true)
    private LocalDate date;

    @Column(length = 255)
    private String reason;
}
