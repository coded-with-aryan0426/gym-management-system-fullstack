package com.gym.management.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity representing an invoice generated for a member payment
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invoice_id")
    private Long id;

    @Column(name = "gym_id")
    private Long gymId;

    @Column(name = "invoice_number", nullable = false, unique = true, length = 50)
    private String invoiceNumber;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", insertable = false, updatable = false)
    private User member;

    @Column(name = "membership_id")
    private Long membershipId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membership_id", insertable = false, updatable = false)
    private Membership membership;

    // Invoice Details
    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    // Amounts
    @Column(name = "subtotal", precision = 10, scale = 2, nullable = false)
    private BigDecimal subtotal;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "tax_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal taxPercentage = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "discount_reason", length = 200)
    private String discountReason;

    @Column(name = "late_fee_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal lateFeeAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "amount_paid", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "balance_due", precision = 10, scale = 2)
    private BigDecimal balanceDue;

    // Status
    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "DRAFT"; // DRAFT, SENT, PAID, PARTIAL, OVERDUE, CANCELLED, REFUNDED

    @Column(name = "payment_status", length = 20)
    @Builder.Default
    private String paymentStatus = "UNPAID"; // UNPAID, PARTIAL, PAID, REFUNDED

    // Payment Details
    @Column(name = "payment_method", length = 50)
    private String paymentMethod; // CASH, CARD, UPI, BANK_TRANSFER, ONLINE

    @Column(name = "payment_reference", length = 100)
    private String paymentReference;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    // Currency
    @Column(name = "currency", length = 10)
    @Builder.Default
    private String currency = "INR";

    // Notes
    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "internal_notes", length = 1000)
    private String internalNotes;

    // Email status
    @Column(name = "email_sent")
    @Builder.Default
    private Boolean emailSent = false;

    @Column(name = "email_sent_at")
    private LocalDateTime emailSentAt;

    @Column(name = "reminder_count")
    @Builder.Default
    private Integer reminderCount = 0;

    @Column(name = "last_reminder_at")
    private LocalDateTime lastReminderAt;

    // Audit fields
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    // Helper methods
    public void calculateBalanceDue() {
        this.balanceDue = this.totalAmount.subtract(this.amountPaid != null ? this.amountPaid : BigDecimal.ZERO);
    }

    public void calculateTotalAmount() {
        BigDecimal total = this.subtotal != null ? this.subtotal : BigDecimal.ZERO;
        total = total.add(this.taxAmount != null ? this.taxAmount : BigDecimal.ZERO);
        total = total.add(this.lateFeeAmount != null ? this.lateFeeAmount : BigDecimal.ZERO);
        total = total.subtract(this.discountAmount != null ? this.discountAmount : BigDecimal.ZERO);
        this.totalAmount = total;
    }

    public boolean isOverdue() {
        return this.dueDate != null && 
               LocalDate.now().isAfter(this.dueDate) && 
               !"PAID".equals(this.paymentStatus) &&
               !"CANCELLED".equals(this.status);
    }
}
