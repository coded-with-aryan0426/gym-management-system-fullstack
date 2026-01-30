package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "member_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberPreference {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "workout_preferences", length = 1000)
    private String workoutPreferences;

    @Column(name = "skill_level")
    private String skillLevel;

    @Column(name = "theme")
    private String theme = "LIGHT";

    @Column(name = "language")
    private String language = "en";
}
