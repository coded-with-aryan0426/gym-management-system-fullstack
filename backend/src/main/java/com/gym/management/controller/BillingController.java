package com.gym.management.controller;

import com.gym.management.dto.BillingSettingsDTO;
import com.gym.management.security.CustomUserDetails;
import com.gym.management.security.DataScopeValidator;
import com.gym.management.service.BillingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private static final Logger log = LoggerFactory.getLogger(BillingController.class);

    @Autowired
    private BillingService billingService;
    
    @Autowired
    private DataScopeValidator dataScopeValidator;

    // ==================== Billing Settings ====================

    /**
     * Get billing settings for current user with RBAC.
     * TRAINER: Gets only their own billing settings
     * ADMIN/OWNER: Gets their billing settings
     */
    @GetMapping("/settings")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'TRAINER')")
    public ResponseEntity<?> getBillingSettings() {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            if (currentUserId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated"));
            }

            dataScopeValidator.logDataAccess("billing_settings", currentUserId, "READ");

            BillingSettingsDTO settings = billingService.getBillingSettingsForUser(currentUserId);
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            log.error("Failed to retrieve billing settings", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve billing settings"));
        }
    }

    /**
     * Update billing settings for current user with RBAC.
     * TRAINER: Can only update their own billing settings
     * ADMIN/OWNER: Can update their billing settings
     */
    @PutMapping("/settings")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'TRAINER')")
    public ResponseEntity<?> updateBillingSettings(@RequestBody BillingSettingsDTO dto) {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            if (currentUserId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated"));
            }

            dataScopeValidator.logDataAccess("billing_settings", currentUserId, "UPDATE");

            BillingSettingsDTO updated = billingService.updateBillingSettingsForUser(currentUserId, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalStateException e) {
            log.error("Failed to update billing settings: Invalid state", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to update billing settings"));
        } catch (Exception e) {
            log.error("Failed to update billing settings", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update billing settings"));
        }
    }

    /**
     * Get billing settings by gym with RBAC.
     * TRAINER: Cannot access gym-wide billing settings
     * ADMIN/OWNER: Can access gym-wide billing settings
     */
    @GetMapping("/settings/{gymId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> getBillingSettingsByGym(@PathVariable Long gymId) {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            if (currentUserId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated"));
            }

            dataScopeValidator.logDataAccess("gym_billing_settings", gymId, "READ");

            BillingSettingsDTO settings = billingService.getBillingSettings(gymId);
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            log.error("Failed to retrieve gym billing settings", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve gym billing settings"));
        }
    }

    /**
     * Update billing settings by gym with RBAC.
     * TRAINER: Cannot update gym-wide billing settings
     * ADMIN/OWNER: Can update gym-wide billing settings
     */
    @PutMapping("/settings/{gymId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> updateBillingSettingsByGym(
            @PathVariable Long gymId,
            @RequestBody BillingSettingsDTO dto) {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            if (currentUserId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated"));
            }

            dataScopeValidator.logDataAccess("gym_billing_settings", gymId, "UPDATE");

            BillingSettingsDTO updated = billingService.updateBillingSettings(gymId, dto, currentUserId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Failed to update gym billing settings", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update gym billing settings"));
        }
    }

    // ==================== Billing Statistics ====================

    /**
     * Get billing statistics with RBAC data scoping.
     * TRAINER: Cannot access billing stats (financial data)
     * ADMIN/OWNER: Can access gym-wide billing stats
     */
    @GetMapping("/stats/{gymId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> getBillingStats(@PathVariable Long gymId) {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            if (currentUserId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated"));
            }

            dataScopeValidator.logDataAccess("billing_stats", gymId, "READ");

            BillingService.BillingStatsDTO stats = billingService.getBillingStats(gymId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Failed to retrieve billing stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve billing stats"));
        }
    }

    // ==================== Invoice Number Generation ====================

    /**
     * Get next invoice number with RBAC.
     * TRAINER: Can generate invoice numbers for their clients
     * ADMIN/OWNER: Can generate invoice numbers for the gym
     */
    @GetMapping("/next-invoice-number/{gymId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'TRAINER')")
    public ResponseEntity<?> getNextInvoiceNumber(@PathVariable Long gymId) {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            if (currentUserId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated"));
            }

            dataScopeValidator.logDataAccess("invoice_number", gymId, "GENERATE");

            String invoiceNumber = billingService.generateInvoiceNumber(gymId);
            return ResponseEntity.ok(Map.of("invoiceNumber", invoiceNumber));
        } catch (Exception e) {
            log.error("Failed to generate invoice number", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to generate invoice number"));
        }
    }

    // ==================== Helper Methods ====================

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
            return ((CustomUserDetails) auth.getPrincipal()).getId();
        }
        return null;
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAllExceptions(Exception e) {
        log.error("Exception in BillingController", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred"));
    }
}
