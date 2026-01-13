package com.gym.management.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "trainer_classes")
public class TrainerClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(name = "trainer_id", nullable = false)
    private Long trainerId;

    @Column(name = "class_date", nullable = false)
    private LocalDate classDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    private Integer duration; // in minutes

    @Column(length = 50)
    private String room;

    @Column(nullable = false)
    private Integer capacity = 20;

    @Column(nullable = false)
    private Integer enrolled = 0;

    @Column(name = "class_type", length = 20)
    @Enumerated(EnumType.STRING)
    private ClassType type = ClassType.GROUP;

    @Column(length = 20)
    @Enumerated(EnumType.STRING)
    private ClassStatus status = ClassStatus.UPCOMING;

    @Column(name = "is_recurring")
    private Boolean recurring = false;

    @Column(length = 500)
    private String notes;

    // Enums
    public enum ClassType {
        GROUP, PT
    }

    public enum ClassStatus {
        UPCOMING, IN_PROGRESS, COMPLETED, CANCELLED
    }

    // Constructors
    public TrainerClass() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Long getTrainerId() {
        return trainerId;
    }

    public void setTrainerId(Long trainerId) {
        this.trainerId = trainerId;
    }

    public LocalDate getClassDate() {
        return classDate;
    }

    public void setClassDate(LocalDate classDate) {
        this.classDate = classDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Integer getEnrolled() {
        return enrolled;
    }

    public void setEnrolled(Integer enrolled) {
        this.enrolled = enrolled;
    }

    public ClassType getType() {
        return type;
    }

    public void setType(ClassType type) {
        this.type = type;
    }

    public ClassStatus getStatus() {
        return status;
    }

    public void setStatus(ClassStatus status) {
        this.status = status;
    }

    public Boolean getRecurring() {
        return recurring;
    }

    public void setRecurring(Boolean recurring) {
        this.recurring = recurring;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
