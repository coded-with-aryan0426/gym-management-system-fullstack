# 🔐 Subscription & Licensing System — Complete Micro-Detail Plan

---

## 📌 Improved Prompt (XML Format)

```xml
<prompt>
  <objective>
    Design and implement a complete subscription-based access control system
    for an existing desktop/web application. The system must enforce feature
    gating based on active payment status and plan tier, provide a smooth
    paywall experience, and auto-lock features when a subscription lapses or
    trial expires.
  </objective>

  <requirements>
    <requirement id="R1">
      Feature Gating — Lock all premium features behind subscription validation.
      When a user attempts to access a locked feature, display a contextual
      paywall modal with plan options and a CTA to subscribe.
    </requirement>

    <requirement id="R2">
      Plan Tiers — Support multiple subscription plans (e.g., Free Trial,
      Basic, Pro, Enterprise) each with a defined feature set, usage limits,
      and time-bound validity (7-day trial, monthly, annual).
    </requirement>

    <requirement id="R3">
      Payment Integration — Integrate a payment gateway (Razorpay / Stripe /
      LemonSqueezy) to handle one-time payments, recurring subscriptions,
      and webhook-based status updates.
    </requirement>

    <requirement id="R4">
      License Enforcement — After payment, issue a license key or JWT token
      tied to the user's plan, device, and expiry date. Validate on every
      app launch and feature access attempt.
    </requirement>

    <requirement id="R5">
      Expiry Handling — When a subscription expires or payment fails, auto-lock
      premium features, notify the user with a renewal prompt, and allow
      continued access to free-tier features only.
    </requirement>

    <requirement id="R6">
      Offline Grace Period — Allow a configurable offline grace period
      (e.g., 3 days) before enforcing online license validation, to handle
      temporary connectivity loss without disrupting the user experience.
    </requirement>

    <requirement id="R7">
      Admin Dashboard — Provide a backend admin panel to view subscribers,
      manually grant or revoke licenses, view MRR/ARR metrics, and manage
      plan configurations.
    </requirement>
  </requirements>

  <tech_stack>
    <backend>Spring Boot (Java 17+), PostgreSQL, Redis</backend>
    <frontend>React + TypeScript / Flutter</frontend>
    <payment>Razorpay (India) or LemonSqueezy (Global SaaS)</payment>
    <licensing>JWT + HMAC signature or Keygen.sh</licensing>
    <deployment>AWS EKS / Railway / Render</deployment>
  </tech_stack>

  <output_format>
    Provide a complete implementation plan covering: database schema,
    API endpoints, frontend gating logic, webhook handling, license
    validation flow, recommended open-source libraries and GitHub repos,
    and security best practices.
  </output_format>
</prompt>
```

---

## 🗂️ System Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                     CLIENT APP                           │
│  (React / Flutter / Electron)                            │
│                                                          │
│  ┌────────────┐    ┌─────────────┐    ┌───────────────┐  │
│  │ Feature A  │    │  Feature B  │    │   Feature C   │  │
│  │  [FREE]    │    │  [PRO 🔒]  │    │  [ENT 🔒]    │  │
│  └────────────┘    └─────────────┘    └───────────────┘  │
│          │                │                   │           │
│          └────────────────┴───────────────────┘           │
│                           │                              │
│                  License Guard Layer                     │
│                 (checks plan + expiry)                   │
└───────────────────────────┬──────────────────────────────┘
                            │ REST / gRPC
┌───────────────────────────▼──────────────────────────────┐
│                  BACKEND (Spring Boot)                    │
│                                                          │
│  /auth  /plans  /subscribe  /license/validate  /webhooks │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │  Users   │  │  Plans   │  │  Subs    │  │ License │  │
│  │    DB    │  │    DB    │  │    DB    │  │   DB    │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘  │
└───────────────────────────┬──────────────────────────────┘
                            │
              ┌─────────────▼─────────────┐
              │     Payment Gateway        │
              │  (Razorpay / LemonSqueezy) │
              │   Webhooks → /webhooks     │
              └───────────────────────────┘
