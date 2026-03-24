package com.gym.management.controller;

import com.gym.management.dto.FeatureFlagDTO;
import com.gym.management.dto.UpdateFeatureFlagRequest;
import com.gym.management.security.CustomUserDetails;
import com.gym.management.service.FeatureFlagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/features")
public class FeatureFlagController {

    @Autowired
    private FeatureFlagService featureFlagService;

    @GetMapping("/{featureKey}")
    public ResponseEntity<FeatureFlagDTO> getFeatureFlag(@PathVariable String featureKey) {
        Optional<FeatureFlagDTO> flagOpt = featureFlagService.getByKey(featureKey);
        if (flagOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        CustomUserDetails userDetails = getCurrentUserDetails();
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        FeatureFlagDTO flag = flagOpt.get();
        if (!featureFlagService.isAllowedForUser(convertToEntity(flag), userDetails)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(flag);
    }

    @PutMapping("/{featureKey}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeatureFlagDTO> updateFeatureFlag(
            @PathVariable String featureKey,
            @RequestBody UpdateFeatureFlagRequest request) {
        Optional<FeatureFlagDTO> updated = featureFlagService.update(featureKey, request);
        if (updated.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated.get());
    }

    @GetMapping("/all")
    public ResponseEntity<List<FeatureFlagDTO>> getAllFlagsForUser() {
        CustomUserDetails userDetails = getCurrentUserDetails();
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<FeatureFlagDTO> flags = featureFlagService.getAllFlagsForUser(userDetails);
        return ResponseEntity.ok(flags);
    }

    private CustomUserDetails getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
            return (CustomUserDetails) authentication.getPrincipal();
        }
        return null;
    }

    private com.gym.management.model.FeatureFlag convertToEntity(FeatureFlagDTO dto) {
        com.gym.management.model.FeatureFlag flag = new com.gym.management.model.FeatureFlag();
        flag.setId(dto.getId());
        flag.setFeatureKey(dto.getFeatureKey());
        flag.setEnabled(dto.getEnabled());
        flag.setDescription(dto.getDescription());
        flag.setAllowedRoles(dto.getAllowedRoles());
        flag.setUpdatedAt(dto.getUpdatedAt());
        return flag;
    }
}