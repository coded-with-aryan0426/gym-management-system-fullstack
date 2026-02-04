package com.gym.management.component;

import com.gym.management.model.PlanFeature;
import com.gym.management.model.PlanFeature.FeatureCategory;
import com.gym.management.model.PlanVariant;
import com.gym.management.model.PlanVariant.DurationUnit;
import com.gym.management.model.TieredMembershipPlan;
import com.gym.management.model.TieredMembershipPlan.PlanCategory;
import com.gym.management.model.TieredMembershipPlan.PlanStatus;
import com.gym.management.repository.TieredMembershipPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Seeds sample tiered membership plans for testing.
 * Creates a variety of gym membership tiers with different pricing and features.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(5)
public class TieredPlanDataSeeder implements CommandLineRunner {

    private final TieredMembershipPlanRepository planRepository;

    @Override
    public void run(String... args) throws Exception {
        if (planRepository.count() > 0) {
            log.info("Tiered membership plans already exist. Skipping seed.");
            return;
        }

        log.info("Seeding tiered membership plans...");

        // 1. BASIC / STARTER Plan
        createBasicPlan();

        // 2. STANDARD Plan
        createStandardPlan();

        // 3. PREMIUM / GOLD Plan
        createPremiumPlan();

        // 4. VIP / PLATINUM Plan
        createVIPPlan();

        // 5. STUDENT Plan
        createStudentPlan();

        // 6. CORPORATE Plan
        createCorporatePlan();

        // 7. WEEKEND WARRIOR Plan
        createWeekendPlan();

        // 8. OFF-PEAK Plan
        createOffPeakPlan();

        log.info("Successfully seeded {} tiered membership plans.", planRepository.count());
    }

    // ============================================
    // PLAN CREATORS
    // ============================================

    private void createBasicPlan() {
        TieredMembershipPlan plan = new TieredMembershipPlan();
        plan.setPlanName("Basic");
        plan.setDescription("Essential gym access for fitness beginners. Perfect for those starting their fitness journey.");
        plan.setCategory(PlanCategory.STANDARD);
        plan.setPlanColor("#6B7280"); // Gray
        plan.setIconName("dumbbell");
        plan.setStatus(PlanStatus.ACTIVE);
        plan.setIsRecommended(false);
        plan.setSortOrder(1);

        // Variants
        addVariant(plan, 1, DurationUnit.MONTHS, 999.0, null, 0.0, 0, false, true, 1);
        addVariant(plan, 3, DurationUnit.MONTHS, 2699.0, 2997.0, 10.0, 0, false, true, 2);
        addVariant(plan, 6, DurationUnit.MONTHS, 4999.0, 5994.0, 17.0, 0, false, true, 3);

        // Features
        addFeature(plan, "Gym Floor Access", "Access to main gym equipment area", FeatureCategory.ACCESS, true, 1);
        addFeature(plan, "Cardio Equipment", "Treadmills, bikes, and ellipticals", FeatureCategory.EQUIPMENT, true, 2);
        addFeature(plan, "Basic Weight Training", "Access to free weights and machines", FeatureCategory.EQUIPMENT, true, 3);
        addFeature(plan, "Locker Usage", "Standard locker during visit", FeatureCategory.AMENITIES, true, 4);
        addFeature(plan, "Group Classes", "Yoga, Zumba, Aerobics", FeatureCategory.CLASSES, false, 5);
        addFeature(plan, "Swimming Pool", "Pool and wet area access", FeatureCategory.AMENITIES, false, 6);
        addFeature(plan, "Personal Training", "One-on-one sessions", FeatureCategory.SERVICES, false, 7);
        addFeature(plan, "Towel Service", "Fresh towels provided", FeatureCategory.AMENITIES, false, 8);

        planRepository.save(plan);
        log.info("Created Basic plan");
    }

