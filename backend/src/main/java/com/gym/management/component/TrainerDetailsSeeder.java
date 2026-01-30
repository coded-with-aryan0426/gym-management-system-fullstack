package com.gym.management.component;

import com.gym.management.model.TrainerDetails;
import com.gym.management.model.User;
import com.gym.management.repository.TrainerDetailsRepository;
import com.gym.management.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Component
@Order(10) // Run after AppDataLoader
public class TrainerDetailsSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TrainerDetailsRepository trainerDetailsRepository;

    public TrainerDetailsSeeder(UserRepository userRepository, TrainerDetailsRepository trainerDetailsRepository) {
        this.userRepository = userRepository;
        this.trainerDetailsRepository = trainerDetailsRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        List<User> trainers = userRepository.findByRoleName("TRAINER");
        System.out.println("🔍 Found " + trainers.size() + " trainers. Checking for detailed profiles...");

        String[] bios = {
            "Dedicated fitness professional with a passion for helping clients reach their full potential through evidence-based training and nutrition.",
            "Certified strength and conditioning specialist focused on functional movement and long-term athletic development.",
            "Yoga and mobility expert helping members improve flexibility, reduce stress, and build sustainable healthy habits.",
            "Bodybuilding and muscle hypertrophy specialist with over 8 years of competitive experience and coaching success.",
            "Weight loss and lifestyle coach dedicated to sustainable transformations and positive mindset shifts."
        };

        String[][] skillSets = {
            {"Fat Loss", "HIIT", "Cardio Conditioning"},
            {"Muscle Building", "Powerlifting", "Hypertrophy"},
            {"Bodyweight Strength", "Barbell Training", "Functional Strength"},
            {"Cycling", "Running", "Circuit Training"},
            {"Stretching", "Injury Prevention", "Post-Op Recovery"},
            {"Vinyasa Flow", "Balance", "Flexibility"}
        };

        String[] skillCategories = {
            "Weight Loss",
            "Muscle Gain",
            "Strength Training",
            "Cardio & Endurance",
            "Rehabilitation",
            "Yoga / Mobility"
        };

        String[] specializationsList = {
            "Weight Loss,Cardio & Endurance",
            "Muscle Gain,Strength Training",
            "Strength Training,Muscle Gain",
            "Cardio & Endurance,Weight Loss",
            "Rehabilitation,Strength Training",
            "Yoga / Mobility,Rehabilitation"
        };

        Random random = new Random();

        for (int i = 0; i < trainers.size(); i++) {
            User trainer = trainers.get(i);
            TrainerDetails details = trainerDetailsRepository.findById(trainer.getUserId())
                .orElse(new TrainerDetails());
            
            if (details.getUser() == null) {
                details.setUser(trainer);
                details.setJoiningDate(LocalDate.now().minusYears(1).minusMonths(random.nextInt(12)));
            }
            
            // Only update if no skills or specializations exist, or if they are "General"
            if (details.getSkillsJson() == null || details.getSkillsJson().contains("\"category\": \"General\"") || details.getSpecializations() == null) {
                details.setBio(bios[i % bios.length]);
                details.setExperienceYears(3 + random.nextInt(10));
                details.setSpecializations(specializationsList[i % specializationsList.length]);
                
                // Construct Skills JSON
                String[] selectedSkills = skillSets[i % skillSets.length];
                String category = skillCategories[i % skillCategories.length];
                StringBuilder skillsJson = new StringBuilder("[");
                for (int j = 0; j < selectedSkills.length; j++) {
                    skillsJson.append(String.format(
                        "{\"name\": \"%s\", \"category\": \"%s\", \"level\": \"Expert\", \"isPrimary\": %b}",
                        selectedSkills[j], category, j == 0
                    ));
                    if (j < selectedSkills.length - 1) skillsJson.append(",");
                }
                skillsJson.append("]");
                details.setSkillsJson(skillsJson.toString());
                
                trainerDetailsRepository.save(details);
                System.out.println("✅ Updated details for trainer: " + trainer.getFullName());
            }
        }
    }
}
