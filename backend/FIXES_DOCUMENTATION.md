# Gym Management System - Backend Fixes Documentation

**Date:** April 6, 2026
**Project:** Gym Management System Backend
**Status:** ✅ Compilation Errors Resolved

---

## Overview

This document records all the database schema updates, Java compilation fixes, and configuration changes made to get the Spring Boot backend running with the Oracle database.

---

## Part 1: Database Schema Changes

### 1.1 Schema Update: `tenant_id` → `gym_id`

**Problem:** The Java entities used `gym_id` for tenant isolation, but the database schema used `tenant_id`.

**Solution:** Updated all SQL files to replace `tenant_id` with `gym_id`:
- `gym_management_schema.sql`
- `gym_management_seed_data.sql`

### 1.2 Missing Database Columns

Created multiple fix scripts to add missing columns discovered during backend startup:

| Script | Purpose |
|--------|---------|
| `fix_missing_columns.sql` | Added `is_deleted`, `full_name`, `password_changed_at` |
| `fix_more_columns.sql` | Added `updated_by`, emergency contact fields |
| `fix_password_changed_at.sql` | Added `password_changed_at` column |
| `create_member_points.sql` | Created `member_points` table |
| `fix_member_points.sql` | Added `member_user_id` column |

### 1.3 Combined Setup File

**Problem:** Running three separate SQL files was cumbersome.

**Solution:** Created `setup_complete.sql` - a single file combining:
- Schema creation
- Seed data
- All fix scripts

---

## Part 2: Java Compilation Errors Fixed

### 2.1 IncomeSummaryDTO - Missing @Builder and Fields

**File:** `dto/finance/IncomeSummaryDTO.java`

**Errors:**
```
The method builder() is undefined for the type IncomeSummaryDTO
```

**Missing Fields Added:**
- `thisMonth` (BigDecimal)
- `lastMonth` (BigDecimal)
- `byCategory` (Map<IncomeCategory, BigDecimal>)
- `percentageChange` (BigDecimal)
- `recentTransactions` (List<FinancialTransactionDTO>)

**Fix Applied:**
```java
@Data
@Builder
public class IncomeSummaryDTO {
    private Long gymId;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalIncome;
    private BigDecimal thisMonth;
    private BigDecimal lastMonth;
    private Map<IncomeCategory, BigDecimal> byCategory;
    private BigDecimal percentageChange;
    private long transactionCount;
    private List<FinancialTransactionDTO> recentTransactions;
    private String period;
}
```

---

### 2.2 FinancialReportDTO - Missing @Builder and Fields

**File:** `dto/finance/FinancialReportDTO.java`

**Errors:**
```
The method builder() is undefined for the type FinancialReportDTO
```

**Missing Fields Added:**
- `profitMargin` (BigDecimal)
- `totalTaxLiability` (BigDecimal)
- `transactions` (List<FinancialTransactionDTO>)
- `generatedAt` (LocalDate)

**Fix Applied:**
```java
@Data
@Builder
public class FinancialReportDTO {
    private Long gymId;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netProfit;
    private BigDecimal profitMargin;
    private BigDecimal totalTaxLiability;
    private long transactionCount;
    private String reportType;
    private List<FinancialTransactionDTO> transactions;
    private LocalDate generatedAt;
}
```

---

### 2.3 FileStorageService - Missing Overloaded Method

**File:** `service/FileStorageService.java`

**Error:**
```
The method storeFile(MultipartFile) in the type FileStorageService
is not applicable for the arguments (MultipartFile, String)
```

**Problem:** `FinancialTransactionService.uploadReceipt()` called `storeFile(file, "receipts/" + gymId)` but only single-argument `storeFile(MultipartFile)` existed.

**Fix Applied:** Added overloaded method:
```java
public String storeFile(MultipartFile file) {
    return storeFile(file, "");
}

public String storeFile(MultipartFile file, String subfolder) {
    String originalFileName = file.getOriginalFilename();
    String extension = "";
    if (originalFileName != null && originalFileName.contains(".")) {
        extension = originalFileName.substring(originalFileName.lastIndexOf("."));
    }
    String fileName = UUID.randomUUID().toString() + extension;
    try {
        Path targetLocation = subfolder != null && !subfolder.isEmpty()
            ? this.fileStorageLocation.resolve(subfolder).resolve(fileName)
            : this.fileStorageLocation.resolve(fileName);
        Files.createDirectories(targetLocation.getParent());
        Files.copy(file.getInputStream(), targetLocation);
        return subfolder != null && !subfolder.isEmpty() ? subfolder + "/" + fileName : fileName;
    } catch (Exception ex) {
        throw new RuntimeException("Could not store file");
    }
}
```

