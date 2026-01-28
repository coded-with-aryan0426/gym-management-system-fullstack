package com.gym.management.service;

import com.gym.management.dto.progress.*;
import com.gym.management.model.*;
import com.gym.management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MemberProgressService {

    @Autowired
    private ProgressMetricRepository progressMetricRepository;

    @Autowired
    private BodyMeasurementRepository bodyMeasurementRepository;

    @Autowired
    private MemberGoalRepository memberGoalRepository;

    @Autowired
    private PersonalBestRepository personalBestRepository;

    @Autowired
    private WorkoutLogRepository workoutLogRepository;

    @Autowired
    private UserRepository userRepository;

    public ProgressSummaryDTO getProgressSummary(Long userId) {
        ProgressSummaryDTO summary = new ProgressSummaryDTO();
        summary.setUserId(userId);

        Optional<ProgressMetric> latestMetric = progressMetricRepository.findTopByUserUserIdOrderByRecordDateDesc(userId);
        Optional<ProgressMetric> firstMetric = progressMetricRepository.findTopByUserUserIdOrderByRecordDateAsc(userId);

        if (latestMetric.isPresent()) {
            ProgressMetric latest = latestMetric.get();
            summary.setCurrentWeight(latest.getWeight());
            summary.setCurrentBodyFat(latest.getBodyFat());
            summary.setCurrentMuscleMass(latest.getMuscleMass());
            summary.setCurrentBmi(latest.getBmi());
            summary.setLastEntryDate(latest.getRecordDate());
            
            if (latest.getBmi() != null) {
                summary.setBmiCategory(calculateBmiCategory(latest.getBmi()));
            }
        }

        if (firstMetric.isPresent()) {
            ProgressMetric first = firstMetric.get();
            summary.setStartWeight(first.getWeight());
            summary.setStartBodyFat(first.getBodyFat());
            summary.setStartMuscleMass(first.getMuscleMass());
            summary.setFirstEntryDate(first.getRecordDate());
        }

        if (summary.getCurrentWeight() != null && summary.getStartWeight() != null) {
            BigDecimal weightChange = summary.getCurrentWeight().subtract(summary.getStartWeight());
            summary.setWeightChange(weightChange);
            if (summary.getStartWeight().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal changePercent = weightChange.divide(summary.getStartWeight(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
                summary.setWeightChangePercent(changePercent);
            }
        }

        if (summary.getCurrentBodyFat() != null && summary.getStartBodyFat() != null) {
            summary.setBodyFatChange(summary.getCurrentBodyFat().subtract(summary.getStartBodyFat()));
        }

        if (summary.getCurrentMuscleMass() != null && summary.getStartMuscleMass() != null) {
            summary.setMuscleMassChange(summary.getCurrentMuscleMass().subtract(summary.getStartMuscleMass()));
        }

        List<MemberGoal> activeGoals = memberGoalRepository.findByUserUserIdAndIsActiveTrueOrderByCreatedAtDesc(userId);
        List<MemberGoal> weightGoals = activeGoals.stream()
                .filter(g -> g.getGoalType() == MemberGoal.GoalType.WEIGHT)
                .collect(Collectors.toList());
        if (!weightGoals.isEmpty()) {
            summary.setGoalWeight(weightGoals.get(0).getTargetValue());
        }

        calculateWorkoutStats(userId, summary);

        summary.setTotalProgressEntries((int) progressMetricRepository.countByUserUserId(userId));
        summary.setTotalPersonalBests((int) personalBestRepository.countByUserUserId(userId));
        summary.setActiveGoals((int) memberGoalRepository.countByUserUserIdAndIsActiveTrue(userId));
        summary.setCompletedGoals((int) memberGoalRepository.countByUserUserIdAndCompletedAtIsNotNull(userId));

        List<ProgressMetric> recentMetrics = progressMetricRepository.findLatestEntriesByUserId(userId, 10);
        summary.setRecentMetrics(recentMetrics.stream().map(this::toProgressMetricDTO).collect(Collectors.toList()));

        Optional<BodyMeasurement> latestMeasurement = bodyMeasurementRepository.findTopByUserUserIdOrderByRecordDateDesc(userId);
        Optional<BodyMeasurement> firstMeasurement = bodyMeasurementRepository.findTopByUserUserIdOrderByRecordDateAsc(userId);
        List<BodyMeasurementDTO> measurements = new ArrayList<>();
        latestMeasurement.ifPresent(m -> measurements.add(toBodyMeasurementDTO(m)));
        firstMeasurement.ifPresent(m -> {
            if (latestMeasurement.isEmpty() || !m.getId().equals(latestMeasurement.get().getId())) {
                measurements.add(toBodyMeasurementDTO(m));
            }
        });
        summary.setRecentMeasurements(measurements);

        List<PersonalBest> topPBs = personalBestRepository.findTopPersonalBests(userId, 5);
        summary.setTopPersonalBests(topPBs.stream().map(this::toPersonalBestDTO).collect(Collectors.toList()));

        summary.setActiveGoalsList(activeGoals.stream().map(this::toMemberGoalDTO).collect(Collectors.toList()));

        LocalDate weekAgo = LocalDate.now().minusDays(7);
        List<WorkoutLog> recentWorkouts = workoutLogRepository.findRecentWorkouts(userId, weekAgo);
        summary.setRecentWorkouts(recentWorkouts.stream().map(this::toWorkoutLogDTO).collect(Collectors.toList()));

        return summary;
    }

    private void calculateWorkoutStats(Long userId, ProgressSummaryDTO summary) {
        long totalWorkouts = workoutLogRepository.countByUserUserId(userId);
        summary.setTotalWorkouts((int) totalWorkouts);

        LocalDate weekAgo = LocalDate.now().minusDays(7);
        LocalDate monthAgo = LocalDate.now().minusDays(30);

        List<WorkoutLog> weekWorkouts = workoutLogRepository.findRecentWorkouts(userId, weekAgo);
        List<WorkoutLog> monthWorkouts = workoutLogRepository.findRecentWorkouts(userId, monthAgo);

        summary.setWorkoutsThisWeek(weekWorkouts.size());
        summary.setWorkoutsThisMonth(monthWorkouts.size());

        int totalCalories = weekWorkouts.stream()
                .filter(w -> w.getCaloriesBurned() != null)
                .mapToInt(WorkoutLog::getCaloriesBurned)
                .sum();
        summary.setTotalCaloriesBurned(totalCalories);

        double avgDuration = monthWorkouts.stream()
                .filter(w -> w.getDurationMinutes() != null)
                .mapToInt(WorkoutLog::getDurationMinutes)
                .average()
                .orElse(0);
        summary.setAvgWorkoutDuration((int) Math.round(avgDuration));

        if (weekWorkouts.size() > 0) {
            summary.setConsistencyRate((weekWorkouts.size() / 7.0) * 100);
        } else {
            summary.setConsistencyRate(0.0);
        }

        int[] streaks = calculateStreaks(userId);
        summary.setCurrentStreak(streaks[0]);
        summary.setLongestStreak(streaks[1]);
    }

    private int[] calculateStreaks(Long userId) {
        List<LocalDate> workoutDates = workoutLogRepository.findWorkoutDatesByUserId(userId);
        if (workoutDates.isEmpty()) {
            return new int[]{0, 0};
        }

        Set<LocalDate> dateSet = new HashSet<>(workoutDates);
        int currentStreak = 0;
        int longestStreak = 0;
        int tempStreak = 0;

        LocalDate today = LocalDate.now();
        LocalDate checkDate = today;
        
        while (dateSet.contains(checkDate) || dateSet.contains(checkDate.minusDays(1))) {
            if (dateSet.contains(checkDate)) {
                currentStreak++;
            }
            checkDate = checkDate.minusDays(1);
            if (!dateSet.contains(checkDate) && !dateSet.contains(checkDate.minusDays(1))) {
                break;
            }
        }

        Collections.sort(workoutDates);
        for (int i = 0; i < workoutDates.size(); i++) {
            if (i == 0) {
                tempStreak = 1;
            } else {
                long daysBetween = ChronoUnit.DAYS.between(workoutDates.get(i - 1), workoutDates.get(i));
                if (daysBetween <= 1) {
                    tempStreak++;
                } else {
                    tempStreak = 1;
                }
            }
            longestStreak = Math.max(longestStreak, tempStreak);
        }

        return new int[]{currentStreak, longestStreak};
    }

    private String calculateBmiCategory(BigDecimal bmi) {
        double bmiValue = bmi.doubleValue();
        if (bmiValue < 18.5) return "Underweight";
        if (bmiValue < 25) return "Normal";
        if (bmiValue < 30) return "Overweight";
        return "Obese";
    }

    public List<ProgressMetricDTO> getProgressHistory(Long userId, String timeRange) {
        LocalDate startDate = calculateStartDate(timeRange);
        List<ProgressMetric> metrics;
        if (startDate != null) {
            metrics = progressMetricRepository.findByUserIdAndDateRange(userId, startDate);
        } else {
            metrics = progressMetricRepository.findByUserUserIdOrderByRecordDateAsc(userId);
        }
        return metrics.stream().map(this::toProgressMetricDTO).collect(Collectors.toList());
    }

    public List<BodyMeasurementDTO> getMeasurementHistory(Long userId, String timeRange) {
        LocalDate startDate = calculateStartDate(timeRange);
        List<BodyMeasurement> measurements;
        if (startDate != null) {
            measurements = bodyMeasurementRepository.findByUserIdAndDateRange(userId, startDate);
        } else {
            measurements = bodyMeasurementRepository.findByUserUserIdOrderByRecordDateAsc(userId);
        }
        return measurements.stream().map(this::toBodyMeasurementDTO).collect(Collectors.toList());
    }

    private LocalDate calculateStartDate(String timeRange) {
        if (timeRange == null) return null;
        return switch (timeRange.toUpperCase()) {
            case "7D" -> LocalDate.now().minusDays(7);
            case "30D" -> LocalDate.now().minusDays(30);
            case "90D" -> LocalDate.now().minusDays(90);
            case "1Y" -> LocalDate.now().minusYears(1);
            default -> null;
        };
    }

    @Transactional
    public ProgressMetricDTO createProgressMetric(Long userId, ProgressMetricDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ProgressMetric metric = ProgressMetric.builder()
                .user(user)
                .recordDate(dto.getRecordDate() != null ? dto.getRecordDate() : LocalDate.now())
                .weight(dto.getWeight())
                .bodyFat(dto.getBodyFat())
                .muscleMass(dto.getMuscleMass())
                .bmi(calculateBmi(dto.getWeight(), user))
                .chest(dto.getChest())
                .waist(dto.getWaist())
                .arms(dto.getArms())
                .legs(dto.getLegs())
                .hips(dto.getHips())
                .shoulders(dto.getShoulders())
                .notes(dto.getNotes())
                .build();

        ProgressMetric saved = progressMetricRepository.save(metric);
        
        updateGoalsProgress(userId, dto);
        
        return toProgressMetricDTO(saved);
    }

    private BigDecimal calculateBmi(BigDecimal weight, User user) {
        if (weight == null) return null;
        BigDecimal height = user.getHeight();
        if (height == null || height.compareTo(BigDecimal.ZERO) <= 0) return null;
        BigDecimal heightInMeters = height.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal heightSquared = heightInMeters.multiply(heightInMeters);
        return weight.divide(heightSquared, 2, RoundingMode.HALF_UP);
    }

    private void updateGoalsProgress(Long userId, ProgressMetricDTO dto) {
        List<MemberGoal> activeGoals = memberGoalRepository.findByUserUserIdAndIsActiveTrueOrderByCreatedAtDesc(userId);
        
        for (MemberGoal goal : activeGoals) {
            boolean updated = false;
            switch (goal.getGoalType()) {
                case WEIGHT:
                    if (dto.getWeight() != null) {
                        goal.setCurrentValue(dto.getWeight());
                        updated = true;
                    }
                    break;
                case MUSCLE:
                    if (dto.getMuscleMass() != null) {
                        goal.setCurrentValue(dto.getMuscleMass());
                        updated = true;
                    }
                    break;
                case BODY_FAT:
                    if (dto.getBodyFat() != null) {
                        goal.setCurrentValue(dto.getBodyFat());
                        updated = true;
                    }
                    break;
                default:
                    break;
            }
            
            if (updated) {
                checkGoalCompletion(goal);
                memberGoalRepository.save(goal);
            }
        }
    }

    private void checkGoalCompletion(MemberGoal goal) {
        if (goal.getCurrentValue() == null || goal.getTargetValue() == null) return;
        
        boolean completed = false;
        if (goal.getGoalType() == MemberGoal.GoalType.WEIGHT || 
            goal.getGoalType() == MemberGoal.GoalType.BODY_FAT) {
            if (goal.getStartValue() != null && goal.getStartValue().compareTo(goal.getTargetValue()) > 0) {
                completed = goal.getCurrentValue().compareTo(goal.getTargetValue()) <= 0;
            } else {
                completed = goal.getCurrentValue().compareTo(goal.getTargetValue()) >= 0;
            }
        } else {
            completed = goal.getCurrentValue().compareTo(goal.getTargetValue()) >= 0;
        }
        
        if (completed && goal.getCompletedAt() == null) {
            goal.setCompletedAt(java.time.LocalDateTime.now());
            goal.setIsActive(false);
        }
    }

    @Transactional
    public ProgressMetricDTO updateProgressMetric(Long userId, Long metricId, ProgressMetricDTO dto) {
        ProgressMetric metric = progressMetricRepository.findById(metricId)
                .orElseThrow(() -> new RuntimeException("Progress metric not found"));

        if (!metric.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized to update this metric");
        }

        if (dto.getWeight() != null) metric.setWeight(dto.getWeight());
        if (dto.getBodyFat() != null) metric.setBodyFat(dto.getBodyFat());
        if (dto.getMuscleMass() != null) metric.setMuscleMass(dto.getMuscleMass());
        if (dto.getChest() != null) metric.setChest(dto.getChest());
        if (dto.getWaist() != null) metric.setWaist(dto.getWaist());
        if (dto.getArms() != null) metric.setArms(dto.getArms());
        if (dto.getLegs() != null) metric.setLegs(dto.getLegs());
        if (dto.getHips() != null) metric.setHips(dto.getHips());
        if (dto.getShoulders() != null) metric.setShoulders(dto.getShoulders());
        if (dto.getNotes() != null) metric.setNotes(dto.getNotes());
        if (dto.getWeight() != null) {
            metric.setBmi(calculateBmi(dto.getWeight(), metric.getUser()));
        }

        ProgressMetric saved = progressMetricRepository.save(metric);
        return toProgressMetricDTO(saved);
    }

    @Transactional
    public void deleteProgressMetric(Long userId, Long metricId) {
        ProgressMetric metric = progressMetricRepository.findById(metricId)
                .orElseThrow(() -> new RuntimeException("Progress metric not found"));

        if (!metric.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this metric");
        }

        progressMetricRepository.delete(metric);
    }

    @Transactional
    public BodyMeasurementDTO createBodyMeasurement(Long userId, BodyMeasurementDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BodyMeasurement measurement = BodyMeasurement.builder()
                .user(user)
                .recordDate(dto.getRecordDate() != null ? dto.getRecordDate() : LocalDate.now())
                .chest(dto.getChest())
                .waist(dto.getWaist())
                .hips(dto.getHips())
                .arms(dto.getArms())
                .legs(dto.getLegs())
                .shoulders(dto.getShoulders())
                .neck(dto.getNeck())
                .calves(dto.getCalves())
                .notes(dto.getNotes())
                .build();

        BodyMeasurement saved = bodyMeasurementRepository.save(measurement);
        return toBodyMeasurementDTO(saved);
    }

    @Transactional
    public BodyMeasurementDTO updateBodyMeasurement(Long userId, Long measurementId, BodyMeasurementDTO dto) {
        BodyMeasurement measurement = bodyMeasurementRepository.findById(measurementId)
                .orElseThrow(() -> new RuntimeException("Body measurement not found"));

        if (!measurement.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized to update this measurement");
        }

        if (dto.getChest() != null) measurement.setChest(dto.getChest());
        if (dto.getWaist() != null) measurement.setWaist(dto.getWaist());
        if (dto.getHips() != null) measurement.setHips(dto.getHips());
        if (dto.getArms() != null) measurement.setArms(dto.getArms());
        if (dto.getLegs() != null) measurement.setLegs(dto.getLegs());
        if (dto.getShoulders() != null) measurement.setShoulders(dto.getShoulders());
        if (dto.getNeck() != null) measurement.setNeck(dto.getNeck());
        if (dto.getCalves() != null) measurement.setCalves(dto.getCalves());
        if (dto.getNotes() != null) measurement.setNotes(dto.getNotes());

        BodyMeasurement saved = bodyMeasurementRepository.save(measurement);
        return toBodyMeasurementDTO(saved);
    }

    @Transactional
    public void deleteBodyMeasurement(Long userId, Long measurementId) {
        BodyMeasurement measurement = bodyMeasurementRepository.findById(measurementId)
                .orElseThrow(() -> new RuntimeException("Body measurement not found"));

        if (!measurement.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this measurement");
        }

        bodyMeasurementRepository.delete(measurement);
    }

    public List<MemberGoalDTO> getGoals(Long userId) {
        List<MemberGoal> goals = memberGoalRepository.findByUserUserIdOrderByCreatedAtDesc(userId);
        return goals.stream().map(this::toMemberGoalDTO).collect(Collectors.toList());
    }

    @Transactional
    public MemberGoalDTO createGoal(Long userId, MemberGoalDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MemberGoal goal = MemberGoal.builder()
                .user(user)
                .title(dto.getTitle())
                .goalType(MemberGoal.GoalType.valueOf(dto.getGoalType().toUpperCase()))
                .startValue(dto.getStartValue() != null ? dto.getStartValue() : dto.getCurrentValue())
                .currentValue(dto.getCurrentValue())
                .targetValue(dto.getTargetValue())
                .unit(dto.getUnit())
                .startDate(dto.getStartDate() != null ? dto.getStartDate() : LocalDate.now())
                .targetDate(dto.getTargetDate())
                .weeklyTarget(dto.getWeeklyTarget())
                .isActive(true)
                .build();

        MemberGoal saved = memberGoalRepository.save(goal);
        return toMemberGoalDTO(saved);
    }

    @Transactional
    public MemberGoalDTO updateGoal(Long userId, Long goalId, MemberGoalDTO dto) {
        MemberGoal goal = memberGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!goal.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized to update this goal");
        }

        if (dto.getTitle() != null) goal.setTitle(dto.getTitle());
        if (dto.getCurrentValue() != null) goal.setCurrentValue(dto.getCurrentValue());
        if (dto.getTargetValue() != null) goal.setTargetValue(dto.getTargetValue());
        if (dto.getUnit() != null) goal.setUnit(dto.getUnit());
        if (dto.getTargetDate() != null) goal.setTargetDate(dto.getTargetDate());
        if (dto.getWeeklyTarget() != null) goal.setWeeklyTarget(dto.getWeeklyTarget());
        if (dto.getIsActive() != null) goal.setIsActive(dto.getIsActive());

        checkGoalCompletion(goal);
        
        MemberGoal saved = memberGoalRepository.save(goal);
        return toMemberGoalDTO(saved);
    }

    @Transactional
    public void deleteGoal(Long userId, Long goalId) {
        MemberGoal goal = memberGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!goal.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this goal");
        }

        memberGoalRepository.delete(goal);
    }

    public List<PersonalBestDTO> getPersonalBests(Long userId) {
        List<PersonalBest> pbs = personalBestRepository.findByUserUserIdOrderByRecordDateDesc(userId);
        return pbs.stream().map(this::toPersonalBestDTO).collect(Collectors.toList());
    }

    @Transactional
    public PersonalBestDTO createOrUpdatePersonalBest(Long userId, PersonalBestDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<PersonalBest> existingPB = personalBestRepository
                .findByUserUserIdAndExerciseIgnoreCase(userId, dto.getExercise());

        PersonalBest pb;
        if (existingPB.isPresent()) {
            pb = existingPB.get();
            if (dto.getWeightValue().compareTo(pb.getWeightValue()) > 0) {
                pb.setPreviousBest(pb.getWeightValue());
                pb.setWeightValue(dto.getWeightValue());
                pb.setReps(dto.getReps());
                pb.setRecordDate(dto.getRecordDate() != null ? dto.getRecordDate() : LocalDate.now());
                pb.setNotes(dto.getNotes());
            }
        } else {
            pb = PersonalBest.builder()
                    .user(user)
                    .exercise(dto.getExercise())
                    .weightValue(dto.getWeightValue())
                    .reps(dto.getReps())
                    .unit(dto.getUnit() != null ? dto.getUnit() : "lbs")
                    .recordDate(dto.getRecordDate() != null ? dto.getRecordDate() : LocalDate.now())
                    .category(dto.getCategory() != null ? 
                            PersonalBest.ExerciseCategory.valueOf(dto.getCategory().toUpperCase()) : null)
                    .notes(dto.getNotes())
                    .build();
        }

        PersonalBest saved = personalBestRepository.save(pb);
        return toPersonalBestDTO(saved);
    }

    @Transactional
    public void deletePersonalBest(Long userId, Long pbId) {
        PersonalBest pb = personalBestRepository.findById(pbId)
                .orElseThrow(() -> new RuntimeException("Personal best not found"));

        if (!pb.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this personal best");
        }

        personalBestRepository.delete(pb);
    }

    public List<WorkoutLogDTO> getWorkoutLogs(Long userId, String timeRange) {
        LocalDate startDate = calculateStartDate(timeRange);
        List<WorkoutLog> logs;
        if (startDate != null) {
            logs = workoutLogRepository.findRecentWorkouts(userId, startDate);
        } else {
            logs = workoutLogRepository.findByUserUserIdOrderByWorkoutDateDesc(userId);
        }
        return logs.stream().map(this::toWorkoutLogDTO).collect(Collectors.toList());
    }

    @Transactional
    public WorkoutLogDTO createWorkoutLog(Long userId, WorkoutLogDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        WorkoutLog log = WorkoutLog.builder()
                .user(user)
                .workoutDate(dto.getWorkoutDate() != null ? dto.getWorkoutDate() : LocalDate.now())
                .durationMinutes(dto.getDurationMinutes())
                .workoutType(dto.getWorkoutType())
                .caloriesBurned(dto.getCaloriesBurned())
                .exercisesCount(dto.getExercisesCount())
                .intensityLevel(dto.getIntensityLevel())
                .notes(dto.getNotes())
                .build();

        WorkoutLog saved = workoutLogRepository.save(log);
        return toWorkoutLogDTO(saved);
    }

    @Transactional
    public void deleteWorkoutLog(Long userId, Long logId) {
        WorkoutLog log = workoutLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("Workout log not found"));

        if (!log.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this workout log");
        }

        workoutLogRepository.delete(log);
    }

    private ProgressMetricDTO toProgressMetricDTO(ProgressMetric metric) {
        return ProgressMetricDTO.builder()
                .id(metric.getId())
                .userId(metric.getUser().getUserId())
                .recordDate(metric.getRecordDate())
                .weight(metric.getWeight())
                .bodyFat(metric.getBodyFat())
                .muscleMass(metric.getMuscleMass())
                .bmi(metric.getBmi())
                .chest(metric.getChest())
                .waist(metric.getWaist())
                .arms(metric.getArms())
                .legs(metric.getLegs())
                .hips(metric.getHips())
                .shoulders(metric.getShoulders())
                .notes(metric.getNotes())
                .createdAt(metric.getCreatedAt())
                .build();
    }

    private BodyMeasurementDTO toBodyMeasurementDTO(BodyMeasurement measurement) {
        return BodyMeasurementDTO.builder()
                .id(measurement.getId())
                .userId(measurement.getUser().getUserId())
                .recordDate(measurement.getRecordDate())
                .chest(measurement.getChest())
                .waist(measurement.getWaist())
                .hips(measurement.getHips())
                .arms(measurement.getArms())
                .legs(measurement.getLegs())
                .shoulders(measurement.getShoulders())
                .neck(measurement.getNeck())
                .calves(measurement.getCalves())
                .notes(measurement.getNotes())
                .createdAt(measurement.getCreatedAt())
                .build();
    }

    private MemberGoalDTO toMemberGoalDTO(MemberGoal goal) {
        return MemberGoalDTO.builder()
                .id(goal.getId())
                .userId(goal.getUser().getUserId())
                .title(goal.getTitle())
                .goalType(goal.getGoalType().toString())
                .startValue(goal.getStartValue())
                .currentValue(goal.getCurrentValue())
                .targetValue(goal.getTargetValue())
                .unit(goal.getUnit())
                .startDate(goal.getStartDate())
                .targetDate(goal.getTargetDate())
                .weeklyTarget(goal.getWeeklyTarget())
                .isActive(goal.getIsActive())
                .completedAt(goal.getCompletedAt())
                .createdAt(goal.getCreatedAt())
                .build();
    }

    private PersonalBestDTO toPersonalBestDTO(PersonalBest pb) {
        return PersonalBestDTO.builder()
                .id(pb.getId())
                .userId(pb.getUser().getUserId())
                .exercise(pb.getExercise())
                .weightValue(pb.getWeightValue())
                .reps(pb.getReps())
                .unit(pb.getUnit())
                .recordDate(pb.getRecordDate())
                .previousBest(pb.getPreviousBest())
                .category(pb.getCategory() != null ? pb.getCategory().toString() : null)
                .notes(pb.getNotes())
                .createdAt(pb.getCreatedAt())
                .build();
    }

    private WorkoutLogDTO toWorkoutLogDTO(WorkoutLog log) {
        return WorkoutLogDTO.builder()
                .id(log.getId())
                .userId(log.getUser().getUserId())
                .workoutDate(log.getWorkoutDate())
                .durationMinutes(log.getDurationMinutes())
                .workoutType(log.getWorkoutType())
                .caloriesBurned(log.getCaloriesBurned())
                .exercisesCount(log.getExercisesCount())
                .intensityLevel(log.getIntensityLevel())
                .notes(log.getNotes())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
