package com.gym.management.dto.progress;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressPhotoDTO {
    private Long id;
    private Long userId;
    private String photoUrl;
    private String description;
    private LocalDate recordDate;
    private LocalDateTime createdAt;
}
