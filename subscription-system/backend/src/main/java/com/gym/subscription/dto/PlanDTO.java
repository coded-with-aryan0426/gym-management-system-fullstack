package com.gym.subscription.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanDTO {
    private String id;
    private String name;
    private String displayName;
    private String description;
    private Integer tierLevel;
    private BigDecimal priceMonthly;
    private BigDecimal priceQuarterly;
    private BigDecimal priceYearly;
    private BigDecimal priceUsdMonthly;
    private BigDecimal priceUsdQuarterly;
    private BigDecimal priceUsdYearly;
    private String currency;
    private Integer trialDays;
    private Integer gracePeriodDays;
    private Integer maxDevices;
    private Map<String, Object> features;
    private Boolean isActive;
    private Boolean isFeatured;
    private Integer sortOrder;
}