    private void createStandardPlan() {
        TieredMembershipPlan plan = new TieredMembershipPlan();
        plan.setPlanName("Standard");
        plan.setDescription("Our most popular membership with full gym access and group classes included.");
        plan.setCategory(PlanCategory.STANDARD);
        plan.setPlanColor("#2563EB"); // Blue
        plan.setIconName("star");
        plan.setStatus(PlanStatus.ACTIVE);
        plan.setIsRecommended(true); // Best Value!
        plan.setSortOrder(2);

        // Variants
        addVariant(plan, 1, DurationUnit.MONTHS, 1499.0, null, 0.0, 0, false, true, 1);
        addVariant(plan, 3, DurationUnit.MONTHS, 3999.0, 4497.0, 11.0, 1, true, true, 2); // Popular!
        addVariant(plan, 6, DurationUnit.MONTHS, 7499.0, 8994.0, 17.0, 2, false, true, 3);
        addVariant(plan, 12, DurationUnit.MONTHS, 13999.0, 17988.0, 22.0, 4, false, true, 4);

        // Features
        addFeature(plan, "Full Gym Access", "24/7 access to all gym areas", FeatureCategory.ACCESS, true, 1);
        addFeature(plan, "All Cardio Equipment", "Premium cardio machines", FeatureCategory.EQUIPMENT, true, 2);
        addFeature(plan, "Weight Training Zone", "Complete weight section access", FeatureCategory.EQUIPMENT, true, 3);
        addFeature(plan, "Group Fitness Classes", "Unlimited yoga, zumba, spinning", FeatureCategory.CLASSES, true, 4);
        addFeature(plan, "Locker Room", "Personal locker with lock", FeatureCategory.AMENITIES, true, 5);
        addFeature(plan, "Fitness Assessment", "Monthly body composition check", FeatureCategory.SERVICES, true, 6);
        addFeature(plan, "Swimming Pool", "Pool and sauna access", FeatureCategory.AMENITIES, false, 7);
        addFeature(plan, "Personal Training", "PT sessions available", FeatureCategory.SERVICES, false, 8);
        addFeature(plan, "Guest Passes", "Bring friends (2/month)", FeatureCategory.PERKS, false, 9);

        planRepository.save(plan);
        log.info("Created Standard plan");
    }

    private void createPremiumPlan() {
        TieredMembershipPlan plan = new TieredMembershipPlan();
        plan.setPlanName("Gold");
        plan.setDescription("Premium membership with pool access, spa facilities, and personal training sessions.");
        plan.setCategory(PlanCategory.PREMIUM);
        plan.setPlanColor("#D97706"); // Amber/Gold
        plan.setIconName("crown");
        plan.setStatus(PlanStatus.ACTIVE);
        plan.setIsRecommended(false);
        plan.setSortOrder(3);

        // Variants
        addVariant(plan, 1, DurationUnit.MONTHS, 2499.0, null, 0.0, 2, false, true, 1);
        addVariant(plan, 3, DurationUnit.MONTHS, 6999.0, 7497.0, 7.0, 6, true, true, 2);
        addVariant(plan, 6, DurationUnit.MONTHS, 12999.0, 14994.0, 13.0, 12, false, true, 3);
        addVariant(plan, 12, DurationUnit.MONTHS, 23999.0, 29988.0, 20.0, 24, false, true, 4);

        // Features
        addFeature(plan, "Premium Gym Access", "All areas including VIP section", FeatureCategory.ACCESS, true, 1);
        addFeature(plan, "Advanced Equipment", "Latest cardio and strength machines", FeatureCategory.EQUIPMENT, true, 2);
        addFeature(plan, "Functional Training Zone", "CrossFit and functional area", FeatureCategory.EQUIPMENT, true, 3);
        addFeature(plan, "All Group Classes", "Unlimited access to all classes", FeatureCategory.CLASSES, true, 4);
        addFeature(plan, "Swimming Pool & Sauna", "Pool, steam, and sauna access", FeatureCategory.AMENITIES, true, 5);
        addFeature(plan, "Personal Training", "Included PT sessions monthly", FeatureCategory.SERVICES, true, 6);
        addFeature(plan, "Towel Service", "Fresh towels every visit", FeatureCategory.AMENITIES, true, 7);
        addFeature(plan, "Nutrition Consultation", "Diet planning session", FeatureCategory.SERVICES, true, 8);
        addFeature(plan, "Premium Locker", "Large locker with amenities", FeatureCategory.AMENITIES, true, 9);
        addFeature(plan, "Guest Passes", "4 guest passes per month", FeatureCategory.PERKS, true, 10);
        addFeature(plan, "Parking", "Free parking included", FeatureCategory.PERKS, false, 11);

        planRepository.save(plan);
        log.info("Created Gold/Premium plan");
    }

