package com.gym.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillingSettingsDTO {
    
    private Long id;
    private Long gymId;
    
    // Currency Settings
    private String currency;
    private String currencySymbol;
    
    // Tax Settings
    private Boolean taxEnabled;
    private BigDecimal taxPercentage;
    private String taxName;
    private String taxNumber;
    
    // Late Fee Settings
    private Boolean lateFeeEnabled;
    private BigDecimal lateFeeAmount;
    private String lateFeeType;
    private BigDecimal lateFeePercentage;
    private Integer gracePeriodDays;
    private BigDecimal maxLateFeeAmount;
    
    // Invoice Settings
    private String invoicePrefix;
    private Boolean autoInvoiceEnabled;
    private String invoiceNotes;
    private String invoiceFooter;
    private Long nextInvoiceNumber;
    
    // Payment Settings
    private Boolean allowPartialPayments;
    private BigDecimal minPartialPaymentPercentage;
    private Boolean allowOnlinePayments;
    private Boolean allowCashPayments;
    private Boolean allowBankTransfer;
    private Boolean allowCardPayments;
    private Boolean allowUpiPayments;
    
    // Reminder Settings
    private Boolean paymentReminderEnabled;
    private List<Integer> paymentReminderDays;
    private Boolean overdueReminderEnabled;
    private List<Integer> overdueReminderDays;
    
    // Refund Settings
    private Boolean refundPolicyEnabled;
    private Integer refundPeriodDays;
    private BigDecimal refundPercentage;
    private BigDecimal refundDeductionAmount;
    
    // Discount Settings
    private Boolean autoDiscountEnabled;
    private BigDecimal earlyPaymentDiscountPercentage;
    private Integer earlyPaymentDays;
    
    // Proration Settings
    private Boolean prorateEnabled;
    private String prorateMethod;
}
