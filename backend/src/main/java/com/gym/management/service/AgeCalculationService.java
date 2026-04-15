package com.gym.management.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.gym.management.model.MembershipPackage;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class AgeCalculationService {

    public AgeResult calculateAge(LocalDate dateOfBirth) {
        return calculateAge(dateOfBirth, LocalDate.now());
    }

    public AgeResult calculateAge(LocalDate dateOfBirth, LocalDate referenceDate) {
        if (dateOfBirth == null) {
            throw new IllegalArgumentException("Date of birth cannot be null");
        }
        if (dateOfBirth.isAfter(referenceDate)) {
            throw new IllegalArgumentException("Date of birth cannot be in the future");
        }

        int years = referenceDate.getYear() - dateOfBirth.getYear();
        int months = referenceDate.getMonthValue() - dateOfBirth.getMonthValue();
        int days = referenceDate.getDayOfMonth() - dateOfBirth.getDayOfMonth();

        if (days < 0) {
            months--;
            days += referenceDate.minusMonths(1).lengthOfMonth();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        boolean isBirthdayToday = isBirthdayToday(dateOfBirth, referenceDate);
        boolean isLeapYearBirthday = isLeapYearBirthday(dateOfBirth);
        LocalDate nextBirthday = calculateNextBirthday(dateOfBirth, referenceDate);

        return AgeResult.builder()
                .years(years)
                .months(Math.abs(months))
                .days(Math.abs(days))
                .isBirthdayToday(isBirthdayToday)
                .isLeapYearBirthday(isLeapYearBirthday)
                .nextBirthday(nextBirthday)
                .ageGroup(determineAgeGroup(years))
                .build();
    }

    public int calculateAgeInYears(LocalDate dateOfBirth) {
        return calculateAgeInYears(dateOfBirth, LocalDate.now());
    }

    public int calculateAgeInYears(LocalDate dateOfBirth, LocalDate referenceDate) {
        if (dateOfBirth == null) {
            throw new IllegalArgumentException("Date of birth cannot be null");
        }
        int age = referenceDate.getYear() - dateOfBirth.getYear();
        if (referenceDate.getMonthValue() < dateOfBirth.getMonthValue() ||
            (referenceDate.getMonthValue() == dateOfBirth.getMonthValue() &&
             referenceDate.getDayOfMonth() < dateOfBirth.getDayOfMonth())) {
            age--;
        }
        return age;
    }

    public boolean meetsMinimumAge(LocalDate dateOfBirth, int minimumAge) {
        if (dateOfBirth == null || minimumAge <= 0) return false;
        return calculateAgeInYears(dateOfBirth) >= minimumAge;
    }

    public boolean exceedsMaximumAge(LocalDate dateOfBirth, Integer maximumAge) {
        if (dateOfBirth == null || maximumAge == null) return false;
        return calculateAgeInYears(dateOfBirth) > maximumAge;
    }

    public boolean requiresParentalConsent(LocalDate dateOfBirth, int thresholdAge) {
        if (dateOfBirth == null) return false;
        return calculateAgeInYears(dateOfBirth) < thresholdAge;
    }

    public EligibilityResult getMembershipEligibility(LocalDate dateOfBirth, MembershipPackage membershipPackage) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        if (dateOfBirth == null) {
            errors.add("Date of birth is required for membership");
            return EligibilityResult.builder()
                    .eligible(false).age(null).errors(errors).warnings(warnings).requiresConsent(false).build();
        }

        int age = calculateAgeInYears(dateOfBirth);

        if (membershipPackage.getMinimumAge() != null && age < membershipPackage.getMinimumAge()) {
            errors.add(String.format("Minimum age of %d years required", membershipPackage.getMinimumAge()));
        }
        if (membershipPackage.getMaximumAge() != null && age > membershipPackage.getMaximumAge()) {
            errors.add(String.format("Maximum age of %d years allowed", membershipPackage.getMaximumAge()));
        }
        if (membershipPackage.getRequiresParentalConsentUnder() != null &&
            age < membershipPackage.getRequiresParentalConsentUnder()) {
            warnings.add(String.format("Parental consent required for members under %d",
                membershipPackage.getRequiresParentalConsentUnder()));
        }

        return EligibilityResult.builder()
                .eligible(errors.isEmpty())
                .age(age)
                .errors(errors)
                .warnings(warnings)
                .requiresConsent(!warnings.isEmpty())
                .build();
    }

    private boolean isBirthdayToday(LocalDate dateOfBirth, LocalDate referenceDate) {
        return dateOfBirth.getMonthValue() == referenceDate.getMonthValue() &&
               dateOfBirth.getDayOfMonth() == referenceDate.getDayOfMonth();
    }

    private boolean isLeapYearBirthday(LocalDate dateOfBirth) {
        return dateOfBirth.getMonthValue() == 2 && dateOfBirth.getDayOfMonth() == 29;
    }

    private LocalDate calculateNextBirthday(LocalDate dateOfBirth, LocalDate referenceDate) {
        LocalDate nextBirthday = LocalDate.of(referenceDate.getYear(),
            dateOfBirth.getMonthValue(), dateOfBirth.getDayOfMonth());
        if (dateOfBirth.getMonthValue() == 2 && dateOfBirth.getDayOfMonth() == 29) {
            while (nextBirthday.getYear() % 4 != 0) {
                nextBirthday = nextBirthday.plusYears(1);
            }
        }
        if (nextBirthday.isBefore(referenceDate) || nextBirthday.isEqual(referenceDate)) {
            nextBirthday = nextBirthday.plusYears(1);
        }
        return nextBirthday;
    }

    private String determineAgeGroup(int years) {
        if (years < 18) return "minor";
        if (years <= 25) return "young_adult";
        if (years <= 45) return "adult";
        if (years <= 65) return "mature";
        return "senior";
    }

    @lombok.Data
    @lombok.Builder
    public static class AgeResult {
        private int years;
        private int months;
        private int days;
        private boolean isBirthdayToday;
        private boolean isLeapYearBirthday;
        private LocalDate nextBirthday;
        private String ageGroup;
    }

    @lombok.Data
    @lombok.Builder
    public static class EligibilityResult {
        private boolean eligible;
        private Integer age;
        private List<String> errors;
        private List<String> warnings;
        private boolean requiresConsent;
    }
}
