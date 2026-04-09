package com.gym.management.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.gym.management.dto.finance.ExpenseSummaryDTO;
import com.gym.management.dto.finance.FinancialReportDTO;
import com.gym.management.dto.finance.FinancialTransactionDTO;
import com.gym.management.dto.finance.IncomeSummaryDTO;
import com.gym.management.model.ExpenseCategory;
import com.gym.management.model.FinancialTransaction;
import com.gym.management.model.FinancialTransaction.TransactionStatus;
import com.gym.management.model.IncomeCategory;
import com.gym.management.repository.FinancialTransactionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class FinancialTransactionService {

    private final FinancialTransactionRepository transactionRepository;
    private final FileStorageService fileStorageService;

    @Value("${app.base.currency:INR}")
    private String baseCurrency;

    @Transactional
    public FinancialTransactionDTO createTransaction(FinancialTransactionDTO dto) {
        FinancialTransaction transaction = mapToEntity(dto);
        transaction.setReferenceNumber(generateReferenceNumber(dto.getType().toUpperCase()));
        transaction.setStatus(TransactionStatus.COMPLETED);

        if (dto.getAmountInBaseCurrency() == null && !baseCurrency.equals(dto.getCurrency())) {
            transaction.setAmountInBaseCurrency(dto.getAmount());
            transaction.setExchangeRate(BigDecimal.ONE);
        }

        FinancialTransaction saved = transactionRepository.save(transaction);
        log.info("Created financial transaction: {} for gym: {}", saved.getId(), saved.getGymId());

        return mapToDTO(saved);
    }

    @Transactional
    public FinancialTransactionDTO updateTransaction(Long id, FinancialTransactionDTO dto) {
        FinancialTransaction existing = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found: " + id));

        existing.setAmount(dto.getAmount());
        existing.setCurrency(dto.getCurrency());
        existing.setTransactionDate(dto.getTransactionDate());
        existing.setDescription(dto.getDescription());
        existing.setPaymentMethod(dto.getPaymentMethod());
        existing.setCategory(dto.getIncomeCategory() != null ?
                dto.getIncomeCategory() : dto.getExpenseCategory());

        FinancialTransaction updated = transactionRepository.save(existing);
        log.info("Updated financial transaction: {}", id);

        return mapToDTO(updated);
    }

    @Transactional
    public void deleteTransaction(Long id) {
        FinancialTransaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found: " + id));

        if (transaction.getReceiptUrl() != null) {
            fileStorageService.deleteFile(transaction.getReceiptUrl());
        }

        transactionRepository.delete(transaction);
        log.info("Deleted financial transaction: {}", id);
    }

    public FinancialTransactionDTO getTransaction(Long id) {
        FinancialTransaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found: " + id));
        return mapToDTO(transaction);
    }

    public Page<FinancialTransactionDTO> getTransactions(Long gymId, int page, int size) {
        Page<FinancialTransaction> transactions = transactionRepository.findByGymIdOrderByTransactionDateDesc(
                gymId, PageRequest.of(page, size, Sort.by("transactionDate").descending()));
        return transactions.map(this::mapToDTO);
    }

    public Page<FinancialTransactionDTO> getTransactionsByType(Long gymId, String type, int page, int size) {
        Page<FinancialTransaction> transactions = transactionRepository.findByGymIdAndTypeOrderByTransactionDateDesc(
                gymId, type.toUpperCase(), PageRequest.of(page, size));
        return transactions.map(this::mapToDTO);
    }

    public IncomeSummaryDTO getIncomeSummary(Long gymId, LocalDate startDate, LocalDate endDate) {
        List<FinancialTransaction> incomeTransactions = transactionRepository
                .findIncomeByGymIdAndDateRange(gymId, startDate, endDate);

        BigDecimal totalIncome = incomeTransactions.stream()
                .map(FinancialTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<IncomeCategory, BigDecimal> byCategory = new HashMap<>();
        for (FinancialTransaction t : incomeTransactions) {
            IncomeCategory category = IncomeCategory.valueOf(t.getCategory());
            byCategory.merge(category, t.getAmount(), BigDecimal::add);
        }

        LocalDate now = LocalDate.now();
        LocalDate monthStart = now.withDayOfMonth(1);
        LocalDate lastMonthStart = monthStart.minusMonths(1);
        LocalDate lastMonthEnd = monthStart.minusDays(1);

        BigDecimal thisMonth = transactionRepository.sumIncomeByGymIdAndDateRange(gymId, monthStart, now);
        BigDecimal lastMonth = transactionRepository.sumIncomeByGymIdAndDateRange(gymId, lastMonthStart, lastMonthEnd);

        BigDecimal percentageChange = BigDecimal.ZERO;
        if (lastMonth != null && lastMonth.compareTo(BigDecimal.ZERO) > 0) {
            percentageChange = thisMonth.subtract(lastMonth)
                    .divide(lastMonth, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
        }

        return IncomeSummaryDTO.builder()
                .totalIncome(totalIncome)
                .thisMonth(thisMonth != null ? thisMonth : BigDecimal.ZERO)
                .lastMonth(lastMonth != null ? lastMonth : BigDecimal.ZERO)
                .byCategory(byCategory)
                .percentageChange(percentageChange)
                .transactionCount(incomeTransactions.size())
                .recentTransactions(incomeTransactions.stream()
                        .limit(10)
                        .map(this::mapToDTO)
                        .collect(Collectors.toList()))
                .build();
    }

    public ExpenseSummaryDTO getExpenseSummary(Long gymId, LocalDate startDate, LocalDate endDate) {
        List<FinancialTransaction> expenseTransactions = transactionRepository
                .findExpenseByGymIdAndDateRange(gymId, startDate, endDate);

        BigDecimal totalExpenses = expenseTransactions.stream()
                .map(FinancialTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<ExpenseCategory, BigDecimal> byCategory = new HashMap<>();
        for (FinancialTransaction t : expenseTransactions) {
            ExpenseCategory category = ExpenseCategory.valueOf(t.getCategory());
            byCategory.merge(category, t.getAmount(), BigDecimal::add);
        }

        LocalDate now = LocalDate.now();
        LocalDate monthStart = now.withDayOfMonth(1);
        LocalDate lastMonthStart = monthStart.minusMonths(1);
        LocalDate lastMonthEnd = monthStart.minusDays(1);

        BigDecimal thisMonth = transactionRepository.sumExpenseByGymIdAndDateRange(gymId, monthStart, now);
        BigDecimal lastMonth = transactionRepository.sumExpenseByGymIdAndDateRange(gymId, lastMonthStart, lastMonthEnd);

        BigDecimal pendingPayments = expenseTransactions.stream()
                .filter(t -> t.getStatus() == TransactionStatus.PENDING)
                .map(FinancialTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal percentageChange = BigDecimal.ZERO;
        if (lastMonth != null && lastMonth.compareTo(BigDecimal.ZERO) > 0) {
            percentageChange = thisMonth.subtract(lastMonth)
                    .divide(lastMonth, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
        }

        return ExpenseSummaryDTO.builder()
                .totalExpenses(totalExpenses)
                .thisMonth(thisMonth != null ? thisMonth : BigDecimal.ZERO)
                .lastMonth(lastMonth != null ? lastMonth : BigDecimal.ZERO)
                .byCategory(byCategory)
                .percentageChange(percentageChange)
                .transactionCount(expenseTransactions.size())
                .pendingPayments(pendingPayments)
                .recentExpenses(expenseTransactions.stream()
                        .limit(10)
                        .map(this::mapToDTO)
                        .collect(Collectors.toList()))
                .build();
    }

    public FinancialReportDTO generateReport(Long gymId, String reportType, LocalDate startDate, LocalDate endDate) {
        List<FinancialTransaction> allTransactions = transactionRepository
                .findByGymIdAndDateRange(gymId, startDate, endDate);

        BigDecimal totalIncome = allTransactions.stream()
                .filter(t -> "INCOME".equals(t.getType()))
                .map(FinancialTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = allTransactions.stream()
                .filter(t -> "EXPENSE".equals(t.getType()))
                .map(FinancialTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netProfit = totalIncome.subtract(totalExpenses);
        BigDecimal profitMargin = BigDecimal.ZERO;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            profitMargin = netProfit.divide(totalIncome, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
        }

        BigDecimal totalTaxLiability = allTransactions.stream()
                .filter(t -> "EXPENSE".equals(t.getType()))
                .filter(t -> "TAXES".equals(t.getCategory()))
                .map(FinancialTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return FinancialReportDTO.builder()
                .reportType(reportType)
                .startDate(startDate)
                .endDate(endDate)
                .gymId(gymId)
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netProfit(netProfit)
                .profitMargin(profitMargin)
                .totalTaxLiability(totalTaxLiability)
                .transactions(allTransactions.stream().map(this::mapToDTO).collect(Collectors.toList()))
                .generatedAt(LocalDate.now())
                .build();
    }

    @Transactional
    public String uploadReceipt(Long transactionId, MultipartFile file) {
        FinancialTransaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found: " + transactionId));

        String receiptPath = fileStorageService.storeFile(file, "receipts/" + transaction.getGymId());
        transaction.setReceiptUrl(receiptPath);
        transactionRepository.save(transaction);

        return receiptPath;
    }

    public List<FinancialTransactionDTO> getTransactionsByMember(Long memberId) {
        return transactionRepository.findByMemberIdOrderByTransactionDateDesc(memberId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private String generateReferenceNumber(String type) {
        String prefix = "INCOME".equals(type) ? "INC" : "EXP";
        return prefix + "-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private FinancialTransactionDTO mapToDTO(FinancialTransaction entity) {
        FinancialTransactionDTO dto = FinancialTransactionDTO.builder()
                .id(entity.getId())
                .gymId(entity.getGymId())
                .type(entity.getType())
                .amount(entity.getAmount())
                .currency(entity.getCurrency())
                .amountInBaseCurrency(entity.getAmountInBaseCurrency())
                .exchangeRate(entity.getExchangeRate())
                .transactionDate(entity.getTransactionDate())
                .description(entity.getDescription())
                .referenceNumber(entity.getReferenceNumber())
                .paymentMethod(entity.getPaymentMethod())
                .gatewayTransactionId(entity.getGatewayTransactionId())
                .gateway(entity.getGateway())
                .receiptUrl(entity.getReceiptUrl())
                .status(entity.getStatus() != null ? entity.getStatus().name() : null)
                .memberId(entity.getMemberId())
                .createdBy(entity.getCreatedBy())
                .isRecurring(entity.getIsRecurring())
                .recurringScheduleId(entity.getRecurringScheduleId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();

        try {
            if ("INCOME".equals(entity.getType())) {
                dto.setIncomeCategory(entity.getCategory());
            } else {
                dto.setExpenseCategory(entity.getCategory());
            }
        } catch (IllegalArgumentException e) {
            log.warn("Unknown category: {}", entity.getCategory());
        }

        return dto;
    }

    private FinancialTransaction mapToEntity(FinancialTransactionDTO dto) {
        return FinancialTransaction.builder()
                .gymId(dto.getGymId())
                .type(dto.getType().toUpperCase())
                .category(dto.getIncomeCategory() != null ?
                        dto.getIncomeCategory() : dto.getExpenseCategory())
                .amount(dto.getAmount())
                .currency(dto.getCurrency() != null ? dto.getCurrency() : baseCurrency)
                .amountInBaseCurrency(dto.getAmountInBaseCurrency())
                .exchangeRate(dto.getExchangeRate())
                .transactionDate(dto.getTransactionDate() != null ? dto.getTransactionDate() : LocalDate.now())
                .description(dto.getDescription())
                .paymentMethod(dto.getPaymentMethod())
                .gatewayTransactionId(dto.getGatewayTransactionId())
                .gateway(dto.getGateway())
                .memberId(dto.getMemberId())
                .createdBy(dto.getCreatedBy())
                .isRecurring(dto.isRecurring())
                .recurringScheduleId(dto.getRecurringScheduleId())
                .build();
    }
}
