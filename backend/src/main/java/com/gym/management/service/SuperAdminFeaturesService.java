package com.gym.management.service;

import com.gym.management.model.FeatureFlag;
import com.gym.management.repository.FeatureFlagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class SuperAdminFeaturesService {

    @Autowired
    private FeatureFlagRepository featureFlagRepository;

    public List<Map<String, Object>> getAllFlags() {
        List<FeatureFlag> flags = featureFlagRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (FeatureFlag flag : flags) {
            Map<String, Object> map = new HashMap<>();
            map.put("key", flag.getFeatureKey());
            map.put("name", formatName(flag.getFeatureKey()));
            map.put("enabled", flag.getEnabled());
            map.put("rolloutPercentage", flag.getEnabled() ? 100 : 0);
            map.put("description", flag.getDescription());
            map.put("critical", false);
            map.put("updatedAt", flag.getUpdatedAt() != null ? flag.getUpdatedAt().toString() : LocalDateTime.now().toString());
            result.add(map);
        }
        return result;
    }

    public Map<String, Object> updateFlag(String key, Boolean enabled, Integer rollout) {
        Optional<FeatureFlag> optFlag = featureFlagRepository.findByFeatureKey(key);
        if (optFlag.isEmpty()) {
            throw new IllegalArgumentException("Feature flag not found: " + key);
        }
        FeatureFlag flag = optFlag.get();
        if (enabled != null) {
            flag.setEnabled(enabled);
        }
        flag.setUpdatedAt(LocalDateTime.now());
        featureFlagRepository.save(flag);

        Map<String, Object> result = new HashMap<>();
        result.put("key", flag.getFeatureKey());
        result.put("name", formatName(flag.getFeatureKey()));
        result.put("enabled", flag.getEnabled());
        result.put("rolloutPercentage", flag.getEnabled() ? 100 : 0);
        result.put("description", flag.getDescription());
        result.put("updatedAt", flag.getUpdatedAt().toString());
        return result;
    }

    private String formatName(String key) {
        return Arrays.stream(key.split("_"))
                .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1))
                .reduce((a, b) -> a + " " + b)
                .orElse(key);
    }
}
