package com.gym.management.service;

import com.gym.management.model.Gym;
import com.gym.management.model.Membership;
import com.gym.management.model.MembershipPackage;
import com.gym.management.model.MembershipStatus;
import com.gym.management.model.PlanVariant;
import com.gym.management.model.TieredMembershipPlan;
import com.gym.management.model.User;
import com.gym.management.repository.GymRepository;
import com.gym.management.repository.MembershipPackageRepository;
import com.gym.management.repository.MembershipRepository;
import com.gym.management.repository.PlanVariantRepository;
import com.gym.management.repository.TieredMembershipPlanRepository;
import com.gym.management.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MembershipService {

    private static final Logger log = LoggerFactory.getLogger(MembershipService.class);
    private static final long EXPIRING_SOON_HOURS = 7L * 24L;

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
        // Validate inputs
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        
        if (planId == null && packageId == null) {
            throw new IllegalArgumentException("Either planId or packageId must be provided");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        String planName;
        double price;
        int durationDays;
        TieredMembershipPlan tieredPlan = null;
        PlanVariant planVariant = null;
        MembershipPackage legacyPackage = null;

        // Load plan/package details
        if (planId != null && variantId != null) {
            tieredPlan = tieredPlanRepository.findById(planId)
                    .orElseThrow(() -> new RuntimeException("Selected plan not found (ID: " + planId + ")"));
            planVariant = planVariantRepository.findById(variantId)
                    .orElseThrow(() -> new RuntimeException("Selected duration option not found (ID: " + variantId + ")"));

            if (planVariant.getPlan() == null || !planVariant.getPlan().getPlanId().equals(planId)) {
                throw new RuntimeException("The selected duration option does not belong to the selected plan. Please refresh and try again.");
            }

            planName = tieredPlan.getPlanName();
            price = planVariant.getPrice();
            durationDays = planVariant.getDurationDays();
        } else if (packageId != null) {
            legacyPackage = packageRepository.findById(packageId)
                    .orElseThrow(() -> new RuntimeException("Package not found with ID: " + packageId));
            planName = legacyPackage.getPackageName();
            price = legacyPackage.getPrice();
            durationDays = legacyPackage.getDurationDays();
        } else {
            throw new RuntimeException("Either planId+variantId or packageId must be provided");
        }

        log.info("[MembershipService] Renewing membership for user {} with plan '{}' (duration: {} days, price: {})", 
                userId, planName, durationDays, price);

        // BULLETPROOF FIX: Resolve gym first, then find existing membership for THAT SPECIFIC GYM
        // This ensures we ALWAYS update the existing membership for a gym-user combo instead of creating duplicates
        List<Membership> allMemberships = membershipRepository.findByUserUserId(userId);
        log.debug("[MembershipService] Found {} existing memberships for user {}", allMemberships.size(), userId);
        
        Gym targetGym = resolveGymForMembership(gymId, allMemberships);
        
        if (targetGym == null) {
            log.error("[MembershipService] Unable to determine target gym for user {}", userId);
            throw new RuntimeException("Unable to determine target gym. Please specify a gym ID.");
        }
        
        log.info("[MembershipService] Target gym resolved: {} (ID: {})", targetGym.getName(), targetGym.getGymId());
        
        // Try to find existing membership for this specific gym-user combination
        // This respects the unique constraint on (gym_id, user_id)
        Membership membership = membershipRepository.findByGymGymIdAndUserUserId(targetGym.getGymId(), userId).orElse(null);
        
        // If no membership exists for this gym-user combo, create new one
        if (membership == null) {
            log.info("[MembershipService] No existing membership found for user {} at gym {}. Creating new membership.", 
                    userId, targetGym.getGymId());
            membership = new Membership();
            membership.setUser(user);
            membership.setGym(targetGym);
        } else {
            log.info("[MembershipService] Found existing membership ID {} for user {} at gym {}. Updating it.", 
                    membership.getId(), userId, targetGym.getGymId());
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime effectiveCurrentEnd = membership.getEffectiveEndDateTime();

        LocalDateTime newStartDateTime = now;
        if ((isUpgrade == null || !isUpgrade) && effectiveCurrentEnd != null && effectiveCurrentEnd.isAfter(now)) {
            newStartDateTime = effectiveCurrentEnd;
            log.info("[MembershipService] Extending from current end date: {}", effectiveCurrentEnd);
        } else {
            log.info("[MembershipService] Starting membership from now (upgrade or expired): {}", now);
        }

        LocalDateTime newEndDateTime;
        if (customMonths != null && customMonths > 0) {
            newEndDateTime = newStartDateTime.plusMonths(customMonths);
            log.info("[MembershipService] Using custom duration: {} months", customMonths);
        } else {
            newEndDateTime = newStartDateTime.plusDays(durationDays);
            log.info("[MembershipService] Using plan duration: {} days", durationDays);
        }

        log.info("[MembershipService] New membership period: {} to {}", newStartDateTime, newEndDateTime);

        membership.setStartDateTime(newStartDateTime);
        membership.setEndDateTime(newEndDateTime);
        membership.setStartDate(newStartDateTime.toLocalDate());
        membership.setEndDate(newEndDateTime.toLocalDate());
        membership.setStatus(calculateStatusFromEndDateTime(newEndDateTime));

        if (tieredPlan != null) {
            membership.setTieredPlan(tieredPlan);
            membership.setPlanVariant(planVariant);
            membership.setMembershipPackage(null);
            log.debug("[MembershipService] Set tiered plan: {} with variant: {}", planName, variantId);
        }

        if (legacyPackage != null) {
            membership.setMembershipPackage(legacyPackage);
            membership.setTieredPlan(null);
            membership.setPlanVariant(null);
            log.debug("[MembershipService] Set legacy package: {}", planName);
        }

        try {
            Membership saved = membershipRepository.save(membership);
            log.info("[MembershipService] Successfully saved membership ID {} for user {}", saved.getId(), userId);

            // Audit log
            try {
                String changes = String.format(
                        "{\"planName\":\"%s\",\"price\":%.2f,\"durationDays\":%d,\"startDateTime\":\"%s\",\"endDateTime\":\"%s\"}",
                        planName,
                        price,
                        durationDays,
                        newStartDateTime,
                        newEndDateTime
                );
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
                log.error("[MembershipService] Failed to log membership renewal audit", e);
            }

            return saved;
        } catch (Exception e) {
            log.error("[MembershipService] Failed to save membership for user {} at gym {}: {}", 
                    userId, targetGym.getGymId(), e.getMessage(), e);
            throw new RuntimeException("Failed to save membership: " + e.getMessage(), e);
        }
    }

    public MembershipStatus calculateStatusFromEndDateTime(LocalDateTime endDateTime) {
        if (endDateTime == null) {
            return MembershipStatus.ACTIVE;
        }

        LocalDateTime now = LocalDateTime.now();
        if (!now.isBefore(endDateTime)) {
            return MembershipStatus.EXPIRED;
        }

        long hoursRemaining = Duration.between(now, endDateTime).toHours();
        if (hoursRemaining <= EXPIRING_SOON_HOURS) {
            return MembershipStatus.EXPIRING_SOON;
        }

        return MembershipStatus.ACTIVE;
    }

    private Gym resolveGymForMembership(Long gymId, List<Membership> memberships) {
        if (gymId != null) {
            return gymRepository.findById(gymId)
                    .orElseThrow(() -> new RuntimeException("Gym not found"));
        }

        Membership anyMembership = memberships.stream().findFirst().orElse(null);
        if (anyMembership != null && anyMembership.getGym() != null) {
            return anyMembership.getGym();
        }

        List<Gym> allGyms = gymRepository.findAll();
        if (!allGyms.isEmpty()) {
            return allGyms.get(0);
        }

        throw new RuntimeException("No gym context found. Please ensure at least one gym exists in the system.");
    }
}
