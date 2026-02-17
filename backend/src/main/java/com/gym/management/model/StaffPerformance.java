package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

/**
 * Entity representing staff performance metrics
 * Maps to staff_performance table in the database
 */
@Entity
@Table(name = "staff_performance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffPerformance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "performance_id")
    private Long performanceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private User staff;

    @Column(name = "sessions_completed")
    private Integer sessionsCompleted;

    @Column(name = "attendance_rate")
    private BigDecimal attendanceRate;

    @Column(name = "satisfaction_score")
    private BigDecimal satisfactionScore;

    @Column(name = "present_days")
    private Integer presentDays;

    @Column(name = "absent_days")
    private Integer absentDays;

    @Column(name = "late_days")
    private Integer lateDays;

    @Column(name = "record_month", nullable = false, length = 7)
    private String recordMonth; // Format: YYYY-MM

    @PrePersist
    protected void onCreate() {
        if (sessionsCompleted == null) {
            sessionsCompleted = 0;
        }
        if (presentDays == null) {
            presentDays = 0;
        }
        if (absentDays == null) {
            absentDays = 0;
        }
        if (lateDays == null) {
            lateDays = 0;
        }
    }
}
