package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "class_bookings")
@Data
@NoArgsConstructor
public class ClassBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getBookingId() { return id; }
    public void setBookingId(Long bookingId) { this.id = bookingId; }
    public GymClass getGymClass() { return gymClass; }
    public void setGymClass(GymClass gymClass) { this.gymClass = gymClass; }
    public User getMember() { return member; }
    public void setMember(User member) { this.member = member; }
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
    public LocalDateTime getBookedAt() { return bookedAt; }
    public void setBookedAt(LocalDateTime bookedAt) { this.bookedAt = bookedAt; }
    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
    public Boolean getAttended() { return attended; }
    public void setAttended(Boolean attended) { this.attended = attended; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public enum BookingStatus {
        CONFIRMED, CANCELLED, WAITLISTED, ATTENDED, NO_SHOW
    }
}