---

### 2.4 MemberDashboardStatsDTO - Missing Fields and Type Mismatches

**File:** `dto/member/MemberDashboardStatsDTO.java`

**Errors:**
```
The method avatarId(Long) in the type MemberDashboardStatsDTOBuilder
is not applicable for the arguments (String)

MemberDashboardStatsDTO.WeightProgressDTO cannot be resolved to a type
MemberDashboardStatsDTO.AchievementDTO cannot be resolved to a type
The constructor FitnessMetricDTO(String, String, String) is undefined
```

**Problems Fixed:**

1. **`avatarId` Type Mismatch:** Changed from `Long` to `String` to match `User.avatarId` type
2. **Missing Inner Classes:** Added `WeightProgressDTO` and `AchievementDTO`
3. **Builder Constructor Issue:** Added `@AllArgsConstructor` to inner static classes
4. **Missing Fields:** Added `weightProgress`, `achievements`, `fitnessMetrics` lists

**Final Structure:**
```java
@Data
@Builder
@AllArgsConstructor
public class MemberDashboardStatsDTO {
    private Long memberId;
    private String memberName;
    private String email;
    private String avatarId;
    private MembershipInfoDTO membership;
    private TrainerInfoDTO assignedTrainer;
    private Integer workoutsThisMonth;
    private Integer streakDays;
    private Long bookedClassesCount;
    private Long unreadNotificationsCount;
    private Integer caloriesBurned;
    private Integer minutesActive;
    private Integer totalPoints;
    private List<UpcomingClassDTO> upcomingClasses;
    private List<WeeklyActivityDTO> weeklyActivity;
    private List<ActivityItemDTO> recentActivity;
    private List<FitnessMetricDTO> fitnessMetrics;
    private List<WeightProgressDTO> weightProgress;
    private List<AchievementDTO> achievements;
}
```

---

### 2.5 MemberDashboardController - Constructor to Builder Migration

**File:** `controller/MemberDashboardController.java`

**Problem:** Controller used constructors like `new FitnessMetricDTO("Strength", 85)` but DTO only supported builder pattern.

**Fix Applied:** Changed all constructor calls to builder pattern:

**Before:**
```java
new MemberDashboardStatsDTO.FitnessMetricDTO("Strength", 85)
new MemberDashboardStatsDTO.WeightProgressDTO("Week 1", w + 2, w)
new MemberDashboardStatsDTO.AchievementDTO("Trophy", "7-Day Streak", "#F59E0B")
```

**After:**
```java
MemberDashboardStatsDTO.FitnessMetricDTO.builder()
    .metricName("Strength")
    .currentValue("85")
    .change("+0")
    .build()
MemberDashboardStatsDTO.WeightProgressDTO.builder()
    .week("Week 1")
    .weight(w + 2)
    .change(w)
    .build()
MemberDashboardStatsDTO.AchievementDTO.builder()
    .icon("Trophy")
    .title("7-Day Streak")
    .color("#F59E0B")
    .build()
```

---

### 2.6 FinancialController - getReceipt Method Fix

**File:** `controller/FinancialController.java`

**Error:**
```
Type mismatch: cannot convert from Resource to byte[]
```

**Problem:** `getReceipt()` method tried to assign `Resource` directly to `byte[]`.

**Fix Applied:**
```java
@GetMapping("/transactions/{id}/receipt")
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'ACCOUNTANT')")
public ResponseEntity<?> getReceipt(@PathVariable Long id) {
    FinancialTransactionDTO transaction = transactionService.getTransaction(id);
    if (transaction.getReceiptUrl() == null) {
        return ResponseEntity.notFound().build();
    }
    org.springframework.core.io.Resource resource = fileStorageService.getFile(transaction.getReceiptUrl());
    if (resource == null) {
        return ResponseEntity.notFound().build();
    }
    try {
        return ResponseEntity.ok()
                .header("Content-Type", "application/octet-stream")
                .body(resource.getContentAsByteArray());
    } catch (Exception e) {
        log.error("Failed to read receipt file", e);
        return ResponseEntity.status(500).build();
    }
}
```

**Also Added:** `fileStorageService` as a class field with `@RequiredArgsConstructor`.

---

## Part 3: Lombok Builder Issues

### Problem Description

Lombok's `@Data` and `@Builder` combination on nested static classes caused "cannot find symbol: class Builder" errors during compilation even though Lombok was properly configured.

