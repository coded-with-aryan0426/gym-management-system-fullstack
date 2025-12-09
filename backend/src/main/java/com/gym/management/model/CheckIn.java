package com.gym.management.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "CHECK_INS")
public class CheckIn {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "checkin_seq")
    @SequenceGenerator(name = "checkin_seq", sequenceName = "CHECK_IN_SEQ", allocationSize = 1)
    @Column(name = "CHECK_IN_ID")
    private Long checkInId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "CHECK_IN_TIME", nullable = false)
    private LocalDateTime checkInTime;

    @Column(name = "CHECK_OUT_TIME")
    private LocalDateTime checkOutTime;

    @Column(name = "STATUS")
    private String status; // "check-in", "access denied", "checked-out"

    // Constructors
    public CheckIn() {
        this.checkInTime = LocalDateTime.now();
        this.status = "check-in";
    }

    public CheckIn(User user) {
        this.user = user;
        this.checkInTime = LocalDateTime.now();
        this.status = "check-in";
    }

    // Getters and Setters
    public Long getCheckInId() {
        return checkInId;
    }

    public void setCheckInId(Long checkInId) {
        this.checkInId = checkInId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalDateTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    public LocalDateTime getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(LocalDateTime checkOutTime) {
        this.checkOutTime = checkOutTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // Check out method
    public void checkOut() {
        this.checkOutTime = LocalDateTime.now();
        this.status = "checked-out";
    }
}
