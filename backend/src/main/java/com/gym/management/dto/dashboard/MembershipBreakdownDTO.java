package com.gym.management.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Membership Breakdown Data Transfer Object
 * Shows current member status distribution
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MembershipBreakdownDTO {
    private Integer active;
    private Integer expiring;
    private Integer frozen;
    private Integer expired;
    private Integer total;
}