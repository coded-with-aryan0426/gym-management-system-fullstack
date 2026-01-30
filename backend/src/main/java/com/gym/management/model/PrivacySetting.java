package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "privacy_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrivacySetting {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "profile_visibility")
    private String profileVisibility = "PUBLIC";

    @Column(name = "show_progress_photos")
    private Boolean showProgressPhotos = true;

    @Column(name = "allow_trainer_access")
    private Boolean allowTrainerAccess = true;
}