```

---

## 🗄️ Database Schema (PostgreSQL)

### `users` table

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          VARCHAR(255),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### `plans` table

```sql
CREATE TABLE plans (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(100) NOT NULL,       -- 'free', 'basic', 'pro', 'enterprise'
  display_name     VARCHAR(100) NOT NULL,
  price_monthly    DECIMAL(10,2),
  price_annual     DECIMAL(10,2),
  currency         VARCHAR(10) DEFAULT 'INR',
  trial_days       INT DEFAULT 0,
  features         JSONB,                        -- {"max_users": 5, "analytics": true}
  is_active        BOOLEAN DEFAULT TRUE,
  razorpay_plan_id VARCHAR(255),                 -- Razorpay plan ID for recurring
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
```

### `subscriptions` table

```sql
CREATE TABLE subscriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id             UUID REFERENCES plans(id),
  status              VARCHAR(50) NOT NULL,   -- 'trialing','active','past_due','cancelled','expired'
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end   TIMESTAMPTZ NOT NULL,
  trial_end           TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  gateway             VARCHAR(50),            -- 'razorpay', 'stripe', 'lemonsqueezy'
  gateway_subscription_id VARCHAR(255),       -- gateway's subscription ID
  gateway_customer_id     VARCHAR(255),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

### `licenses` table

```sql
CREATE TABLE licenses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  subscription_id UUID REFERENCES subscriptions(id),
  license_key     VARCHAR(255) UNIQUE NOT NULL,  -- XXXX-XXXX-XXXX-XXXX format
  plan_name       VARCHAR(100),
  max_devices     INT DEFAULT 1,
  activated_devices JSONB DEFAULT '[]',           -- [{device_id, activated_at}]
  expires_at      TIMESTAMPTZ NOT NULL,
  is_revoked      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `payments` table

```sql
CREATE TABLE payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id),
  subscription_id   UUID REFERENCES subscriptions(id),
  gateway           VARCHAR(50),
  gateway_payment_id VARCHAR(255),
  amount            DECIMAL(10,2),
  currency          VARCHAR(10),
  status            VARCHAR(50),   -- 'pending','captured','failed','refunded'
  payment_method    VARCHAR(100),
  metadata          JSONB,
  paid_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

### `webhook_events` table (idempotency)

```sql
CREATE TABLE webhook_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway       VARCHAR(50),
  event_id      VARCHAR(255) UNIQUE NOT NULL,   -- gateway's event ID
  event_type    VARCHAR(255),
  payload       JSONB,
  processed     BOOLEAN DEFAULT FALSE,
  processed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔌 API Endpoints (Spring Boot)

### Auth

| Method | Endpoint               | Description          |
| ------ | ---------------------- | -------------------- |
| POST   | `/api/auth/register` | Register new user    |
| POST   | `/api/auth/login`    | Login, return JWT    |
| POST   | `/api/auth/refresh`  | Refresh access token |

### Plans

| Method | Endpoint            | Description                     |
| ------ | ------------------- | ------------------------------- |
| GET    | `/api/plans`      | List all active plans           |
| GET    | `/api/plans/{id}` | Get plan details + feature list |

### Subscriptions

| Method | Endpoint                      | Description                             |
| ------ | ----------------------------- | --------------------------------------- |
| POST   | `/api/subscribe/checkout`   | Create payment order / checkout session |
| GET    | `/api/subscribe/status`     | Get current user's subscription status  |
| POST   | `/api/subscribe/cancel`     | Cancel subscription at period end       |
| POST   | `/api/subscribe/reactivate` | Reactivate cancelled subscription       |

### License

| Method | Endpoint                    | Description                               |
| ------ | --------------------------- | ----------------------------------------- |
| POST   | `/api/license/validate`   | Validate license key + device fingerprint |
| POST   | `/api/license/activate`   | Activate license on a device              |
| POST   | `/api/license/deactivate` | Remove device from license                |
| GET    | `/api/license/my`         | Get user's current license info           |

### Webhooks

| Method | Endpoint                       | Description                   |
| ------ | ------------------------------ | ----------------------------- |
| POST   | `/api/webhooks/razorpay`     | Razorpay webhook receiver     |
| POST   | `/api/webhooks/stripe`       | Stripe webhook receiver       |
| POST   | `/api/webhooks/lemonsqueezy` | LemonSqueezy webhook receiver |

### Admin

| Method | Endpoint                           | Description                  |
| ------ | ---------------------------------- | ---------------------------- |
| GET    | `/api/admin/subscribers`         | List all subscribers         |
| POST   | `/api/admin/license/revoke/{id}` | Revoke a license             |
| POST   | `/api/admin/license/grant`       | Manually grant license       |
| GET    | `/api/admin/metrics`             | MRR, ARR, churn, active subs |

---

## ⚙️ Feature Gating Logic (Frontend)

### React — `useLicense` hook

```typescript
// hooks/useLicense.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export type PlanFeatures = {
  analytics: boolean;
  maxUsers: number;
  exportPdf: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
};

