package com.gym.management.dto.progress_note;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressNoteDTO {
    private Long id;
    private MemberInfo member;
    private String date; // YYYY-MM-DD
    private String time; // HH:MM AM/PM
    private String sessionType;
    private String category;
    private String mood;
    private String content;
    private List<String> highlights;
    private List<String> concerns;
    private List<String> goals;
    private List<Stat> stats;
    private List<Attachment> attachments;
    private List<String> tags;
    private String followUp;
    private boolean isPrivate;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberInfo {
        private String name;
        private String avatar;
        private String goal;
        private String startDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Stat {
        private String label;
        private String value;
        private String change;
        private String trend; // 'up' | 'down' | 'neutral'
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Attachment {
        private String type; // 'photo' | 'video' | 'document'
        private String name;
        private String url;
    }
}