    private void createVIPPlan() {
        TieredMembershipPlan plan = new TieredMembershipPlan();
        plan.setPlanName("Platinum Elite");
        plan.setDescription("The ultimate fitness experience. All-inclusive access with dedicated trainer and exclusive perks.");
        plan.setCategory(PlanCategory.VIP);
        plan.setPlanColor("#7C3AED"); // Purple
        plan.setIconName("gem");
        plan.setStatus(PlanStatus.ACTIVE);
        plan.setIsRecommended(false);
        plan.setSortOrder(4);

        // Variants
        addVariant(plan, 1, DurationUnit.MONTHS, 4999.0, null, 0.0, 4, false, true, 1);
        addVariant(plan, 3, DurationUnit.MONTHS, 13999.0, 14997.0, 7.0, 12, false, true, 2);
        addVariant(plan, 6, DurationUnit.MONTHS, 25999.0, 29994.0, 13.0, 24, true, true, 3);
        addVariant(plan, 12, DurationUnit.MONTHS, 47999.0, 59988.0, 20.0, 48, false, true, 4);

        // Features - All inclusive
        addFeature(plan, "VIP Gym Access", "Exclusive VIP floor and all areas", FeatureCategory.ACCESS, true, 1);
        addFeature(plan, "Priority Equipment", "Reserved equipment slots", FeatureCategory.EQUIPMENT, true, 2);
        addFeature(plan, "Private Training Studio", "Access to private training area", FeatureCategory.ACCESS, true, 3);
        addFeature(plan, "Unlimited Group Classes", "Priority booking for all classes", FeatureCategory.CLASSES, true, 4);
        addFeature(plan, "Full Spa Access", "Pool, sauna, steam, jacuzzi", FeatureCategory.AMENITIES, true, 5);
        addFeature(plan, "Dedicated Personal Trainer", "Weekly PT sessions included", FeatureCategory.SERVICES, true, 6);
        addFeature(plan, "Premium Towel & Robe", "Luxury linens provided", FeatureCategory.AMENITIES, true, 7);
        addFeature(plan, "Nutrition & Diet Plans", "Customized meal planning", FeatureCategory.SERVICES, true, 8);
        addFeature(plan, "Executive Locker", "Private locker with safe", FeatureCategory.AMENITIES, true, 9);
        addFeature(plan, "Unlimited Guest Passes", "Bring unlimited guests", FeatureCategory.PERKS, true, 10);
        addFeature(plan, "Free Parking", "Reserved VIP parking spot", FeatureCategory.PERKS, true, 11);
        addFeature(plan, "Complimentary Smoothies", "Post-workout nutrition bar", FeatureCategory.PERKS, true, 12);
        addFeature(plan, "Massage Sessions", "Monthly massage included", FeatureCategory.SERVICES, true, 13);

        planRepository.save(plan);
        log.info("Created Platinum Elite/VIP plan");
    }

    private void createStudentPlan() {
        TieredMembershipPlan plan = new TieredMembershipPlan();
        plan.setPlanName("Student");
        plan.setDescription("Special discounted rates for students with valid ID. Full gym access at student-friendly prices.");
        plan.setCategory(PlanCategory.STUDENT);
        plan.setPlanColor("#10B981"); // Green
        plan.setIconName("graduation-cap");
        plan.setStatus(PlanStatus.ACTIVE);
        plan.setIsRecommended(false);
        plan.setSortOrder(5);

        // Variants - Discounted
        addVariant(plan, 1, DurationUnit.MONTHS, 699.0, 999.0, 30.0, 0, false, true, 1);
        addVariant(plan, 3, DurationUnit.MONTHS, 1899.0, 2699.0, 30.0, 0, true, true, 2);
        addVariant(plan, 6, DurationUnit.MONTHS, 3499.0, 4999.0, 30.0, 1, false, true, 3);
        addVariant(plan, 12, DurationUnit.MONTHS, 5999.0, 8999.0, 33.0, 2, false, true, 4);

        // Features
        addFeature(plan, "Full Gym Access", "All gym areas during operating hours", FeatureCategory.ACCESS, true, 1);
        addFeature(plan, "Cardio Zone", "All cardio equipment", FeatureCategory.EQUIPMENT, true, 2);
        addFeature(plan, "Weight Training", "Free weights and machines", FeatureCategory.EQUIPMENT, true, 3);
        addFeature(plan, "Group Classes", "Access to most group classes", FeatureCategory.CLASSES, true, 4);
        addFeature(plan, "Locker Room", "Standard locker access", FeatureCategory.AMENITIES, true, 5);
        addFeature(plan, "Study Lounge", "Quiet area with WiFi", FeatureCategory.AMENITIES, true, 6);
        addFeature(plan, "Swimming Pool", "Pool access", FeatureCategory.AMENITIES, false, 7);
        addFeature(plan, "Personal Training", "Discounted PT available", FeatureCategory.SERVICES, false, 8);

        planRepository.save(plan);
        log.info("Created Student plan");
    }

