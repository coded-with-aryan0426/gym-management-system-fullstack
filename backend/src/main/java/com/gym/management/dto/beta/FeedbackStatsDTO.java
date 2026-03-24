package com.gym.management.dto.beta;

import lombok.*;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackStatsDTO {

    private Long totalCount;
    private Long bugCount;
    private Long uiIssueCount;
    private Long suggestionCount;
    private Long improvementCount;
    private Long questionCount;

    private Long openCount;
    private Long resolvedCount;

    // Map<page_route, count>
    private Map<String, Long> byPage;

    // Map<category, count>
    private Map<String, Long> byCategory;

    // Map<severity, count>
    private Map<String, Long> bySeverity;

    // Map<status, count>
    private Map<String, Long> byStatus;
}
