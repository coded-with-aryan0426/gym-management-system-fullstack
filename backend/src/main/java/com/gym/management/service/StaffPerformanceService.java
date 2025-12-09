package com.gym.management.service;

import com.gym.management.dto.StaffPerformanceDTO;
import com.gym.management.model.StaffPerformance;
import com.gym.management.model.User;
import com.gym.management.repository.StaffPerformanceRepository;
import com.gym.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Objects;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class StaffPerformanceService {

    @Autowired
    private StaffPerformanceRepository staffPerformanceRepository;

    @Autowired
    private UserRepository userRepository;

    public StaffPerformanceDTO getPerformanceMetrics(Long staffId, String recordMonth) {
        StaffPerformance performance = staffPerformanceRepository
                .findByStaffIdAndMonth(staffId, recordMonth)
                .orElseGet(() -> createDefaultPerformance(staffId, recordMonth));

        return convertToDTO(performance);
    }

    public StaffPerformanceDTO updateAttendance(Long staffId, LocalDate date, String status) {
        String recordMonth = YearMonth.from(date).format(DateTimeFormatter.ofPattern("yyyy-MM"));

        StaffPerformance performance = staffPerformanceRepository
                .findByStaffIdAndMonth(staffId, recordMonth)
                .orElseGet(() -> createDefaultPerformance(staffId, recordMonth));

        switch (status.toUpperCase()) {
            case "PRESENT":
                performance.setPresentDays(performance.getPresentDays() + 1);
                break;
            case "ABSENT":
                performance.setAbsentDays(performance.getAbsentDays() + 1);
                break;
            case "LATE":
                performance.setLateDays(performance.getLateDays() + 1);
                performance.setPresentDays(performance.getPresentDays() + 1);
                break;
        }

        performance.setAttendanceRate(calculateAttendanceRate(performance));
        StaffPerformance saved = staffPerformanceRepository.save(performance);
        return convertToDTO(saved);
    }

    public Double calculateSatisfactionScore(Long staffId) {
        // Placeholder - would integrate with feedback system
        return 4.5;
    }

    public List<StaffPerformanceDTO> getAllPerformanceForMonth(String recordMonth) {
        return staffPerformanceRepository.findByRecordMonth(recordMonth)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private StaffPerformance createDefaultPerformance(Long staffId, String recordMonth) {
        Objects.requireNonNull(staffId, "Staff ID must not be null");
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff not found"));

        StaffPerformance performance = new StaffPerformance();
        performance.setStaff(staff);
        performance.setRecordMonth(recordMonth);
        performance.setSessionsCompleted(0);
        performance.setPresentDays(0);
        performance.setAbsentDays(0);
        performance.setLateDays(0);
        performance.setAttendanceRate(BigDecimal.ZERO);
        performance.setSatisfactionScore(BigDecimal.ZERO);

        return staffPerformanceRepository.save(performance);
    }

    private BigDecimal calculateAttendanceRate(StaffPerformance performance) {
        int totalDays = performance.getPresentDays() + performance.getAbsentDays();
        if (totalDays == 0)
            return BigDecimal.ZERO;
        return BigDecimal.valueOf(performance.getPresentDays() * 100.0 / totalDays)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private StaffPerformanceDTO convertToDTO(StaffPerformance performance) {
        StaffPerformanceDTO dto = new StaffPerformanceDTO();
        dto.setPerformanceId(performance.getPerformanceId());
        dto.setStaffId(performance.getStaff().getUserId());
        dto.setStaffName(performance.getStaff().getFullName());
        dto.setSessionsCompleted(performance.getSessionsCompleted());
        dto.setAttendanceRate(performance.getAttendanceRate());
        dto.setSatisfactionScore(performance.getSatisfactionScore());
        dto.setPresentDays(performance.getPresentDays());
        dto.setAbsentDays(performance.getAbsentDays());
        dto.setLateDays(performance.getLateDays());
        dto.setRecordMonth(performance.getRecordMonth());
        return dto;
    }
}
