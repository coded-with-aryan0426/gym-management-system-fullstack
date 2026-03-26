# 05: Super Admin System Errors Plan

## 1. Ultimate Goal

Transform `SAErrors.tsx` into a real-time command center mimicking Sentry or Datadog. The operator should never need to SSH into servers to debug crashes. The UI must aggressively capture and organize both frontend and backend panics instantly with actionable insights.

---

## 2. Current Page Analysis

### 2.1 File Location
`/Users/aryan/Sem 8/Intership/frontend/src/pages/superadmin/SAErrors.tsx`

### 2.2 Current Implementation
- Error trend chart (7-day area chart)
- Error list with severity filtering
- Error details expandable accordion
- Error count KPIs (total, critical, open, resolved)

### 2.3 Identified Issues
| Issue | Severity | Impact |
|-------|----------|--------|
| Recharts dimension warnings | Medium | Visual glitches on load |
| No real-time feed | High | Must refresh manually |
| No blast radius calculation | Medium | Can't prioritize fixes |
| No AI stacktrace summarization | Low | Nice to have |
| No client-side crash catching | High | Missing React errors |

---

## 3. Enhanced Features Specification

### 3.1 The "Blast Radius" Indicator

#### Calculation
- Count distinct users affected
- Count distinct gyms affected
- Group by identical stack trace

#### Visual Display
```
┌────────────────────────────────────────────────────────────┐
│ NullPointerException at CheckoutController        [IMPACT] │
│ 🔥 42 Users across 3 Gyms                                  │
└────────────────────────────────────────────────────────────┘
```

### 3.2 Real-Time Error Feed (SSE)

#### Event Types
| Type | Severity | Visual |
|------|---------|-------|
| FATAL | Critical | Pulsing red badge |
| ERROR | Error | Standard red badge |
| WARN | Warning | Amber badge |
| INFO | Low | Gray badge |

#### Feed Behavior
- New errors slide in from top
- Auto-pause when scrolling up
- Click to expand stack trace
- "Resume" button to catch up

### 3.3 Stack Trace Accordion

#### Display
- Monospace font in `<pre><code>` block
- Syntax highlighting (Prism.js)
- Pitch-black background (`#000000`)
- Line numbers
- Collapsible (show first 10 lines, expand all)

#### Actions
- "Copy Trace" - clipboard with check confirmation
- "Mark Resolved" - strikethrough + fade out animation
- "View in Logs" - link to log aggregator

### 3.4 Client-Side React Error Catching

#### Error Boundary Implementation
```typescript
class ReactErrorBoundary extends React.Component {
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Extract component stack
    const componentStack = info.componentStack || '';

    // Fire to backend
    apiClient.post('/api/superadmin/telemetry/client-error', {
      message: error.message,
      stack: error.stack,
      componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  }
}
```

---

## 4. UI/UX Layout Specification

### 4.1 Error Tracker Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 🐛 Error Tracker                           [Auto-refresh 🔄] [Export] [Settings] │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┬─────────────┬─────────────┬─────────────────────────────────────┐│
│ │ Total: 847 │ Critical: 12│ Open: 156   │ Resolved Today: 23                    ││
│ └─────────────┴─────────────┴─────────────┴─────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────────────┤
│ ERROR TREND (7 DAYS)                                                          │
│ [AreaChart with stacked critical/warning/info]                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│ FILTERS: [Severity ▾] [Status ▾] [Search: _______________] [Show Resolved ☐] │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────────────────┐ │
│ │ FATAL ●  NullPointerException at CheckoutController     [IMPACT: 42 users]│ │
│ │ 2:45 PM   #ERR-1234                                           [Expand ▼]  │ │
│ ├────────────────────────────────────────────────────────────────────────────┤ │
│ │ │ at CheckoutController.processPayment(Order.java:156)                  │ │
│ │ │ at PaymentService.process(PaymentService.java:89)                       │ │
│ │ │ ... 12 more frames                                                    │ │
│ │ │                                              [Copy] [Resolve] [Details]│ │
│ └────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Frontend Implementation

### 5.1 SSE Connection for Real-Time Errors

```typescript
// hooks/useErrorStream.ts
export const useErrorStream = (onError: (error: SystemError) => void) => {
  useEffect(() => {
    const eventSource = new EventSource('/api/superadmin/errors/stream');
    eventSource.onmessage = (e) => {
      const error = JSON.parse(e.data);
      onError(error);
    };
    return () => eventSource.close();
  }, [onError]);
};
```

