# 09: Super Admin Analytics Plan

## 1. Ultimate Goal

Transform `SAAnalytics.tsx` from basic charts into a **Predictive Intelligence Hub** that doesn't just show what happened, but forecasts what will happen next. Use AI/ML patterns to predict churn, forecast revenue, and surface hidden growth opportunities.

---

## 2. Current Page Analysis

### 2.1 File Location
`/Users/aryan/Sem 8/Intership/frontend/src/pages/superadmin/SAAnalytics.tsx`

### 2.2 Current Implementation
- User signups trend chart
- Revenue trend chart
- Basic member check-in analytics
- Gym performance comparison

### 2.3 Identified Issues
| Issue | Severity | Impact |
|-------|----------|--------|
| No predictive analytics | High | Reactive, not proactive |
| No cohort analysis | Medium | Can't track user journeys |
| No funnel visualization | Medium | Can't find conversion leaks |
| No A/B test results | Low | Can't validate hypotheses |
| No geographic heatmap | Low | Missing location insights |

---

## 3. Enhanced Features Specification

### 3.1 Churn Prediction Model

#### User-Level Churn Scores
```
Probability of Churn = f(loginFrequency, sessionDuration, featureAdoption, supportTickets)
```

#### Visual Display
- **High Risk (>70%):** Red heat badge
- **Medium Risk (40-70%):** Amber heat badge
- **Low Risk (<40%):** Green badge

#### Churn Dashboard Widget
```
┌────────────────────────────────────────────────────────────┐
│ 🚨 CHURN ALERT                                              │
│ 47 users predicted to churn in next 14 days                 │
│ Top reason: No login in 14+ days                            │
│ [View At-Risk Users] [Send Re-Engagement Campaign]         │
└────────────────────────────────────────────────────────────┘
```

### 3.2 Cohort Analysis

#### Retention Heatmap
- **X-axis:** Weeks since signup (0, 1, 2, 3...)
- **Y-axis:** Signup cohort (Jan, Feb, Mar...)
- **Cell color:** Retention % (green = retained, red = churned)

```
           Week 0   Week 1   Week 2   Week 3   Week 4
Jan 2024   100%     78%      65%      54%      48%
Feb 2024   100%     82%      71%      62%      55%
Mar 2024   100%     85%      74%      68%      -
```

### 3.3 Revenue Forecasting

#### ML-Based Forecast
- **Model:** Moving average with seasonality
- **Confidence Interval:** 80% and 95% bands
- **Display:** Dashed lines for forecast, solid for actual

#### Forecast Cards
```
┌────────────────────────────────────────────────────────────┐
│ 📈 MRR FORECAST (30 DAYS)                                  │
│ Predicted: ₹2,25,000 (+22%)                                │
│ Confidence: 80% [₹2,10,000 - ₹2,40,000]                   │
│ [View Model Details] [Adjust Assumptions]                  │
└────────────────────────────────────────────────────────────┘
```

### 3.4 Funnel Visualization

#### Conversion Funnel
```
┌────────────────────────────────────────────────────────────┐
│ SIGNUP FUNNEL (Last 30 Days)                               │
│                                                            │
│ Visitors     ████████████████████████████  10,000 (100%)  │
│ ↓ -60%                                                      │
│ Signups      ████████████                   4,000 (40%)   │
│ ↓ -25%                                                      │
│ First Checkin████████████████             3,000 (30%)     │
│ ↓ -20%                                                      │
│ Active 30d   ████████                       2,400 (24%)    │
│                                                            │
│ [View Drop-off Analysis] [A/B Test Ideas]                │
└────────────────────────────────────────────────────────────┘
```

### 3.5 Geographic Heatmap

#### Gym Locations on Map
- **Library:** Leaflet or Mapbox GL
- **Markers:** Gym locations colored by performance
- **Clustering:** Yes, for dense regions
- **Popup:** Gym name, MRR, member count

---

## 4. UI/UX Layout Specification

### 4.1 Analytics Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 📊 Analytics Hub                         [Date Range ▾] [Compare ▾] [Export ▾] │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────┬─────────────────┬─────────────────┬─────────────────────┐ │
│ │ MRR Forecast    │ Churn Risk      │ DAU Today       │ Conversion Rate     │ │
│ │ ₹2,25,000 ↑22% │ 47 users        │ 8,432           │ 4.2%                │ │
│ └─────────────────┴─────────────────┴─────────────────┴─────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│ REVENUE TREND + FORECAST                  │ CHURN PREDICTION                     │
│ [Area chart with ML forecast bands]       │ [At-risk users table]              │
├───────────────────────────────────────────┴────────────────────────────────────┤
│ COHORT RETENTION HEATMAP                 │ FUNNEL ANALYSIS                    │
│ [Color-coded retention grid]               │ [Step-by-step funnel viz]          │
├───────────────────────────────────────────┴────────────────────────────────────┤
│ GEOGRAPHIC PERFORMANCE                                                           │
│ [Interactive map with gym markers]                                               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Frontend Implementation

### 5.1 Chart.js for Advanced Analytics

```typescript
// For retention heatmaps and complex visualizations
import { Chart } from 'react-chartjs-2';
import 'chartjs-chart-matrix'; // For heatmaps
```

### 5.2 Date Range Picker

```typescript
// Shared date range context
const DateRangeContext = createContext<{
  range: DateRange;
  setRange: (range: DateRange) => void;
  compare: DateRange | null;
}>();

// Usage in analytics pages
const { range, compare } = useContext(DateRangeContext);
```

