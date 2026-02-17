package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "trainer_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrainerSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String notificationPrefs; // JSON

    @Lob
    @Column(columnDefinition = "CLOB")
    private String privacyPrefs; // JSON

    @Lob
    @Column(columnDefinition = "CLOB")
    private String appearancePrefs; // JSON

    @Lob
    @Column(columnDefinition = "CLOB")
    private String regionalPrefs; // JSON

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
