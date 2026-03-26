# 10: Super Admin Beta Feedback Plan

## 1. Ultimate Goal

Create a centralized **Beta Feedback Command Center** that transforms scattered user feedback into actionable product insights. The Super Admin should see feedback as a live pulse of what users love, hate, and desperately need.

---

## 2. New Page: Beta Feedback

### 2.1 File Location
`/Users/aryan/Sem 8/Intership/frontend/src/pages/superadmin/SABetaFeedback.tsx`

### 2.2 Purpose
Aggregate and organize user feedback from beta testers, track feature requests, and prioritize development based on user demand signals.

---

## 3. Features Specification

### 3.1 Feedback Collection

#### Sources
- In-app feedback widget (SDK integration)
- Email feedback forwarded to feedback inbox
- Support ticket feedback tagged #beta

#### Feedback Card
```
┌────────────────────────────────────────────────────────────┐
│ [💡 Feature Request]  "Add dark mode to the app"          │
│ rahul@fitzone.com • FitZone Elite • 2h ago               │
│ 👍 47  👎 3  💬 12  [Reply] [Create Ticket] [Dismiss]     │
└────────────────────────────────────────────────────────────┘
```

### 3.2 Sentiment Analysis

#### Auto-Detection
- **Positive:** User loves a feature
- **Neutral:** Bug report or question
- **Negative:** User frustrated or complaining

#### Sentiment Dashboard
```
┌────────────────────────────────────────────────────────────┐
│ SENTIMENT OVERVIEW (Last 30 Days)                         │
│                                                            │
│ 😊 Positive  ████████████████████████████  62%            │
│ 😐 Neutral   ████████████                     28%          │
│ 😠 Negative  ██████                             10%       │
│                                                            │
│ Trend: ↑ 5% positive vs last month                        │
└────────────────────────────────────────────────────────────┘
```

### 3.3 Feature Request Voting

#### Upvote System
- Users can upvote feature requests
- Sort by: Most votes | Newest | Trending

#### Aggregated Requests
```
┌────────────────────────────────────────────────────────────┐
│ FEATURE REQUESTS (Most Voted)                              │
│                                                            │
│ 💬 "Calendar view for bookings"          👍 234  | v2.1   │
│ 💬 "Export workout history to PDF"       👍 189  | v2.2   │
│ 💬 "Social sharing with friends"          👍 156  | Backlog│
│ 💬 "Apple Watch integration"             👍 98   | Planned │
└────────────────────────────────────────────────────────────┘
```

---

## 4. UI/UX Layout Specification

### 4.1 Beta Feedback Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 🧪 Beta Feedback                         [Add Feedback] [Export] [Filter ▾]     │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────┬─────────────────┬─────────────────┬─────────────────────┐ │
│ │ Total Feedback  │ Pending Review   │ Feature Requests│ Avg Sentiment       │ │
│ │ 1,234          │ 89              │ 456             │ 😊 Positive          │ │
│ └─────────────────┴─────────────────┴─────────────────┴─────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│ SENTIMENT TREND (30 DAYS)                                                        │
│ [Stacked area chart: positive/neutral/negative]                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│ FEEDBACK LIST                                    │ FEATURE REQUESTS             │
│ [Cards with upvote/downvote]                     │ [Ranked by votes]           │
│ Sort: [Most Recent ▾] [Filter: All ▾]           │ [Status: Planned/Backlog ▾] │
│ ┌───────────────────────────────────────────────┴────────────────────────────┐ │
│ │ 💡 Add dark mode                     👍 47  │ 💬 Calendar view     👍 234  │ │
│ │ rahul@fit.com • 2h ago          👎 3       │ Trending now                  │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Frontend Implementation

### 5.1 Feedback Card Component

```typescript
interface FeedbackCardProps {
  feedback: Feedback;
  onUpvote: (id: string) => void;
  onReply: (id: string) => void;
  onDismiss: (id: string) => void;
}

const FeedbackCard = ({ feedback, onUpvote, onReply, onDismiss }: FeedbackCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`feedback-card sentiment-${feedback.sentiment}`}
  >
    <div className="feedback-type">{feedback.type}</div>
    <div className="feedback-content">{feedback.content}</div>
    <div className="feedback-meta">
      <span>{feedback.userEmail}</span>
      <span>•</span>
      <span>{feedback.gymName}</span>
      <span>•</span>
      <span>{formatTimeAgo(feedback.createdAt)}</span>
    </div>
    <div className="feedback-actions">
      <button onClick={() => onUpvote(feedback.id)}>
        <ThumbsUp /> {feedback.upvotes}
      </button>
      <button onClick={() => onReply(feedback.id)}>
        <MessageCircle /> {feedback.replies}
      </button>
      <button onClick={() => onDismiss(feedback.id)}>
        <X />
      </button>
    </div>
  </motion.div>
);
```

