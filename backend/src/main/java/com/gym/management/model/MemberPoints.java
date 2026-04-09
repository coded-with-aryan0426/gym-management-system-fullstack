package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "member_points")
public class MemberPoints {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "member_user_id")
    private Long memberUserId;

    @Column(name = "gym_id")
    private Long gymId;

    @Column(name = "points", nullable = false)
    private Integer points;

    @Column(name = "points_type")
    private String pointsType;

    @Column(name = "description")
    private String description;

    @Column(name = "transaction_date")
    private LocalDateTime transactionDate;

    @Column(name = "reference_id")
    private String referenceId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}