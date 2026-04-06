package com.gym.subscription.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.gym.subscription.config.PlansConfigLoader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlanManagementService {

    private final PlansConfigLoader configLoader;
    private static final String CONFIG_PATH = System.getProperty("user.home") + "/.gym-subscription/plans-config.json";

    public PlansConfigLoader.PlansConfiguration getConfiguration() {
        return configLoader.getConfig();
    }

    public PlansConfigLoader.PlanConfig getPlan(String planId) {
        return configLoader.getPlanById(planId);
    }

    public PlansConfigLoader.PlanConfig updatePlan(String planId, PlanUpdateRequest request) {
        PlansConfigLoader.PlanConfig plan = configLoader.getPlanById(planId);
        if (plan == null) {
            throw new IllegalArgumentException("Plan not found: " + planId);
        }

        if (request.getDisplayName() != null) {
            plan.setDisplayName(request.getDisplayName());
        }
        if (request.getDescription() != null) {
            plan.setDescription(request.getDescription());
        }
        if (request.getTrialDays() != null) {
            plan.setTrialDays(request.getTrialDays());
        }
        if (request.getGracePeriodDays() != null) {
            plan.setGracePeriodDays(request.getGracePeriodDays());
        }
        if (request.getMaxDevices() != null) {
            plan.setMaxDevices(request.getMaxDevices());
        }
        if (request.getMaxMembers() != null) {
            plan.setMaxMembers(request.getMaxMembers());
        }
        if (request.getMaxStaff() != null) {
            plan.setMaxStaff(request.getMaxStaff());
        }
        if (request.getMaxTrainers() != null) {
            plan.setMaxTrainers(request.getMaxTrainers());
        }
        if (request.getMaxClasses() != null) {
            plan.setMaxClasses(request.getMaxClasses());
        }
        if (request.getIsFeatured() != null) {
            plan.setFeatured(request.getIsFeatured());
        }
        if (request.getIsActive() != null) {
            plan.setActive(request.getIsActive());
        }
        if (request.getSortOrder() != null) {
            plan.setSortOrder(request.getSortOrder());
        }

        if (request.getPrices() != null) {
            Map<String, BigDecimal> prices = new HashMap<>(plan.getPrices() != null ? plan.getPrices() : new HashMap<>());
            request.getPrices().forEach((key, value) -> {
                if (value != null) {
                    prices.put(key, value);
                }
            });
            plan.setPrices(prices);
        }

        if (request.getPricesUSD() != null) {
            Map<String, BigDecimal> pricesUSD = new HashMap<>(plan.getPricesUSD() != null ? plan.getPricesUSD() : new HashMap<>());
            request.getPricesUSD().forEach((key, value) -> {
                if (value != null) {
                    pricesUSD.put(key, value);
                }
            });
            plan.setPricesUSD(pricesUSD);
        }

        if (request.getFeatures() != null) {
            Map<String, Object> features = plan.getFeatures();
            if (features == null) {
                features = new HashMap<>();
            }
            features.putAll(request.getFeatures());
            plan.setFeatures(features);
        }

        saveConfiguration();
        configLoader.reloadConfiguration();

        log.info("Updated plan: {} by admin", planId);
        return plan;
    }

    public PlansConfigLoader.PlanConfig createPlan(CreatePlanRequest request) {
        PlansConfigLoader.PlansConfiguration config = configLoader.getConfig();

        if (config.getPlans() == null) {
            config.setPlans(new java.util.ArrayList<>());
        }

        PlansConfigLoader.PlanConfig newPlan = new PlansConfigLoader.PlanConfig();
        newPlan.setId(request.getId());
        newPlan.setName(request.getName());
        newPlan.setDisplayName(request.getDisplayName());
        newPlan.setDescription(request.getDescription());
        newPlan.setTierLevel(request.getTierLevel());
        newPlan.setTrialDays(request.getTrialDays() != null ? request.getTrialDays() : 14);
        newPlan.setGracePeriodDays(request.getGracePeriodDays() != null ? request.getGracePeriodDays() : 5);
        newPlan.setMaxDevices(request.getMaxDevices() != null ? request.getMaxDevices() : 1);
        newPlan.setMaxMembers(request.getMaxMembers() != null ? request.getMaxMembers() : 100);
        newPlan.setMaxStaff(request.getMaxStaff() != null ? request.getMaxStaff() : 5);
        newPlan.setMaxTrainers(request.getMaxTrainers() != null ? request.getMaxTrainers() : 5);
        newPlan.setMaxClasses(request.getMaxClasses() != null ? request.getMaxClasses() : -1);
        newPlan.setActive(true);
        newPlan.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : config.getPlans().size() + 1);

        if (request.getPrices() != null) {
            newPlan.setPrices(request.getPrices());
        } else {
            newPlan.setPrices(new HashMap<>());
        }

        if (request.getPricesUSD() != null) {
            newPlan.setPricesUSD(request.getPricesUSD());
        } else {
            newPlan.setPricesUSD(new HashMap<>());
        }

        if (request.getFeatures() != null) {
            newPlan.setFeatures(request.getFeatures());
        } else {
            newPlan.setFeatures(new HashMap<>());
        }

        config.getPlans().add(newPlan);
        saveConfiguration();
        configLoader.reloadConfiguration();

        log.info("Created new plan: {} by admin", request.getId());
        return newPlan;
    }

    public void deletePlan(String planId) {
        PlansConfigLoader.PlansConfiguration config = configLoader.getConfig();

        boolean removed = config.getPlans().removeIf(p -> p.getId().equalsIgnoreCase(planId));

        if (!removed) {
            throw new IllegalArgumentException("Plan not found: " + planId);
        }

        saveConfiguration();
        configLoader.reloadConfiguration();

        log.info("Deleted plan: {} by admin", planId);
    }

    public PlansConfigLoader.PlanConfig updatePrice(String planId, String cycle, BigDecimal newPrice) {
        PlansConfigLoader.PlanConfig plan = configLoader.getPlanById(planId);
        if (plan == null) {
            throw new IllegalArgumentException("Plan not found: " + planId);
        }

        Map<String, BigDecimal> prices = plan.getPrices();
        if (prices == null) {
            prices = new HashMap<>();
            plan.setPrices(prices);
        }

        prices.put(cycle.toLowerCase(), newPrice);

        saveConfiguration();
        configLoader.reloadConfiguration();

        log.info("Updated {} price for plan {} to {}", cycle, planId, newPrice);
        return plan;
    }

    public Map<String, Object> getPricingSummary() {
        Map<String, Object> summary = new HashMap<>();

        PlansConfigLoader.CurrencyConfig currency = configLoader.getCurrencyConfig();
        summary.put("currency", currency.getDefaultCurrency());
        summary.put("symbol", currency.getSymbol());

        PlansConfigLoader.BillingConfig billing = configLoader.getConfig().getBilling();
        if (billing != null) {
            summary.put("defaultCycle", billing.getDefaultCycle());
            summary.put("discounts", billing.getDiscounts());
        }

        Map<String, Map<String, Object>> plansSummary = new HashMap<>();
        for (PlansConfigLoader.PlanConfig plan : configLoader.getActivePlans()) {
            Map<String, Object> planInfo = new HashMap<>();
            planInfo.put("name", plan.getDisplayName());
            planInfo.put("tierLevel", plan.getTierLevel());
            planInfo.put("prices", plan.getPrices());
            planInfo.put("pricesUSD", plan.getPricesUSD());
            planInfo.put("trialDays", plan.getTrialDays());
            planInfo.put("isFeatured", plan.isFeatured());
            plansSummary.put(plan.getId(), planInfo);
        }
        summary.put("plans", plansSummary);

        return summary;
    }

    private void saveConfiguration() {
        try {
            Path configDir = Paths.get(CONFIG_PATH).getParent();
            if (configDir != null && !Files.exists(configDir)) {
                Files.createDirectories(configDir);
            }

            ObjectMapper mapper = new ObjectMapper();
            mapper.enable(SerializationFeature.INDENT_OUTPUT);
            mapper.writeValue(Paths.get(CONFIG_PATH).toFile(), configLoader.getConfig());

            log.info("Saved configuration to: {}", CONFIG_PATH);
        } catch (IOException e) {
            log.error("Failed to save configuration: {}", e.getMessage());
            throw new RuntimeException("Failed to save configuration", e);
        }
    }

    @lombok.Data
    public static class PlanUpdateRequest {
        private String displayName;
        private String description;
        private Integer trialDays;
        private Integer gracePeriodDays;
        private Integer maxDevices;
        private Integer maxMembers;
        private Integer maxStaff;
        private Integer maxTrainers;
        private Integer maxClasses;
        private Boolean isFeatured;
        private Boolean isActive;
        private Integer sortOrder;
        private Map<String, BigDecimal> prices;
        private Map<String, BigDecimal> pricesUSD;
        private Map<String, Object> features;
    }

    @lombok.Data
    public static class CreatePlanRequest {
        private String id;
        private String name;
        private String displayName;
        private String description;
        private int tierLevel;
        private Integer trialDays;
        private Integer gracePeriodDays;
        private Integer maxDevices;
        private Integer maxMembers;
        private Integer maxStaff;
        private Integer maxTrainers;
        private Integer maxClasses;
        private Integer sortOrder;
        private Map<String, BigDecimal> prices;
        private Map<String, BigDecimal> pricesUSD;
        private Map<String, Object> features;
    }
}
