package com.gym.management.service;

import com.gym.management.dto.BillingSettingsDTO;
import com.gym.management.model.BillingSettings;
import com.gym.management.model.Gym;
import com.gym.management.model.Invoice;
import com.gym.management.model.User;
import com.gym.management.repository.BillingSettingsRepository;
import com.gym.management.repository.GymRepository;
import com.gym.management.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class BillingService {

    @Autowired
    private BillingSettingsRepository billingSettingsRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private GymRepository gymRepository;

    // ==================== Billing Settings ====================

    public BillingSettingsDTO getBillingSettings(Long gymId) {
        BillingSettings settings = billingSettingsRepository.findByGymId(gymId)
                .orElseGet(() -> createDefaultBillingSettings(gymId));
        return convertToDTO(settings);
    }

    public BillingSettingsDTO getBillingSettingsForUser(Long userId) {
        // Find gym for user
        Optional<Gym> gymOpt = gymRepository.findFirstByOwnerUserIdOrderByCreatedAtDesc(userId);
        if (gymOpt.isEmpty()) {
            // Create default settings without a gym
            BillingSettings defaultSettings = createDefaultBillingSettings(null);
            return convertToDTO(defaultSettings);
        }
        return getBillingSettings(gymOpt.get().getGymId());
    }

    public BillingSettingsDTO updateBillingSettings(Long gymId, BillingSettingsDTO dto, Long userId) {
        BillingSettings settings = billingSettingsRepository.findByGymId(gymId)
                .orElseGet(() -> {
                    BillingSettings newSettings = new BillingSettings();
                    newSettings.setGymId(gymId);
                    return newSettings;
                });

        // Update from DTO
        updateSettingsFromDTO(settings, dto);
        settings.setUpdatedBy(userId);

        BillingSettings saved = billingSettingsRepository.save(settings);
        return convertToDTO(saved);
    }

    public BillingSettingsDTO updateBillingSettingsForUser(Long userId, BillingSettingsDTO dto) {
        // Find gym for user
        Optional<Gym> gymOpt = gymRepository.findFirstByOwnerUserIdOrderByCreatedAtDesc(userId);
        if (gymOpt.isEmpty()) {
            // Create a new gym first (this shouldn't normally happen)
            throw new IllegalStateException("No gym found for user. Please create a gym first.");
        }
        return updateBillingSettings(gymOpt.get().getGymId(), dto, userId);
    }

    private BillingSettings createDefaultBillingSettings(Long gymId) {
        BillingSettings settings = BillingSettings.builder()
                .gymId(gymId)
                .currency("INR")
                .currencySymbol("₹")
                .taxEnabled(false)
                .taxPercentage(BigDecimal.valueOf(18))
                .taxName("GST")
                .lateFeeEnabled(false)
                .lateFeeAmount(BigDecimal.valueOf(50))
                .lateFeeType("FIXED")
                .gracePeriodDays(3)
                .invoicePrefix("GYM-")
                .autoInvoiceEnabled(true)
                .allowPartialPayments(false)
                .minPartialPaymentPercentage(BigDecimal.valueOf(25))
                .allowOnlinePayments(true)
                .allowCashPayments(true)
                .allowBankTransfer(true)
                .allowCardPayments(true)
                .allowUpiPayments(true)
                .paymentReminderEnabled(true)
                .paymentReminderDays("7,3,1")
                .overdueReminderEnabled(true)
                .overdueReminderDays("1,3,7")
                .refundPolicyEnabled(false)
                .refundPeriodDays(7)
                .refundPercentage(BigDecimal.valueOf(100))
                .autoDiscountEnabled(false)
                .earlyPaymentDiscountPercentage(BigDecimal.valueOf(5))
                .earlyPaymentDays(5)
                .prorateEnabled(true)
                .prorateMethod("DAILY")
                .build();

        if (gymId != null) {
            return billingSettingsRepository.save(settings);
        }
        return settings;
    }

    private void updateSettingsFromDTO(BillingSettings settings, BillingSettingsDTO dto) {
        if (dto.getCurrency() != null) settings.setCurrency(dto.getCurrency());
        if (dto.getCurrencySymbol() != null) settings.setCurrencySymbol(dto.getCurrencySymbol());
        if (dto.getTaxEnabled() != null) settings.setTaxEnabled(dto.getTaxEnabled());
        if (dto.getTaxPercentage() != null) settings.setTaxPercentage(dto.getTaxPercentage());
        if (dto.getTaxName() != null) settings.setTaxName(dto.getTaxName());
        if (dto.getTaxNumber() != null) settings.setTaxNumber(dto.getTaxNumber());
        if (dto.getLateFeeEnabled() != null) settings.setLateFeeEnabled(dto.getLateFeeEnabled());
        if (dto.getLateFeeAmount() != null) settings.setLateFeeAmount(dto.getLateFeeAmount());
        if (dto.getLateFeeType() != null) settings.setLateFeeType(dto.getLateFeeType());
        if (dto.getLateFeePercentage() != null) settings.setLateFeePercentage(dto.getLateFeePercentage());
        if (dto.getGracePeriodDays() != null) settings.setGracePeriodDays(dto.getGracePeriodDays());
        if (dto.getMaxLateFeeAmount() != null) settings.setMaxLateFeeAmount(dto.getMaxLateFeeAmount());
        if (dto.getInvoicePrefix() != null) settings.setInvoicePrefix(dto.getInvoicePrefix());
        if (dto.getAutoInvoiceEnabled() != null) settings.setAutoInvoiceEnabled(dto.getAutoInvoiceEnabled());
        if (dto.getInvoiceNotes() != null) settings.setInvoiceNotes(dto.getInvoiceNotes());
        if (dto.getInvoiceFooter() != null) settings.setInvoiceFooter(dto.getInvoiceFooter());
        if (dto.getAllowPartialPayments() != null) settings.setAllowPartialPayments(dto.getAllowPartialPayments());
        if (dto.getMinPartialPaymentPercentage() != null) settings.setMinPartialPaymentPercentage(dto.getMinPartialPaymentPercentage());
        if (dto.getAllowOnlinePayments() != null) settings.setAllowOnlinePayments(dto.getAllowOnlinePayments());
        if (dto.getAllowCashPayments() != null) settings.setAllowCashPayments(dto.getAllowCashPayments());
        if (dto.getAllowBankTransfer() != null) settings.setAllowBankTransfer(dto.getAllowBankTransfer());
        if (dto.getAllowCardPayments() != null) settings.setAllowCardPayments(dto.getAllowCardPayments());
        if (dto.getAllowUpiPayments() != null) settings.setAllowUpiPayments(dto.getAllowUpiPayments());
        if (dto.getPaymentReminderEnabled() != null) settings.setPaymentReminderEnabled(dto.getPaymentReminderEnabled());
        if (dto.getPaymentReminderDays() != null) {
            settings.setPaymentReminderDays(dto.getPaymentReminderDays().stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(",")));
        }
        if (dto.getOverdueReminderEnabled() != null) settings.setOverdueReminderEnabled(dto.getOverdueReminderEnabled());
        if (dto.getOverdueReminderDays() != null) {
            settings.setOverdueReminderDays(dto.getOverdueReminderDays().stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(",")));
        }
        if (dto.getRefundPolicyEnabled() != null) settings.setRefundPolicyEnabled(dto.getRefundPolicyEnabled());
        if (dto.getRefundPeriodDays() != null) settings.setRefundPeriodDays(dto.getRefundPeriodDays());
        if (dto.getRefundPercentage() != null) settings.setRefundPercentage(dto.getRefundPercentage());
        if (dto.getRefundDeductionAmount() != null) settings.setRefundDeductionAmount(dto.getRefundDeductionAmount());
        if (dto.getAutoDiscountEnabled() != null) settings.setAutoDiscountEnabled(dto.getAutoDiscountEnabled());
        if (dto.getEarlyPaymentDiscountPercentage() != null) settings.setEarlyPaymentDiscountPercentage(dto.getEarlyPaymentDiscountPercentage());
        if (dto.getEarlyPaymentDays() != null) settings.setEarlyPaymentDays(dto.getEarlyPaymentDays());
        if (dto.getProrateEnabled() != null) settings.setProrateEnabled(dto.getProrateEnabled());
        if (dto.getProrateMethod() != null) settings.setProrateMethod(dto.getProrateMethod());
    }

    private BillingSettingsDTO convertToDTO(BillingSettings settings) {
        return BillingSettingsDTO.builder()
                .id(settings.getId())
                .gymId(settings.getGymId())
                .currency(settings.getCurrency())
                .currencySymbol(settings.getCurrencySymbol())
                .taxEnabled(settings.getTaxEnabled())
                .taxPercentage(settings.getTaxPercentage())
                .taxName(settings.getTaxName())
                .taxNumber(settings.getTaxNumber())
                .lateFeeEnabled(settings.getLateFeeEnabled())
                .lateFeeAmount(settings.getLateFeeAmount())
                .lateFeeType(settings.getLateFeeType())
                .lateFeePercentage(settings.getLateFeePercentage())
                .gracePeriodDays(settings.getGracePeriodDays())
                .maxLateFeeAmount(settings.getMaxLateFeeAmount())
                .invoicePrefix(settings.getInvoicePrefix())
                .autoInvoiceEnabled(settings.getAutoInvoiceEnabled())
                .invoiceNotes(settings.getInvoiceNotes())
                .invoiceFooter(settings.getInvoiceFooter())
                .nextInvoiceNumber(settings.getNextInvoiceNumber())
                .allowPartialPayments(settings.getAllowPartialPayments())
                .minPartialPaymentPercentage(settings.getMinPartialPaymentPercentage())
                .allowOnlinePayments(settings.getAllowOnlinePayments())
                .allowCashPayments(settings.getAllowCashPayments())
                .allowBankTransfer(settings.getAllowBankTransfer())
                .allowCardPayments(settings.getAllowCardPayments())
                .allowUpiPayments(settings.getAllowUpiPayments())
                .paymentReminderEnabled(settings.getPaymentReminderEnabled())
                .paymentReminderDays(parseIntegerList(settings.getPaymentReminderDays()))
                .overdueReminderEnabled(settings.getOverdueReminderEnabled())
                .overdueReminderDays(parseIntegerList(settings.getOverdueReminderDays()))
                .refundPolicyEnabled(settings.getRefundPolicyEnabled())
                .refundPeriodDays(settings.getRefundPeriodDays())
                .refundPercentage(settings.getRefundPercentage())
                .refundDeductionAmount(settings.getRefundDeductionAmount())
                .autoDiscountEnabled(settings.getAutoDiscountEnabled())
                .earlyPaymentDiscountPercentage(settings.getEarlyPaymentDiscountPercentage())
                .earlyPaymentDays(settings.getEarlyPaymentDays())
                .prorateEnabled(settings.getProrateEnabled())
                .prorateMethod(settings.getProrateMethod())
                .build();
    }

    private List<Integer> parseIntegerList(String value) {
        if (value == null || value.isEmpty()) {
            return List.of();
        }
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Integer::parseInt)
                .collect(Collectors.toList());
    }

    // ==================== Invoice Generation ====================

    public String generateInvoiceNumber(Long gymId) {
        BillingSettings settings = billingSettingsRepository.findByGymId(gymId)
                .orElseGet(() -> createDefaultBillingSettings(gymId));

        String prefix = settings.getInvoicePrefix();
        Long nextNumber = settings.getNextInvoiceNumber();

        // Update next invoice number
        settings.setNextInvoiceNumber(nextNumber + 1);
        billingSettingsRepository.save(settings);

        // Format: GYM-0001
        return String.format("%s%04d", prefix, nextNumber);
    }

    // ==================== Billing Statistics ====================

    public BillingStatsDTO getBillingStats(Long gymId) {
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        BigDecimal monthlyRevenue = invoiceRepository.sumPaidAmountByDateRange(gymId, startOfMonth, endOfMonth);
        BigDecimal outstandingAmount = invoiceRepository.sumOutstandingAmount(gymId);
        long overdueCount = invoiceRepository.findOverdueInvoices(gymId, now).size();
        long dueToday = invoiceRepository.findDueTodayInvoices(gymId, now).size();

        return BillingStatsDTO.builder()
                .monthlyRevenue(monthlyRevenue != null ? monthlyRevenue : BigDecimal.ZERO)
                .outstandingAmount(outstandingAmount != null ? outstandingAmount : BigDecimal.ZERO)
                .overdueInvoicesCount(overdueCount)
                .dueTodayCount(dueToday)
                .build();
    }

    // Inner class for stats
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class BillingStatsDTO {
        private BigDecimal monthlyRevenue;
        private BigDecimal outstandingAmount;
        private long overdueInvoicesCount;
        private long dueTodayCount;
    }
}
