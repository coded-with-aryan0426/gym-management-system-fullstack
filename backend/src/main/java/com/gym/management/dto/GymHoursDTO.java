package com.gym.management.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO for gym operating hours configuration
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GymHoursDTO {

    @NotNull(message = "Day of week is required")
    @Pattern(regexp = "monday|tuesday|wednesday|thursday|friday|saturday|sunday", 
             message = "Invalid day of week")
    private String dayOfWeek;

    @NotNull(message = "Opening time is required")
    @Pattern(regexp = "([01]?[0-9]|2[0-3]):[0-5][0-9]", 
             message = "Opening time must be in HH:mm format")
    private String openTime;

    @NotNull(message = "Closing time is required")
    @Pattern(regexp = "([01]?[0-9]|2[0-3]):[0-5][0-9]", 
             message = "Closing time must be in HH:mm format")
    private String closeTime;

    private Boolean isClosed; // If true, gym is closed on this day

    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public String getOpenTime() { return openTime; }
    public void setOpenTime(String openTime) { this.openTime = openTime; }
    public String getCloseTime() { return closeTime; }
    public void setCloseTime(String closeTime) { this.closeTime = closeTime; }
    public Boolean getIsClosed() { return isClosed; }
    public void setIsClosed(Boolean isClosed) { this.isClosed = isClosed; }
}
