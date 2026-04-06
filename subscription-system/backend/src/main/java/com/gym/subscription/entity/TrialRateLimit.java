package com.gym.subscription.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "trial_rate_limits", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "endpoint"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrialRateLimit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "endpoint", nullable = false, length = 255)
    private String endpoint;

    @Column(name = "request_count")
    @Builder.Default
    private Integer requestCount = 0;

    @Column(name = "window_start")
    private LocalDateTime windowStart;

    @Column(name = "window_end")
    private LocalDateTime windowEnd;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public void incrementCount() {
        this.requestCount = (this.requestCount == null ? 0 : this.requestCount) + 1;
    }

    public boolean isWindowExpired() {
        return windowEnd != null && LocalDateTime.now().isAfter(windowEnd);
    }

    public void resetWindow(int windowMinutes) {
        this.windowStart = LocalDateTime.now();
        this.windowEnd = LocalDateTime.now().plusMinutes(windowMinutes);
        this.requestCount = 0;
    }
}
