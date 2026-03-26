# 04: Super Admin Revenue & Payments Plan

## 1. Ultimate Goal

Convert `SARevenue.tsx` into a bulletproof financial dashboard with absolute certainty that every cent processed through Stripe matches the local database. The operator must instantly identify failed payouts and reconcile discrepancies without manual SQL queries.

---

## 2. Current Page Analysis

### 2.1 File Location
`/Users/aryan/Sem 8/Intership/frontend/src/pages/superadmin/SARevenue.tsx`

### 2.2 Current Implementation
- MRR trend chart (6-month area chart)
- Plan distribution pie chart
- Revenue by city bar chart
- Recent payments table
- Failed payments table
- Coupons management

### 2.3 Identified Issues
| Issue | Severity | Impact |
|-------|----------|--------|
| Recharts dimension warnings | Medium | Visual glitches on load |
| No reconciliation engine | Critical | Can't detect Stripe/DB mismatches |
| No live Stripe sync | High | Stale payment data |
| No failed payment retry | High | Lost revenue recovery |
| No forensic transaction view | Medium | Can't debug payment issues |

---

## 3. Enhanced Features Specification

### 3.1 The "Unreconciled" Alert

#### Detection Logic
- Compare `Stripe Total Balance` vs `Local DB Expected Balance`
- Alert if discrepancy > ₹100 or > 1% difference
- Trigger: Webhook failure or manual sync

#### Visual Implementation
- **Critical Alert Banner:** Full-width red banner at top of page
- **Icon:** `AlertTriangle` with pulse animation
- **Content:** "Ledger Mismatch: ₹4,500 discrepancy detected"
- **Action:** "Sync Now" button

### 3.2 Gym Payout Ledger

#### Split Display Widget
```
┌─────────────────────────────────────────────────────────────┐
│  Platform Revenue          │  Pending Gym Payouts           │
│  ₹45,000 (+12.5%)         │  ₹1,20,000 (47 gyms)          │
│  [Stripe Live]            │  [48 pending, 3 overdue]      │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Failed Transaction "Retry/Rescue" Flow

#### Dunning Actions
| Action | Description |
|--------|-------------|
| "Trigger Retry Email" | Fires Stripe retry webhook |
| "Mark as Recovered" | Manual override with reason |
| "Escalate to Support" | Creates support ticket |

### 3.4 Transaction Forensic Drawer

#### Contents
- Raw Stripe JSON payload
- Receipt URL
- Risk level assessment
- Gateway response codes
- Timeline of payment attempts

---

## 4. UI/UX Layout Specification

### 4.1 Revenue Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 💰 Revenue & Billing                    [Sync Ledger] [Export ▾] [Settings ⚙️] │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ⚠️ LEDGER MISMATCH: ₹4,500 discrepancy detected              [Sync Now] [Dismiss] │
├───────────────┬───────────────┬───────────────┬─────────────────────────────────┤
│ MRR           │ ARR           │ Paying Gyms  │ Churn Rate                      │
│ ₹1,84,250    │ ₹22.1L        │ 247           │ 2.1%                             │
│ (+15.2%)      │               │               │                                  │
├───────────────┴───────────────┴───────────────┴─────────────────────────────────┤
│ REVENUE TREND                    │ PLAN DISTRIBUTION                          │
│ [Area Chart - 6 months]          │ [Donut Chart]                              │
│                                 │ Enterprise 68 | Pro 112 | Starter 52      │
├─────────────────────────────────┴────────────────────────────────────────────┤
│ PAYMENT TABLES                      │ FAILED PAYMENTS                           │
│ Recent 10 transactions               │ Failed 5 (Retry/Rescue)                  │
│ [Expandable rows]                   │ [Action buttons per row]                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Frontend Implementation

### 5.1 Chart Container Fix (Resolved)

**Issue:** Recharts dimension warnings with width=-1, height=-1

**Solution:** Custom `useContainerDimensions` hook with ResizeObserver:
```typescript
function useContainerDimensions(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef]);

  return dimensions;
}

// Usage: Only render chart when dimensions > 0
{dimensions.width > 0 && dimensions.height > 0 ? (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={revenueTrend}>...</AreaChart>
  </ResponsiveContainer>
) : <div style={{ height: '100%', minHeight: 200 }} />}
```

### 5.2 Currency Formatting

```typescript
// Never format manually - use Intl.NumberFormat
const formatCurrency = (amount: number, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);

// Usage with useMemo for performance
const formattedMRR = useMemo(() => formatCurrency(mrr), [mrr]);
```

### 5.3 Optimistic Sync Button

```typescript
// Sync button with loading state
const [isSyncing, setIsSyncing] = useState(false);

