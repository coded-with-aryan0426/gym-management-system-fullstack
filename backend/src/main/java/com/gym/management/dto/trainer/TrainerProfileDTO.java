package com.gym.management.dto.trainer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerProfileDTO {
    // Basic User Info
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String role;

    // Details
    private String employeeId;
    private String dob;
    private String gender;
    private String bloodType;
    private String address;
    private String altPhone;
    private String joiningDate;
    private String department;
    private String reportingTo;

    private List<String> languages;
    private List<String> specializations;
    private String bio;

    private String instagram;
    private String linkedin;

    private String emergencyName;
    private String emergencyPhone;

    private String bankName;
    private String accountNo;
    private String ifsc;

    private String shift;

    // JSON strings or Object lists
    private List<CertificationDTO> certifications;
    private List<DocumentDTO> documents;

    // Stats (Computed or Mocked for now)
    private ProfileStatsDTO stats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CertificationDTO {
        private String name;
        private String issuer;
        private String year;
        private boolean valid;
        private String expires;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentDTO {
        private String name;
        private String type; // e.g. "id", "cert"
        private String url;
        private boolean verified;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileStatsDTO {
        private int activeMembers;
        private int totalMembers;
        private int sessionsMonth;
        private double attendance;
        private double rating;
        private int reviews;
        private String experience;
        private double earnings;
    }
}
