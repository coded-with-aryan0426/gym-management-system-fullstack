package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entity representing a Personal Training session
 * Maps to pt_sessions table in the database
 */
@Entity
@Table(name = "pt_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PTSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Long sessionId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "trainer_id", nullable = false)
    private User trainer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "member_id", nullable = false)
    private User member;

    @Column(name = "session_date", nullable = false)
    private LocalDateTime sessionDate;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SessionStatus status;

    @Column(name = "progress_notes", columnDefinition = "CLOB")
    private String progressNotes;

    @Column(name = "workout_plan", columnDefinition = "CLOB")
    private String workoutPlan;

    @Column(name = "diet_plan", columnDefinition = "CLOB")
    private String dietPlan;

    @Column(name = "is_recurring")
    private Boolean isRecurring;

    @Enumerated(EnumType.STRING)
    @Column(name = "recurring_frequency", length = 20)
    private RecurringFrequency recurringFrequency;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isRecurring == null) {
            isRecurring = false;
        }
        if (status == null) {
            status = SessionStatus.SCHEDULED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getSessionDate() {
        return sessionDate;
    }

    public User getTrainer() {
        return trainer;
    }

    public User getMember() {
        return member;
    }

    public SessionStatus getStatus() {
        return status;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setTrainer(User trainer) {
        this.trainer = trainer;
    }

    public void setMember(User member) {
        this.member = member;
    }

    public void setSessionDate(LocalDateTime sessionDate) {
        this.sessionDate = sessionDate;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public void setStatus(SessionStatus status) {
        this.status = status;
    }

    public void setProgressNotes(String progressNotes) {
        this.progressNotes = progressNotes;
    }

    public void setIsRecurring(Boolean isRecurring) {
        this.isRecurring = isRecurring;
    }
}