### 5.2 Sentiment Chart

```typescript
const SentimentChart = ({ data }: { data: SentimentData[] }) => (
  <ResponsiveContainer width="100%" height={200}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="positive" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
          <stop offset="100%" stopColor="#10B981" stopOpacity={0.1} />
        </linearGradient>
        <linearGradient id="negative" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EF4444" stopOpacity={0.8} />
          <stop offset="100%" stopColor="#EF4444" stopOpacity={0.1} />
        </linearGradient>
      </defs>
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Area type="monotone" dataKey="positive" stackId="1" stroke="#10B981" fill="url(#positive)" />
      <Area type="monotone" dataKey="neutral" stackId="1" stroke="#6B7280" fill="#6B7280" />
      <Area type="monotone" dataKey="negative" stackId="1" stroke="#EF4444" fill="url(#negative)" />
    </AreaChart>
  </ResponsiveContainer>
);
```

---

## 6. Backend Implementation

### 6.1 Required Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/superadmin/feedback` | Paginated feedback list |
| GET | `/api/superadmin/feedback/stats` | Sentiment overview |
| POST | `/api/superadmin/feedback/{id}/upvote` | Upvote feedback |
| POST | `/api/superadmin/feedback/{id}/reply` | Reply to feedback |
| PUT | `/api/superadmin/feedback/{id}/status` | Update status |
| DELETE | `/api/superadmin/feedback/{id}` | Dismiss feedback |

### 6.2 Sentiment Analysis Service

```java
@Service
public class SentimentAnalysisService {

    public Sentiment detectSentiment(String text) {
        // Simple keyword-based analysis
        // In production: integrate with ML model
        int positiveScore = countMatches(text, POSITIVE_KEYWORDS);
        int negativeScore = countMatches(text, NEGATIVE_KEYWORDS);

        if (positiveScore > negativeScore) return Sentiment.POSITIVE;
        if (negativeScore > positiveScore) return Sentiment.NEGATIVE;
        return Sentiment.NEUTRAL;
    }

    private static final Set<String> POSITIVE_KEYWORDS = Set.of(
        "love", "amazing", "great", "awesome", "fantastic", "helpful", "easy"
    );

    private static final Set<String> NEGATIVE_KEYWORDS = Set.of(
        "hate", "terrible", "awful", "broken", "bug", "crash", "slow", "frustrated"
    );
}
```

### 6.3 Feedback DTO

```java
public class FeedbackDTO {
    private Long id;
    private String content;
    private FeedbackType type; // FEATURE_REQUEST, BUG_REPORT, QUESTION, COMPLAINT
    private Sentiment sentiment;
    private String userEmail;
    private String gymName;
    private Integer upvotes;
    private Integer replies;
    private FeedbackStatus status; // PENDING, IN_REVIEW, ADDRESSED, DISMISSED
    private LocalDateTime createdAt;
}
```

---

## 7. Database Schema

### 7.1 Feedback Table

```sql
CREATE TABLE beta_feedback (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    sentiment VARCHAR(20),
    user_id BIGINT REFERENCES users(id),
    gym_id BIGINT REFERENCES gyms(id),
    upvotes INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_feedback_sentiment ON beta_feedback (sentiment);
CREATE INDEX idx_feedback_type ON beta_feedback (type);
CREATE INDEX idx_feedback_status ON beta_feedback (status);
```

### 7.2 Upvote Table

```sql
CREATE TABLE feedback_upvotes (
    feedback_id BIGINT REFERENCES beta_feedback(id),
    user_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (feedback_id, user_id)
);
```

---

## 8. Testing Procedures

### 8.1 Sentiment Analysis Tests
```java
@Test
void detectSentiment_withPositiveKeywords_returnsPositive() {
    Sentiment result = sentimentService.detectSentiment("I love this feature, it's amazing!");
    assertEquals(Sentiment.POSITIVE, result);
}

@Test
void detectSentiment_withBugKeywords_returnsNegative() {
    Sentiment result = sentimentService.detectSentiment("The app keeps crashing, this is terrible");
    assertEquals(Sentiment.NEGATIVE, result);
}
```

---

## 9. Success Criteria

| Criterion | Target | Validation |
|-----------|--------|------------|
| Sentiment accuracy | >80% | Sample test set |
| Feedback load | < 500ms | Performance test |
| Upvote response | < 200ms | Optimistic update |
| Email parsing | >90% success | Email integration test |

---

## 10. Deliverables Checklist

- [ ] `SABetaFeedback.tsx` new page
- [ ] Feedback card component
- [ ] Sentiment analysis dashboard
- [ ] Feature request voting
- [ ] Upvote/downvote functionality
- [ ] Feedback status management
- [ ] Sentiment analysis service
- [ ] Email feedback integration
- [ ] Feedback database table
- [ ] Unit tests >80% coverage