### Root Cause

The combination of `@Data` + `@Builder` without `@AllArgsConstructor` on nested static classes generates a builder but no constructor, causing conflicts when trying to use `new ClassName(args)`.

### Solution

Applied `@AllArgsConstructor` alongside `@Data` and `@Builder` on all nested static DTO classes:

```java
@Data
@Builder
@AllArgsConstructor
public static class FitnessMetricDTO {
    private String metricName;
    private String currentValue;
    private String change;
}
```

This ensures both:
- Builder pattern works: `ClassName.builder().field(value).build()`
- Constructor works: `new ClassName(arg1, arg2, arg3)`

---

## Part 4: Files Modified/Created

### Database Files
| File | Action |
|------|--------|
| `database/gym_management_schema.sql` | Modified |
| `database/gym_management_seed_data.sql` | Modified |
| `database/cleanup.sql` | Created |
| `database/setup_complete.sql` | Created |
| `database/fix_missing_columns.sql` | Created |
| `database/fix_more_columns.sql` | Created |
| `database/fix_password_changed_at.sql` | Created |
| `database/create_member_points.sql` | Created |
| `database/fix_member_points.sql` | Created |

### Java Files Modified
| File | Changes |
|------|---------|
| `dto/finance/IncomeSummaryDTO.java` | Added @Builder, fields |
| `dto/finance/FinancialReportDTO.java` | Added @Builder, fields |
| `service/FileStorageService.java` | Added overloaded storeFile() |
| `dto/member/MemberDashboardStatsDTO.java` | Complete rewrite with all inner classes |
| `controller/MemberDashboardController.java` | Builder pattern migration |
| `controller/FinancialController.java` | Fixed getReceipt(), added dependency |

### Java Files Created (Previously Missing)
| File |
|------|
| `model/MemberPoints.java` |
| `repository/MemberPointsRepository.java` |

---

## Part 5: Build Status

**Final Command:** `mvn compile`

**Result:** ✅ `BUILD SUCCESS`

All compilation errors have been resolved. The backend is ready for startup testing.

---

## Part 6: Runtime Startup Errors

### Error 1: Missing `memberUserId` in MemberPoints

**Error Message:**
```
No property 'memberUserId' found for type 'MemberPoints'
```

**Root Cause:** The `MemberPointsRepository` had a method `findByMemberUserId()` but the `MemberPoints` entity didn't have a `memberUserId` field.

**Fix Applied:** Added `memberUserId` field to `MemberPoints.java`:
```java
@Column(name = "member_user_id")
private Long memberUserId;
```

**SQL Fix Script:** `database/fix_member_points.sql` (already existed)

---

### Error 2: Missing `GENDER` Column in USERS Table

**Error Message:**
```
Caused by: java.sql.SQLSyntaxErrorException: ORA-00904: "U1_0"."GENDER": invalid identifier
```

**Root Cause:** The `User` entity has a `gender` field but the database `users` table was missing the `gender` column.

**Fix Applied:**

1. Added `memberUserId` field to `MemberPoints.java`
2. Created `database/comprehensive_user_fix.sql` to add missing columns:
   - `gender VARCHAR2(20)`
   - `date_of_birth DATE`
   - `address VARCHAR2(500)`
   - `emergency_contact_name VARCHAR2(200)`
   - `emergency_contact_phone VARCHAR2(20)`
   - `emergency_contact_relation VARCHAR2(50)`
   - `password_changed_at TIMESTAMP`
   - `created_by NUMBER`
   - `updated_by NUMBER`

**Files Created:**
- `database/fix_gender_column.sql` - Initial fix for gender column
- `database/fix_user_columns.sql` - Broader fix for user columns
- `database/comprehensive_user_fix.sql` - Complete fix for all missing user columns

---

## Notes for Future Development

1. **Database Changes:** When modifying Java entities, ensure corresponding database columns exist
2. **Lombok Pattern:** For DTOs with builders, always use `@Data @Builder @AllArgsConstructor` together
3. **Builder vs Constructors:** If controller code uses `new ClassName(args)`, the DTO needs `@AllArgsConstructor`; if using `.builder()...build()`, `@Builder` alone suffices
4. **FileStorageService:** Use `storeFile(file, subfolder)` for organized file storage (e.g., `receipts/1`)
5. **Runtime Errors:** Use `ORA-00904` errors to identify missing database columns - the column name in the error message shows what's missing

---

*Document generated: April 6, 2026*
*Last updated: April 6, 2026 (Added runtime startup error fixes)*
