package com.gym.management.config;

import com.gym.management.model.MembershipPackage;
import com.gym.management.repository.MembershipPackageRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataMigrationConfig {

    @Bean
    public CommandLineRunner migratePlanData(MembershipPackageRepository repository) {
        return args -> {
            List<MembershipPackage> packages = repository.findAll();
            for (MembershipPackage pkg : packages) {
                boolean changed = false;
                String originalName = pkg.getPackageName();
                String normalizedName = originalName;

                // Initialize durationMonths if null
                if (pkg.getDurationMonths() == null) {
                    if (pkg.getDurationDays() == 365) {
                        pkg.setDurationMonths(12);
                    } else {
                        pkg.setDurationMonths(1); // Default to 1 month for 30 days
                    }
                    changed = true;
                }

                // Clean package name (remove "Monthly" / "Annual")
                // Current names: "Basic Monthly", "Standard Monthly", "Annual Basic"
                if (originalName.contains(" Monthly")) {
                    normalizedName = originalName.replace(" Monthly", "");
                } else if (originalName.contains("Annual ")) {
                    normalizedName = originalName.replace("Annual ", "");
                }

                if (!normalizedName.equals(originalName)) {
                    boolean nameConflict = repository.existsByPackageNameAndDurationDaysAndPackageIdNot(
                            normalizedName,
                            pkg.getDurationDays(),
                            pkg.getPackageId());

                    if (nameConflict) {
                        System.out.println(
                                "Skipping package rename for '" + originalName + "' -> '" + normalizedName
                                        + "' because that package name + duration already exists.");
                    } else {
                        pkg.setPackageName(normalizedName);
                        changed = true;
                    }
                }

                if (changed) {
                    repository.save(pkg);
                    System.out.println(
                            "Migrated package: " + pkg.getPackageName() + ", Months: " + pkg.getDurationMonths());
                }
            }
        };
    }
}
