package com.gym.management.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassBookingDTO {
    private Long bookingId;
    private Long classId;
    private String className;
    private String classType;
    private Long memberId;
    private String memberName;
    private String status;
    private LocalDateTime bookedAt;
    private LocalDateTime cancelledAt;
    private Boolean attended;
    private String notes;
    private LocalDateTime classStartTime;
    private Integer durationMinutes;
    private String trainerName;
    private String location;
    private String difficulty;

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public Long getClassId() { return classId; }
    public void setClassId(Long classId) { this.classId = classId; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public String getClassType() { return classType; }
    public void setClassType(String classType) { this.classType = classType; }
    public Long getMemberId() { return memberId; }
    public void setMemberId(Long memberId) { this.memberId = memberId; }
    public String getMemberName() { return memberName; }
    public void setMemberName(String memberName) { this.memberName = memberName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getBookedAt() { return bookedAt; }
    public void setBookedAt(LocalDateTime bookedAt) { this.bookedAt = bookedAt; }
    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
    public Boolean getAttended() { return attended; }
    public void setAttended(Boolean attended) { this.attended = attended; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getClassStartTime() { return classStartTime; }
    public void setClassStartTime(LocalDateTime classStartTime) { this.classStartTime = classStartTime; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public String getTrainerName() { return trainerName; }
    public void setTrainerName(String trainerName) { this.trainerName = trainerName; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
}
