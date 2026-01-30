package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "notification_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSetting {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "workout_reminders")
    private Boolean workoutReminders = true;

    @Column(name = "class_schedule")
    private Boolean classSchedule = true;

    @Column(name = "trainer_messages")
    private Boolean trainerMessages = true;

    @Column(name = "marketing_emails")
    private Boolean marketingEmails = false;
}
