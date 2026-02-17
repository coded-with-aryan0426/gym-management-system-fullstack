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
                String name = pkg.getPackageName();
                if (name.contains(" Monthly")) {
                    pkg.setPackageName(name.replace(" Monthly", ""));
                    changed = true;
                } else if (name.contains("Annual ")) {
                    pkg.setPackageName(name.replace("Annual ", ""));
                    changed = true;
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
