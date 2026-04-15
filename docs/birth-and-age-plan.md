# Birth Date & Age Implementation Plan
## AthlonX Gym Management System

**Document Version:** 1.0
**Created:** April 15, 2026
**Status:** Implementation Guide
**Classification:** Internal Development Reference

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Database Schema Modifications](#2-database-schema-modifications)
3. [Backend Services Architecture](#3-backend-services-architecture)
4. [Frontend Implementation](#4-frontend-implementation)
5. [System Integration Points](#5-system-integration-points)
6. [Data Migration Strategy](#6-data-migration-strategy)
7. [Privacy & Compliance Considerations](#7-privacy--compliance-considerations)
8. [Testing Scenarios](#8-testing-scenarios)
9. [Performance Requirements](#9-performance-requirements)
10. [Internationalization Support](#10-internationalization-support)
11. [Rollout Timeline](#11-rollout-timeline)
12. [API Reference](#12-api-reference)

---

## 1. Executive Summary

### 1.1 Purpose

This document provides a comprehensive implementation plan for adding birth date and age functionality to the AthlonX Gym Management System. The feature impacts all user types: Members, Trainers, Staff, and Administrators.

### 1.2 Scope

| User Type | Current Birth Date Support | Required Action |
|-----------|---------------------------|-----------------|
| Members | `dateOfBirth` field in profile state (frontend only) | Migrate to database, add validation |
| Trainers | Not stored | Add to database schema |
| Staff | Not stored | Add to database schema |
| Admins/Owners | Not stored | Add to database schema |

### 1.3 Key Requirements

- Store date of birth (DOB) in database with proper constraints
- Calculate age dynamically (never store age - derived field)
- Support minimum age requirements for membership eligibility (typically 16-18 years)
- Support maximum age considerations for certain programs
- Comply with data protection regulations (GDPR, local privacy laws)
- Support international date formats
- Handle timezone edge cases (leap years, DST)

---

## 2. Database Schema Modifications

### 2.1 Users Table - Add DOB Column

```sql
-- Migration: Add date_of_birth to users table
ALTER TABLE users
ADD (
    date_of_birth DATE,
    birth_date_verified CHAR(1) DEFAULT 'N' CHECK (birth_date_verified IN ('Y', 'N')),
    birth_date_verified_at TIMESTAMP,
    birth_date_verified_by VARCHAR2(100)
);

-- Add comment for documentation
COMMENT ON COLUMN users.date_of_birth IS 'Member/trainer/staff date of birth - required for age-based eligibility';
COMMENT ON COLUMN users.birth_date_verified IS 'Whether DOB has been verified with ID document';
```

### 2.2 Members Table Enhancement

```sql
-- For members, add age-related tracking fields
ALTER TABLE members
ADD (
    age_at_registration NUMBER(3,0),
    age_group VARCHAR2(20) GENERATED ALWAYS AS (
        CASE
            WHEN date_of_birth IS NULL THEN NULL
            ELSE FLOOR(MONTHS_BETWEEN(SYSDATE, date_of_birth) / 12)
        END
    ) VIRTUAL,
    requires_parental_consent CHAR(1) DEFAULT 'N',
    parental_consent_document_id NUMBER
);

COMMENT ON COLUMN members.age_group IS 'Auto-calculated: Minor (0-17), Young Adult (18-25), Adult (26-45), Mature (46-65), Senior (66+)';
```

### 2.3 Membership Packages - Age Restrictions

```sql
ALTER TABLE membership_packages
ADD (
    minimum_age NUMBER(3,0) DEFAULT 16,
    maximum_age NUMBER(3,0),
    requires_parental_consent_under NUMBER(3,0) DEFAULT 18,
    age_verification_required CHAR(1) DEFAULT 'N'
);

COMMENT ON COLUMN membership_packages.minimum_age IS 'Minimum age required for this membership tier';
COMMENT ON COLUMN membership_packages.maximum_age IS 'Maximum age allowed (NULL = no limit)';
```

### 2.4 Training Programs - Age Restrictions

```sql
CREATE TABLE training_program_age_rules (
    rule_id NUMBER DEFAULT program_rule_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    program_id NUMBER NOT NULL,
    minimum_age NUMBER(3,0),
    maximum_age NUMBER(3,0),
    requires_medical_clearance_above NUMBER(3,0),
    requires_parental_consent_under NUMBER(3,0),
    is_active CHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tpar_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id)
);

CREATE INDEX idx_tpar_program ON training_program_age_rules(program_id);
CREATE INDEX idx_tpar_age ON training_program_age_rules(minimum_age, maximum_age);
```

### 2.5 Equipment Restrictions

```sql
CREATE TABLE equipment_age_restrictions (
    restriction_id NUMBER DEFAULT equip_restrict_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    equipment_id NUMBER NOT NULL,
    minimum_age NUMBER(3,0),
    maximum_age NUMBER(3,0),
    requires_supervision_under NUMBER(3,0),
    requires_induction CHAR(1) DEFAULT 'N',
    restriction_reason VARCHAR2(500),
    is_active CHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ear_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id),
    CONSTRAINT fk_ear_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id)
);
```

### 2.6 Audit Log for DOB Changes

```sql
CREATE TABLE birth_date_audit_log (
    audit_id NUMBER DEFAULT birth_audit_seq.NEXTVAL PRIMARY KEY,
    user_id NUMBER NOT NULL,
    old_date_of_birth DATE,
    new_date_of_birth DATE,
    changed_by VARCHAR2(100) NOT NULL,
    change_reason VARCHAR2(500),
    verification_status VARCHAR2(50),
    ip_address VARCHAR2(45),
    user_agent VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bdal_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_bdal_user ON birth_date_audit_log(user_id);
CREATE INDEX idx_bdal_date ON birth_date_audit_log(created_at);
```

---

## 3. Backend Services Architecture

### 3.1 Age Calculation Service

```typescript
// Backend service: AgeCalculationService
// Location: backend/src/services/AgeCalculationService.ts

import { injectable } from 'tsyringe';

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  isBirthdayToday: boolean;
  isLeapYearBirthday: boolean;
  nextBirthday: Date;
  ageGroup: AgeGroup;
}

export type AgeGroup =
  | 'minor'        // 0-17
  | 'young_adult'   // 18-25
  | 'adult'         // 26-45
  | 'mature'        // 46-65
  | 'senior';       // 66+

@injectable()
export class AgeCalculationService {

  /**
   * Calculate precise age from date of birth
   * @param dateOfBirth - ISO date string or Date object
   * @param referenceDate - Date to calculate age from (defaults to now)
   */
  calculateAge(dateOfBirth: Date | string, referenceDate: Date = new Date()): AgeResult {
    const dob = new Date(dateOfBirth);
    const ref = new Date(referenceDate);

    if (isNaN(dob.getTime())) {
      throw new Error('Invalid date of birth');
    }

    if (dob > ref) {
      throw new Error('Date of birth cannot be in the future');
    }

    let years = ref.getFullYear() - dob.getFullYear();
    let months = ref.getMonth() - dob.getMonth();
    let days = ref.getDate() - dob.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(ref.getFullYear(), ref.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = this.calculateTotalDaysBetween(dob, ref);
    const isLeapYearBirthday = this.isLeapYear(dob.getMonth() === 1 && dob.getDate() === 29);

    const nextBirthday = this.calculateNextBirthday(dob, ref);
    const isBirthdayToday = this.isBirthdayToday(dob, ref);

    return {
      years,
      months,
      days,
      isBirthdayToday,
      isLeapYearBirthday,
      nextBirthday,
      ageGroup: this.determineAgeGroup(years)
    };
  }

  /**
   * Calculate age in years only (performance-optimized)
   */
  calculateAgeInYears(dateOfBirth: Date | string, referenceDate: Date = new Date()): number {
    const dob = new Date(dateOfBirth);
    const ref = new Date(referenceDate);

    let age = ref.getFullYear() - dob.getFullYear();
    const monthDiff = ref.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Check if user meets minimum age requirement
   */
  meetsMinimumAge(dateOfBirth: Date | string, minimumAge: number, referenceDate: Date = new Date()): boolean {
    const age = this.calculateAgeInYears(dateOfBirth, referenceDate);
    return age >= minimumAge;
  }

  /**
   * Check if user exceeds maximum age limit
   */
  exceedsMaximumAge(dateOfBirth: Date | string, maximumAge: number, referenceDate: Date = new Date()): boolean {
    const age = this.calculateAgeInYears(dateOfBirth, referenceDate);
    return maximumAge !== null && age > maximumAge;
  }

  /**
   * Check if parental consent is required
   */
  requiresParentalConsent(dateOfBirth: Date | string, thresholdAge: number = 18, referenceDate: Date = new Date()): boolean {
    const age = this.calculateAgeInYears(dateOfBirth, referenceDate);
    return age < thresholdAge;
  }

  /**
   * Get membership eligibility status
   */
  getMembershipEligibility(
    dateOfBirth: Date | string,
    membershipRules: { minimumAge?: number; maximumAge?: number; requiresConsentUnder?: number }
  ): EligibilityResult {
    const age = this.calculateAgeInYears(dateOfBirth);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (membershipRules.minimumAge && age < membershipRules.minimumAge) {
      errors.push(`Minimum age of ${membershipRules.minimumAge} years required`);
    }

    if (membershipRules.maximumAge && age > membershipRules.maximumAge) {
      errors.push(`Maximum age of ${membershipRules.maximumAge} years allowed`);
    }

    if (membershipRules.requiresConsentUnder && age < membershipRules.requiresConsentUnder) {
      warnings.push(`Parental/guardian consent required for members under ${membershipRules.requiresConsentUnder}`);
    }

    return {
      eligible: errors.length === 0,
      age,
      errors,
      warnings,
      requiresConsent: warnings.length > 0
    };
  }

  private calculateTotalDaysBetween(start: Date, end: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((end.getTime() - start.getTime()) / oneDay));
  }

  private isLeapYear(isFeb29: boolean): boolean {
    return isFeb29;
  }

  private calculateNextBirthday(dob: Date, reference: Date): Date {
    const nextBirthday = new Date(reference.getFullYear(), dob.getMonth(), dob.getDate());
    if (nextBirthday <= reference) {
      nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }
    return nextBirthday;
  }

  private isBirthdayToday(dob: Date, reference: Date): boolean {
    return dob.getMonth() === reference.getMonth() && dob.getDate() === reference.getDate();
  }

  private determineAgeGroup(years: number): AgeGroup {
    if (years < 18) return 'minor';
    if (years <= 25) return 'young_adult';
    if (years <= 45) return 'adult';
    if (years <= 65) return 'mature';
    return 'senior';
  }
}

export interface EligibilityResult {
  eligible: boolean;
  age: number;
  errors: string[];
  warnings: string[];
  requiresConsent: boolean;
}
```

### 3.2 Validation Rules

```typescript
// Backend service: BirthDateValidationService
// Location: backend/src/services/BirthDateValidationService.ts

import { injectable } from 'tsyringe';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

@injectable()
export class BirthDateValidationService {

  /**
   * Validate date of birth format and logical constraints
   */
  validateDateOfBirth(
    dateOfBirth: string | Date | null,
    userType: 'MEMBER' | 'TRAINER' | 'STAFF' | 'ADMIN' | 'OWNER'
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if DOB is provided
    if (!dateOfBirth) {
      if (userType === 'MEMBER') {
        errors.push('Date of birth is required for membership');
      }
      return { valid: errors.length === 0, errors, warnings };
    }

    const dob = new Date(dateOfBirth);

    // Check valid date format
    if (isNaN(dob.getTime())) {
      errors.push('Invalid date format. Please use YYYY-MM-DD');
      return { valid: false, errors, warnings };
    }

    const today = new Date();

    // Cannot be in the future
    if (dob > today) {
      errors.push('Date of birth cannot be in the future');
    }

    // Must be at least some minimum age (e.g., 10 years old)
    const minReasonableAge = 10;
    const maxReasonableAge = 120;

    const age = this.calculateAgeSimple(dob, today);

    if (age < minReasonableAge) {
      errors.push(`Age must be at least ${minReasonableAge} years`);
    }

    if (age > maxReasonableAge) {
      errors.push(`Age must be less than ${maxReasonableAge} years - please verify`);
    }

    // Warning for very young members
    if (userType === 'MEMBER' && age < 16) {
      warnings.push('Members under 16 require parental consent and may need special arrangements');
    }

    // Warning for teenage members
    if (userType === 'MEMBER' && age >= 16 && age < 18) {
      warnings.push('Members under 18 require parental consent');
    }

    // Warning for senior members
    if (age >= 65) {
      warnings.push('Members 65+ may require medical clearance for full gym access');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate age-specific restrictions for training programs
   */
  validateTrainingProgramEligibility(
    dateOfBirth: string | Date,
    programRequirements: {
      minimumAge?: number;
      maximumAge?: number;
      requiresMedicalClearanceAbove?: number;
    }
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const dob = new Date(dateOfBirth);
    const today = new Date();
    const age = this.calculateAgeSimple(dob, today);

    if (programRequirements.minimumAge && age < programRequirements.minimumAge) {
      errors.push(`This program requires members to be at least ${programRequirements.minimumAge} years old`);
    }

    if (programRequirements.maximumAge && age > programRequirements.maximumAge) {
      errors.push(`This program is restricted to members under ${programRequirements.maximumAge} years old`);
    }

    if (programRequirements.requiresMedicalClearanceAbove && age > programRequirements.requiresMedicalClearanceAbove) {
      warnings.push(`Members over ${programRequirements.requiresMedicalClearanceAbove} require medical clearance for this program`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private calculateAgeSimple(dob: Date, reference: Date): number {
    let age = reference.getFullYear() - dob.getFullYear();
    const monthDiff = reference.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  }
}
```

### 3.3 Controller Endpoints

```typescript
// Backend controller: UserBirthDateController
// Location: backend/src/controllers/UserBirthDateController.ts

import { Request, Response, NextFunction } from 'express';
import { UserBirthDateService } from '../services/UserBirthDateService';
import { AgeCalculationService } from '../services/AgeCalculationService';
import { BirthDateValidationService } from '../services/BirthDateValidationService';
import { auditService } from '../services/AuditService';

export class UserBirthDateController {

  constructor(
    private userBirthDateService: UserBirthDateService,
    private ageCalculationService: AgeCalculationService,
    private validationService: BirthDateValidationService
  ) {}

  /**
   * GET /api/users/:userId/age-info
   * Get calculated age information for a user (does not expose raw DOB)
   */
  getAgeInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const user = await this.userBirthDateService.getUserBirthDate(userId);

      if (!user.dateOfBirth) {
        res.status(404).json({
          success: false,
          error: 'Birth date not available for this user',
          code: 'DOB_NOT_SET'
        });
        return;
      }

      const ageInfo = this.ageCalculationService.calculateAge(user.dateOfBirth);

      res.json({
        success: true,
        data: {
          userId,
          age: ageInfo.years,
          ageGroup: ageInfo.ageGroup,
          isBirthdayToday: ageInfo.isBirthdayToday,
          nextBirthday: ageInfo.nextBirthday
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/users/:userId/date-of-birth
   * Update user's date of birth (with validation and audit)
   */
  updateDateOfBirth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const { dateOfBirth, verificationDocument } = req.body;
      const userType = req.user?.userType || 'MEMBER';

      // Validate the date
      const validation = this.validationService.validateDateOfBirth(dateOfBirth, userType);

      if (!validation.valid) {
        res.status(400).json({
          success: false,
          errors: validation.errors,
          code: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check eligibility rules if membership-related
      if (userType === 'MEMBER') {
        const membershipRules = await this.userBirthDateService.getMembershipRules(userId);
        const eligibility = this.ageCalculationService.getMembershipEligibility(
          dateOfBirth,
          membershipRules
        );

        if (!eligibility.eligible) {
          res.status(400).json({
            success: false,
            errors: eligibility.errors,
            warnings: eligibility.warnings,
            code: 'MEMBERSHIP_INELIGIBLE'
          });
          return;
        }
      }

      // Update with audit trail
      const oldDob = await this.userBirthDateService.getRawBirthDate(userId);

      await this.userBirthDateService.updateBirthDate(userId, dateOfBirth, {
        verified: !!verificationDocument,
        verifiedAt: verificationDocument ? new Date() : null,
        verifiedBy: verificationDocument ? req.user?.userId : null
      });

      // Audit log
      await auditService.log({
        action: 'DATE_OF_BIRTH_UPDATED',
        entityType: 'USER',
        entityId: userId,
        oldValue: oldDob,
        newValue: dateOfBirth,
        performedBy: req.user?.userId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      const ageInfo = this.ageCalculationService.calculateAge(dateOfBirth);

      res.json({
        success: true,
        data: {
          dateOfBirth,
          age: ageInfo.years,
          ageGroup: ageInfo.ageGroup,
          warnings: validation.warnings,
          requiresConsent: ageInfo.years < 18
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/users/:userId/verify-birth-date
   * Verify birth date with ID document
   */
  verifyBirthDate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const { documentId, verificationType } = req.body;

      await this.userBirthDateService.markAsVerified(userId, {
        documentId,
        verificationType,
        verifiedBy: req.user?.userId,
        verifiedAt: new Date()
      });

      await auditService.log({
        action: 'DATE_OF_BIRTH_VERIFIED',
        entityType: 'USER',
        entityId: userId,
        performedBy: req.user?.userId,
        metadata: { documentId, verificationType }
      });

      res.json({
        success: true,
        message: 'Birth date verified successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/memberships/:membershipId/age-eligibility
   * Check if user's age qualifies for a specific membership plan
   */
  checkMembershipEligibility = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { membershipId } = req.params;
      const userId = req.user?.userId;

      const user = await this.userBirthDateService.getUserBirthDate(userId);
      if (!user.dateOfBirth) {
        res.status(400).json({
          success: false,
          error: 'Date of birth required to check eligibility',
          code: 'DOB_REQUIRED'
        });
        return;
      }

      const membershipRules = await this.userBirthDateService.getMembershipPackageRules(membershipId);
      const eligibility = this.ageCalculationService.getMembershipEligibility(
        user.dateOfBirth,
        membershipRules
      );

      res.json({
        success: true,
        data: eligibility
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/training-programs/:programId/age-eligibility
   * Check age eligibility for training programs
   */
  checkProgramEligibility = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { programId } = req.params;
      const userId = req.user?.userId;

      const user = await this.userBirthDateService.getUserBirthDate(userId);
      if (!user.dateOfBirth) {
        res.status(400).json({
          success: false,
          error: 'Date of birth required to check eligibility',
          code: 'DOB_REQUIRED'
        });
        return;
      }

      const programRules = await this.userBirthDateService.getProgramAgeRules(programId);
      const eligibility = this.ageCalculationService.validateTrainingProgramEligibility(
        user.dateOfBirth,
        programRules
      );

      res.json({
        success: true,
        data: eligibility
      });
    } catch (error) {
      next(error);
    }
  };
}
```

---

## 4. Frontend Implementation

### 4.1 Date Picker Component

```typescript
// Frontend component: BirthDatePicker
// Location: frontend/src/components/BirthDatePicker.tsx

import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

interface BirthDatePickerProps {
  value: string; // ISO date string
  onChange: (date: string, age: number | null) => void;
  onBlur?: () => void;
  error?: string;
  warning?: string;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  minAge?: number;
  maxAge?: number;
}

export const BirthDatePicker: React.FC<BirthDatePickerProps> = ({
  value,
  onChange,
  onBlur,
  error,
  warning,
  disabled = false,
  label = 'Date of Birth',
  required = false,
  minAge = 10,
  maxAge = 100
}) => {
  const [localError, setLocalError] = useState<string | null>(null);
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);

  // Calculate age from date
  useEffect(() => {
    if (!value) {
      setCalculatedAge(null);
      return;
    }

    const calculateAge = (dob: string): number => {
      const birth = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      return age;
    };

    const age = calculateAge(value);
    setCalculatedAge(age);

    // Validate age range
    if (age < minAge) {
      setLocalError(`Minimum age of ${minAge} years required`);
    } else if (age > maxAge) {
      setLocalError(`Age must be less than ${maxAge} years`);
    } else {
      setLocalError(null);
    }
  }, [value, minAge, maxAge]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    const age = newDate ? calculateAgeFromInput(newDate) : null;
    onChange(newDate, age);
  };

  const calculateAgeFromInput = (dateStr: string): number | null => {
    if (!dateStr) return null;
    const birth = new Date(dateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const getMaxDate = (): string => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - minAge);
    return today.toISOString().split('T')[0];
  };

  const getMinDate = (): string => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - maxAge);
    return today.toISOString().split('T')[0];
  };

  const displayError = error || localError;

  return (
    <div className="birth-date-picker">
      {label && (
        <label className="birth-date-picker__label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}

      <div className="birth-date-picker__input-wrapper">
        <Calendar size={16} className="birth-date-picker__icon" />
        <input
          type="date"
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          max={getMaxDate()}
          min={getMinDate()}
          className={`birth-date-picker__input ${displayError ? 'error' : ''} ${warning ? 'warning' : ''}`}
        />
      </div>

      {calculatedAge !== null && !displayError && (
        <div className="birth-date-picker__age-display">
          <span className="age-label">Age:</span>
          <span className="age-value">{calculatedAge} years</span>
          {calculatedAge < 18 && (
            <span className="age-warning">Parental consent required</span>
          )}
        </div>
      )}

      {displayError && (
        <div className="birth-date-picker__error">
          <AlertCircle size={12} />
          {displayError}
        </div>
      )}

      {warning && !displayError && (
        <div className="birth-date-picker__warning">
          <AlertCircle size={12} />
          {warning}
        </div>
      )}
    </div>
  );
};

// CSS Module: BirthDatePicker.css
/*
.birth-date-picker {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.birth-date-picker__label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.birth-date-picker__input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.birth-date-picker__icon {
  position: absolute;
  left: 12px;
  color: var(--text-tertiary);
  pointer-events: none;
}

.birth-date-picker__input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-main);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.birth-date-picker__input.error {
  border-color: var(--color-crimson);
}

.birth-date-picker__input.warning {
  border-color: var(--color-amber);
}

.birth-date-picker__age-display {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
}

.age-label {
  color: var(--text-tertiary);
}

.age-value {
  font-weight: 600;
  color: var(--text-primary);
}

.age-warning {
  color: var(--color-amber);
  font-size: 0.7rem;
  margin-left: auto;
}

.birth-date-picker__error,
.birth-date-picker__warning {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--color-crimson);
}
*/
```

### 4.2 Age Display Component

```typescript
// Frontend component: AgeDisplay
// Location: frontend/src/components/AgeDisplay.tsx

interface AgeDisplayProps {
  dateOfBirth: string;
  showAgeGroup?: boolean;
  showNextBirthday?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const AgeDisplay: React.FC<AgeDisplayProps> = ({
  dateOfBirth,
  showAgeGroup = true,
  showNextBirthday = false,
  size = 'medium'
}) => {
  const age = useMemo(() => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      years--;
    }

    return years;
  }, [dateOfBirth]);

  const ageGroup = useMemo(() => {
    if (age < 18) return 'Minor';
    if (age <= 25) return 'Young Adult';
    if (age <= 45) return 'Adult';
    if (age <= 65) return 'Mature';
    return 'Senior';
  }, [age]);

  const nextBirthday = useMemo(() => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    const next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());

    if (next <= today) {
      next.setFullYear(next.getFullYear() + 1);
    }

    return next.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [dateOfBirth]);

  const sizeClasses = {
    small: 'age-display--small',
    medium: 'age-display--medium',
    large: 'age-display--large'
  };

  return (
    <div className={`age-display ${sizeClasses[size]}`}>
      <span className="age-display__age">{age}</span>
      <span className="age-display__unit">yrs</span>
      {showAgeGroup && (
        <span className="age-display__group">{ageGroup}</span>
      )}
      {showNextBirthday && (
        <span className="age-display__next">
          Next birthday: {nextBirthday}
        </span>
      )}
    </div>
  );
};
```

### 4.3 Profile Form Integration - Member Settings

```typescript
// In MemberSettings.tsx - Profile section update

const MemberSettings: React.FC = () => {
  // ... existing state ...

  const [profile, setProfile] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',  // Already exists, needs API integration
    gender: '',
    address: '',
    bio: '',
  });

  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  // Calculate age when DOB changes
  useEffect(() => {
    if (profile.dateOfBirth) {
      const dob = new Date(profile.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      setCalculatedAge(age);

      // Set parental consent flag if under 18
      if (age < 18) {
        setProfile(prev => ({ ...prev, requiresParentalConsent: true }));
      }
    } else {
      setCalculatedAge(null);
    }
  }, [profile.dateOfBirth]);

  const validateProfileForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Date of Birth validation for members
    if (!profile.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required for membership verification';
    } else {
      const dob = new Date(profile.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();

      if (age < 16) {
        errors.dateOfBirth = 'Minimum age of 16 years required for membership';
      }
      if (age > 100) {
        errors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfileForm()) {
      toast.error('Please correct the errors before saving');
      return;
    }

    try {
      const response = await api.put(`/users/${user.userId}`, {
        dateOfBirth: profile.dateOfBirth,
        calculatedAge // Not stored, but returned for confirmation
      });

      if (response.data.requiresConsent) {
        toast.warning('Parental consent required - please upload consent form');
      } else {
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  // In the profile form JSX:
  /*
  <BirthDatePicker
    value={profile.dateOfBirth}
    onChange={(date, age) => {
      setProfile(prev => ({ ...prev, dateOfBirth: date }));
      setCalculatedAge(age);
    }}
    error={profileErrors.dateOfBirth}
    warning={calculatedAge && calculatedAge < 18 ? 'Parental consent required' : undefined}
    required
  />

  {calculatedAge && (
    <div className="profile-calculated-age">
      Calculated Age: <strong>{calculatedAge} years</strong>
      {calculatedAge < 18 && (
        <span className="consent-required"> - Parental consent required</span>
      )}
    </div>
  )}
  */
};
```

### 4.4 Trainer Profile Form

```typescript
// In TrainerProfile.tsx - Add birth date field

interface TrainerProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  specializations: string[];
  certifications: Certification[];
  experienceYears: number;
  bio: string;
}

const TrainerProfile: React.FC = () => {
  const [form, setForm] = useState<TrainerProfileForm>({
    // ... existing fields
    dateOfBirth: '',
  });

  const validateTrainerProfile = (): boolean => {
    const errors: Record<string, string> = {};

    // DOB for trainers (older trainers may have restrictions)
    if (form.dateOfBirth) {
      const age = calculateAge(form.dateOfBirth);
      if (age < 18) {
        errors.dateOfBirth = 'Trainers must be at least 18 years old';
      }
      if (age > 75) {
        errors.dateOfBirth = 'Please contact HR regarding retirement requirements';
      }
    }

    return Object.keys(errors).length === 0;
  };

  // DOB picker for trainer profile
  /*
  <BirthDatePicker
    value={form.dateOfBirth}
    onChange={(date) => setForm(prev => ({ ...prev, dateOfBirth: date }))}
    minAge={18}
    maxAge={75}
    label="Date of Birth"
    warning={calculateAge(form.dateOfBirth) > 65 ? 'Medical clearance may be required' : undefined}
  />
  */
};
```

---

## 5. System Integration Points

### 5.1 Membership Eligibility Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Membership Eligibility Check                      │
└─────────────────────────────────────────────────────────────────────┘

1. User selects membership plan
          │
          ▼
2. System checks if user has DOB on file
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
  NO          YES
    │           │
    │           ▼
    │    3. Calculate age from DOB
    │           │
    │           ▼
    │    4. Compare against plan requirements:
    │       - minimum_age
    │       - maximum_age
    │       - requires_parental_consent_under
    │           │
    │    ┌──────┴──────┐
    │    │             │
    │    ▼             ▼
    │  PASS         FAIL
    │    │             │
    │    │             ▼
    │    │     Show eligibility error
    │    │     Suggest alternative plans
    │    │
    │    ▼
    │  Check parental consent
    │           │
    │    ┌──────┴──────┐
    │    │             │
    │    ▼             ▼
    │  UNDER 18     18+
    │    │             │
    ▼    ▼             ▼
5. Prompt    Grant       Grant
   for DOB   membership  membership
            (if consent (no consent
             provided)  needed)
```

### 5.2 Training Program Age Restrictions

| Program Type | Min Age | Max Age | Medical Required | Consent Required |
|--------------|---------|---------|-----------------|------------------|
| Basic Fitness | 16 | None | >65 | <18 |
| Strength Training | 18 | None | >65 | <18 |
| HIIT | 16 | 55 | >50 | <18 |
| CrossFit | 18 | 55 | >45 | N/A |
| Yoga | 14 | None | >70 | <18 |
| Swimming Lessons | 8 | None | No | <16 |
| Personal Training | 16 | None | >60 | <18 |
| Senior Fitness | 55 | None | Yes | N/A |
| Youth Programs | 10 | 17 | No | Yes |

### 5.3 Equipment Restrictions

| Equipment | Min Age | Max Age | Supervision Required | Induction Required |
|-----------|---------|---------|---------------------|-------------------|
| Free Weights | 16 | None | <18 | Yes |
| Power Rack | 18 | None | <18 | Yes |
| Treadmill | 14 | None | >65 | No |
| Elliptical | 12 | None | >70 | No |
| Leg Press | 16 | None | <18 | Yes |
| Chest Press | 16 | None | <18 | Yes |
| Cable Machines | 14 | None | <16 | Yes |
| Smith Machine | 16 | None | <18 | Yes |
| Swimming Pool | 8 | None | <12 | No |
| Sauna/Steam | 16 | None | >65 | No |

### 5.4 Insurance Requirements

```typescript
interface InsuranceAgeRequirement {
  coverageType: string;
  minimumAge: number;
  maximumAge: number;
  requiresMedicalClearance: boolean;
  requiresConsent: boolean;
  additionalDocumentation?: string[];
}

// Insurance configurations
const INSURANCE_REQUIREMENTS: InsuranceAgeRequirement[] = [
  {
    coverageType: 'BASIC_MEMBERSHIP',
    minimumAge: 16,
    maximumAge: 75,
    requiresMedicalClearance: true, // over 65
    requiresConsent: true // under 18
  },
  {
    coverageType: 'PREMIUM_MEMBERSHIP',
    minimumAge: 18,
    maximumAge: 70,
    requiresMedicalClearance: true, // over 60
    requiresConsent: false
  },
  {
    coverageType: 'PERSONAL_TRAINING',
    minimumAge: 16,
    maximumAge: 70,
    requiresMedicalClearance: true, // over 55
    requiresConsent: true, // under 18
    additionalDocumentation: ['Health questionnaire', 'PAR-Q form']
  },
  {
    coverageType: 'YOUTH_PROGRAM',
    minimumAge: 10,
    maximumAge: 17,
    requiresMedicalClearance: false,
    requiresConsent: true,
    additionalDocumentation: ['Parental consent form', 'Emergency contact']
  }
];
```

---

## 6. Data Migration Strategy

### 6.1 Migration Phases

#### Phase 1: Schema Update (Week 1)
```sql
-- Add nullable columns (no data loss)
ALTER TABLE users ADD (date_of_birth DATE);
ALTER TABLE users ADD (birth_date_verified CHAR(1) DEFAULT 'N');

-- Add columns to members table
ALTER TABLE members ADD (age_at_registration NUMBER(3,0));
ALTER TABLE members ADD (requires_parental_consent CHAR(1) DEFAULT 'N');

-- Add age restriction columns to membership_packages
ALTER TABLE membership_packages ADD (minimum_age NUMBER(3,0) DEFAULT 16);
ALTER TABLE membership_packages ADD (maximum_age NUMBER(3,0));
ALTER TABLE membership_packages ADD (requires_parental_consent_under NUMBER(3,0) DEFAULT 18);

-- Add audit table
CREATE TABLE birth_date_audit_log (...);
```

#### Phase 2: Existing Data Assessment (Week 1-2)

```sql
-- Count users without DOB
SELECT user_type, COUNT(*) as total, COUNT(date_of_birth) as with_dob
FROM users
GROUP BY user_type;

-- Sample users without DOB
SELECT user_id, username, email, user_type, created_at
FROM users
WHERE date_of_birth IS NULL
ORDER BY created_at DESC;
```

#### Phase 3: Soft Migration - Request DOB from Users (Week 2-4)

```typescript
// Backend: Flag users needing DOB
async function identifyUsersNeedingDob(): Promise<UserNeedsDob[]> {
  return await db.query(`
    SELECT u.user_id, u.email, u.user_type, u.gym_id,
           CASE WHEN ur.role_name = 'CUSTOMER' THEN 'MEMBER'
                ELSE ur.role_name END as role_type
    FROM users u
    JOIN user_role_assignments ura ON u.user_id = ura.user_id
    JOIN user_roles ur ON ura.role_id = ur.role_id
    WHERE u.date_of_birth IS NULL
    AND u.is_active = 'Y'
  `);
}

// Send email/SMS campaign requesting DOB
async function sendDobRequestCampaign(): Promise<void> {
  const usersNeedingDob = await identifyUsersNeedingDob();

  for (const user of usersNeedingDob) {
    await notificationService.send({
      type: 'EMAIL',
      recipient: user.email,
      template: 'DOB_REQUEST',
      data: {
        name: user.username,
        roleType: user.role_type,
        redirectUrl: `/profile?prompt=dob&userId=${user.user_id}`
      }
    });
  }
}
```

#### Phase 4: Required Collection (Week 4-8)

For new signups: DOB becomes **required field**
For existing users: DOB becomes **required for:
- Membership renewal
- Personal training booking
- Class booking
- Access to age-restricted equipment**

#### Phase 5: Hard Deadline (Week 8+)

```sql
-- After deadline, users without DOB:
-- 1. Cannot renew membership
-- 2. Cannot book PT sessions
-- 3. Limited to basic gym access

UPDATE users
SET date_of_birth = (SELECT birth_date FROM legacy_member_data WHERE legacy_member_data.user_id = users.user_id)
WHERE date_of_birth IS NULL
AND EXISTS (SELECT 1 FROM legacy_member_data WHERE legacy_member_data.user_id = users.user_id);

-- For truly unresolvable cases, use estimated age from join date
-- (This is a last resort - mark as "estimated")
UPDATE users
SET date_of_birth = TO_DATE('1990-01-01', 'YYYY-MM-DD') -- Placeholder
WHERE date_of_birth IS NULL
AND user_type IN ('MEMBER', 'TRAINER', 'STAFF');
```

### 6.2 Rollback Procedures

```sql
-- Rollback: Remove DOB columns (if major issue discovered)
ALTER TABLE users DROP COLUMN date_of_birth;
ALTER TABLE users DROP COLUMN birth_date_verified;

-- Rollback: Remove age restrictions from membership packages
ALTER TABLE membership_packages DROP COLUMN minimum_age;
ALTER TABLE membership_packages DROP COLUMN maximum_age;
ALTER TABLE membership_packages DROP COLUMN requires_parental_consent_under;

-- Rollback: Remove audit table
DROP TABLE birth_date_audit_log;
```

---

## 7. Privacy & Compliance Considerations

### 7.1 Data Protection Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Data Minimization** | Only collect birth date, not full ID numbers |
| **Purpose Limitation** | DOB used only for age verification, eligibility checks |
| **Storage Limitation** | DOB retained while account active, deleted on account closure |
| **Encryption** | DOB encrypted at rest using AES-256 |
| **Access Control** | Only authorized roles can view raw DOB |
| **Audit Trail** | All DOB access and changes logged |

### 7.2 Access Control Matrix

| Role | View Own DOB | View Others DOB | Edit Own DOB | Edit Others DOB | View Age Groups |
|------|-------------|-----------------|--------------|-----------------|-----------------|
| Member | ✓ | ✗ | ✓ | ✗ | ✓ |
| Trainer | ✓ | Own members | ✓ | ✗ | ✓ |
| Staff | ✓ | ✗ | ✓ | ✗ | ✓ |
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ |
| Owner | ✓ | ✓ | ✓ | ✓ | ✓ |

### 7.3 GDPR Compliance Checklist

- [ ] Privacy Policy updated to include DOB processing
- [ ] Consent checkbox added to registration form
- [ ] Data export includes DOB (if requested)
- [ ] Data deletion removes DOB
- [ ] Breach notification procedure documented
- [ ] Data Processing Agreement with third parties updated
- [ ] Privacy impact assessment completed

### 7.4 Parental Consent Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                   Parental Consent Workflow                           │
└─────────────────────────────────────────────────────────────────────┘

1. Minor (<18) attempts to register/purchase
          │
          ▼
2. System identifies age requires consent
          │
          ▼
3. Display parental consent requirement
          │
          ▼
4. Parent/Guardian provides:
   - Full name
   - Email
   - Phone
   - ID verification
   - Digital signature
          │
          ▼
5. Verification email sent to parent
          │
          ▼
6. Parent confirms consent
          │
          ▼
7. Membership activated with consent flag
          │
          ▼
8. Annual re-consent reminder
```

---

## 8. Testing Scenarios

### 8.1 Unit Tests

```typescript
describe('AgeCalculationService', () => {
  describe('calculateAge', () => {
    it('should calculate age correctly for simple case', () => {
      const dob = '1990-05-15';
      const ref = '2026-04-15';
      const result = service.calculateAge(dob, new Date(ref));
      expect(result.years).toBe(35);
      expect(result.months).toBe(11);
      expect(result.days).toBe(0);
    });

    it('should handle birthday not yet reached this year', () => {
      const dob = '1990-10-20';
      const ref = '2026-04-15';
      const result = service.calculateAge(dob, new Date(ref));
      expect(result.years).toBe(35);
      expect(result.months).toBe(5);
      expect(result.days).toBe(26);
    });

    it('should handle leap year birthdays', () => {
      const dob = '2000-02-29'; // Born on leap day
      const ref = '2026-02-28';
      const result = service.calculateAge(dob, new Date(ref));
      // On Feb 28, still 25 because birthday is Feb 29
      expect(result.years).toBe(25);
    });

    it('should handle leap year birthday in leap year', () => {
      const dob = '2000-02-29';
      const ref = '2024-02-29';
      const result = service.calculateAge(dob, new Date(ref));
      expect(result.years).toBe(24);
      expect(result.isBirthdayToday).toBe(true);
    });

    it('should handle timezone edge cases', () => {
      // User born at 11:59 PM in EST
      const dob = '2000-01-15T23:59:00-05:00';
      const ref = '2026-01-15T23:30:00-05:00'; // Almost birthday
      const result = service.calculateAge(dob, new Date(ref));
      expect(result.years).toBe(25);
    });

    it('should reject future dates', () => {
      const dob = '2030-01-01';
      const ref = '2026-04-15';
      expect(() => service.calculateAge(dob, new Date(ref)))
        .toThrow('Date of birth cannot be in the future');
    });

    it('should handle very old dates', () => {
      const dob = '1940-06-20';
      const ref = '2026-04-15';
      const result = service.calculateAge(dob, new Date(ref));
      expect(result.years).toBe(85);
      expect(result.ageGroup).toBe('senior');
    });
  });

  describe('requiresParentalConsent', () => {
    it('should return true for 17 year old', () => {
      const dob = '2008-04-20';
      const ref = '2026-04-15';
      expect(service.requiresParentalConsent(dob, 18, new Date(ref))).toBe(true);
    });

    it('should return false for 18 year old', () => {
      const dob = '2008-04-10';
      const ref = '2026-04-15';
      expect(service.requiresParentalConsent(dob, 18, new Date(ref))).toBe(false);
    });

    it('should handle birthday exactly at threshold', () => {
      const dob = '2008-04-15';
      const ref = '2026-04-15';
      // On birthday, exactly 18
      expect(service.requiresParentalConsent(dob, 18, new Date(ref))).toBe(false);
    });
  });
});
```

### 8.2 Integration Tests

```typescript
describe('Birth Date API Integration', () => {
  describe('PUT /api/users/:userId/date-of-birth', () => {
    it('should update DOB and return age info', async () => {
      const response = await request(app)
        .put(`/api/users/${testUserId}/date-of-birth`)
        .send({ dateOfBirth: '1995-06-20' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.age).toBe(30);
      expect(response.body.data.ageGroup).toBe('adult');
    });

    it('should reject future DOB', async () => {
      const response = await request(app)
        .put(`/api/users/${testUserId}/date-of-birth`)
        .send({ dateOfBirth: '2030-01-01' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Date of birth cannot be in the future');
    });

    it('should trigger parental consent for minors', async () => {
      const response = await request(app)
        .put(`/api/users/${testUserId}/date-of-birth`)
        .send({ dateOfBirth: '2010-06-20' })
        .expect(200);

      expect(response.body.data.requiresConsent).toBe(true);
    });

    it('should create audit log entry', async () => {
      await request(app)
        .put(`/api/users/${testUserId}/date-of-birth`)
        .send({ dateOfBirth: '1995-06-20' });

      const audit = await db.query(
        'SELECT * FROM birth_date_audit_log WHERE user_id = ? ORDER BY created_at DESC',
        [testUserId]
      );

      expect(audit.rows.length).toBe(1);
      expect(audit.rows[0].action).toBe('DATE_OF_BIRTH_UPDATED');
    });
  });

  describe('Membership Eligibility', () => {
    it('should correctly assess eligibility based on age', async () => {
      // Create member under 18
      const minorUser = await createTestUser({ dateOfBirth: '2010-06-20' });

      // Try to book restricted program
      const response = await request(app)
        .post(`/api/training-programs/${adultOnlyProgramId}/book`)
        .send({ userId: minorUser.userId })
        .expect(400);

      expect(response.body.errors).toContain(
        'This program requires members to be at least 18 years old'
      );
    });
  });
});
```

### 8.3 Edge Cases

| Scenario | Input | Expected Output | Test Case |
|----------|-------|-----------------|-----------|
| Leap year birthday Feb 29 | DOB: 2000-02-29, Ref: 2024-02-29 | Age: 24, isBirthdayToday: true | TC-001 |
| Leap year birthday Feb 28 | DOB: 2000-02-29, Ref: 2025-02-28 | Age: 24 (no birthday yet) | TC-002 |
| Exactly 18 years old | DOB: 2008-04-15, Ref: 2026-04-15 | requiresConsent: false | TC-003 |
| One day before 18 | DOB: 2008-04-16, Ref: 2026-04-15 | requiresConsent: true | TC-004 |
| Future date rejection | DOB: 2030-01-01 | Error message | TC-005 |
| Invalid date format | DOB: "invalid" | Error message | TC-006 |
| Very young user | DOB: 2018-01-01, Ref: 2026-04-15 | Validation error (min 16) | TC-007 |
| Centenarian | DOB: 1920-05-15, Ref: 2026-04-15 | Age: 105, senior | TC-008 |
| DST transition | DOB: 1990-03-10, Ref: 2026-03-09 | Age calculation correct | TC-009 |
| Year boundary | DOB: 1990-12-31, Ref: 2026-01-01 | Age: 35 | TC-010 |

---

## 9. Performance Requirements

### 9.1 Calculation Performance

| Metric | Requirement | Implementation |
|--------|-------------|----------------|
| Single age calculation | < 1ms | In-memory calculation |
| Bulk age calculation (1000 users) | < 50ms | Batch processing |
| Age lookup from cache | < 5ms | Redis cache with 1hr TTL |
| Age group aggregation | < 100ms | Materialized view |

### 9.2 Caching Strategy

```typescript
// Redis caching for age calculations
const AGE_CACHE_TTL = 3600; // 1 hour

async function getCachedAge(userId: number): Promise<AgeResult | null> {
  const cached = await redis.get(`age:${userId}`);
  if (cached) {
    return JSON.parse(cached);
  }
  return null;
}

async function setCachedAge(userId: number, ageResult: AgeResult): Promise<void> {
  await redis.setex(
    `age:${userId}`,
    AGE_CACHE_TTL,
    JSON.stringify(ageResult)
  );
}

// Invalidate on DOB change
async function invalidateAgeCache(userId: number): Promise<void> {
  await redis.del(`age:${userId}`);
}
```

### 9.3 Database Indexes

```sql
-- Index for age-based queries
CREATE INDEX idx_users_age ON users(
  CASE WHEN date_of_birth IS NOT NULL
  THEN FLOOR(MONTHS_BETWEEN(SYSDATE, date_of_birth) / 12)
  END
);

-- Index for membership eligibility checks
CREATE INDEX idx_members_age_group ON members(
  CASE
    WHEN FLOOR(MONTHS_BETWEEN(SYSDATE, date_of_birth) / 12) < 18 THEN 'minor'
    WHEN FLOOR(MONTHS_BETWEEN(SYSDATE, date_of_birth) / 12) <= 25 THEN 'young_adult'
    WHEN FLOOR(MONTHS_BETWEEN(SYSDATE, date_of_birth) / 12) <= 45 THEN 'adult'
    WHEN FLOOR(MONTHS_BETWEEN(SYSDATE, date_of_birth) / 12) <= 65 THEN 'mature'
    ELSE 'senior'
  END
);

-- Composite index for eligibility checks
CREATE INDEX idx_membership_age_eligible ON membership_packages(
  minimum_age,
  maximum_age,
  requires_parental_consent_under
);
```

---

## 10. Internationalization Support

### 10.1 Date Format Configuration

```typescript
interface DateFormatConfig {
  locale: string;
  format: string;
  displayFormat: string;
  placeholder: string;
}

const DATE_FORMAT_CONFIGS: Record<string, DateFormatConfig> = {
  'en-US': {
    locale: 'en-US',
    format: 'YYYY-MM-DD',      // ISO for API/storage
    displayFormat: 'MM/DD/YYYY',
    placeholder: 'MM/DD/YYYY'
  },
  'en-GB': {
    locale: 'en-GB',
    format: 'YYYY-MM-DD',
    displayFormat: 'DD/MM/YYYY',
    placeholder: 'DD/MM/YYYY'
  },
  'de-DE': {
    locale: 'de-DE',
    format: 'YYYY-MM-DD',
    displayFormat: 'DD.MM.YYYY',
    placeholder: 'DD.MM.YYYY'
  },
  'fr-FR': {
    locale: 'fr-FR',
    format: 'YYYY-MM-DD',
    displayFormat: 'DD/MM/YYYY',
    placeholder: 'DD/MM/YYYY'
  },
  'ja-JP': {
    locale: 'ja-JP',
    format: 'YYYY-MM-DD',
    displayFormat: 'YYYY/MM/DD',
    placeholder: 'YYYY/MM/DD'
  },
  'zh-CN': {
    locale: 'zh-CN',
    format: 'YYYY-MM-DD',
    displayFormat: 'YYYY年MM月DD日',
    placeholder: 'YYYY/MM/DD'
  },
  'ar-SA': {
    locale: 'ar-SA',
    format: 'YYYY-MM-DD',
    displayFormat: 'DD/MM/YYYY',
    placeholder: 'DD/MM/YYYY',
    direction: 'rtl'
  }
};
```

### 10.2 Frontend Date Formatting

```typescript
// Utility: Format date for display based on locale
function formatDateForDisplay(
  isoDate: string,
  locale: string = 'en-US'
): string {
  const date = new Date(isoDate);

  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// Utility: Parse localized date input
function parseLocalizedDate(
  dateString: string,
  locale: string
): Date | null {
  // Try locale-specific parsing first
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch {
    // Fall through to manual parsing
  }

  // Manual parsing based on locale format
  const parts = dateString.split(/[./-]/);
  if (parts.length !== 3) return null;

  if (locale === 'en-US') {
    // MM/DD/YYYY
    return new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
  } else {
    // DD/MM/YYYY or DD.MM.YYYY
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }
}

// Utility: Convert to ISO for API
function toIsoDate(localDate: Date): string {
  return localDate.toISOString().split('T')[0];
}
```

### 10.3 Age Calculation Across Timezones

```typescript
// Always calculate age in user's local timezone context
function calculateAgeWithTimezone(
  dateOfBirth: Date,
  referenceDate: Date,
  userTimezone: string
): AgeResult {
  // Convert dates to user's timezone for calculation
  const dobLocal = zonedTimeToUtc(dateOfBirth, userTimezone);
  const refLocal = zonedTimeToUtc(referenceDate, userTimezone);

  return calculateAgeInZulu(dobLocal, refLocal);
}

// Handle edge case: user in different timezone than server
function calculateAgeForUser(
  dateOfBirth: Date,
  userTimezone: string
): number {
  const userDOB = utcToZonedTime(dateOfBirth, userTimezone);
  const now = utcToZonedTime(new Date(), userTimezone);

  let age = now.getFullYear() - userDOB.getFullYear();
  const monthDiff = now.getMonth() - userDOB.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < userDOB.getDate())) {
    age--;
  }

  return age;
}
```

---

## 11. Rollout Timeline

### 11.1 Implementation Schedule

```
Week 1-2: Database Migration
├── Add DOB columns (nullable)
├── Create audit table
├── Create age restriction tables
├── Add indexes
└── Deploy to staging

Week 3-4: Backend Development
├── Age Calculation Service
├── Birth Date Validation Service
├── API Endpoints
├── Audit logging
└── Unit tests

Week 5-6: Frontend Development
├── BirthDatePicker component
├── AgeDisplay component
├── Member profile form update
├── Trainer profile form update
├── Staff profile form update
└── Integration tests

Week 7: Integration & Testing
├── End-to-end testing
├── Penetration testing
├── Performance testing
├── Accessibility testing
└── Bug fixes

Week 8: Staged Rollout (10% → 25% → 50% → 100%)
├── Deploy to production (10% users)
├── Monitor errors and metrics
├── Gradual increase
└── Full deployment

Week 9-10: User Communication & Follow-up
├── Email campaign for existing users
├── Help documentation
├── Support training
└── Monitor adoption
```

### 11.2 Rollback Procedures

```sql
-- Immediate rollback (within first 24 hours)
-- Revert database changes
ALTER TABLE users DROP COLUMN date_of_birth;
ALTER TABLE users DROP COLUMN birth_date_verified;
ALTER TABLE members DROP COLUMN age_at_registration;
ALTER TABLE members DROP COLUMN requires_parental_consent;

-- Remove new tables
DROP TABLE birth_date_audit_log;
DROP TABLE training_program_age_rules;
DROP TABLE equipment_age_restrictions;

-- Revert membership package changes
ALTER TABLE membership_packages DROP COLUMN minimum_age;
ALTER TABLE membership_packages DROP COLUMN maximum_age;
ALTER TABLE membership_packages DROP COLUMN requires_parental_consent_under;

-- Code rollback
git revert <commit_hash>
npm run build && npm run deploy:rollback
```

### 11.3 Go/No-Go Criteria

| Metric | Go Criteria | No-Go Criteria |
|--------|-------------|----------------|
| Error rate | < 0.1% | > 1% |
| Performance impact | < 5% latency increase | > 20% latency |
| Failed validations | < 1% | > 5% |
| Audit logging | 100% | < 99% |
| User complaints | < 10 | > 50 |

---

## 12. API Reference

### 12.1 Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/:userId/age-info` | Get age info (not raw DOB) | Yes |
| PUT | `/api/users/:userId/date-of-birth` | Update DOB | Yes (Self or Admin) |
| POST | `/api/users/:userId/verify-birth-date` | Verify with document | Admin |
| GET | `/api/users/:userId/eligibility/:type` | Check eligibility | Yes |
| GET | `/api/memberships/:id/age-requirements` | Get membership age rules | Yes |
| GET | `/api/training-programs/:id/age-requirements` | Get program age rules | Yes |
| GET | `/api/equipment/:id/age-restrictions` | Get equipment age rules | Yes |
| POST | `/api/parental-consent` | Submit parental consent | Yes |

### 12.2 Endpoint Details

#### PUT /api/users/:userId/date-of-birth

**Request:**
```json
{
  "dateOfBirth": "1995-06-20",
  "verificationDocument": "doc_123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": 12345,
    "dateOfBirth": "1995-06-20",
    "age": 30,
    "ageGroup": "adult",
    "warnings": [],
    "requiresConsent": false,
    "isBirthdayToday": false,
    "nextBirthday": "2026-06-20"
  }
}
```

**Validation Error Response (400):**
```json
{
  "success": false,
  "errors": [
    "Date of birth cannot be in the future",
    "Minimum age of 16 years required"
  ],
  "warnings": [
    "Members under 18 require parental consent"
  ],
  "code": "VALIDATION_ERROR"
}
```

**Membership Ineligible Response (400):**
```json
{
  "success": false,
  "errors": [
    "Maximum age of 65 years allowed for this membership tier"
  ],
  "warnings": [],
  "code": "MEMBERSHIP_INELIGIBLE",
  "data": {
    "userAge": 70,
    "requiredAge": 65
  }
}
```

#### GET /api/users/:userId/age-info

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": 12345,
    "age": 30,
    "ageGroup": "adult",
    "isBirthdayToday": false,
    "nextBirthday": "2026-06-20",
    "isLeapYearBirthday": false
  }
}
```

**Not Available Response (404):**
```json
{
  "success": false,
  "error": "Birth date not available for this user",
  "code": "DOB_NOT_SET"
}
```

### 12.3 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| DOB_NOT_SET | 404 | User has not provided DOB |
| DOB_REQUIRED | 400 | DOB required for this action |
| VALIDATION_ERROR | 400 | DOB failed validation rules |
| MEMBERSHIP_INELIGIBLE | 400 | Age doesn't meet membership requirements |
| PROGRAM_INELIGIBLE | 400 | Age doesn't meet program requirements |
| CONSENT_REQUIRED | 400 | Parental consent required for minor |
| CONSENT_EXPIRED | 400 | Parental consent has expired |
| VERIFICATION_FAILED | 400 | DOB verification with document failed |
| UNSUPPORTED_DATE_FORMAT | 400 | Date format not recognized |

### 12.4 Validation Rules Summary

| Field | Rule | Error Message |
|-------|------|--------------|
| dateOfBirth | Required for members | "Date of birth is required for membership" |
| dateOfBirth | Valid date format | "Invalid date format. Please use YYYY-MM-DD" |
| dateOfBirth | Not in future | "Date of birth cannot be in the future" |
| dateOfBirth | Minimum age (16) | "Minimum age of 16 years required for membership" |
| dateOfBirth | Maximum age (100) | "Age must be less than 100 years - please verify" |
| dateOfBirth | Minimum for trainers (18) | "Trainers must be at least 18 years old" |
| dateOfBirth | Minimum for staff (16) | "Staff must be at least 16 years old" |

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| DOB | Date of Birth |
| Age Group | Categorization of users by age (Minor, Young Adult, Adult, Mature, Senior) |
| Parental Consent | Legal approval from parent/guardian for users under 18 |
| Age Eligibility | Rules determining if a user can participate based on age |
| Verification | Process of confirming DOB with official ID document |
| Age Calculation | Deriving age from DOB and current date |

## Appendix B: Related Documents

- Database Schema (gym_management_schema.sql)
- API Documentation
- Privacy Policy
- Parental Consent Form Template
- Membership Plan Documentation

## Appendix C: Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-15 | Initial version |

---

**Document Owner:** Development Team
**Review Schedule:** Before each milestone
**Approval Required:** CTO, Product Owner, Legal (Privacy)
