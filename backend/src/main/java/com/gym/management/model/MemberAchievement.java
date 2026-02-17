package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "member_achievements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberAchievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "achievement_type", nullable = false)
    private String achievementType;

    @Column(name = "achievement_name", nullable = false)
    private String achievementName;

    @Lob
    private String description;

    @Column(name = "earned_at")
    private LocalDateTime earnedAt;

    @PrePersist
    protected void onCreate() {
        if (earnedAt == null) {
            earnedAt = LocalDateTime.now();
        }
    }
}
