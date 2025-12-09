package com.gym.management.service;

import com.gym.management.dto.MembershipPackageDTO;
import com.gym.management.model.MembershipPackage;
import com.gym.management.repository.MembershipPackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
@SuppressWarnings("null")
public class MembershipPackageService {

    @Autowired
    private MembershipPackageRepository membershipPackageRepository;

    public List<MembershipPackageDTO> getAllPackages() {
        return membershipPackageRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<MembershipPackageDTO> getActivePackages() {
        return membershipPackageRepository.findActivePackages()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public MembershipPackageDTO createPackage(MembershipPackageDTO dto) {
        if (membershipPackageRepository.existsByPackageName(dto.getPackageName())) {
            throw new IllegalArgumentException("Package with this name already exists");
        }

        MembershipPackage pkg = new MembershipPackage();
        pkg.setPackageName(dto.getPackageName());
        pkg.setPrice(dto.getPrice());
        pkg.setDurationDays(dto.getDurationDays());
        pkg.setIncludedPTSessions(dto.getIncludedPTSessions());
        pkg.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        MembershipPackage saved = membershipPackageRepository.save(pkg);
        return convertToDTO(saved);
    }

    public MembershipPackageDTO updatePackage(Long packageId, MembershipPackageDTO dto) {
        Objects.requireNonNull(packageId, "Package ID must not be null");
        MembershipPackage pkg = membershipPackageRepository.findById(packageId)
                .orElseThrow(() -> new IllegalArgumentException("Package not found"));

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
        if (!membershipPackageRepository.existsById(packageId)) {
            throw new IllegalArgumentException("Package not found");
        }

        // Check if package has active subscriptions (placeholder - would check
        // subscription table)
        // For now, just delete
        membershipPackageRepository.deleteById(packageId);
    }

    private MembershipPackageDTO convertToDTO(MembershipPackage pkg) {
        MembershipPackageDTO dto = new MembershipPackageDTO();
        dto.setPackageId(pkg.getPackageId());
        dto.setPackageName(pkg.getPackageName());
        dto.setPrice(pkg.getPrice());
        dto.setDurationDays(pkg.getDurationDays());
        dto.setIncludedPTSessions(pkg.getIncludedPTSessions());
        dto.setIsActive(pkg.getIsActive());
        return dto;
    }
}
