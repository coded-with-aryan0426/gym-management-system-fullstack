# My Membership Improvements Plan

**File:** `frontend/src/pages/member/MyMembership.tsx`\
**API:** `GET /api/member/membership?memberId=X`\
**Backend:** `MemberDashboardController.java` (`getMembership`)\
**Lines:** \~910 (frontend)\
**Last Reviewed:** 2026-03-02 (against actual source)

---

## Current State (Verified)

The membership page is visually rich with a hero countdown timer, 4 tabs (Overview, Benefits, Payments, Settings), QR modal, and freeze modal.

**Working:**

- Fetches real membership data from `/api/member/membership`
- Falls back to `DUMMY_MEMBERSHIP` when no real membership found (shows "Preview" banner)
- Countdown timer to membership expiry
- QR modal for check-in (shows member ID, not a real scannable QR)
- Freeze modal (UI only — no backend call)
- Auto-renewal toggle (UI only — no backend call)
- Payment methods (fully hardcoded dummy data)
- Payment history (fully hardcoded dummy data)
- Usage stats (gymVisits, classesAttended, etc.) — all hardcoded `usageStats` object
- Upcoming perks — all hardcoded dummy events

---

## P0 — No-Op Actions (Critical)

#IssueFixM1"Freeze Membership" calls `handleFreezeMembership()` which only shows a toast — no API callAdd `POST /api/member/membership/{id}/freeze?days=X` backend endpoint; update `MembershipController`M2"Auto-Renewal" toggle updates local state only — no API callAdd `PUT /api/member/membership/{id}/auto-renew?enabled=true` endpointM3"Renewal Reminders" toggle is a no-opConnect to notification preferences: `PUT /api/member/settings/notifications`M4"Cancel Membership" says "Please contact support" — at minimum should raise a support ticketAdd `POST /api/member/membership/{id}/cancel-request` or link to messages/supportM5"Renew" button in hero has no handler (no `onClick`)Add renewal flow: navigate to `/member/membership/renew` or show a plan picker modalM6"Guest Pass" button shows toast "Guest pass sent!" — no actual backend callImplement or clearly mark as coming soon

---

## P1 — All Usage Stats Are Hardcoded

```typescript
const usageStats = {
    gymVisits: 18,      // hardcoded
    classesAttended: 12, // hardcoded
    ptSessionsUsed: 2,   // hardcoded
    ptSessionsTotal: 4,  // hardcoded
    calories: 24500,     // hardcoded
    minutesActive: 1680, // hardcoded
    streak: 7,           // hardcoded
    points: 850          // hardcoded
};
```

**Fix:** Add `GET /api/member/membership/usage-stats?memberId=X` endpoint that returns:

- `gymVisits` from `check_in` table count for current month
- `classesAttended` from `class_booking` count with status=ATTENDED
- `ptSessionsUsed/Total` from `pt_session` table
- `calories` from `workout_log` SUM for current month
- `streak` from `workout_log` consecutive days
- `points` from a new `member_points` table (or formula)

---

## P2 — Payment Data Is Hardcoded

```typescript
const paymentHistory = [
    { id: 'INV-2025-001', date: 'Dec 20, 2025', ... }, // hardcoded
    { id: 'INV-2025-002', ... }, // hardcoded
    { id: 'INV-2025-003', ... }, // hardcoded
];
const paymentMethods = [
    { id: '1', type: 'visa', last4: '4242', ... }, // hardcoded
    { id: '2', type: 'mastercard', last4: '8888', ... } // hardcoded
];
```

**Fix:**

- Add `GET /api/member/payments/history?memberId=X` → query `transaction` table
- Payment methods: either integrate Stripe for real card storage, or add a `payment_methods` table (tokenized)

---

## P3 — Benefits Are Hardcoded

```typescript
const benefits = [
    { title: 'Unlimited Gym Access', active: true },       // hardcoded
    { title: 'Spa & Sauna', active: membershipTier.tier !== 'standard' }, // semi-dynamic
    { title: 'PT Sessions', desc: '2 of 4 sessions used', progress: 50 }, // hardcoded
    ...
];
```

**Fix:**

- Add `GET /api/member/membership/benefits?memberId=X` — returns plan features from `membership_plan_features` table
- PT session progress should come from real `ptSessionsUsed/Total` query

---

## P4 — QR Code Is Not a Real Scannable QR

The QR modal renders `<QrCode size={100} />` — this is just an icon, not an actual scannable QR code.

**Fix:** Use `qrcode.react` or `react-qr-code` library to generate a real QR from the member ID + token. The gym entrance scanner should verify against `/api/checkin/verify?token=X`.

---

## P5 — Upcoming Perks Are Hardcoded

```typescript
const upcomingPerks = [
    { date: 'Jan 28', title: 'Free Smoothie Day' },   // hardcoded
    { date: 'Jan 30', title: 'Double Points Weekend' }, // hardcoded
    { date: 'Feb 1', title: 'New Year Challenge' }     // hardcoded
];
```

**Fix:** Add `GET /api/member/perks?memberId=X` or make perks come from a gym `events` or `promotions` table.

---

## P6 — Backend Gaps

#GapFixBE1`getMembership()` does not return `freezeDaysUsed`, `freezeDaysTotal`, `autoRenew` from DB — these are hardcoded in frontend fallbackAdd `freeze_days_used`, `freeze_days_total`, `auto_renew` columns to `membership` table and return themBE2No freeze endpoint existsAdd `POST /api/member/membership/{id}/freeze`BE3No cancel-request endpointAdd `POST /api/member/membership/{id}/cancel-request`BE4No usage stats endpointAdd `GET /api/member/membership/usage-stats?memberId=X`BE5No payment history endpoint for members`TransactionController` exists — add `GET /api/member/payments/history?memberId=X`

---

## P7 — Database Gaps

#GapFixDB1`membership` table missing: `auto_renew BOOLEAN`, `freeze_days_used INT`, `freeze_days_total INT`, `is_frozen BOOLEAN`, `frozen_until DATE`Migration to add these columnsDB2No `member_points` tableAdd: `member_points(id, member_id, points, reason, earned_at)`DB3No `plan_features` / `membership_plan_benefits` table linking plans to featuresAdd if benefits are plan-driven

---

## P8 — Frontend UX Gaps

#GapFixUX1Add Card modal (`showAddCard`) has no implementation — state exists but nothing rendersImplement the add card modal with form fields (or Stripe Elements)UX2Payment history "Export" button does nothingGenerate CSV from `paymentHistory` arrayUX3Membership progress bar uses `(daysRemaining / 30) * 100` — wrong for plans that aren't 30 daysCalculate from `(endDate - startDate)` total days vs remainingUX4No visual difference between ACTIVE and FROZEN membership statesAdd a blue "Frozen" state variant in the hero

---

## Implementation Order

 1. **DB1** — Add missing columns to `membership` table
 2. **BE1+BE2** — Freeze endpoint + store freeze state in DB
 3. **M1** — Wire freeze modal to real API
 4. **BE4** — Usage stats endpoint
 5. **P1** — Replace hardcoded `usageStats` with real API call
 6. **BE5** — Payment history endpoint
 7. **P2** — Replace hardcoded payment history
 8. **P4** — Real QR code generation
 9. **M2+M3** — Wire toggles to real endpoints
10. **UX1** — Add card modal implementation