export function useLicense() {
  const { data, isLoading } = useQuery({
    queryKey: ['license'],
    queryFn: () => api.get('/license/my').then(r => r.data),
    staleTime: 1000 * 60 * 5, // re-check every 5 mins
  });

  const features: PlanFeatures = data?.features ?? {
    analytics: false,
    maxUsers: 1,
    exportPdf: false,
    apiAccess: false,
    prioritySupport: false,
  };

  return {
    isActive: data?.status === 'active' || data?.status === 'trialing',
    plan: data?.planName ?? 'free',
    expiresAt: data?.expiresAt,
    features,
    isLoading,
  };
}
```

### `<FeatureGate>` component

```typescript
// components/FeatureGate.tsx
import { useLicense } from '../hooks/useLicense';
import { PaywallModal } from './PaywallModal';
import { useState } from 'react';

type Props = {
  feature: keyof PlanFeatures;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function FeatureGate({ feature, children, fallback }: Props) {
  const { features, isActive } = useLicense();
  const [showPaywall, setShowPaywall] = useState(false);

  const hasAccess = isActive && features[feature];

  if (!hasAccess) {
    return (
      <>
        <div
          className="relative cursor-not-allowed opacity-50"
          onClick={() => setShowPaywall(true)}
        >
          {/* Blurred preview of locked feature */}
          <div className="pointer-events-none blur-sm">{children}</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span>🔒 Upgrade to unlock</span>
          </div>
        </div>
        {showPaywall && (
          <PaywallModal
            feature={feature}
            onClose={() => setShowPaywall(false)}
          />
        )}
      </>
    );
  }

  return <>{children}</>;
}
```

### Usage in any component

```tsx
// Usage anywhere in the app
<FeatureGate feature="analytics">
  <AnalyticsDashboard />
</FeatureGate>

<FeatureGate feature="exportPdf">
  <ExportButton />
</FeatureGate>
```

---

## 💳 Payment Integration

### Option A — Razorpay (India, Recommended for AthlonX)

**Step 1: Create subscription order (backend)**

```java
// RazorpayService.java
@Service
public class RazorpayService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public JSONObject createSubscription(String razorpayPlanId) throws Exception {
        RazorpayClient client = new RazorpayClient(keyId, keySecret);

        JSONObject options = new JSONObject();
        options.put("plan_id", razorpayPlanId);
        options.put("total_count", 12);        // 12 billing cycles
        options.put("quantity", 1);
        options.put("customer_notify", 1);

        Subscription subscription = client.subscriptions.create(options);
        return subscription.toJson();
    }
}
```

**Step 2: Checkout on frontend**

```typescript
// lib/razorpay.ts
export function openRazorpayCheckout(options: {
  subscriptionId: string;
  userEmail: string;
  userName: string;
  planName: string;
  onSuccess: (paymentId: string) => void;
}) {
  const rzp = new (window as any).Razorpay({
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    subscription_id: options.subscriptionId,
    name: 'AthlonX',
    description: `${options.planName} Plan`,
    prefill: {
      email: options.userEmail,
      name: options.userName,
    },
    theme: { color: '#6366f1' },
    handler: (response: any) => {
      options.onSuccess(response.razorpay_payment_id);
    },
  });
  rzp.open();
}
```

### Option B — LemonSqueezy (Global, SaaS-friendly)

```typescript
// Redirect to LemonSqueezy checkout URL
const checkoutUrl = await api.post('/subscribe/checkout', {
  planId,
  userId: currentUser.id,
});
window.location.href = checkoutUrl.data.url;
// LemonSqueezy handles everything, redirects back with ?subscription_id=
```

### Option C — Stripe (if global audience)

```java
// Use stripe-java SDK
SessionCreateParams params = SessionCreateParams.builder()
  .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
  .addLineItem(SessionCreateParams.LineItem.builder()
    .setPrice(priceId)
    .setQuantity(1L)
    .build())
  .setSuccessUrl("https://yourapp.com/success?session_id={CHECKOUT_SESSION_ID}")
  .setCancelUrl("https://yourapp.com/pricing")
  .build();
