# Member Profile Improvements Plan

**File:** `frontend/src/pages/member/MemberProfile.tsx`\
**API:** `memberProfileApi` → `GET/PUT /api/member/profile?memberId=X`\
**Backend:** `MemberDashboardController.java` (profile endpoints), `MemberProfileService.java`\
**Lines:** \~1100 (frontend)\
**Last Reviewed:** 2026-03-02 (against actual source)

---

## Current State (Verified)

The profile page is feature-rich with 6 tabs: Overview, Personal, Contact, Emergency, Goals, Security.

**Working correctly:**

- Fetches real profile data via `memberProfileApi.getProfile()`
- Saves changes via `memberProfileApi.updateProfile()` (PUT)
- Change detection between original and modified form data
- All form fields: fullName, phone, DOB, gender, bloodType, address, city, state, zip, emergency contact, healthNotes, fitnessGoals, height, weight, bodyFat
- Achievements display (real data or placeholder)
- Assigned trainer widget in sidebar

**Confirmed gaps:**

---

## P0 — Non-Functional Buttons (Critical)

#IssueLocationFixPR1"Change Password" button is a no-op (`type="button"` with no handler)Security tab, line \~954Wire up to a password change modal/flow — POST `/api/auth/change-password`PR2"View Sessions" button is a no-opSecurity tab, line \~978Show active JWT sessions from server or navigate to a sessions listPR3"Setup" (Biometric Login) is a no-opSecurity tab, line \~990Either implement or hide if not supportedPR4Camera/Upload Photo button has no handlerAvatar section, line \~386Implement photo upload: POST `/api/member/profile/avatar` multipart

---

## P1 — Data Issues

#IssueFixDA1BMI is not displayed anywhere on the profile even though height+weight are storedAdd a computed BMI field in the Personal tab or Overview sidebarDA2`achievements` is fetched from `profile.achievements` but MemberProfileService may not populate itVerify `MemberProfileService.getMemberProfile()` returns achievements; if not, add query to `achievement` tableDA3`stats.totalWorkouts` and `stats.currentStreak` come from `profile.stats` — verify this is populated by the backend (MemberProfileDTO)Check `MemberProfileDTO.stats` field; if null, query from `workout_log`DA4`profile.twoFactorEnabled` is used in Security tab but this field may not exist in `User` entityCheck if `two_factor_enabled` column exists in DB; add if missingDA5`profile.status` is used for the Active badge — verify what this maps to in the DBConfirm `MemberProfileDTO.status` is correctly mapped from `User.status` or `Membership.status`

---

## P2 — Frontend UX Gaps

#GapFixUX1No validation on form fields before save (e.g., phone number format, invalid date of birth)Add field-level validation on save: phone regex, DOB cannot be future date, body fat 0-100%UX2Edit mode is global — editing any tab shows save bar, but the save saves ALL fields at onceThis is acceptable behavior; document it but note that granular per-section save would be better UXUX3`formatDate()` only shows `month, year` — full date not shown for DOBFix to show `month day, year` formatUX4Loading spinner uses `Activity` icon rotating — not visually distinct as a loaderReplace with a proper `Loader2` spinner from lucideUX5Sidebar trainer widget has hardcoded `assignedTrainer.name[0]` for avatar — crashes if name is empty stringGuard: `assignedTrainer.name?.[0] ?? '?'`UX6No way to remove a fitness goal once set (other than toggling in edit mode) — the display-only view doesn't hint at how to removeAlready works in edit mode; add a small `(×)` hint in view mode "Click Edit to remove"

---

## P3 — Backend Gaps

#GapFixBE1`PUT /api/member/profile` — no validation of input (e.g., negative height, body fat &gt; 100)Add `@Valid` annotations to `MemberProfileUpdateDTO` with `@Min`, `@Max`, `@Size` constraintsBE2No `PATCH /api/member/profile/avatar` endpoint for photo uploadAdd multipart endpoint in `MemberDashboardController` or new `MemberProfileController`BE3`POST /api/auth/change-password` — verify this exists and is accessible from member roleCheck `AuthController`; ensure member can change their own passwordBE4`MemberProfileDTO.achievements` — verify the service populates this from an `achievement` or `member_achievement` tableIf no achievement table exists, create one or remove the field from DTOBE5Profile endpoint uses `@RequestParam Long memberId` — should ideally use JWT subject to avoid members accessing others' profilesSecurity improvement: derive memberId from `Authentication` principal instead of query param

---

## P4 — Database Gaps

#GapFixDB1`two_factor_enabled` column may not exist in `users` tableAdd column: `ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE`DB2No `profile_photos` table for avatar storageAdd table: `member_profile_photos(id, member_id, photo_url, uploaded_at, is_primary)`DB3No `member_achievements` table if achievements are displayedAdd table: `member_achievements(id, member_id, name, description, earned_at, badge_type)`DB4`body_fat`, `height`, `weight` columns on `users` table — are they Double or Decimal?Verify precision; use `DECIMAL(5,2)` for accuracy

---

## P5 — Nice to Have

#ImprovementN1Add a "Profile Completion %" indicator showing how many optional fields are filledN2Add "Last Updated" timestamp showing when profile was last savedN3QR Code tab — generate a QR code from member ID for check-in (already has QR icon imported)N4Export profile as PDF buttonN5Add profile visibility settings (show/hide fields to trainers)

---

## Implementation Order

1. **PR1** — Change Password modal (most requested security feature)
2. **PR4 + BE2 + DB2** — Avatar upload (photo upload endpoint + storage)
3. **DA2 + DA3 + BE4 + DB3** — Fix achievements and stats population
4. **DA1** — BMI display in Personal tab
5. **BE1** — Input validation on backend
6. **UX1** — Client-side validation before save
7. **DA4 + DB1** — Two-factor enabled flag