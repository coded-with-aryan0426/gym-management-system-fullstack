package com.gym.management.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Overdue Payment Data Transfer Object
 * Shows members with overdue payments
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OverduePaymentDTO {
    private Long memberId;
    private String memberName;
    private String memberEmail;
    private String memberPhone;
    private Double amount;
    private LocalDate dueDate;
    private Integer daysOverdue;
    private String planName;
    private LocalDate lastReminderSent;
}