const handleSync = async () => {
  setIsSyncing(true);
  try {
    await superAdminApi.syncStripe();
    toast.success('Ledger synced successfully');
  } catch (error) {
    toast.error('Sync failed: ' + error.message);
  } finally {
    setIsSyncing(false);
  }
};
```

---

## 6. Backend Implementation

### 6.1 Required Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/superadmin/revenue/overview` | MRR, ARR, trends |
| GET | `/api/superadmin/revenue/ledger` | Transaction ledger |
| GET | `/api/superadmin/revenue/summary` | Reconciliation status |
| POST | `/api/superadmin/revenue/sync-gateway` | Manual Stripe sync |
| POST | `/api/superadmin/revenue/{txId}/rescue` | Retry failed payment |
| GET | `/api/superadmin/revenue/{txId}/forensic` | Raw Stripe data |

### 6.2 Reconciliation Service

```java
@Service
public class RevenueReconciliationService {

    @Async
    public ReconciliationResult reconcileStripeWithDatabase() {
        // 1. Fetch last 24h Stripe events
        List<PaymentIntent> stripePayments = stripeClient.listPaymentIntents();

        // 2. Compare with local DB
        List<Payment> dbPayments = paymentRepository.findLast24Hours();

        // 3. Find discrepancies
        List<Discrepancy> discrepancies = findDiscrepancies(stripePayments, dbPayments);

        // 4. Auto-correct minor issues
        for (Discrepancy d : discrepancies) {
            if (d.getAmount().compareTo(BigDecimal.valueOf(100)) < 0) {
                autoCorrect(d);
            }
        }

        // 5. Return report
        return ReconciliationResult.builder()
            .totalStripe(stripePayments.size())
            .totalDb(dbPayments.size())
            .discrepancies(discrepancies)
            .autoCorrected(autoCorrectedCount)
            .build();
    }
}
```

### 6.3 BigDecimal Precision Mandate

```java
// ALL currency operations MUST use BigDecimal
public class PaymentDTO {
    private BigDecimal amount;          // Never Double or Float
    private BigDecimal platformFee;   // Calculated with HALF_UP rounding
    private BigDecimal gymPayout;      // Derived from amount - platformFee
}

// Correct calculation:
amount.subtract(platformFee).setScale(2, RoundingMode.HALF_UP);
```

---

## 7. Database Strategy

### 7.1 Trigger-Based Summary Table

```sql
-- Pre-aggregated daily revenue
CREATE TABLE daily_revenue_summaries (
    summary_date DATE PRIMARY KEY,
    total_gross DECIMAL(12,2),
    platform_cut DECIMAL(12,2),
    gym_payouts DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'INR',
    is_reconciled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Trigger to increment on payment success
CREATE OR REPLACE FUNCTION update_daily_revenue()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'SUCCESS' AND OLD.status != 'SUCCESS' THEN
        INSERT INTO daily_revenue_summaries (summary_date, total_gross, platform_cut)
        VALUES (CURRENT_DATE, NEW.amount, NEW.platform_fee)
        ON CONFLICT (summary_date)
        DO UPDATE SET
            total_gross = daily_revenue_summaries.total_gross + NEW.amount,
            platform_cut = daily_revenue_summaries.platform_cut + NEW.platform_fee;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 8. Testing Procedures

### 8.1 Reconciliation Tests
```java
@Test
void reconcileStripeWithDatabase_matchingPayments_noDiscrepancies() {
    // Given matching Stripe and DB records
    // When reconcile
    // Then no discrepancies reported
}

@Test
void reconcileStripeWithDatabase_webhookMissed_detectsDiscrepancy() {
    // Given Stripe says success, DB says pending
    // When reconcile
    // Then discrepancy detected and auto-corrected
}
```

### 8.2 Currency Precision Tests
```java
@Test
void paymentCalculation_IndianRupee_noRoundingErrors() {
    BigDecimal amount = new BigDecimal("99.99");
    BigDecimal fee = new BigDecimal("10.00");
    BigDecimal result = amount.subtract(fee).setScale(2, RoundingMode.HALF_UP);
    assertEquals(new BigDecimal("89.99"), result);
}
```

---

## 9. Success Criteria

| Criterion | Target | Validation |
|-----------|--------|------------|
| Chart render | No dimension warnings | Console clean |
| MRR accuracy | 100% match Stripe | Manual verification |
| Reconciliation | < 5s for 500 transactions | Performance test |
| Currency precision | No floating point errors | Unit test |
| Failed payment recovery | >50% through dunning | A/B test |

---

## 10. Deliverables Checklist

- [ ] `SARevenue.tsx` with fixed chart containers
- [ ] Unreconciled alert banner
- [ ] Gym payout ledger widget
- [ ] Failed payment retry/rescue flow
- [ ] Transaction forensic drawer
- [ ] Revenue reconciliation service
- [ ] Stripe sync endpoint
- [ ] BigDecimal currency throughout
- [ ] Daily revenue summary table + trigger
- [ ] Unit tests for reconciliation logic
