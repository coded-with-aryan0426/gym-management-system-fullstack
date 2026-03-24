package com.gym.management.service;

import com.gym.management.dto.FeatureFlagDTO;
import com.gym.management.dto.UpdateFeatureFlagRequest;
import com.gym.management.model.FeatureFlag;
import com.gym.management.repository.FeatureFlagRepository;
import com.gym.management.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class FeatureFlagService {

    @Autowired
    private FeatureFlagRepository featureFlagRepository;

    public Optional<FeatureFlagDTO> getByKey(String featureKey) {
        return featureFlagRepository.findByFeatureKey(featureKey)
                .map(this::convertToDTO);
    }

    public List<FeatureFlagDTO> getAllFlagsForUser(CustomUserDetails userDetails) {
        List<FeatureFlag> allFlags = featureFlagRepository.findAll();
        return allFlags.stream()
                .filter(flag -> isAllowedForUser(flag, userDetails))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public boolean isAllowedForUser(FeatureFlag flag, CustomUserDetails userDetails) {
        if (flag.getAllowedRoles() == null || flag.getAllowedRoles().isEmpty()) {
            return false;
        }
        String[] allowedRoles = flag.getAllowedRoles().split(",");
        List<String> allowedRoleList = Arrays.stream(allowedRoles)
                .map(String::trim)
                .map(String::toUpperCase)
                .collect(Collectors.toList());

        return userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(auth -> auth.replace("ROLE_", ""))
                .map(String::toUpperCase)
                .anyMatch(allowedRoleList::contains);
    }

    public Optional<FeatureFlagDTO> update(String featureKey, UpdateFeatureFlagRequest request) {
        Optional<FeatureFlag> flagOpt = featureFlagRepository.findByFeatureKey(featureKey);
        if (flagOpt.isEmpty()) {
            return Optional.empty();
        }

        FeatureFlag flag = flagOpt.get();
        if (request.getEnabled() != null) {
            flag.setEnabled(request.getEnabled());
        }
        if (request.getDescription() != null) {
            flag.setDescription(request.getDescription());
        }
        if (request.getAllowedRoles() != null) {
            flag.setAllowedRoles(request.getAllowedRoles());
        }
        flag.setUpdatedAt(LocalDateTime.now());

        FeatureFlag saved = featureFlagRepository.save(flag);
        return Optional.of(convertToDTO(saved));
    }

    public void seedDefaultFlags() {
        seedFlag("feedback_widget", false, "Global feedback widget toggle", "ADMIN,OWNER,TRAINER,MEMBER");
        seedFlag("beta_mode", false, "Enable beta-specific features", "ADMIN,OWNER");
        seedFlag("new_ui", false, "New UI/UX improvements", "ADMIN");
        seedFlag("debug_mode", false, "Developer debug information", "ADMIN");
    }

    private void seedFlag(String featureKey, Boolean enabled, String description, String allowedRoles) {
        if (!featureFlagRepository.existsByFeatureKey(featureKey)) {
            FeatureFlag flag = new FeatureFlag();
            flag.setFeatureKey(featureKey);
            flag.setEnabled(enabled);
            flag.setDescription(description);
            flag.setAllowedRoles(allowedRoles);
            flag.setUpdatedAt(LocalDateTime.now());
            featureFlagRepository.save(flag);
        }
    }

    private FeatureFlagDTO convertToDTO(FeatureFlag flag) {
        FeatureFlagDTO dto = new FeatureFlagDTO();
        dto.setId(flag.getId());
        dto.setFeatureKey(flag.getFeatureKey());
        dto.setEnabled(flag.getEnabled());
        dto.setDescription(flag.getDescription());
        dto.setAllowedRoles(flag.getAllowedRoles());
        dto.setUpdatedAt(flag.getUpdatedAt());
        return dto;
    }
}