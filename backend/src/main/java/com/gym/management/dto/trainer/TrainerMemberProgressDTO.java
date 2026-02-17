package com.gym.management.dto.trainer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Member Progress card data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerMemberProgressDTO {

    private Long id;
    private String name;
    private String avatar; // URL or initials-based URL
    private int sessions;
    private int attendance; // Percentage
    private int goalProgress; // Percentage
    private String trend; // up, down, stable
    private String lastSession; // "2 days ago", "Yesterday", etc.
    private String goal; // "Build muscle", "Weight loss", etc.
}
