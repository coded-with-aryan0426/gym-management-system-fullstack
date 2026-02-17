package com.gym.management.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "TRANSACTIONS")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "transaction_seq")
    @SequenceGenerator(name = "transaction_seq", sequenceName = "TRANSACTION_SEQ", allocationSize = 1)
    @Column(name = "TRANSACTION_ID")
    private Long transactionId;

    @Column(name = "gym_id")
    private Long gymId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gym_id", insertable = false, updatable = false)
    private Gym gym;

    @Column(name = "DATE_TIME", nullable = false)
    @com.fasterxml.jackson.annotation.JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateTime;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "CATEGORY")
    private String category; // "Membership", "POS", "Salary", "Expense"

    @Column(name = "TYPE")
    private String type; // "INCOME", "EXPENSE"

    @Column(name = "AMOUNT", precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "STATUS")
    private String status; // "Completed", "Pending", "Cancelled"

    @Column(name = "REFERENCE_NUMBER")
    private String referenceNumber;

    @Column(name = "CREATED_BY")
    private String createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @Column(name = "USER_ID", insertable = false, updatable = false)
    private Long userId;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    // Helper for legacy support or manual instantiation
    public void complete() {
        this.status = "Completed";
    }
}
