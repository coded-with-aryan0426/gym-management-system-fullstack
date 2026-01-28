package com.gym.management.config;

import com.gym.management.model.*;
import com.gym.management.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
@Order(4)
public class MemberProgressDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProgressMetricRepository progressMetricRepository;
    private final BodyMeasurementRepository bodyMeasurementRepository;
    private final MemberGoalRepository memberGoalRepository;
    private final PersonalBestRepository personalBestRepository;
    private final WorkoutLogRepository workoutLogRepository;

    private final Random random = new Random(42);

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        List<User> members = userRepository.findByRoleName("MEMBER");
        
        if (members.isEmpty()) {
            User devMember = userRepository.findByEmail("member@dev.com").orElse(null);
            if (devMember != null) {
                members = List.of(devMember);
            } else {
                log.warn("⚠️ No members found, skipping member progress data seeding");
                return;
            }
        }

        log.info("🌱 Found {} members to seed progress data for", members.size());

        for (User member : members) {
            if (progressMetricRepository.countByUserUserId(member.getUserId()) > 5) {
                log.info("📊 Progress data already seeded for member: {}", member.getFullName());
                continue;
            }

            log.info("🌱 Seeding progress data for member: {} ({})", member.getFullName(), member.getEmail());

            seedProgressMetrics(member);
            seedBodyMeasurements(member);
            seedMemberGoals(member);
            seedPersonalBests(member);
            seedWorkoutLogs(member);
        }

        log.info("✅ Member Progress data seeded for all members!");
    }

    private void seedProgressMetrics(User member) {
        List<ProgressMetric> metrics = new ArrayList<>();
        LocalDate today = LocalDate.now();
        
        BigDecimal startWeight = BigDecimal.valueOf(85.0);
        BigDecimal startBodyFat = BigDecimal.valueOf(22.0);
        BigDecimal startMuscleMass = BigDecimal.valueOf(58.0);
        
        BigDecimal currentWeight = startWeight;
        BigDecimal currentBodyFat = startBodyFat;
        BigDecimal currentMuscleMass = startMuscleMass;
        
        for (int week = 12; week >= 0; week--) {
            LocalDate recordDate = today.minusWeeks(week);
            
            double weeklyWeightLoss = 0.4 + random.nextDouble() * 0.4;
            double weeklyMuscleGain = 0.2 + random.nextDouble() * 0.2;
            double weeklyFatLoss = 0.3 + random.nextDouble() * 0.2;
            
            currentWeight = currentWeight.subtract(BigDecimal.valueOf(weeklyWeightLoss));
            currentMuscleMass = currentMuscleMass.add(BigDecimal.valueOf(weeklyMuscleGain));
            currentBodyFat = currentBodyFat.subtract(BigDecimal.valueOf(weeklyFatLoss));
            
            if (currentBodyFat.doubleValue() < 14) {
                currentBodyFat = BigDecimal.valueOf(14 + random.nextDouble() * 0.5);
            }
            
            BigDecimal height = member.getHeight() != null ? member.getHeight() : BigDecimal.valueOf(175);
            BigDecimal heightInMeters = height.divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP);
            BigDecimal bmi = currentWeight.divide(heightInMeters.multiply(heightInMeters), 2, java.math.RoundingMode.HALF_UP);
            
            ProgressMetric metric = ProgressMetric.builder()
                    .user(member)
                    .recordDate(recordDate)
                    .weight(currentWeight.setScale(2, java.math.RoundingMode.HALF_UP))
                    .bodyFat(currentBodyFat.setScale(2, java.math.RoundingMode.HALF_UP))
                    .muscleMass(currentMuscleMass.setScale(2, java.math.RoundingMode.HALF_UP))
                    .bmi(bmi)
                    .notes(generateProgressNote(week))
                    .build();
            
            metrics.add(metric);
        }
        
        progressMetricRepository.saveAll(metrics);
        log.info("📊 Created {} progress metrics", metrics.size());
    }

    private void seedBodyMeasurements(User member) {
        List<BodyMeasurement> measurements = new ArrayList<>();
        LocalDate today = LocalDate.now();
        
        BigDecimal chest = BigDecimal.valueOf(102.0);
        BigDecimal waist = BigDecimal.valueOf(88.0);
        BigDecimal hips = BigDecimal.valueOf(98.0);
        BigDecimal arms = BigDecimal.valueOf(35.0);
        BigDecimal legs = BigDecimal.valueOf(58.0);
        BigDecimal shoulders = BigDecimal.valueOf(115.0);
        
        for (int week = 12; week >= 0; week -= 2) {
            LocalDate recordDate = today.minusWeeks(week);
            
            chest = chest.add(BigDecimal.valueOf(0.3 + random.nextDouble() * 0.3));
            waist = waist.subtract(BigDecimal.valueOf(0.5 + random.nextDouble() * 0.4));
            hips = hips.subtract(BigDecimal.valueOf(0.3 + random.nextDouble() * 0.2));
            arms = arms.add(BigDecimal.valueOf(0.15 + random.nextDouble() * 0.15));
            legs = legs.add(BigDecimal.valueOf(0.2 + random.nextDouble() * 0.15));
            shoulders = shoulders.add(BigDecimal.valueOf(0.3 + random.nextDouble() * 0.3));
            
            BodyMeasurement measurement = BodyMeasurement.builder()
                    .user(member)
                    .recordDate(recordDate)
                    .chest(chest.setScale(2, java.math.RoundingMode.HALF_UP))
                    .waist(waist.setScale(2, java.math.RoundingMode.HALF_UP))
                    .hips(hips.setScale(2, java.math.RoundingMode.HALF_UP))
                    .arms(arms.setScale(2, java.math.RoundingMode.HALF_UP))
                    .legs(legs.setScale(2, java.math.RoundingMode.HALF_UP))
                    .shoulders(shoulders.setScale(2, java.math.RoundingMode.HALF_UP))
                    .notes("Bi-weekly measurement check")
                    .build();
            
            measurements.add(measurement);
        }
        
        bodyMeasurementRepository.saveAll(measurements);
        log.info("📏 Created {} body measurements", measurements.size());
    }

    private void seedMemberGoals(User member) {
        List<MemberGoal> goals = new ArrayList<>();
        LocalDate today = LocalDate.now();
        
        MemberGoal weightGoal = MemberGoal.builder()
                .user(member)
                .title("Reach 75kg")
                .goalType(MemberGoal.GoalType.WEIGHT)
                .startValue(BigDecimal.valueOf(85.0))
                .currentValue(BigDecimal.valueOf(78.0))
                .targetValue(BigDecimal.valueOf(75.0))
                .unit("kg")
                .startDate(today.minusWeeks(12))
                .targetDate(today.plusWeeks(6))
                .weeklyTarget(BigDecimal.valueOf(0.5))
                .isActive(true)
                .build();
        goals.add(weightGoal);
        
        MemberGoal muscleGoal = MemberGoal.builder()
                .user(member)
                .title("Build 5kg Muscle")
                .goalType(MemberGoal.GoalType.MUSCLE)
                .startValue(BigDecimal.valueOf(58.0))
                .currentValue(BigDecimal.valueOf(62.0))
                .targetValue(BigDecimal.valueOf(63.0))
                .unit("kg")
                .startDate(today.minusWeeks(12))
                .targetDate(today.plusWeeks(4))
                .weeklyTarget(BigDecimal.valueOf(0.25))
                .isActive(true)
                .build();
        goals.add(muscleGoal);
        
        MemberGoal bodyFatGoal = MemberGoal.builder()
                .user(member)
                .title("Reach 15% Body Fat")
                .goalType(MemberGoal.GoalType.BODY_FAT)
                .startValue(BigDecimal.valueOf(22.0))
                .currentValue(BigDecimal.valueOf(18.0))
                .targetValue(BigDecimal.valueOf(15.0))
                .unit("%")
                .startDate(today.minusWeeks(12))
                .targetDate(today.plusWeeks(8))
                .weeklyTarget(BigDecimal.valueOf(0.3))
                .isActive(true)
                .build();
        goals.add(bodyFatGoal);
        
        memberGoalRepository.saveAll(goals);
        log.info("🎯 Created {} member goals", goals.size());
    }

    private void seedPersonalBests(User member) {
        List<PersonalBest> pbs = new ArrayList<>();
        LocalDate today = LocalDate.now();
        
        pbs.add(PersonalBest.builder()
                .user(member)
                .exercise("Bench Press")
                .weightValue(BigDecimal.valueOf(185))
                .reps(5)
                .unit("lbs")
                .recordDate(today.minusDays(3))
                .previousBest(BigDecimal.valueOf(175))
                .category(PersonalBest.ExerciseCategory.PUSH)
                .notes("New PR! Felt strong today")
                .build());
        
        pbs.add(PersonalBest.builder()
                .user(member)
                .exercise("Squat")
                .weightValue(BigDecimal.valueOf(275))
                .reps(5)
                .unit("lbs")
                .recordDate(today.minusDays(5))
                .previousBest(BigDecimal.valueOf(265))
                .category(PersonalBest.ExerciseCategory.LEGS)
                .notes("Deep squat, good form")
                .build());
        
        pbs.add(PersonalBest.builder()
                .user(member)
                .exercise("Deadlift")
                .weightValue(BigDecimal.valueOf(315))
                .reps(3)
                .unit("lbs")
                .recordDate(today.minusDays(7))
                .previousBest(BigDecimal.valueOf(295))
                .category(PersonalBest.ExerciseCategory.PULL)
                .notes("Conventional grip")
                .build());
        
        pbs.add(PersonalBest.builder()
                .user(member)
                .exercise("Pull-ups")
                .weightValue(BigDecimal.valueOf(25))
                .reps(8)
                .unit("lbs")
                .recordDate(today.minusDays(10))
                .previousBest(BigDecimal.valueOf(15))
                .category(PersonalBest.ExerciseCategory.PULL)
                .notes("Weighted pull-ups")
                .build());
        
        pbs.add(PersonalBest.builder()
                .user(member)
                .exercise("Overhead Press")
                .weightValue(BigDecimal.valueOf(135))
                .reps(5)
                .unit("lbs")
                .recordDate(today.minusDays(12))
                .previousBest(BigDecimal.valueOf(125))
                .category(PersonalBest.ExerciseCategory.PUSH)
                .notes("Standing military press")
                .build());
        
        personalBestRepository.saveAll(pbs);
        log.info("🏆 Created {} personal bests", pbs.size());
    }

    private void seedWorkoutLogs(User member) {
        List<WorkoutLog> logs = new ArrayList<>();
        LocalDate today = LocalDate.now();
        String[] workoutTypes = {"Strength", "Cardio", "HIIT", "Upper Body", "Lower Body", "Full Body", "Push", "Pull"};
        
        for (int day = 35; day >= 0; day--) {
            LocalDate workoutDate = today.minusDays(day);
            int dayOfWeek = workoutDate.getDayOfWeek().getValue();
            
            if (dayOfWeek == 7) continue;
            if (dayOfWeek == 3 && random.nextFloat() > 0.3) continue;
            if (random.nextFloat() > 0.85) continue;
            
            String workoutType = workoutTypes[random.nextInt(workoutTypes.length)];
            int duration = 45 + random.nextInt(30);
            int calories = 300 + random.nextInt(400);
            int exercises = 5 + random.nextInt(5);
            int intensity = 2 + random.nextInt(3);
            
            WorkoutLog log = WorkoutLog.builder()
                    .user(member)
                    .workoutDate(workoutDate)
                    .durationMinutes(duration)
                    .workoutType(workoutType)
                    .caloriesBurned(calories)
                    .exercisesCount(exercises)
                    .intensityLevel(intensity)
                    .notes(generateWorkoutNote(workoutType))
                    .build();
            
            logs.add(log);
        }
        
        workoutLogRepository.saveAll(logs);
        log.info("💪 Created {} workout logs", logs.size());
    }

    private String generateProgressNote(int weeksAgo) {
        if (weeksAgo > 10) return "Starting measurements recorded";
        if (weeksAgo > 8) return "Good progress, staying consistent";
        if (weeksAgo > 6) return "Diet adjustments helping with fat loss";
        if (weeksAgo > 4) return "Hitting PRs in the gym regularly";
        if (weeksAgo > 2) return "Feeling stronger every week";
        return "Approaching goal, maintaining discipline";
    }

    private String generateWorkoutNote(String type) {
        switch (type) {
            case "Strength": return "Heavy compound lifts - progressive overload";
            case "Cardio": return "30 min steady state + 15 min intervals";
            case "HIIT": return "8 rounds of 40s work / 20s rest";
            case "Upper Body": return "Push/pull supersets";
            case "Lower Body": return "Squats and deadlift variations";
            case "Full Body": return "Circuit training with compound movements";
            default: return "Good session overall";
        }
    }
}
