package com.gym.subscription.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Data
@Slf4j
public class PlansConfigLoader {

    private PlansConfiguration config;
    private static PlansConfigLoader instance;

    @PostConstruct
    public void init() {
        instance = this;
        loadConfiguration();
    }

    public static PlansConfigLoader getInstance() {
        if (instance == null) {
            instance = new PlansConfigLoader();
            instance.loadConfiguration();
        }
        return instance;
    }

    public void loadConfiguration() {
        ObjectMapper mapper = new ObjectMapper();

        try {
            Path externalConfig = Paths.get(System.getProperty("user.home"),
                ".gym-subscription", "plans-config.json");

            Resource resource;
            if (Files.exists(externalConfig)) {
                log.info("Loading plans configuration from: {}", externalConfig);
                resource = new FileSystemResource(externalConfig);
            } else {
                log.info("Loading plans configuration from classpath");
                resource = new ClassPathResource("plans-config.json");
            }

            try (InputStream is = resource.getInputStream()) {
                this.config = mapper.readValue(is, PlansConfiguration.class);
                log.info("Loaded {} plans from configuration", config.getPlans().size());
            }
        } catch (IOException e) {
            log.error("Failed to load plans configuration, using defaults: {}", e.getMessage());
            this.config = createDefaultConfiguration();
        }
    }

    public void reloadConfiguration() {
        loadConfiguration();
    }

    public List<PlanConfig> getActivePlans() {
        return config.getPlans().stream()
                .filter(PlanConfig::isActive)
                .sorted((a, b) -> Integer.compare(a.getSortOrder(), b.getSortOrder()))
                .toList();
    }

    public PlanConfig getPlanById(String id) {
        return config.getPlans().stream()
                .filter(p -> p.getId().equalsIgnoreCase(id))
                .findFirst()
                .orElse(null);
    }

    public PlanConfig getPlanByTierLevel(int tierLevel) {
        return config.getPlans().stream()
                .filter(p -> p.getTierLevel() == tierLevel)
                .findFirst()
                .orElse(null);
    }

    public BigDecimal getPrice(String planId, String billingCycle) {
        PlanConfig plan = getPlanById(planId);
        if (plan == null) return BigDecimal.ZERO;

        Map<String, BigDecimal> prices = plan.getPrices();
        if (prices == null) return BigDecimal.ZERO;

        return switch (billingCycle.toLowerCase()) {
            case "quarterly" -> prices.getOrDefault("quarterly", BigDecimal.ZERO);
            case "yearly" -> prices.getOrDefault("yearly", BigDecimal.ZERO);
            default -> prices.getOrDefault("monthly", BigDecimal.ZERO);
        };
    }

    public CurrencyConfig getCurrencyConfig() {
        return config.getCurrency();
    }

    public TrialConfig getTrialConfig() {
        return config.getTrial();
    }

    public GracePeriodConfig getGracePeriodConfig() {
        return config.getGracePeriod();
    }

    public Map<String, Object> getFeatures(String planId) {
        PlanConfig plan = getPlanById(planId);
        if (plan == null) return new HashMap<>();

        Map<String, Object> features = new HashMap<>();
        features.put("maxMembers", plan.getMaxMembers());
        features.put("maxDevices", plan.getMaxDevices());
        features.put("maxStaff", plan.getMaxStaff());
        features.put("maxTrainers", plan.getMaxTrainers());
        features.put("maxClasses", plan.getMaxClasses());

        if (plan.getFeatures() != null) {
            features.putAll(plan.getFeatures());
        }

        return features;
    }

