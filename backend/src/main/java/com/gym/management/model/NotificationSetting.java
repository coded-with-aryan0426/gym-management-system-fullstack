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
    @Builder.Default
    private Boolean workoutReminders = true;

    @Column(name = "class_schedule")
    @Builder.Default
    private Boolean classSchedule = true;

    @Column(name = "trainer_messages")
    @Builder.Default
    private Boolean trainerMessages = true;

    @Column(name = "marketing_emails")
    @Builder.Default
    private Boolean marketingEmails = false;
}
