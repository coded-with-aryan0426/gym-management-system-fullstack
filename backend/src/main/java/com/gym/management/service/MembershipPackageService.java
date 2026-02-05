package com.gym.management.service;

import com.gym.management.dto.MembershipPackageDTO;
import com.gym.management.dto.MembershipPlanAnalyticsDTO;
import com.gym.management.model.MembershipPackage;
import com.gym.management.repository.MembershipPackageRepository;
import com.gym.management.repository.MembershipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class MembershipPackageService {

    // Premium color palette for membership plans
    private static final String[] PLAN_COLORS = {
            "#DC2626", // Red
            "#EA580C", // Orange
            "#D97706", // Amber
            "#CA8A04", // Yellow
            "#65A30D", // Lime
            "#16A34A", // Green
            "#059669", // Emerald
            "#0D9488", // Teal
            "#0891B2", // Cyan
            "#0284C7", // Sky
            "#2563EB", // Blue
            "#4F46E5", // Indigo
            "#7C3AED", // Violet
            "#9333EA", // Purple
            "#C026D3", // Fuchsia
            "#DB2777", // Pink
            "#E11D48", // Rose
    };

    @Autowired
    private MembershipPackageRepository membershipPackageRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    public List<MembershipPackageDTO> getAllPackages() {
        cleanupDuplicatePackages();
        return membershipPackageRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(MembershipPackage::getPackageName, String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(MembershipPackage::getDurationDays)
                        .thenComparing(MembershipPackage::getPrice))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<MembershipPackageDTO> getActivePackages() {
        return membershipPackageRepository.findActivePackages()
                .stream()
                .sorted(Comparator.comparing(MembershipPackage::getPackageName, String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(MembershipPackage::getDurationDays)
                        .thenComparing(MembershipPackage::getPrice))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public MembershipPackageDTO createPackage(MembershipPackageDTO dto) {
        if (membershipPackageRepository.existsByPackageNameAndDurationDays(dto.getPackageName(),
                dto.getDurationDays())) {
            throw new IllegalArgumentException("Package with this name and duration already exists");
        }

        MembershipPackage pkg = new MembershipPackage();
        pkg.setPackageName(dto.getPackageName());
        pkg.setPrice(dto.getPrice());
        pkg.setDurationDays(dto.getDurationDays());
        pkg.setIncludedPTSessions(dto.getIncludedPTSessions());
        pkg.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        // Assign unique color
        pkg.setPlanColor(assignUniqueColor());

        MembershipPackage saved = membershipPackageRepository.save(pkg);
        return convertToDTO(saved);
    }

    /**
     * Assigns a unique color from the palette that isn't currently in use
     */
    private String assignUniqueColor() {
        Set<String> usedColors = membershipPackageRepository.findAll().stream()
                .map(MembershipPackage::getPlanColor)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        for (String color : PLAN_COLORS) {
            if (!usedColors.contains(color)) {
                return color;
            }
        }

        // If all colors are used, generate a random one
        Random random = new Random();
        return String.format("#%06X", random.nextInt(0xFFFFFF + 1));
    }

    public MembershipPackageDTO updatePackage(Long packageId, MembershipPackageDTO dto) {
        Objects.requireNonNull(packageId, "Package ID must not be null");
        MembershipPackage pkg = membershipPackageRepository.findById(packageId)
                .orElseThrow(() -> new IllegalArgumentException("Package not found"));

        String nextName = dto.getPackageName() != null ? dto.getPackageName() : pkg.getPackageName();
        Integer nextDuration = dto.getDurationDays() != null ? dto.getDurationDays() : pkg.getDurationDays();

        if (nextName != null && nextDuration != null
                && membershipPackageRepository.existsByPackageNameAndDurationDaysAndPackageIdNot(nextName, nextDuration,
                        packageId)) {
            throw new IllegalArgumentException("Package with this name and duration already exists");
        }

        if (dto.getPackageName() != null) {
            pkg.setPackageName(dto.getPackageName());
        }
        if (dto.getPrice() != null) {
            pkg.setPrice(dto.getPrice());
        }
        if (dto.getDurationDays() != null) {
            pkg.setDurationDays(dto.getDurationDays());
        }
        if (dto.getIncludedPTSessions() != null) {
            pkg.setIncludedPTSessions(dto.getIncludedPTSessions());
        }
        if (dto.getIsActive() != null) {
            pkg.setIsActive(dto.getIsActive());
        }

        membershipPackageRepository.save(pkg);
        return convertToDTO(pkg);
    }

    public void deletePackage(Long packageId) {
        Objects.requireNonNull(packageId, "Package ID must not be null");

        // Verify package exists before deletion
        membershipPackageRepository.findById(packageId)
                .orElseThrow(() -> new IllegalArgumentException("Package not found"));

        // Check if any members are using this package
        long memberCount = membershipRepository.countByMembershipPackagePackageId(packageId);
        if (memberCount > 0) {
            throw new IllegalStateException(
                    "Cannot delete this membership plan. It is currently assigned to " + memberCount +
                            " member" + (memberCount > 1 ? "s" : "")
                            + ". Please reassign or remove these members first.");
        }

        membershipPackageRepository.deleteById(packageId);
    }

    /**
     * DEACTIVATE MEMBERSHIP PACKAGE
     * Soft delete by setting inactive
     */
    public void deactivatePackage(Long packageId) {
        Objects.requireNonNull(packageId, "Package ID must not be null");
        MembershipPackage pkg = membershipPackageRepository.findById(packageId)
                .orElseThrow(() -> new IllegalArgumentException("Package not found"));

        pkg.setIsActive(false);
        membershipPackageRepository.save(pkg);
    }

    /**
     * ACTIVATE MEMBERSHIP PACKAGE
     * Reactivate inactive package
     */
    public void activatePackage(Long packageId) {
        Objects.requireNonNull(packageId, "Package ID must not be null");
        MembershipPackage pkg = membershipPackageRepository.findById(packageId)
                .orElseThrow(() -> new IllegalArgumentException("Package not found"));

        pkg.setIsActive(true);
        membershipPackageRepository.save(pkg);
    }

    /**
     * CLEANUP DUPLICATE PACKAGES
     * Removes duplicate plans with the same name + duration when they are unused
     */
    private void cleanupDuplicatePackages() {
        List<MembershipPackage> allPackages = membershipPackageRepository.findAll();
        if (allPackages.size() < 2) {
            return;
        }

        Map<String, List<MembershipPackage>> groupedPackages = allPackages.stream()
                .collect(Collectors
                        .groupingBy(pkg -> pkg.getPackageName().trim().toLowerCase() + "|" + pkg.getDurationDays()));

        List<Long> duplicateIdsToDelete = new ArrayList<>();

        for (List<MembershipPackage> group : groupedPackages.values()) {
            if (group.size() <= 1) {
                continue;
            }

            List<MembershipPackage> sortedGroup = group.stream()
                    .sorted(Comparator.comparing(MembershipPackage::getPackageId))
                    .collect(Collectors.toList());

            for (int i = 1; i < sortedGroup.size(); i++) {
                MembershipPackage duplicate = sortedGroup.get(i);
                long memberCount = membershipRepository.countByMembershipPackagePackageId(duplicate.getPackageId());
                if (memberCount == 0) {
                    duplicateIdsToDelete.add(duplicate.getPackageId());
                }
            }
        }

        if (!duplicateIdsToDelete.isEmpty()) {
            membershipPackageRepository.deleteAllById(duplicateIdsToDelete);
        }
    }

    /**
     * GET MEMBERSHIP PLAN ANALYTICS
     * Provides comprehensive analytics for membership plans
     */
    public MembershipPlanAnalyticsDTO getPlanAnalytics() {
        List<MembershipPackage> allPackages = membershipPackageRepository.findAll();
        List<MembershipPackage> activePackages = membershipPackageRepository.findActivePackages();

        // Basic counts
        long totalPlans = allPackages.size();
        long activePlans = activePackages.size();
        long inactivePlans = totalPlans - activePlans;

        // Price analytics
        Double averagePrice = allPackages.stream()
                .mapToDouble(MembershipPackage::getPrice)
                .average()
                .orElse(0.0);

        // Revenue calculation (simplified - would need actual membership data)
        Double totalRevenue = calculateTotalRevenue();

        // Plans by status
        Map<String, Long> plansByStatus = allPackages.stream()
                .collect(Collectors.groupingBy(
                        pkg -> pkg.getIsActive() ? "ACTIVE" : "INACTIVE",
                        Collectors.counting()));

        // Revenue by plan (simplified)
        Map<String, Double> revenueByPlan = calculateRevenueByPlan();

        // Member count by plan (simplified)
        Map<String, Long> memberCountByPlan = calculateMemberCountByPlan();

        // Average duration by plan
        Map<String, Double> averageDurationByPlan = allPackages.stream()
                .collect(Collectors.toMap(
                        MembershipPackage::getPackageName,
                        pkg -> (double) pkg.getDurationDays(),
                        (a, b) -> a));

        // Popular plans (simplified)
        String mostPopularPlan = findMostPopularPlan(memberCountByPlan);
        String highestRevenuePlan = findHighestRevenuePlan(revenueByPlan);
        String longestDurationPlan = findLongestDurationPlan(averageDurationByPlan);

        // Growth metrics (simplified)
        Long plansCreatedThisMonth = calculatePlansCreatedThisMonth();
        Long plansCreatedLastMonth = calculatePlansCreatedLastMonth();
        Double monthOverMonthGrowth = calculateMonthOverMonthGrowth(plansCreatedThisMonth, plansCreatedLastMonth);

        return new MembershipPlanAnalyticsDTO(
                totalPlans, activePlans, inactivePlans, averagePrice, totalRevenue,
                plansByStatus, revenueByPlan, memberCountByPlan, averageDurationByPlan,
                mostPopularPlan, highestRevenuePlan, longestDurationPlan,
                plansCreatedThisMonth, plansCreatedLastMonth, monthOverMonthGrowth);
    }

    // Helper methods for analytics

    private Double calculateTotalRevenue() {
        // Simplified calculation - in real implementation would sum actual membership
        // payments
        return membershipRepository.findAll().stream()
                .mapToDouble(membership -> membership.getMembershipPackage() != null
                        ? membership.getMembershipPackage().getPrice()
                        : 0.0)
                .sum();
    }

    private Map<String, Double> calculateRevenueByPlan() {
        // Simplified calculation - would need actual payment data
        return membershipRepository.findAll().stream()
                .filter(membership -> membership.getMembershipPackage() != null)
                .collect(Collectors.groupingBy(
                        membership -> membership.getMembershipPackage().getPackageName(),
                        Collectors.summingDouble(membership -> membership.getMembershipPackage().getPrice())));
    }

    private Map<String, Long> calculateMemberCountByPlan() {
        return membershipRepository.findAll().stream()
                .filter(membership -> membership.getMembershipPackage() != null)
                .collect(Collectors.groupingBy(
                        membership -> membership.getMembershipPackage().getPackageName(),
                        Collectors.counting()));
    }

    private String findMostPopularPlan(Map<String, Long> memberCountByPlan) {
        return memberCountByPlan.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");
    }

    private String findHighestRevenuePlan(Map<String, Double> revenueByPlan) {
        return revenueByPlan.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");
    }

    private String findLongestDurationPlan(Map<String, Double> averageDurationByPlan) {
        return averageDurationByPlan.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");
    }

    private Long calculatePlansCreatedThisMonth() {
        // Simplified - would need creation date tracking
        return membershipPackageRepository.count();
    }

    private Long calculatePlansCreatedLastMonth() {
        // Simplified - would need creation date tracking
        return Math.max(0, membershipPackageRepository.count() - 2);
    }

    private Double calculateMonthOverMonthGrowth(Long thisMonth, Long lastMonth) {
        if (lastMonth == 0)
            return 0.0;
        return ((double) (thisMonth - lastMonth) / lastMonth) * 100;
    }

    private MembershipPackageDTO convertToDTO(MembershipPackage pkg) {
        MembershipPackageDTO dto = new MembershipPackageDTO();
        dto.setPackageId(pkg.getPackageId());
        dto.setPackageName(pkg.getPackageName());
        dto.setPrice(pkg.getPrice());
        dto.setDurationDays(pkg.getDurationDays());
        dto.setIncludedPTSessions(pkg.getIncludedPTSessions());
        dto.setIsActive(pkg.getIsActive());
        dto.setPlanColor(pkg.getPlanColor() != null ? pkg.getPlanColor() : assignUniqueColor());
        return dto;
    }
}