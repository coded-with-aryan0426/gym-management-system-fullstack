package com.gym.management.dto.trainer;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChartDataDTO {
    private String label;
    private Double value;
    private String meta; // Optional metadata like color or secondary label
}
