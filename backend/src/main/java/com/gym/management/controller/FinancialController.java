package com.gym.management.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.gym.management.dto.finance.ExpenseSummaryDTO;
import com.gym.management.dto.finance.FinancialReportDTO;
import com.gym.management.dto.finance.FinancialTransactionDTO;
import com.gym.management.dto.finance.IncomeSummaryDTO;
import com.gym.management.service.FileStorageService;
import com.gym.management.service.FinancialTransactionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/finance")
@RequiredArgsConstructor
public class FinancialController {

    private final FinancialTransactionService transactionService;
    private final FileStorageService fileStorageService;

    @PostMapping("/transactions")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<FinancialTransactionDTO> createTransaction(
            @RequestBody FinancialTransactionDTO dto) {
        log.info("Creating financial transaction for gym: {}", dto.getGymId());
        return ResponseEntity.ok(transactionService.createTransaction(dto));
    }

    @PutMapping("/transactions/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<FinancialTransactionDTO> updateTransaction(
            @PathVariable Long id,
            @RequestBody FinancialTransactionDTO dto) {
        log.info("Updating financial transaction: {}", id);
        return ResponseEntity.ok(transactionService.updateTransaction(id, dto));
    }

    @DeleteMapping("/transactions/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        log.info("Deleting financial transaction: {}", id);
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/transactions/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<FinancialTransactionDTO> getTransaction(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getTransaction(id));
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<Page<FinancialTransactionDTO>> getTransactions(
            @RequestParam Long gymId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(transactionService.getTransactions(gymId, page, size));
    }

    @GetMapping("/transactions/by-type/{type}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<Page<FinancialTransactionDTO>> getTransactionsByType(
            @RequestParam Long gymId,
            @PathVariable String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(transactionService.getTransactionsByType(gymId, type, page, size));
    }

    @GetMapping("/transactions/member/{memberId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'MEMBER')")
    public ResponseEntity<List<FinancialTransactionDTO>> getTransactionsByMember(
            @PathVariable Long memberId) {
        return ResponseEntity.ok(transactionService.getTransactionsByMember(memberId));
    }

    @GetMapping("/income/summary")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<IncomeSummaryDTO> getIncomeSummary(
            @RequestParam Long gymId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.now().withDayOfMonth(1);
        if (endDate == null) endDate = LocalDate.now();
        return ResponseEntity.ok(transactionService.getIncomeSummary(gymId, startDate, endDate));
    }

    @GetMapping("/expense/summary")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ExpenseSummaryDTO> getExpenseSummary(
            @RequestParam Long gymId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.now().withDayOfMonth(1);
        if (endDate == null) endDate = LocalDate.now();
        return ResponseEntity.ok(transactionService.getExpenseSummary(gymId, startDate, endDate));
    }

    @GetMapping("/reports")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<FinancialReportDTO> getReport(
            @RequestParam Long gymId,
            @RequestParam(defaultValue = "MONTHLY") String reportType,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {

        if (startDate == null || endDate == null) {
            LocalDate now = LocalDate.now();
            startDate = now.withDayOfMonth(1);
            endDate = now;
        }

        return ResponseEntity.ok(transactionService.generateReport(gymId, reportType, startDate, endDate));
    }

    @GetMapping("/reports/quarterly")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<FinancialReportDTO> getQuarterlyReport(
            @RequestParam Long gymId,
            @RequestParam int year,
            @RequestParam int quarter) {
        LocalDate startDate = LocalDate.of(year, (quarter - 1) * 3 + 1, 1);
        LocalDate endDate = startDate.plusMonths(3).minusDays(1);
        return ResponseEntity.ok(transactionService.generateReport(gymId, "QUARTERLY", startDate, endDate));
    }

    @GetMapping("/reports/annual")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<FinancialReportDTO> getAnnualReport(
            @RequestParam Long gymId,
            @RequestParam int year) {
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);
        return ResponseEntity.ok(transactionService.generateReport(gymId, "ANNUAL", startDate, endDate));
    }

    @PostMapping("/transactions/{id}/receipt")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<String> uploadReceipt(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        log.info("Uploading receipt for transaction: {}", id);
        String receiptPath = transactionService.uploadReceipt(id, file);
        return ResponseEntity.ok(receiptPath);
    }

    @GetMapping("/transactions/{id}/receipt")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<?> getReceipt(@PathVariable Long id) {
        FinancialTransactionDTO transaction = transactionService.getTransaction(id);
        if (transaction.getReceiptUrl() == null) {
            return ResponseEntity.notFound().build();
        }
        org.springframework.core.io.Resource resource = fileStorageService.getFile(transaction.getReceiptUrl());
        if (resource == null) {
            return ResponseEntity.notFound().build();
        }
        try {
            return ResponseEntity.ok()
                    .header("Content-Type", "application/octet-stream")
                    .body(resource.getContentAsByteArray());
        } catch (Exception e) {
            log.error("Failed to read receipt file", e);
            return ResponseEntity.status(500).build();
        }
    }
}
