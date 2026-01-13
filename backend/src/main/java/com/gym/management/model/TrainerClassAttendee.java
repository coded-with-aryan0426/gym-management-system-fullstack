package com.gym.management.model;

import jakarta.persistence.*;

@Entity
@Table(name = "trainer_class_attendees")
public class TrainerClassAttendee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "class_id", nullable = false)
    private Long classId;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(length = 20)
    @Enumerated(EnumType.STRING)
    private AttendeeStatus status = AttendeeStatus.PENDING;

    // Enum
    public enum AttendeeStatus {
        CONFIRMED, PENDING, ABSENT
    }

    // Constructors
    public TrainerClassAttendee() {
    }

    public TrainerClassAttendee(Long classId, Long memberId, AttendeeStatus status) {
        this.classId = classId;
        this.memberId = memberId;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public Long getMemberId() {
        return memberId;
    }

    public void setMemberId(Long memberId) {
        this.memberId = memberId;
    }

    public AttendeeStatus getStatus() {
        return status;
    }

    public void setStatus(AttendeeStatus status) {
        this.status = status;
    }
}
