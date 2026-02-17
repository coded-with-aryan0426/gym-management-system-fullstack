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

/**
 * Entity representing billing and payment configuration for a gym
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "billing_settings")
public class BillingSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "billing_settings_id")
    private Long id;

    @Column(name = "gym_id", nullable = false)
    private Long gymId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gym_id", insertable = false, updatable = false)
    private Gym gym;

    // Currency Settings
    @Column(name = "currency", length = 10)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "currency_symbol", length = 5)
    @Builder.Default
    private String currencySymbol = "₹";

    // Tax Settings
    @Column(name = "tax_enabled")
    @Builder.Default
    private Boolean taxEnabled = false;

    @Column(name = "tax_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal taxPercentage = BigDecimal.valueOf(18.00);

    @Column(name = "tax_name", length = 50)
    @Builder.Default
    private String taxName = "GST";

    @Column(name = "tax_number", length = 50)
    private String taxNumber;

    // Late Fee Settings
    @Column(name = "late_fee_enabled")
    @Builder.Default
    private Boolean lateFeeEnabled = false;

    @Column(name = "late_fee_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal lateFeeAmount = BigDecimal.valueOf(50.00);

    @Column(name = "late_fee_type", length = 20)
    @Builder.Default
    private String lateFeeType = "FIXED"; // FIXED or PERCENTAGE

    @Column(name = "late_fee_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal lateFeePercentage = BigDecimal.valueOf(5.00);

    @Column(name = "grace_period_days")
    @Builder.Default
    private Integer gracePeriodDays = 3;

    @Column(name = "max_late_fee_amount", precision = 10, scale = 2)
    private BigDecimal maxLateFeeAmount;

    // Invoice Settings
    @Column(name = "invoice_prefix", length = 20)
    @Builder.Default
    private String invoicePrefix = "GYM-";

    @Column(name = "auto_invoice_enabled")
    @Builder.Default
    private Boolean autoInvoiceEnabled = true;

    @Column(name = "invoice_notes", length = 500)
    private String invoiceNotes;

    @Column(name = "invoice_footer", length = 500)
    private String invoiceFooter;

    @Column(name = "next_invoice_number")
    @Builder.Default
    private Long nextInvoiceNumber = 1L;

    // Payment Settings
    @Column(name = "allow_partial_payments")
    @Builder.Default
    private Boolean allowPartialPayments = false;

    @Column(name = "min_partial_payment_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal minPartialPaymentPercentage = BigDecimal.valueOf(25.00);

    @Column(name = "allow_online_payments")
    @Builder.Default
    private Boolean allowOnlinePayments = true;

    @Column(name = "allow_cash_payments")
    @Builder.Default
    private Boolean allowCashPayments = true;

    @Column(name = "allow_bank_transfer")
    @Builder.Default
    private Boolean allowBankTransfer = true;

    @Column(name = "allow_card_payments")
    @Builder.Default
    private Boolean allowCardPayments = true;

    @Column(name = "allow_upi_payments")
    @Builder.Default
    private Boolean allowUpiPayments = true;

    // Reminder Settings
    @Column(name = "payment_reminder_enabled")
    @Builder.Default
    private Boolean paymentReminderEnabled = true;

    @Column(name = "payment_reminder_days", length = 100)
    @Builder.Default
    private String paymentReminderDays = "7,3,1"; // Days before due date

    @Column(name = "overdue_reminder_enabled")
    @Builder.Default
    private Boolean overdueReminderEnabled = true;

    @Column(name = "overdue_reminder_days", length = 100)
    @Builder.Default
    private String overdueReminderDays = "1,3,7"; // Days after due date

    // Refund Settings
    @Column(name = "refund_policy_enabled")
    @Builder.Default
    private Boolean refundPolicyEnabled = false;

    @Column(name = "refund_period_days")
    @Builder.Default
    private Integer refundPeriodDays = 7;

    @Column(name = "refund_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal refundPercentage = BigDecimal.valueOf(100.00);

    @Column(name = "refund_deduction_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal refundDeductionAmount = BigDecimal.ZERO;

    // Discount Settings
    @Column(name = "auto_discount_enabled")
    @Builder.Default
    private Boolean autoDiscountEnabled = false;

    @Column(name = "early_payment_discount_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal earlyPaymentDiscountPercentage = BigDecimal.valueOf(5.00);

    @Column(name = "early_payment_days")
    @Builder.Default
    private Integer earlyPaymentDays = 5;

    // Proration Settings
    @Column(name = "prorate_enabled")
    @Builder.Default
    private Boolean prorateEnabled = true;

    @Column(name = "prorate_method", length = 20)
    @Builder.Default
    private String prorateMethod = "DAILY"; // DAILY or WEEKLY

    // Audit fields
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private Long updatedBy;
}
