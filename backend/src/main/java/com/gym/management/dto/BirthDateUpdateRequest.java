package com.gym.management.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BirthDateUpdateRequest {

    @NotNull(message = "Date of birth is required")
    @PastOrPresent(message = "Birth date cannot be in the future")
    private LocalDate dateOfBirth;

    private String changeReason;

    /**
     * Validate date is within reasonable range (1900 to today)
     */
    public boolean isValidDateRange() {
        LocalDate minDate = LocalDate.of(1900, 1, 1);
        LocalDate today = LocalDate.now();
        return !dateOfBirth.isBefore(minDate) && !dateOfBirth.isAfter(today);
    }
}
