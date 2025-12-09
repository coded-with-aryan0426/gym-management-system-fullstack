package com.gym.management.service;

import com.gym.management.dto.StaffShiftDTO;
import com.gym.management.model.StaffShift;
import com.gym.management.model.ShiftStatus;
import com.gym.management.model.User;
import com.gym.management.repository.StaffShiftRepository;
import com.gym.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
public class StaffShiftService {

    @Autowired
    private StaffShiftRepository staffShiftRepository;

    @Autowired
    private UserRepository userRepository;

    public List<StaffShiftDTO> getShifts(Long staffId, LocalDate startDate, LocalDate endDate) {
        return staffShiftRepository.findByStaffIdAndDateRange(staffId, startDate, endDate)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public StaffShiftDTO assignShift(StaffShiftDTO dto) {
        Long staffId = Objects.requireNonNull(dto.getStaffId(), "Staff ID must not be null");
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff not found"));

        // Check for conflicting shifts
        List<StaffShift> conflicts = staffShiftRepository.findConflictingShifts(
                staffId,
                dto.getShiftDate(),
                dto.getStartTime(),
                dto.getEndTime());

        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException("Staff has a conflicting shift at this time");
        }

        StaffShift shift = new StaffShift();
        shift.setStaff(staff);
        shift.setShiftDate(dto.getShiftDate());
        shift.setStartTime(dto.getStartTime());
        shift.setEndTime(dto.getEndTime());
        shift.setStatus(dto.getStatus() != null ? dto.getStatus() : ShiftStatus.SCHEDULED);

        StaffShift saved = staffShiftRepository.save(shift);
        return convertToDTO(saved);
    }

    public void deleteShift(Long shiftId) {
        Objects.requireNonNull(shiftId, "Shift ID must not be null");
        staffShiftRepository.deleteById(shiftId);
    }

    private StaffShiftDTO convertToDTO(StaffShift shift) {
        StaffShiftDTO dto = new StaffShiftDTO();
        dto.setShiftId(shift.getShiftId());
        dto.setStaffId(shift.getStaff().getUserId());
        dto.setStaffName(shift.getStaff().getFullName());
        dto.setShiftDate(shift.getShiftDate());
        dto.setStartTime(shift.getStartTime());
        dto.setEndTime(shift.getEndTime());
        dto.setStatus(shift.getStatus());
        return dto;
    }
}