    private void createCorporatePlan() {
        TieredMembershipPlan plan = new TieredMembershipPlan();
        plan.setPlanName("Corporate");
        plan.setDescription("Group membership for companies. Special rates for employee wellness programs.");
        plan.setCategory(PlanCategory.CORPORATE);
        plan.setPlanColor("#0891B2"); // Cyan
        plan.setIconName("building");
        plan.setStatus(PlanStatus.ACTIVE);
        plan.setIsRecommended(false);
        plan.setSortOrder(6);

        // Variants - Per employee pricing
        addVariant(plan, 1, DurationUnit.MONTHS, 1199.0, 1499.0, 20.0, 1, false, true, 1);
        addVariant(plan, 6, DurationUnit.MONTHS, 5999.0, 8994.0, 33.0, 4, true, true, 2);
        addVariant(plan, 12, DurationUnit.MONTHS, 9999.0, 17988.0, 44.0, 8, false, true, 3);

        // Features
        addFeature(plan, "Full Facility Access", "All gym areas for employees", FeatureCategory.ACCESS, true, 1);
        addFeature(plan, "All Equipment", "Complete gym equipment access", FeatureCategory.EQUIPMENT, true, 2);
        addFeature(plan, "Group Classes", "Unlimited class access", FeatureCategory.CLASSES, true, 3);
        addFeature(plan, "Corporate Wellness Programs", "Team fitness challenges", FeatureCategory.SERVICES, true, 4);
        addFeature(plan, "Dedicated Account Manager", "Corporate liaison support", FeatureCategory.SERVICES, true, 5);
        addFeature(plan, "Group PT Sessions", "Team training available", FeatureCategory.SERVICES, true, 6);
        addFeature(plan, "Flexible Billing", "Monthly invoicing options", FeatureCategory.PERKS, true, 7);
        addFeature(plan, "Pool & Spa", "Full amenities access", FeatureCategory.AMENITIES, true, 8);
        addFeature(plan, "Branded Merchandise", "Company logo items", FeatureCategory.PERKS, false, 9);

        planRepository.save(plan);
        log.info("Created Corporate plan");
    }

    private void createWeekendPlan() {
        TieredMembershipPlan plan = new TieredMembershipPlan();
        plan.setPlanName("Weekend Warrior");
        plan.setDescription("Perfect for those who can only work out on weekends. Full access Saturday and Sunday.");
        plan.setCategory(PlanCategory.CUSTOM);
        plan.setPlanColor("#DC2626"); // Red
        plan.setIconName("calendar");
        plan.setStatus(PlanStatus.ACTIVE);
        plan.setIsRecommended(false);
        plan.setSortOrder(7);

        // Variants - Weekend only pricing
        addVariant(plan, 1, DurationUnit.MONTHS, 799.0, null, 0.0, 0, false, true, 1);
        addVariant(plan, 3, DurationUnit.MONTHS, 2199.0, 2397.0, 8.0, 0, true, true, 2);
        addVariant(plan, 6, DurationUnit.MONTHS, 3999.0, 4794.0, 17.0, 1, false, true, 3);
        addVariant(plan, 12, DurationUnit.MONTHS, 6999.0, 9588.0, 27.0, 2, false, true, 4);

        // Features
        addFeature(plan, "Weekend Access", "Saturday & Sunday full access", FeatureCategory.ACCESS, true, 1);
        addFeature(plan, "All Equipment", "Full gym equipment on weekends", FeatureCategory.EQUIPMENT, true, 2);
        addFeature(plan, "Weekend Classes", "All weekend group classes", FeatureCategory.CLASSES, true, 3);
        addFeature(plan, "Pool Access", "Weekend pool and spa", FeatureCategory.AMENITIES, true, 4);
        addFeature(plan, "Locker Room", "Weekend locker usage", FeatureCategory.AMENITIES, true, 5);
        addFeature(plan, "Weekday Access", "Monday-Friday access", FeatureCategory.ACCESS, false, 6);
        addFeature(plan, "Personal Training", "Weekend PT available", FeatureCategory.SERVICES, false, 7);

        planRepository.save(plan);
        log.info("Created Weekend Warrior plan");
    }