### 5.3 Forecast Visualization

```typescript
// Confidence interval bands
const forecastData = {
  actual: [...],
  forecast: [...],
  upper80: [...],
  lower80: [...],
  upper95: [...],
  lower95: [...],
};

<Chart type="line" data={buildForecastData(forecastData)} />;
```

---

## 6. Backend Implementation

### 6.1 Required Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/superadmin/analytics/overview` | Dashboard KPIs |
| GET | `/api/superadmin/analytics/mrr-forecast` | MRR prediction |
| GET | `/api/superadmin/analytics/churn-risk` | At-risk users |
| GET | `/api/superadmin/analytics/cohort` | Retention cohort |
| GET | `/api/superadmin/analytics/funnel` | Conversion funnel |
| GET | `/api/superadmin/analytics/geo` | Geographic data |

### 6.2 Churn Prediction Service

```java
@Service
public class ChurnPredictionService {

    public List<ChurnRiskUser> predictChurnRisk(int daysAhead) {
        List<User> activeUsers = userRepository.findActiveUsers();

        return activeUsers.stream()
            .map(user -> {
                ChurnFeatures features = extractFeatures(user);
                double probability = mlModel.predict(features);
                return new ChurnRiskUser(user, probability, features);
            })
            .filter(r -> r.getProbability() > 0.4) // Threshold
            .sorted(Comparator.comparing(ChurnRiskUser::getProbability).reversed())
            .collect(Collectors.toList());
    }

    private ChurnFeatures extractFeatures(User user) {
        return ChurnFeatures.builder()
            .daysSinceLastLogin(daysSince(user.getLastLogin()))
            .avgSessionDuration(calculateAvgSession(user))
            .featureAdoptionScore(calculateFeatureScore(user))
            .supportTicketCount(countRecentTickets(user))
            .paymentFailureCount(countRecentFailures(user))
            .build();
    }
}
```

### 6.3 Cohort Analysis Query

```java
public List<CohortRow> calculateCohortRetention(LocalDate startMonth, LocalDate endMonth) {
    List<CohortRow> cohortRows = new ArrayList<>();

    LocalDate cohortMonth = startMonth;
    while (!cohortMonth.isAfter(endMonth)) {
        List<User> cohortUsers = userRepository.findBySignupMonth(cohortMonth);
        int[] weeklyRetention = new int[8]; // 8 weeks

        for (int week = 0; week < 8; week++) {
            LocalDate weekDate = cohortMonth.plusWeeks(week);
            long activeCount = cohortUsers.stream()
                .filter(u -> activityRepository.hasActivityInWeek(u.getId(), weekDate))
                .count();
            weeklyRetention[week] = (int) ((activeCount * 100) / cohortUsers.size());
        }

        cohortRows.add(new CohortRow(cohortMonth, cohortUsers.size(), weeklyRetention));
        cohortMonth = cohortMonth.plusMonths(1);
    }

    return cohortRows;
}
```

---

## 7. Database Strategy

### 7.1 Analytics Materialized View

```sql
CREATE MATERIALIZED VIEW mv_user_activity_daily AS
SELECT
    date_trunc('day', created_at) as activity_date,
    COUNT(DISTINCT user_id) as dau,
    COUNT(*) as total_checkins,
    COUNT(DISTINCT gym_id) as active_gyms,
    SUM(revenue) as daily_revenue
FROM member_activities
GROUP BY date_trunc('day', created_at);

CREATE UNIQUE INDEX ON mv_user_activity_daily (activity_date);
```

### 7.2 Feature Store for ML

```sql
CREATE TABLE user_churn_features (
    user_id BIGINT PRIMARY KEY,
    feature_date DATE NOT NULL,
    days_since_login INTEGER,
    avg_session_seconds INTEGER,
    feature_adoption_score DECIMAL(5,2),
    support_ticket_count INTEGER,
    payment_failure_count INTEGER,
    predicted_churn_probability DECIMAL(5,4),
    computed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_churn_features_date ON user_churn_features (feature_date);
```

---

## 8. Testing Procedures

### 8.1 Forecast Accuracy Tests
```java
@Test
void mrrForecast_within10PercentAccuracy() {
    // Given historical data
    // When forecast is generated
    // Then predicted vs actual within 10%
}
```

### 8.2 Churn Model Tests
```java
@Test
void churnPrediction_highPaymentFailure_increasesProbability() {
    User user = createUser();
    addPaymentFailures(user, 5);

    ChurnRisk risk = churnPrediction.predict(user);

    assertThat(risk.getProbability()).isGreaterThan(0.7);
}
```

---

## 9. Success Criteria

| Criterion | Target | Validation |
|-----------|--------|------------|
| Forecast accuracy | ±10% of actual | Historical backtest |
| Churn precision | >70% | Labeled test set |
| Page load | < 2s | Lighthouse |
| Chart interaction | 60fps | Performance monitor |
| Data freshness | < 1 hour | Cron job verification |

---

## 10. Deliverables Checklist

- [ ] `SAAnalytics.tsx` with predictive analytics
- [ ] Churn prediction widget
- [ ] Cohort retention heatmap
- [ ] Revenue forecast with confidence bands
- [ ] Conversion funnel visualization
- [ ] Geographic heatmap (Leaflet)
- [ ] Churn prediction ML model
- [ ] Cohort analysis service
- [ ] Analytics materialized views
- [ ] Unit tests >80% coverage
