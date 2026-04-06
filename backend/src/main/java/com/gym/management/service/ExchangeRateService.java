package com.gym.management.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ExchangeRateService {

    @Value("${exchange.rate.api.key:}")
    private String apiKey;

    @Value("${exchange.rate.base.currency:USD}")
    private String baseCurrency;

    private final Map<String, Map<String, BigDecimal>> exchangeRates = new ConcurrentHashMap<>();
    private LocalDateTime lastUpdated;

    private static final String[] SUPPORTED_CURRENCIES = {"INR", "USD", "EUR", "GBP", "AUD", "CAD", "AED", "SGD"};

    @PostConstruct
    public void init() {
        setDefaultRates();
    }

    private void setDefaultRates() {
        Map<String, BigDecimal> inrRates = new HashMap<>();
        inrRates.put("INR", BigDecimal.ONE);
        inrRates.put("USD", new BigDecimal("0.012"));
        inrRates.put("EUR", new BigDecimal("0.011"));
        inrRates.put("GBP", new BigDecimal("0.0095"));
        inrRates.put("AUD", new BigDecimal("0.018"));
        inrRates.put("CAD", new BigDecimal("0.016"));
        inrRates.put("AED", new BigDecimal("0.044"));
        inrRates.put("SGD", new BigDecimal("0.016"));
        exchangeRates.put("INR", inrRates);

        Map<String, BigDecimal> usdRates = new HashMap<>();
        usdRates.put("INR", new BigDecimal("83.50"));
        usdRates.put("USD", BigDecimal.ONE);
        usdRates.put("EUR", new BigDecimal("0.92"));
        usdRates.put("GBP", new BigDecimal("0.79"));
        usdRates.put("AUD", new BigDecimal("1.53"));
        usdRates.put("CAD", new BigDecimal("1.36"));
        usdRates.put("AED", new BigDecimal("3.67"));
        usdRates.put("SGD", new BigDecimal("1.34"));
        exchangeRates.put("USD", usdRates);

        lastUpdated = LocalDateTime.now();
        log.info("Default exchange rates initialized");
    }

    @Scheduled(cron = "0 0 0 * * ?")
    public void updateExchangeRates() {
        if (apiKey == null || apiKey.isEmpty()) {
            log.info("No exchange rate API key configured, using default rates");
            return;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://v6.exchangerate-api.com/v6/" + apiKey + "/latest/" + baseCurrency;
            JsonNode response = restTemplate.getForObject(url, JsonNode.class);

            if (response != null && response.has("conversion_rates")) {
                JsonNode rates = response.get("conversion_rates");
                Map<String, BigDecimal> newRates = new HashMap<>();

                for (String currency : SUPPORTED_CURRENCIES) {
                    if (rates.has(currency)) {
                        newRates.put(currency, new BigDecimal(rates.get(currency).asText()));
                    }
                }

                exchangeRates.put(baseCurrency, newRates);
                lastUpdated = LocalDateTime.now();
                log.info("Exchange rates updated successfully");
            }
        } catch (Exception e) {
            log.error("Failed to update exchange rates", e);
        }
    }

    public BigDecimal convert(BigDecimal amount, String fromCurrency, String toCurrency) {
        if (fromCurrency.equals(toCurrency)) {
            return amount;
        }

        String from = fromCurrency.toUpperCase();
        String to = toCurrency.toUpperCase();

        Map<String, BigDecimal> fromRates = exchangeRates.get(from);
        if (fromRates == null) {
            throw new RuntimeException("Exchange rates not available for currency: " + from);
        }

        BigDecimal rate = fromRates.get(to);
        if (rate == null) {
            Map<String, BigDecimal> usdRates = exchangeRates.get("USD");
            if (usdRates == null) {
                throw new RuntimeException("Exchange rates not available");
            }

            BigDecimal fromToUsd = fromRates.get("USD");
            BigDecimal usdToTo = usdRates.get(to);

            if (fromToUsd == null || usdToTo == null) {
                throw new RuntimeException("Cannot convert from " + from + " to " + to);
            }

            rate = fromToUsd.multiply(usdToTo);
        }

        return amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal getExchangeRate(String fromCurrency, String toCurrency) {
        if (fromCurrency.equals(toCurrency)) {
            return BigDecimal.ONE;
        }

        Map<String, BigDecimal> fromRates = exchangeRates.get(fromCurrency.toUpperCase());
        if (fromRates == null) {
            throw new RuntimeException("Exchange rates not available for currency: " + fromCurrency);
        }

        BigDecimal rate = fromRates.get(toCurrency.toUpperCase());
        if (rate == null) {
            throw new RuntimeException("Exchange rate not available for " + toCurrency);
        }

        return rate;
    }

    public Map<String, BigDecimal> getAllRates(String baseCurrency) {
        Map<String, BigDecimal> rates = exchangeRates.get(baseCurrency.toUpperCase());
        if (rates == null) {
            throw new RuntimeException("Exchange rates not available for currency: " + baseCurrency);
        }
        return new HashMap<>(rates);
    }

    public boolean isCurrencySupported(String currency) {
        return exchangeRates.containsKey(currency.toUpperCase());
    }

    public String[] getSupportedCurrencies() {
        return SUPPORTED_CURRENCIES.clone();
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ExchangeRate {
        private String fromCurrency;
        private String toCurrency;
        private BigDecimal rate;
        private LocalDateTime timestamp;
    }
}
