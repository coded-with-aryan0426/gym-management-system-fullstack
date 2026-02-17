package com.gym.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberProfileUpdateDTO {
    private String fullName;
    private String phone;
    private String avatarId;
    
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodType;
    
    private String address;
    private String city;
    private String state;
    private String zipCode;
    
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String healthNotes;
    
    private List<String> fitnessGoals;
    
    private BigDecimal height;
    private BigDecimal weight;
    private BigDecimal bodyFat;
}
