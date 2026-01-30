package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "trainer_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrainerDetails {

    @Id
    private Long id; // Same as User ID

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private String employeeId;
    private LocalDate dob;
    private String gender;
    private String bloodType;
    private String address;
    private String altPhone;
    private LocalDate joiningDate;
    private String department;
    private String reportingTo;

    @Column(length = 1000)
    private String specializations; // Comma separated

    @Column(length = 2000)
    private String bio;

    private String instagram;
    private String linkedin;

    // Emergency Contact
    private String emergencyName;
    private String emergencyPhone;

    // Bank Details
    private String bankName;
    private String accountNo;
    private String ifsc;

    @Column(length = 4000)
    private String certificationsJson; // JSON string for list of certs

    @Column(length = 4000)
    private String skillsJson; // JSON string for structured skills (primary, secondary, proficiency)

    @Column(length = 2000)
    private String availabilityJson; // JSON string for availability

    private Integer experienceYears;

    @Column(length = 4000)
    private String documentsJson; // JSON string for list of documents

    private String shift;
}