Session session = Session.create(params);
```

---

## 🪝 Webhook Handling (Critical — Do Not Skip)

```java
// WebhookController.java
@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    @PostMapping("/razorpay")
    public ResponseEntity<Void> handleRazorpay(
        @RequestBody String payload,
        @RequestHeader("X-Razorpay-Signature") String signature
    ) {
        // 1. Verify HMAC signature
        boolean valid = RazorpayUtils.verifyWebhookSignature(
            payload, signature, webhookSecret
        );
        if (!valid) return ResponseEntity.status(400).build();

        // 2. Parse event
        JSONObject event = new JSONObject(payload);
        String eventType = event.getString("event");

        // 3. Idempotency — skip if already processed
        String eventId = event.getString("id");
        if (webhookEventRepo.existsByEventId(eventId)) {
            return ResponseEntity.ok().build();
        }

        // 4. Handle event types
        switch (eventType) {
            case "subscription.activated":
                subscriptionService.activate(event);
                break;
            case "subscription.charged":
                subscriptionService.renewSubscription(event);
                break;
            case "subscription.cancelled":
                subscriptionService.cancel(event);
                break;
            case "subscription.halted":          // payment failed
                subscriptionService.markPastDue(event);
                break;
            case "payment.failed":
                subscriptionService.handlePaymentFailure(event);
                break;
        }

        // 5. Mark processed
        webhookEventRepo.save(new WebhookEvent(eventId, eventType, payload));
        return ResponseEntity.ok().build();
    }
}
```

---

## 🔑 License Validation Flow

```
App Launch
    │
    ▼
Read cached license from local storage / keychain
    │
    ├── No license → Show LOGIN / SUBSCRIBE screen
    │
    ▼
Is device online?
    │
    ├── YES → Call POST /api/license/validate
    │              { licenseKey, deviceFingerprint, appVersion }
    │              │
    │              ├── 200 OK → Cache response with TTL=24h → UNLOCK FEATURES
    │              ├── 402 → Subscription expired → SHOW RENEWAL MODAL
    │              ├── 403 → License revoked → LOCK ALL FEATURES
    │              └── 404 → Invalid key → SHOW ERROR
    │
    └── OFFLINE → Check cached validation
                    │
                    ├── Cache valid + within grace period (3 days) → UNLOCK
                    └── Grace period exceeded → LOCK + SHOW OFFLINE WARNING
```

### Device Fingerprint Generation

```typescript
// lib/deviceFingerprint.ts
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export async function getDeviceFingerprint(): Promise<string> {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  return result.visitorId;  // stable unique device ID
}
```

---

## 📦 Recommended Libraries & GitHub Repos

### Backend (Spring Boot)

| Library                          | Purpose                    | Link                                                                        |
| -------------------------------- | -------------------------- | --------------------------------------------------------------------------- |
| `razorpay-java`                | Razorpay Java SDK          | [github.com/razorpay/razorpay-java](https://github.com/razorpay/razorpay-java) |
| `stripe-java`                  | Stripe Java SDK            | [github.com/stripe/stripe-java](https://github.com/stripe/stripe-java)         |
| `spring-security`              | JWT auth, route protection | Spring official                                                             |
| `jjwt`                         | JWT creation & validation  | [github.com/jwtk/jjwt](https://github.com/jwtk/jjwt)                           |
| `spring-boot-starter-data-jpa` | DB access                  | Spring official                                                             |

### Frontend (React)

| Library                           | Purpose                           | Link                                                                                  |
| --------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------- |
| `@tanstack/react-query`         | Server state, license caching     | tanstack.com                                                                          |
| `@fingerprintjs/fingerprintjs`  | Device fingerprinting (free tier) | [github.com/fingerprintjs/fingerprintjs](https://github.com/fingerprintjs/fingerprintjs) |
| `razorpay`(npm)                 | Razorpay checkout JS              | npm                                                                                   |
| `@lemonsqueezy/lemonsqueezy.js` | LemonSqueezy SDK                  | [github.com/lmsqueezy/lemonsqueezy.js](https://github.com/lmsqueezy/lemonsqueezy.js)     |

### Managed Licensing Services (Plug & Play)

| Service                | What it does                                                     | Pricing             |
| ---------------------- | ---------------------------------------------------------------- | ------------------- |
| **Keygen.sh**    | Full license management API, device activation, offline licenses | Free tier available |
| **LemonSqueezy** | Payment + license keys built-in, perfect for SaaS                | 5% transaction fee  |
| **Paddle**       | Payment + tax compliance + licensing                             | 5% + $0.50/txn      |
| **Cryptlex**     | License keys, floating licenses, trials                          | Paid                |

> 💡 **For AthlonX V2** — Use **Razorpay** for payments + **Keygen.sh** for license management. Both have free tiers and great APIs.

---

## 🛡️ Security Best Practices

### 1. Never trust the client

```
❌ WRONG: if (localStorage.getItem('isPremium') === 'true') { unlock() }
✅ RIGHT: Always validate with backend API call on every session start
```

### 2. Sign license tokens

```java
// Backend issues a signed JWT as license token
String licenseToken = Jwts.builder()
    .setSubject(userId)
    .claim("plan", "pro")
    .claim("features", featureMap)
    .claim("deviceId", deviceFingerprint)
    .setExpiration(subscriptionEndDate)
    .signWith(SignatureAlgorithm.HS512, secretKey)
    .compact();
