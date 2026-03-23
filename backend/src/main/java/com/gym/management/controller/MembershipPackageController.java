package com.gym.management.controller;

import com.gym.management.dto.MembershipPackageDTO;
import com.gym.management.service.MembershipPackageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class MembershipPackageController {

    @Autowired
    private MembershipPackageService membershipPackageService;

    @GetMapping
    public ResponseEntity<List<MembershipPackageDTO>> getAllPackages(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        
        List<MembershipPackageDTO> packages = activeOnly ? 
            membershipPackageService.getActivePackages() : 
            membershipPackageService.getAllPackages();
        
        return ResponseEntity.ok(packages);
    }

    @PostMapping
    public ResponseEntity<MembershipPackageDTO> createPackage(@Valid @RequestBody MembershipPackageDTO dto) {
        try {
            MembershipPackageDTO created = membershipPackageService.createPackage(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<MembershipPackageDTO> updatePackage(
            @PathVariable Long id,
            @Valid @RequestBody MembershipPackageDTO dto) {
        try {
            MembershipPackageDTO updated = membershipPackageService.updatePackage(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        try {
            membershipPackageService.deletePackage(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
