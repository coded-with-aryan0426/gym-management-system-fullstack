package com.gym.management.service;

import com.gym.management.model.*;
import com.gym.management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class MembershipService {

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private MembershipPackageRepository packageRepository;

    @Autowired
    private TieredMembershipPlanRepository tieredPlanRepository;

    @Autowired
    private PlanVariantRepository planVariantRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private GymRepository gymRepository;
    
    @Autowired
    private AuditLogService auditLogService;

    /**
     * Renew membership using the new tiered plan system.
     * If planId + variantId are provided, use tiered plan.
     * Falls back to legacy packageId for backward compatibility.
     */
    @Transactional
    public Membership renewMembership(Long userId, Long packageId, Integer customMonths) {
        return renewMembership(userId, packageId, null, null, customMonths, null);
    }

    @Transactional
    public Membership renewMembership(Long userId, Long packageId, Long planId, Long variantId, Integer customMonths) {
        return renewMembership(userId, packageId, planId, variantId, customMonths, null);
    }

    @Transactional
    public Membership renewMembership(Long userId, Long packageId, Long planId, Long variantId, Integer customMonths, Long gymId) {
        return renewMembership(userId, packageId, planId, variantId, customMonths, gymId, false);
    }

    @Transactional
    public Membership renewMembership(Long userId, Long packageId, Long planId, Long variantId, Integer customMonths, Long gymId, Boolean isUpgrade) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Determine plan details
        String planName;
        double price;
        int durationDays;
        TieredMembershipPlan tieredPlan = null;
        PlanVariant planVariant = null;
        MembershipPackage legacyPackage = null;

        if (planId != null && variantId != null) {
            // New tiered plan renewal
            tieredPlan = tieredPlanRepository.findById(planId)
                    .orElseThrow(() -> new RuntimeException("Selected plan not found (ID: " + planId + ")"));
            planVariant = planVariantRepository.findById(variantId)
                    .orElseThrow(() -> new RuntimeException("Selected duration option not found (ID: " + variantId + ")"));

            // Safety check: Ensure variant belongs to the selected plan
            if (planVariant.getPlan() == null || !planVariant.getPlan().getPlanId().equals(planId)) {
                throw new RuntimeException("The selected duration option does not belong to the selected plan. Please refresh and try again.");
            }

            planName = tieredPlan.getPlanName();
            price = planVariant.getPrice();
            durationDays = planVariant.getDurationDays();
        } else if (packageId != null) {
            // Legacy package renewal
            legacyPackage = packageRepository.findById(packageId)
                    .orElseThrow(() -> new RuntimeException("Package not found"));
            planName = legacyPackage.getPackageName();
            price = legacyPackage.getPrice();
            durationDays = legacyPackage.getDurationDays();
        } else {
            throw new RuntimeException("Either planId+variantId or packageId must be provided");
        }

        // Find existing membership
        List<Membership> memberships = membershipRepository.findByUserUserId(userId);
        Membership membership = memberships.stream()
                .filter(m -> m.getStatus() == MembershipStatus.ACTIVE || m.getStatus() == MembershipStatus.EXPIRED)
                .findFirst()
                .orElse(null);

        if (membership == null) {
            // Create new membership
            membership = new Membership();
            membership.setUser(user);
            
            // Try to get gym from various sources
            if (gymId != null) {
                membership.setGym(gymRepository.findById(gymId)
                        .orElseThrow(() -> new RuntimeException("Gym not found")));
            } else {
                Membership anyMembership = memberships.stream().findFirst().orElse(null);
                if (anyMembership != null && anyMembership.getGym() != null) {
                    membership.setGym(anyMembership.getGym());
                } else {
                    // Fallback to first available gym if no gymId provided and no previous memberships
                    List<com.gym.management.model.Gym> allGyms = gymRepository.findAll();
                    if (!allGyms.isEmpty()) {
                        membership.setGym(allGyms.get(0));
                    } else {
                        throw new RuntimeException("No gym context found. Please ensure at least one gym exists in the system.");
                    }
                }
            }
        }

        // Calculate dates
        LocalDate newStartDate = LocalDate.now();
        // Only extend if it's a standard renewal (not an upgrade/change)
        if ((isUpgrade == null || !isUpgrade) && membership.getEndDate() != null && !membership.getEndDate().isBefore(LocalDate.now())) {
            newStartDate = membership.getEndDate();
        } else if (isUpgrade != null && isUpgrade) {
            // For upgrades/changes, start immediately today
            newStartDate = LocalDate.now();
            membership.setStatus(MembershipStatus.ACTIVE); // Force active on upgrade
        }

        // Calculate end date from variant duration or custom months
        LocalDate newEndDate;
        if (customMonths != null && customMonths > 0) {
            newEndDate = newStartDate.plusMonths(customMonths);
        } else {
            newEndDate = newStartDate.plusDays(durationDays);
        }

        membership.setStartDate(newStartDate);
        membership.setEndDate(newEndDate);
        membership.setStatus(MembershipStatus.ACTIVE);

        // Set plan references - clear the other type to avoid stale data
        if (tieredPlan != null) {
            membership.setTieredPlan(tieredPlan);
            membership.setPlanVariant(planVariant);
            membership.setMembershipPackage(null); // Clear legacy reference
        }
        if (legacyPackage != null) {
            membership.setMembershipPackage(legacyPackage);
            membership.setTieredPlan(null); // Clear tiered reference
            membership.setPlanVariant(null);
        }

        Membership saved = membershipRepository.save(membership);
        
        // Log the renewal
        try {
            String changes = String.format(
                "{\"planName\": \"%s\", \"price\": %.2f, \"durationDays\": %d, \"startDate\": \"%s\", \"endDate\": \"%s\"}",
                planName, price, durationDays, newStartDate, newEndDate);
            String action = (isUpgrade != null && isUpgrade) ? "Membership upgraded/changed" : "Membership renewed";
            auditLogService.logUpdate(
                "MEMBERSHIP",
                saved.getId().toString(),
                user.getFullName() + " - " + planName,
                user.getUserId(),
                membership.getGym() != null ? membership.getGym().getGymId() : null,
                action,
                changes,
                null
            );
        } catch (Exception e) {
            System.err.println("Failed to log membership renewal: " + e.getMessage());
        }
        
        return saved;
    }
}
