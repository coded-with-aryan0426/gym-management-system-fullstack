package com.gym.management.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Age Calculation Service - Edge Cases Tests")
class AgeCalculationServiceTest {

    private AgeCalculationService ageCalculationService;

    @BeforeEach
    void setUp() {
        ageCalculationService = new AgeCalculationService();
    }

    @Test
    @DisplayName("TC-001: Leap Year Birthday (Feb 29)")
    void testLeapYearBirthday() {
        LocalDate leapYearBirthday = LocalDate.of(1996, 2, 29);
        LocalDate nonLeapYearDate = LocalDate.of(2023, 2, 28);
        
        int age = calculateAge(leapYearBirthday, nonLeapYearDate);
        assertEquals(26, age, "Age calculation for leap year birthday on non-leap year");
    }

    @Test
    @DisplayName("TC-002: Age Boundary - Exactly 18")
    void testAgeBoundaryEighteen() {
        LocalDate today = LocalDate.of(2024, 4, 15);
        LocalDate turnedEighteen = LocalDate.of(2006, 4, 15);
        
        int age = calculateAge(turnedEighteen, today);
        assertEquals(18, age, "User should be exactly 18");
    }

    @ParameterizedTest
    @DisplayName("TC-003: Multiple age boundary checks")
    @CsvSource({
        "2006-04-15,2024-04-15,18",
        "2008-04-15,2024-04-15,16",
        "2010-04-15,2024-04-15,14"
    })
    void testMultipleAgeBoundaries(String birthDateStr, String currentDateStr, int expectedAge) {
        LocalDate birthDate = LocalDate.parse(birthDateStr);
        LocalDate currentDate = LocalDate.parse(currentDateStr);
        
        int age = calculateAge(birthDate, currentDate);
        assertEquals(expectedAge, age);
    }

    private int calculateAge(LocalDate birthDate, LocalDate currentDate) {
        return (int) java.time.temporal.ChronoUnit.YEARS.between(birthDate, currentDate);
    }
}
