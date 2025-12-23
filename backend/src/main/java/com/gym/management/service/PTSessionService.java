package com.gym.management.service;

import com.gym.management.dto.*;
import com.gym.management.model.*;
import com.gym.management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.scheduling.annotation.Scheduled;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Service layer for PT Session management
 * Handles business logic for creating, updating, and managing PT sessions
 */
@Service
@Transactional
public class PTSessionService {

    private static final Logger logger = LoggerFactory.getLogger(PTSessionService.class);

    @Autowired
    private PTSessionRepository ptSessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BlackoutDayRepository blackoutDayRepository;

    @Autowired
    private GymSettingsRepository gymSettingsRepository;

    /**
     * Create a new PT session
     * 
     * @param dto PT session data
     * @return Created session DTO
     * @throws IllegalArgumentException if validation fails
     */
    public PTSessionDTO createSession(PTSessionDTO dto) {
        // Validate trainer and member exist
        Long trainerId = Objects.requireNonNull(dto.getTrainerId(), "Trainer ID must not be null");
        Long memberId = Objects.requireNonNull(dto.getMemberId(), "Member ID must not be null");
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new IllegalArgumentException("Trainer not found with ID: " + trainerId));

        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found with ID: " + memberId));

        // Check for conflicting sessions
        LocalDateTime endTime = dto.getSessionDate().plusMinutes(dto.getDurationMinutes());
        List<PTSession> conflicts = ptSessionRepository.findConflictingSessions(
                dto.getTrainerId(),
                dto.getSessionDate(),
                endTime);

        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException("Trainer has a conflicting session at this time");
        }

        // Check daily session limit
        LocalDateTime startOfDay = dto.getSessionDate().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = dto.getSessionDate().toLocalDate().atTime(LocalTime.MAX);
        Long sessionCount = ptSessionRepository.countSessionsByTrainerAndDate(
                dto.getTrainerId(),
                startOfDay,
                endOfDay);

        Integer maxSessions = getMaxSessionsPerDay();
        if (sessionCount >= maxSessions) {
            throw new IllegalArgumentException(
                    "Trainer has reached maximum sessions for this day (" + maxSessions + ")");
        }

        // Create and save session
        PTSession session = new PTSession();
        session.setTrainer(trainer);
        session.setMember(member);
        session.setSessionDate(dto.getSessionDate());
        session.setDurationMinutes(dto.getDurationMinutes());
        session.setStatus(dto.getStatus() != null ? dto.getStatus() : SessionStatus.SCHEDULED);
        session.setProgressNotes(dto.getProgressNotes());
        session.setWorkoutPlan(dto.getWorkoutPlan());
        session.setDietPlan(dto.getDietPlan());
        session.setIsRecurring(dto.getIsRecurring() != null ? dto.getIsRecurring() : false);
        session.setRecurringFrequency(dto.getRecurringFrequency());

        PTSession savedSession = ptSessionRepository.save(session);
        return convertToDTO(savedSession);
    }

    /**
     * Update an existing PT session
     * 
     * @param sessionId Session ID
     * @param dto       Updated session data
     * @return Updated session DTO
     */
    public PTSessionDTO updateSession(Long sessionId, PTSessionDTO dto) {
        Objects.requireNonNull(sessionId, "Session ID must not be null");
        PTSession session = ptSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found with ID: " + sessionId));

        // Update fields if provided
        if (dto.getSessionDate() != null) {
            // Check for conflicts if date is changing
            if (!dto.getSessionDate().equals(session.getSessionDate())) {
                LocalDateTime endTime = dto.getSessionDate().plusMinutes(
                        dto.getDurationMinutes() != null ? dto.getDurationMinutes() : session.getDurationMinutes());
                List<PTSession> conflicts = ptSessionRepository.findConflictingSessions(
                        session.getTrainer().getUserId(),
                        dto.getSessionDate(),
                        endTime);
                // Exclude current session from conflicts
                conflicts = conflicts.stream()
                        .filter(s -> !s.getSessionId().equals(sessionId))
                        .collect(Collectors.toList());

                if (!conflicts.isEmpty()) {
                    throw new IllegalArgumentException("Trainer has a conflicting session at this time");
                }
            }
            session.setSessionDate(dto.getSessionDate());
        }

        if (dto.getDurationMinutes() != null) {
            session.setDurationMinutes(dto.getDurationMinutes());
        }

        if (dto.getStatus() != null) {
            session.setStatus(dto.getStatus());
        }

        if (dto.getProgressNotes() != null) {
            session.setProgressNotes(dto.getProgressNotes());
        }

        if (dto.getWorkoutPlan() != null) {
            session.setWorkoutPlan(dto.getWorkoutPlan());
        }

        if (dto.getDietPlan() != null) {
            session.setDietPlan(dto.getDietPlan());
        }

        ptSessionRepository.save(session);
        return convertToDTO(session);
    }

    /**
     * Cancel a PT session
     * 
     * @param sessionId Session ID
     */
    public void cancelSession(Long sessionId) {
        Objects.requireNonNull(sessionId, "Session ID must not be null");
        PTSession session = ptSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found with ID: " + sessionId));

        session.setStatus(SessionStatus.CANCELLED);
        ptSessionRepository.save(session);
    }

    /**
     * Mark a session as complete with notes
     * 
     * @param sessionId Session ID
     * @param request   Completion details
     * @return Updated session DTO
     */
    public PTSessionDTO markSessionComplete(Long sessionId, CompleteSessionRequest request) {
        Objects.requireNonNull(sessionId, "Session ID must not be null");
        PTSession session = ptSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found with ID: " + sessionId));

        if (request.getMemberAttended() != null && !request.getMemberAttended()) {
            session.setStatus(SessionStatus.MISSED);
        } else {
            session.setStatus(SessionStatus.COMPLETED);
        }

        if (request.getProgressNotes() != null) {
            session.setProgressNotes(request.getProgressNotes());
        }

        if (request.getWorkoutPlan() != null) {
            session.setWorkoutPlan(request.getWorkoutPlan());
        }

        if (request.getDietPlan() != null) {
            session.setDietPlan(request.getDietPlan());
        }

        PTSession updatedSession = ptSessionRepository.save(session);
        return convertToDTO(updatedSession);
    }

    /**
     * Get all PT sessions
     * 
     * @return List of all session DTOs
     */
    public List<PTSessionDTO> getAllSessions() {
        List<PTSession> sessions = ptSessionRepository.findAll();
        return sessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all sessions for a trainer
     * 
     * @param trainerId Trainer ID
     * @return List of session DTOs
     */
    public List<PTSessionDTO> getTrainerSessions(Long trainerId) {
        List<PTSession> sessions = ptSessionRepository.findByTrainerId(trainerId);
        return sessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get sessions for a trainer within a date range
     * 
     * @param trainerId Trainer ID
     * @param startDate Start date
     * @param endDate   End date
     * @return List of session DTOs
     */
    public List<PTSessionDTO> getTrainerSessions(Long trainerId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<PTSession> sessions = ptSessionRepository.findByTrainerIdAndDateRange(trainerId, start, end);
        return sessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all sessions for a member
     * 
     * @param memberId Member ID
     * @return List of session DTOs
     */
    public List<PTSessionDTO> getMemberSessions(Long memberId) {
        List<PTSession> sessions = ptSessionRepository.findByMemberId(memberId);
        return sessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get sessions for a member within a date range
     * 
     * @param memberId  Member ID
     * @param startDate Start date
     * @param endDate   End date
     * @return List of session DTOs
     */
    public List<PTSessionDTO> getMemberSessions(Long memberId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<PTSession> sessions = ptSessionRepository.findByMemberIdAndDateRange(memberId, start, end);
        return sessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a session by ID
     * 
     * @param sessionId Session ID
     * @return Session DTO
     */
    public PTSessionDTO getSessionById(Long sessionId) {
        Objects.requireNonNull(sessionId, "Session ID must not be null");
        PTSession session = ptSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found with ID: " + sessionId));
        return convertToDTO(session);
    }

    /**
     * Delete a session
     * 
     * @param sessionId Session ID
     */
    public void deleteSession(Long sessionId) {
        Objects.requireNonNull(sessionId, "Session ID must not be null");
        ptSessionRepository.deleteById(sessionId);
    }

    /**
     * Convert PTSession entity to DTO
     * 
     * @param session PT session entity
     * @return PT session DTO
     */
    private PTSessionDTO convertToDTO(PTSession session) {
        PTSessionDTO dto = new PTSessionDTO();
        dto.setSessionId(session.getSessionId());
        dto.setTrainerId(session.getTrainer().getUserId());
        dto.setTrainerName(session.getTrainer().getFullName());
        dto.setMemberId(session.getMember().getUserId());
        dto.setMemberName(session.getMember().getFullName());
        dto.setSessionDate(session.getSessionDate());
        dto.setDurationMinutes(session.getDurationMinutes());
        dto.setStatus(session.getStatus());
        dto.setProgressNotes(session.getProgressNotes());
        dto.setWorkoutPlan(session.getWorkoutPlan());
        dto.setDietPlan(session.getDietPlan());
        dto.setIsRecurring(session.getIsRecurring());
        dto.setRecurringFrequency(session.getRecurringFrequency());
        dto.setCreatedAt(session.getCreatedAt());
        dto.setUpdatedAt(session.getUpdatedAt());
        return dto;
    }

    /**
     * Get maximum sessions per day from settings
     * 
     * @return Max sessions per day
     */
    private Integer getMaxSessionsPerDay() {
        return gymSettingsRepository.findBySettingKey("pt_max_sessions_per_day")
                .map(setting -> Integer.parseInt(setting.getSettingValue()))
                .orElse(8); // Default to 8 if not configured
    }

    /**
     * Get available time slots for a trainer on a specific date
     * 
     * @param trainerId Trainer ID
     * @param date      Date to check
     * @return List of available slots
     */
    public List<AvailableSlotDTO> getAvailableSlots(Long trainerId, LocalDate date) {
        List<AvailableSlotDTO> slots = new ArrayList<>();

        // Check if date is a blackout day
        if (blackoutDayRepository.existsByDate(date)) {
            BlackoutDay blackoutDay = blackoutDayRepository.findByDate(date).orElse(null);
            String reason = blackoutDay != null ? blackoutDay.getReason() : "Gym closed";

            AvailableSlotDTO slot = new AvailableSlotDTO();
            slot.setStartTime(date.atStartOfDay());
            slot.setEndTime(date.atTime(LocalTime.MAX));
            slot.setIsAvailable(false);
            slot.setUnavailableReason("Blackout day: " + reason);
            slots.add(slot);
            return slots;
        }

        // Get gym hours for this day
        String dayOfWeek = date.getDayOfWeek().toString().toLowerCase();
        String gymHoursKey = "gym_hours_" + dayOfWeek;

        GymSettings gymHours = gymSettingsRepository.findBySettingKey(gymHoursKey).orElse(null);
        if (gymHours == null) {
            AvailableSlotDTO slot = new AvailableSlotDTO();
            slot.setStartTime(date.atStartOfDay());
            slot.setEndTime(date.atTime(LocalTime.MAX));
            slot.setIsAvailable(false);
            slot.setUnavailableReason("Gym hours not configured for " + dayOfWeek);
            slots.add(slot);
            return slots;
        }

        // Parse gym hours (assuming JSON format: {"open": "06:00", "close": "22:00"})
        // For simplicity, we'll assume 6 AM to 10 PM if parsing fails
        LocalTime openTime = LocalTime.of(6, 0);
        LocalTime closeTime = LocalTime.of(22, 0);

        // Get trainer's existing sessions for this date
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        List<PTSession> existingSessions = ptSessionRepository.findByTrainerIdAndDateRange(
                trainerId,
                startOfDay,
                endOfDay);

        // Get slot interval from settings
        Integer slotInterval = gymSettingsRepository.findBySettingKey("pt_slot_interval")
                .map(setting -> Integer.parseInt(setting.getSettingValue()))
                .orElse(30); // Default 30 minutes

        // Generate time slots
        LocalDateTime currentSlot = date.atTime(openTime);
        LocalDateTime gymCloseTime = date.atTime(closeTime);

        while (currentSlot.isBefore(gymCloseTime)) {
            LocalDateTime slotEnd = currentSlot.plusMinutes(slotInterval);

            // Check if this slot conflicts with any existing session
            boolean isAvailable = true;
            String unavailableReason = null;

            for (PTSession session : existingSessions) {
                LocalDateTime sessionEnd = session.getSessionDate().plusMinutes(session.getDurationMinutes());

                // Check for overlap
                if (currentSlot.isBefore(sessionEnd) && slotEnd.isAfter(session.getSessionDate())) {
                    isAvailable = false;
                    unavailableReason = "Trainer has session with " + session.getMember().getFullName();
                    break;
                }
            }

            AvailableSlotDTO slot = new AvailableSlotDTO();
            slot.setStartTime(currentSlot);
            slot.setEndTime(slotEnd);
            slot.setDurationMinutes(slotInterval);
            slot.setIsAvailable(isAvailable);
            slot.setUnavailableReason(unavailableReason);
            slots.add(slot);

            currentSlot = currentSlot.plusMinutes(slotInterval);
        }

        return slots;
    }

    /**
     * Check if a trainer is available at a specific time
     * 
     * @param trainerId       Trainer ID
     * @param sessionDate     Proposed session date/time
     * @param durationMinutes Session duration
     * @return true if available, false otherwise
     */
    public boolean isTrainerAvailable(Long trainerId, LocalDateTime sessionDate, Integer durationMinutes) {
        // Check blackout days
        if (blackoutDayRepository.existsByDate(sessionDate.toLocalDate())) {
            return false;
        }

        // Check for conflicting sessions
        LocalDateTime endTime = sessionDate.plusMinutes(durationMinutes);
        List<PTSession> conflicts = ptSessionRepository.findConflictingSessions(
                trainerId,
                sessionDate,
                endTime);

        return conflicts.isEmpty();
    }

    /**
     * Check if a specific date is within gym operating hours
     * 
     * @param dateTime Date and time to check
     * @return true if within hours, false otherwise
     */
    public boolean isWithinGymHours(LocalDateTime dateTime) {
        String dayOfWeek = dateTime.getDayOfWeek().toString().toLowerCase();
        String gymHoursKey = "gym_hours_" + dayOfWeek;

        GymSettings gymHours = gymSettingsRepository.findBySettingKey(gymHoursKey).orElse(null);
        if (gymHours == null) {
            return false; // Gym hours not configured
        }

        // Parse gym hours and check if time is within range
        // For simplicity, assuming 6 AM to 10 PM
        LocalTime time = dateTime.toLocalTime();
        return time.isAfter(LocalTime.of(6, 0)) && time.isBefore(LocalTime.of(22, 0));
    }

    /**
     * Create recurring PT sessions
     * 
     * @param request Recurring session request
     * @return List of created session DTOs
     */
    public List<PTSessionDTO> createRecurringSessions(RecurringSessionRequest request) {
        List<PTSessionDTO> createdSessions = new ArrayList<>();

        // Validate trainer and member exist
        Long trainerId = Objects.requireNonNull(request.getTrainerId(), "Trainer ID must not be null");
        Long memberId = Objects.requireNonNull(request.getMemberId(), "Member ID must not be null");
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(
                        () -> new IllegalArgumentException("Trainer not found with ID: " + trainerId));

        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found with ID: " + memberId));

        LocalDateTime currentDate = request.getStartDate();
        int daysToAdd = request.getFrequency() == RecurringFrequency.WEEKLY ? 7 : 14;

        for (int i = 0; i < request.getOccurrences(); i++) {
            // Check if trainer is available
            if (!isTrainerAvailable(request.getTrainerId(), currentDate, request.getDurationMinutes())) {
                // Skip this occurrence if trainer is not available
                currentDate = currentDate.plusDays(daysToAdd);
                continue;
            }

            // Check daily session limit
            LocalDateTime startOfDay = currentDate.toLocalDate().atStartOfDay();
            LocalDateTime endOfDay = currentDate.toLocalDate().atTime(LocalTime.MAX);
            Long sessionCount = ptSessionRepository.countSessionsByTrainerAndDate(
                    request.getTrainerId(),
                    startOfDay,
                    endOfDay);

            Integer maxSessions = getMaxSessionsPerDay();
            if (sessionCount >= maxSessions) {
                // Skip this occurrence if daily limit reached
                currentDate = currentDate.plusDays(daysToAdd);
                continue;
            }

            // Create session
            PTSession session = new PTSession();
            session.setTrainer(trainer);
            session.setMember(member);
            session.setSessionDate(currentDate);
            session.setDurationMinutes(request.getDurationMinutes());
            session.setStatus(SessionStatus.SCHEDULED);
            session.setIsRecurring(true);
            session.setRecurringFrequency(request.getFrequency());

            PTSession savedSession = ptSessionRepository.save(session);
            createdSessions.add(convertToDTO(savedSession));

            // Move to next occurrence
            currentDate = currentDate.plusDays(daysToAdd);
        }

        if (createdSessions.isEmpty()) {
            throw new IllegalArgumentException("No sessions could be created. All proposed times are unavailable.");
        }

        return createdSessions;
    }

    /**
     * Get upcoming sessions within 24 hours for reminder generation
     * 
     * @return List of sessions needing reminders
     */
    public List<PTSessionDTO> getSessionsNeedingReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime twentyFourHoursLater = now.plusHours(24);

        List<PTSession> sessions = ptSessionRepository.findSessionsWithin24Hours(now, twentyFourHoursLater);
        return sessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Periodically check for scheduled sessions that have passed their time
     * and mark them as MISSED.
     * Runs every 15 minutes.
     */
    @Scheduled(fixedRate = 900000) // 15 minutes
    public void markMissedSessions() {
        LocalDateTime now = LocalDateTime.now();
        List<PTSession> expiredSessions = ptSessionRepository.findExpiredScheduledSessions(now);

        if (!expiredSessions.isEmpty()) {
            logger.info("Found {} expired scheduled sessions. Marking as MISSED.", expiredSessions.size());
            for (PTSession session : expiredSessions) {
                session.setStatus(SessionStatus.MISSED);
                ptSessionRepository.save(session);
            }
        }
    }
}