    private void createOffPeakPlan() {
        TieredMembershipPlan plan = new TieredMembershipPlan();
        plan.setPlanName("Off-Peak");
        plan.setDescription("Budget-friendly access during off-peak hours (6 AM - 4 PM weekdays). Great value for flexible schedules.");
        plan.setCategory(PlanCategory.CUSTOM);
        plan.setPlanColor("#EA580C"); // Orange
        plan.setIconName("clock");
        plan.setStatus(PlanStatus.ACTIVE);
        plan.setIsRecommended(false);
        plan.setSortOrder(8);

        // Variants - Off-peak pricing
        addVariant(plan, 1, DurationUnit.MONTHS, 899.0, null, 0.0, 0, false, true, 1);
        addVariant(plan, 3, DurationUnit.MONTHS, 2399.0, 2697.0, 11.0, 0, false, true, 2);
        addVariant(plan, 6, DurationUnit.MONTHS, 4499.0, 5394.0, 17.0, 1, true, true, 3);
        addVariant(plan, 12, DurationUnit.MONTHS, 7999.0, 10788.0, 26.0, 2, false, true, 4);

        // Features
        addFeature(plan, "Off-Peak Access", "6 AM - 4 PM weekday access", FeatureCategory.ACCESS, true, 1);
        addFeature(plan, "Full Equipment", "All gym equipment available", FeatureCategory.EQUIPMENT, true, 2);
        addFeature(plan, "Morning Classes", "AM group fitness classes", FeatureCategory.CLASSES, true, 3);
        addFeature(plan, "Pool (Off-Peak)", "Pool during off-peak hours", FeatureCategory.AMENITIES, true, 4);
        addFeature(plan, "Locker Room", "Standard locker access", FeatureCategory.AMENITIES, true, 5);
        addFeature(plan, "Peak Hours Access", "Evening/night access", FeatureCategory.ACCESS, false, 6);
        addFeature(plan, "Weekend Access", "Full weekend access", FeatureCategory.ACCESS, false, 7);
        addFeature(plan, "Personal Training", "Off-peak PT sessions", FeatureCategory.SERVICES, false, 8);

        planRepository.save(plan);
        log.info("Created Off-Peak plan");
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    private void addVariant(TieredMembershipPlan plan, int durationValue, DurationUnit durationUnit,
                           double price, Double originalPrice, double discountPercent,
                           int ptSessions, boolean isPopular, boolean isActive, int sortOrder) {
        PlanVariant variant = new PlanVariant();
        variant.setDurationValue(durationValue);
        variant.setDurationUnit(durationUnit);
        variant.setPrice(price);
        variant.setOriginalPrice(originalPrice);
        variant.setDiscountPercent(discountPercent);
        variant.setIncludedPTSessions(ptSessions);
        variant.setIsPopular(isPopular);
        variant.setIsActive(isActive);
        variant.setSortOrder(sortOrder);
        variant.calculateDurationDays();
        plan.addVariant(variant);
    }

    private void addFeature(TieredMembershipPlan plan, String name, String description,
                           FeatureCategory category, boolean isIncluded, int sortOrder) {
        PlanFeature feature = new PlanFeature();
        feature.setName(name);
        feature.setDescription(description);
        feature.setCategory(category);
        feature.setIsIncluded(isIncluded);
        feature.setSortOrder(sortOrder);
        plan.addFeature(feature);
    }
}
