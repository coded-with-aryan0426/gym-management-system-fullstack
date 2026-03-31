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

    @Column(name = "gym_id")
    private Long gymId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gym_id", insertable = false, updatable = false)
    private Gym gym;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "CHECK_IN_TIME", nullable = false)
    private LocalDateTime checkInTime;

    @Column(name = "CHECK_OUT_TIME")
    private LocalDateTime checkOutTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", length = 20)
    private CheckInStatus status = CheckInStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "check_in_method", length = 20)
    private CheckInMethod checkInMethod = CheckInMethod.MANUAL;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "device_info", length = 200)
    private String deviceInfo;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "operator_user_id")
    private Long operatorUserId;

    public CheckIn() {
        this.checkInTime = LocalDateTime.now();
        this.status = CheckInStatus.ACTIVE;
    }

    public CheckIn(User user) {
        this.user = user;
        this.checkInTime = LocalDateTime.now();
        this.status = CheckInStatus.ACTIVE;
    }

    public CheckIn(User user, Long gymId) {
        this.user = user;
        this.gymId = gymId;
        this.checkInTime = LocalDateTime.now();
        this.status = CheckInStatus.ACTIVE;
    }

    public Long getCheckInId() { return checkInId; }
    public void setCheckInId(Long checkInId) { this.checkInId = checkInId; }

    public Long getGymId() { return gymId; }
    public void setGymId(Long gymId) { this.gymId = gymId; }

    public Gym getGym() { return gym; }
    public void setGym(Gym gym) { this.gym = gym; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDateTime getCheckInTime() { return checkInTime; }
    public void setCheckInTime(LocalDateTime checkInTime) { this.checkInTime = checkInTime; }

    public LocalDateTime getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(LocalDateTime checkOutTime) { this.checkOutTime = checkOutTime; }

    public CheckInStatus getStatus() { return status; }
    public void setStatus(CheckInStatus status) { this.status = status; }

    public CheckInMethod getCheckInMethod() { return checkInMethod; }
    public void setCheckInMethod(CheckInMethod checkInMethod) { this.checkInMethod = checkInMethod; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public Long getOperatorUserId() { return operatorUserId; }
    public void setOperatorUserId(Long operatorUserId) { this.operatorUserId = operatorUserId; }

    public void checkOut() {
        this.checkOutTime = LocalDateTime.now();
        this.status = CheckInStatus.CHECKED_OUT;
    }
}
