package com.gym.management.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class TaxCalculationService {

    private static final BigDecimal GST_RATE = new BigDecimal("0.18");
    private static final BigDecimal TDS_RATE = new BigDecimal("0.10");
    private static final BigDecimal PANEL_TAX_RATE = new BigDecimal("0.30");

    private final Map<String, BigDecimal> stateTaxRates = new HashMap<>();

    public TaxCalculationService() {
        stateTaxRates.put("MAHARASHTRA", new BigDecimal("0.20"));
        stateTaxRates.put("DELHI", new BigDecimal("0.20"));
        stateTaxRates.put("KARNATAKA", new BigDecimal("0.20"));
        stateTaxRates.put("TAMIL_NADU", new BigDecimal("0.20"));
        stateTaxRates.put("GUJARAT", new BigDecimal("0.18"));
        stateTaxRates.put("RAJASTHAN", new BigDecimal("0.18"));
        stateTaxRates.put("UP", new BigDecimal("0.18"));
        stateTaxRates.put("WEST_BENGAL", new BigDecimal("0.18"));
        stateTaxRates.put("KERALA", new BigDecimal("0.18"));
        stateTaxRates.put("TELANGANA", new BigDecimal("0.18"));
    }

    public TaxSummary calculateGST(BigDecimal amount, boolean inclusive) {
        BigDecimal taxAmount;
        BigDecimal taxableAmount;
        BigDecimal totalAmount;

        if (inclusive) {
            taxableAmount = amount.divide(BigDecimal.ONE.add(GST_RATE), 2, RoundingMode.HALF_UP);
            taxAmount = amount.subtract(taxableAmount);
            totalAmount = amount;
        } else {
            taxableAmount = amount;
            taxAmount = amount.multiply(GST_RATE).setScale(2, RoundingMode.HALF_UP);
            totalAmount = amount.add(taxAmount);
        }

        return TaxSummary.builder()
                .taxType(TaxType.GST)
                .subTotal(taxableAmount)
                .taxRate(GST_RATE)
                .taxAmount(taxAmount)
                .total(totalAmount)
                .cgst(taxAmount.divide(new BigDecimal("2"), 2, RoundingMode.HALF_UP))
                .sgst(taxAmount.divide(new BigDecimal("2"), 2, RoundingMode.HALF_UP))
                .igst(BigDecimal.ZERO)
                .calculatedAt(LocalDateTime.now())
                .build();
    }

    public TaxSummary calculateTDS(BigDecimal amount, String panNumber) {
        if (panNumber == null || panNumber.isEmpty()) {
            BigDecimal higherRate = amount.multiply(new BigDecimal("0.20")).setScale(2, RoundingMode.HALF_UP);
            return TaxSummary.builder()
                    .taxType(TaxType.TDS)
                    .subTotal(amount)
                    .taxRate(new BigDecimal("0.20"))
                    .taxAmount(higherRate)
                    .total(amount.subtract(higherRate))
                    .calculatedAt(LocalDateTime.now())
                    .build();
        }

        BigDecimal taxAmount = amount.multiply(TDS_RATE).setScale(2, RoundingMode.HALF_UP);
        return TaxSummary.builder()
                .taxType(TaxType.TDS)
                .subTotal(amount)
                .taxRate(TDS_RATE)
                .taxAmount(taxAmount)
                .total(amount.subtract(taxAmount))
                .calculatedAt(LocalDateTime.now())
                .build();
    }

    public BigDecimal calculateIncomeTax(BigDecimal annualIncome) {
        if (annualIncome.compareTo(new BigDecimal("250000")) <= 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal tax = BigDecimal.ZERO;
        BigDecimal income = annualIncome;

        if (income.compareTo(new BigDecimal("250000")) > 0) {
            BigDecimal slab1 = income.min(new BigDecimal("500000")).subtract(new BigDecimal("250000"));
            tax = tax.add(slab1.multiply(new BigDecimal("0.05")));
        }

        if (income.compareTo(new BigDecimal("500000")) > 0) {
            BigDecimal slab2 = income.min(new BigDecimal("750000")).subtract(new BigDecimal("500000"));
            tax = tax.add(slab2.multiply(new BigDecimal("0.10")));
        }

        if (income.compareTo(new BigDecimal("750000")) > 0) {
            BigDecimal slab3 = income.min(new BigDecimal("1000000")).subtract(new BigDecimal("750000"));
            tax = tax.add(slab3.multiply(new BigDecimal("0.15")));
        }

        if (income.compareTo(new BigDecimal("1000000")) > 0) {
            BigDecimal slab4 = income.min(new BigDecimal("1250000")).subtract(new BigDecimal("1000000"));
            tax = tax.add(slab4.multiply(new BigDecimal("0.20")));
        }

        if (income.compareTo(new BigDecimal("1250000")) > 0) {
            BigDecimal slab5 = income.min(new BigDecimal("1500000")).subtract(new BigDecimal("1250000"));
            tax = tax.add(slab5.multiply(new BigDecimal("0.25")));
        }

        if (income.compareTo(new BigDecimal("1500000")) > 0) {
            BigDecimal slab6 = income.subtract(new BigDecimal("1500000"));
            tax = tax.add(slab6.multiply(new BigDecimal("0.30")));
        }

        return tax.setScale(2, RoundingMode.HALF_UP);
    }

    public TaxReport generateTaxReport(Long gymId, int year) {
        log.info("Generating tax report for gym: {} year: {}", gymId, year);
        return TaxReport.builder()
                .gymId(gymId)
                .year(year)
                .generatedAt(LocalDateTime.now())
                .build();
    }

    public enum TaxType {
        GST, CGST, SGST, IGST, TDS, INCOME_TAX, PROFESSIONAL_TAX
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class TaxSummary {
        private TaxType taxType;
        private BigDecimal subTotal;
        private BigDecimal taxRate;
        private BigDecimal taxAmount;
        private BigDecimal total;
        private BigDecimal cgst;
        private BigDecimal sgst;
        private BigDecimal igst;
        private String taxJurisdiction;
        private LocalDateTime calculatedAt;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class TaxReport {
        private Long gymId;
        private int year;
        private BigDecimal totalTaxableIncome;
        private BigDecimal totalTaxApplicable;
        private BigDecimal totalInputTaxCredit;
        private BigDecimal netTaxLiability;
        private Map<String, BigDecimal> breakdownByType;
        private LocalDateTime generatedAt;
        private LocalDate filingDueDate;
    }
}
