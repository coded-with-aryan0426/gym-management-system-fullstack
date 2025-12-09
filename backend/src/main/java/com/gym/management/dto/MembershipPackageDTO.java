package com.gym.management.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Data Transfer Object for Membership Package
 * Used for API requests and responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MembershipPackageDTO {

    private Long packageId;

    @NotBlank(message = "Package name is required")
    @Size(max = 100, message = "Package name cannot exceed 100 characters")
    private String packageName;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Price must have at most 8 digits and 2 decimal places")
    private Double price;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 day")
    @Max(value = 3650, message = "Duration cannot exceed 3650 days (10 years)")
    private Integer durationDays;

    @Min(value = 0, message = "Included PT sessions cannot be negative")
    private Integer includedPTSessions;

    private Boolean isActive;
}
