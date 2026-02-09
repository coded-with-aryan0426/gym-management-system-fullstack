package com.gym.management.controller;

import com.gym.management.dto.BillingSettingsDTO;
import com.gym.management.security.CustomUserDetails;
import com.gym.management.service.BillingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private static final Logger logger = LoggerFactory.getLogger(BillingController.class);

    @Autowired
    private BillingService billingService;

    // ==================== Billing Settings ====================

    @GetMapping("/settings")
    public ResponseEntity<BillingSettingsDTO> getBillingSettings() {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            BillingSettingsDTO settings = billingService.getBillingSettingsForUser(userId);
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            logger.error("Error fetching billing settings: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/settings")
    public ResponseEntity<BillingSettingsDTO> updateBillingSettings(@RequestBody BillingSettingsDTO dto) {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            BillingSettingsDTO updated = billingService.updateBillingSettingsForUser(userId, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalStateException e) {
            logger.error("Error updating billing settings: ", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            logger.error("Error updating billing settings: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/settings/{gymId}")
    public ResponseEntity<BillingSettingsDTO> getBillingSettingsByGym(@PathVariable Long gymId) {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            BillingSettingsDTO settings = billingService.getBillingSettings(gymId);
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            logger.error("Error fetching billing settings for gym: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/settings/{gymId}")
    public ResponseEntity<BillingSettingsDTO> updateBillingSettingsByGym(
            @PathVariable Long gymId,
            @RequestBody BillingSettingsDTO dto) {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            BillingSettingsDTO updated = billingService.updateBillingSettings(gymId, dto, userId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            logger.error("Error updating billing settings for gym: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ==================== Billing Statistics ====================

    @GetMapping("/stats/{gymId}")
    public ResponseEntity<BillingService.BillingStatsDTO> getBillingStats(@PathVariable Long gymId) {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            BillingService.BillingStatsDTO stats = billingService.getBillingStats(gymId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error fetching billing stats: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ==================== Invoice Number Generation ====================

    @GetMapping("/next-invoice-number/{gymId}")
    public ResponseEntity<Map<String, String>> getNextInvoiceNumber(@PathVariable Long gymId) {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            String invoiceNumber = billingService.generateInvoiceNumber(gymId);
            return ResponseEntity.ok(Map.of("invoiceNumber", invoiceNumber));
        } catch (Exception e) {
            logger.error("Error generating invoice number: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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
        logger.error("Exception in BillingController: ", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error: " + e.getMessage()));
    }
}