```

### 3. Webhook signature verification (ALWAYS)

```java
// Verify HMAC-SHA256 signature before processing any webhook
Mac mac = Mac.getInstance("HmacSHA256");
mac.init(new SecretKeySpec(secret.getBytes(), "HmacSHA256"));
String computed = Base64.encodeBase64String(mac.doFinal(payload.getBytes()));
if (!computed.equals(receivedSignature)) throw new SecurityException("Invalid webhook");
```

### 4. Rate limit license validation endpoint

```java
// Use Bucket4j or Spring's rate limiter
@RateLimiter(name = "licenseValidation", fallbackMethod = "rateLimitFallback")
@PostMapping("/license/validate")
public ResponseEntity<?> validateLicense(@RequestBody LicenseRequest req) { ... }
```

### 5. Obfuscate frontend code (for Electron/desktop)

```bash
# Use javascript-obfuscator for Electron apps
npx javascript-obfuscator dist/main.js --output dist/main.obf.js
```

---

## 📊 Plan Configuration Example

```json
{
  "plans": [
    {
      "id": "free",
      "displayName": "Free Trial",
      "trialDays": 14,
      "priceMonthly": 0,
      "features": {
        "maxUsers": 1,
        "analytics": false,
        "exportPdf": false,
        "apiAccess": false,
        "prioritySupport": false,
        "customBranding": false
      }
    },
    {
      "id": "basic",
      "displayName": "Basic",
      "priceMonthly": 499,
      "priceAnnual": 4999,
      "currency": "INR",
      "features": {
        "maxUsers": 5,
        "analytics": true,
        "exportPdf": true,
        "apiAccess": false,
        "prioritySupport": false,
        "customBranding": false
      }
    },
    {
      "id": "pro",
      "displayName": "Pro",
      "priceMonthly": 1299,
      "priceAnnual": 12999,
      "currency": "INR",
      "features": {
        "maxUsers": 25,
        "analytics": true,
        "exportPdf": true,
        "apiAccess": true,
        "prioritySupport": true,
        "customBranding": false
      }
    },
    {
      "id": "enterprise",
      "displayName": "Enterprise",
      "priceMonthly": null,
      "priceAnnual": null,
      "contactSales": true,
      "features": {
        "maxUsers": -1,
        "analytics": true,
        "exportPdf": true,
        "apiAccess": true,
        "prioritySupport": true,
        "customBranding": true
      }
    }
  ]
}
```

---

## 📅 Implementation Timeline

| Week             | Task                                                          |
| ---------------- | ------------------------------------------------------------- |
| **Week 1** | DB schema setup, user auth (JWT), plans API                   |
| **Week 2** | Razorpay integration, checkout flow, webhook handler          |
| **Week 3** | License issuance, validation API, device fingerprinting       |
| **Week 4** | Frontend FeatureGate component, PaywallModal, useLicense hook |
| **Week 5** | Trial system, expiry notifications, renewal flow              |
| **Week 6** | Admin dashboard, metrics (MRR/ARR), manual license management |
| **Week 7** | Security hardening, rate limiting, obfuscation                |
| **Week 8** | Testing (happy path + edge cases), staging deploy, go-live    |

---

## 🧪 Edge Cases to Handle

* [ ] User pays but webhook is delayed → show "Payment processing" state
* [ ] User opens app on 2 devices simultaneously → enforce `maxDevices` limit
* [ ] User clears local storage to reset trial → server-side trial tracking
* [ ] Subscription renewed mid-period (upgrade) → prorate billing
* [ ] Refund issued → auto-revoke license via webhook
* [ ] Clock manipulation on device → server-side expiry validation always wins
* [ ] App used offline for >grace period → graceful lock with offline message
* [ ] Failed recurring payment → 3-day grace, then lock, email reminder

---

## 📧 Email Notifications to Implement

| Trigger                  | Email                            |
| ------------------------ | -------------------------------- |
| Subscription activated   | Welcome + license key            |
| Trial started            | Welcome + trial end date         |
| 3 days before trial ends | Upgrade CTA                      |
| Trial expired            | Locked features + upgrade prompt |
| Payment successful       | Receipt + renewal date           |
| Payment failed           | Retry CTA + update card link     |
| 7 days before renewal    | Heads up email                   |
| Subscription cancelled   | Confirmation + active until date |
| Subscription expired     | Re-subscribe CTA                 |

---

*Generated for AthlonX V2 — Spring Boot + React + Razorpay Stack*
*Last updated: April 2026*