### 5.2 Error Expansion Animation

```typescript
// Framer Motion for accordion
<motion.div
  initial={{ height: 0, opacity: 0 }}
  animate={{ height: 'auto', opacity: 1 }}
  exit={{ height: 0, opacity: 0 }}
  transition={{ duration: 0.3, ease: 'easeInOut' }}
>
  <pre><code>{error.stackTrace}</code></pre>
</motion.div>
```

### 5.3 Copy to Clipboard

```typescript
const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};
```

---

## 6. Backend Implementation

### 6.1 Global Exception Handler

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUncaughtException(
            Exception e, HttpServletRequest request) {

        // Extract sanitized stack trace
        String stackTrace = ExceptionUtils.getStackTrace(e);

        // Create error record
        SystemError error = SystemError.builder()
            .type(e.getClass().getSimpleName())
            .message(e.getMessage())
            .stackTrace(sanitize(stackTrace)) // Remove passwords, tokens
            .url(request.getRequestURI())
            .method(request.getMethod())
            .timestamp(LocalDateTime.now())
            .severity(determineSeverity(e))
            .build();

        // Save asynchronously
        systemErrorService.saveAsync(error);

        // Return safe error to client
        return ResponseEntity.status(500)
            .body(new ErrorResponse("An unexpected error occurred"));
    }
}
```

### 6.2 Security Sanitization

```java
private String sanitize(String stackTrace) {
    return stackTrace
        .replaceAll("password=[^&\\s]*", "password=***")
        .replaceAll("Authorization:[^\\n]*", "Authorization:***")
        .replaceAll("Bearer [A-Za-z0-9.-]*", "Bearer ***")
        .replaceAll("\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}", "****-****-****-****"); // PAN
}
```

### 6.3 Required Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/superadmin/errors` | Paginated error list |
| GET | `/api/superadmin/errors/{id}` | Error details |
| GET | `/api/superadmin/errors/stream` | SSE real-time feed |
| PUT | `/api/superadmin/errors/{id}/resolve` | Mark resolved |
| POST | `/api/superadmin/telemetry/client-error` | Client-side crash |
| DELETE | `/api/superadmin/errors/cleanup` | Purge old resolved |

---

## 7. Database Strategy

### 7.1 Data Retention Policy

```sql
-- Nightly cleanup of old resolved errors
DELETE FROM system_error_logs
WHERE created_at < NOW() - INTERVAL '30 days'
  AND status = 'RESOLVED';

-- Partial index for fast pruning
CREATE INDEX idx_errors_resolved_old
ON system_error_logs (created_at)
WHERE status = 'RESOLVED';
```

### 7.2 Error Grouping (Fingerprint)

```java
// Group errors by fingerprint to count blast radius
public String calculateFingerprint(Exception e) {
    // Use first 3 stack frames as fingerprint
    StackTraceElement[] stack = e.getStackTrace();
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < Math.min(3, stack.length); i++) {
        sb.append(stack[i].toString());
        sb.append("|");
    }
    return sb.toString();
}
```

---

## 8. Testing Procedures

### 8.1 Error Capture Tests
```typescript
it('catches React render errors', () => {
  const errorBoundary = render(<ErrorComponent />);
  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
});
```

### 8.2 Sanitization Tests
```java
@Test
void sanitizeStackTrace_removesPasswords() {
    String input = "password=secret123&token=bearer";
    String result = sanitizer.sanitize(input);
    assertFalse(result.contains("secret123"));
    assertFalse(result.contains("bearer"));
}
```

---

## 9. Success Criteria

| Criterion | Target | Validation |
|-----------|--------|------------|
| Error capture latency | < 100ms | SSE timestamp |
| Frontend error catching | 100% React errors | Error boundary test |
| Blast radius accuracy | Distinct users | Query verification |
| Data retention | 30-day auto-prune | Cron verification |
| Accessibility | WCAG 2.1 AA | axe-core |

---

## 10. Deliverables Checklist

- [ ] `SAErrors.tsx` with fixed chart containers
- [ ] Real-time SSE error stream
- [ ] Blast radius indicator
- [ ] Stack trace accordion with syntax highlighting
- [ ] Copy to clipboard functionality
- [ ] Mark resolved with animation
- [ ] React ErrorBoundary for client crashes
- [ ] Global exception handler in backend
- [ ] Security sanitization for stack traces
- [ ] Data retention policy (30 days)
- [ ] Unit tests >80% coverage