    private PlansConfiguration createDefaultConfiguration() {
        PlansConfiguration defaultConfig = new PlansConfiguration();

        CurrencyConfig currency = new CurrencyConfig();
        currency.setDefaultCurrency("INR");
        currency.setSymbol("₹");
        defaultConfig.setCurrency(currency);

        List<PlanConfig> plans = new ArrayList<>();

        PlanConfig starter = new PlanConfig();
        starter.setId("starter");
        starter.setName("Starter");
        starter.setDisplayName("Starter");
        starter.setDescription("Perfect for solo trainers");
        starter.setTierLevel(1);
        starter.setTrialDays(7);
        starter.setGracePeriodDays(3);
        starter.setMaxMembers(30);
        starter.setMaxDevices(1);
        starter.setSortOrder(1);
        starter.setActive(true);

        Map<String, BigDecimal> starterPrices = new HashMap<>();
        starterPrices.put("monthly", new BigDecimal("999"));
        starterPrices.put("quarterly", new BigDecimal("2699"));
        starterPrices.put("yearly", new BigDecimal("9590"));
        starter.setPrices(starterPrices);

        Map<String, Boolean> starterFeatures = new HashMap<>();
        starterFeatures.put("memberManagement", true);
        starterFeatures.put("qrCheckin", true);
        @SuppressWarnings("unchecked")
        Map<String, Object> featuresObj = (Map<String, Object>) (Map<?, ?>) starterFeatures;
        starter.setFeatures(featuresObj);

        plans.add(starter);
        defaultConfig.setPlans(plans);

        return defaultConfig;
    }

    @Data
    public static class PlansConfiguration {
        private CurrencyConfig currency;
        private List<PlanConfig> plans = new ArrayList<>();
        private BillingConfig billing;
        private TrialConfig trial;
        private GracePeriodConfig gracePeriod;
        private NotificationsConfig notifications;
        private RateLimitingConfig rateLimiting;
        private Map<String, PaymentGatewayConfig> paymentGateways = new HashMap<>();
    }

    @Data
    public static class CurrencyConfig {
        private String defaultCurrency = "INR";
        private String symbol = "₹";
        private List<String> supported = List.of("INR", "USD", "EUR");
    }

    @Data
    public static class PlanConfig {
        private String id;
        private String name;
        private String displayName;
        private String description;
        private List<String> gymTypes = new ArrayList<>();
        private int tierLevel;
        private Map<String, BigDecimal> prices = new HashMap<>();
        private Map<String, BigDecimal> pricesUSD = new HashMap<>();
        private int trialDays;
        private int gracePeriodDays;
        private int maxDevices;
        private int maxMembers;
        private int maxStaff;
        private int maxTrainers;
        private int maxClasses;
        private Map<String, Object> features = new HashMap<>();
        private boolean isActive = true;
        private boolean isFeatured;
        private int sortOrder;
    }

    @Data
    public static class BillingConfig {
        private String defaultCycle = "yearly";
        private boolean allowMonthly = true;
        private boolean allowQuarterly = true;
        private boolean allowYearly = true;
        private BigDecimal taxPercent = BigDecimal.ZERO;
        private Map<String, Integer> discounts = new HashMap<>();
    }

    @Data
    public static class TrialConfig {
        private boolean enabled = true;
        private boolean requireCreditCard = false;
        private int maxTrialsPerUser = 1;
        private boolean autoConvert = true;
        private int conversionGracePeriodDays = 3;
    }

    @Data
    public static class GracePeriodConfig {
        private boolean enabled = true;
        private int defaultDays = 3;
        private List<Integer> notifyDaysBefore = List.of(7, 3, 1);
        private boolean notifyDuringGrace = true;
    }

    @Data
    public static class NotificationsConfig {
        private EmailConfig email = new EmailConfig();
    }

    @Data
    public static class EmailConfig {
        private boolean enabled = true;
        private boolean trialStarting = true;
        private boolean trialExpiring = true;
        private boolean subscriptionActivated = true;
        private boolean subscriptionRenewing = true;
        private boolean subscriptionExpiring = true;
        private boolean paymentFailed = true;
        private boolean gracePeriodStarted = true;
    }

    @Data
    public static class RateLimitingConfig {
        private boolean enabled = true;
        private int trialRequestsPerHour = 100;
        private int paidRequestsPerHour = 1000;
    }

    @Data
    public static class PaymentGatewayConfig {
        private boolean enabled;
        private boolean testMode = true;
        private String webhookSecret;
        private String keyId;
        private String keySecret;
        private String clientId;
    }
}
