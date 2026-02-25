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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class MembershipService {

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
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String planName;
        double price;
        int durationDays;
        TieredMembershipPlan tieredPlan = null;
        PlanVariant planVariant = null;
        MembershipPackage legacyPackage = null;

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
                    .orElseThrow(() -> new RuntimeException("Package not found"));
            planName = legacyPackage.getPackageName();
            price = legacyPackage.getPrice();
            durationDays = legacyPackage.getDurationDays();
        } else {
            throw new RuntimeException("Either planId+variantId or packageId must be provided");
        }

        List<Membership> memberships = membershipRepository.findByUserUserId(userId);
        Membership membership = findMembershipToRenew(memberships);

        if (membership == null) {
            membership = new Membership();
            membership.setUser(user);
            membership.setGym(resolveGymForMembership(gymId, memberships));
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime effectiveCurrentEnd = membership.getEffectiveEndDateTime();

        LocalDateTime newStartDateTime = now;
        if ((isUpgrade == null || !isUpgrade) && effectiveCurrentEnd != null && effectiveCurrentEnd.isAfter(now)) {
            newStartDateTime = effectiveCurrentEnd;
        }

        LocalDateTime newEndDateTime;
        if (customMonths != null && customMonths > 0) {
            newEndDateTime = newStartDateTime.plusMonths(customMonths);
        } else {
            newEndDateTime = newStartDateTime.plusDays(durationDays);
        }

        membership.setStartDateTime(newStartDateTime);
        membership.setEndDateTime(newEndDateTime);
        membership.setStartDate(newStartDateTime.toLocalDate());
        membership.setEndDate(newEndDateTime.toLocalDate());
        membership.setStatus(calculateStatusFromEndDateTime(newEndDateTime));

        if (tieredPlan != null) {
            membership.setTieredPlan(tieredPlan);
            membership.setPlanVariant(planVariant);
            membership.setMembershipPackage(null);
        }

        if (legacyPackage != null) {
            membership.setMembershipPackage(legacyPackage);
            membership.setTieredPlan(null);
            membership.setPlanVariant(null);
        }

        Membership saved = membershipRepository.save(membership);

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
            System.err.println("Failed to log membership renewal: " + e.getMessage());
        }

        return saved;
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

    private Membership findMembershipToRenew(List<Membership> memberships) {
        if (memberships == null || memberships.isEmpty()) {
            return null;
        }

        return memberships.stream()
                .filter(m -> m.getStatus() != MembershipStatus.CANCELLED)
                .max(Comparator.comparing(Membership::getEffectiveEndDateTime, Comparator.nullsLast(LocalDateTime::compareTo)))
                .orElse(memberships.get(0));
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
