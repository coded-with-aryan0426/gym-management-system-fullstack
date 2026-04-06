# Subscription & Licensing System — Implementation Plan

## 1. System Architecture

### 1.1 High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT APPS                              │
│   (React Web / Electron Desktop / Mobile App)                   │
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │  License Guard Layer (Feature Gates)                    │  │
│   │  - FeatureGate component                                 │  │
│   │  - useLicense() hook                                      │  │
│   │  - Offline grace period cache                            │  │
│   └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬──────────────────────────────────┘
                                │ REST / WebSocket
┌───────────────────────────────▼──────────────────────────────────┐
│                    BACKEND (Spring Boot)                          │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  API Gateway Layer                                          │  │
│  │  /api/auth  /api/plans  /api/subscribe  /api/license  /api  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Core Services                                             │  │
│  │  - SubscriptionService     - LicenseService                 │  │
│  │  - PaymentService          - NotificationService            │  │
│  │  - WebhookService          - GracePeriodService             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Payment Gateway Integrations                               │  │
│  │  - StripePaymentHandler    - PayPalPaymentHandler           │  │
│  │  - PaddlePaymentHandler    - LicenseKeyGenerator            │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Database Layer (PostgreSQL + Redis)                       │  │
│  │  - Users/Subscriptions    - Licenses                       │  │
│  │  - Payments/Webhooks      - Audit Logs                     │  │
│  │  - Plans/Features         - Grace Period Cache            │  │
│  └─────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬──────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│    Stripe     │      │    PayPal     │      │    Paddle     │
│   Webhooks    │      │   Webhooks    │      │   Webhooks    │
└───────────────┘      └───────────────┘      └───────────────┘
```

### 1.2 Tech Stack
- **Backend**: Spring Boot 3.2+ (Java 17+)
- **Database**: PostgreSQL with Flyway migrations
- **Caching**: Redis (grace period, rate limiting)
- **Security**: JWT + HMAC signature for license keys
- **Payment Gateways**: Stripe, PayPal, Paddle
- **Frontend**: React + TypeScript (existing)

---

## 2. Database Schema

### 2.1 Core Tables

```sql
-- Plans table (subscription tiers)
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    tier_level INT NOT NULL DEFAULT 0,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_quarterly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    price_usd_monthly DECIMAL(10,2),
    price_usd_quarterly DECIMAL(10,2),
    price_usd_yearly DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'INR',
    trial_days INT DEFAULT 0,
    grace_period_days INT DEFAULT 3,
    max_devices INT DEFAULT 1,
    features JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    gateway_plans JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(50) NOT NULL DEFAULT 'trialing',
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly',
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    grace_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMPTZ,
    auto_renew BOOLEAN DEFAULT TRUE,
    gateway VARCHAR(50),
    gateway_subscription_id VARCHAR(255),
    gateway_customer_id VARCHAR(255),
    previous_plan_id UUID REFERENCES subscription_plans(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- License keys
CREATE TABLE license_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id),
    license_key VARCHAR(255) UNIQUE NOT NULL,
    plan_name VARCHAR(50) NOT NULL,
    plan_tier INT NOT NULL DEFAULT 0,
    max_devices INT DEFAULT 1,
    activated_devices JSONB DEFAULT '[]',
    hardware_fingerprint VARCHAR(255),
    expires_at TIMESTAMPTZ NOT NULL,
    last_validated_at TIMESTAMPTZ,
    is_revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMPTZ,
    revoke_reason VARCHAR(255),
    is_transferable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment records
CREATE TABLE subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id),
    license_id UUID REFERENCES license_keys(id),
    gateway VARCHAR(50) NOT NULL,
    gateway_payment_id VARCHAR(255),
    gateway_invoice_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(100),
    card_last4 VARCHAR(4),
    card_brand VARCHAR(50),
    billing_cycle VARCHAR(20),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    paid_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    refund_amount DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook events (idempotency)
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway VARCHAR(50) NOT NULL,
    event_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    processing_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gateway, event_id)
);

-- License activations (device tracking)
CREATE TABLE license_activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id UUID NOT NULL REFERENCES license_keys(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    device_name VARCHAR(255),
    device_fingerprint VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    activated_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(license_id, device_fingerprint)
);

-- Subscription changes (audit trail)
CREATE TABLE subscription_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id),
    change_type VARCHAR(50) NOT NULL,
    old_plan_id UUID REFERENCES subscription_plans(id),
    new_plan_id UUID REFERENCES subscription_plans(id),
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    reason VARCHAR(255),
    initiated_by VARCHAR(50),
    gateway_action_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email notifications log
CREATE TABLE subscription_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id),
    notification_type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) DEFAULT 'email',
    subject VARCHAR(255),
    content TEXT,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate limiting for trial accounts
CREATE TABLE trial_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    request_count INT DEFAULT 0,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    window_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_subscriptions_period_end ON user_subscriptions(current_period_end);
CREATE INDEX idx_license_keys_user_id ON license_keys(user_id);
CREATE INDEX idx_license_keys_key ON license_keys(license_key);
CREATE INDEX idx_license_keys_expires ON license_keys(expires_at);
CREATE INDEX idx_payments_user_id ON subscription_payments(user_id);
CREATE INDEX idx_payments_status ON subscription_payments(status);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed, gateway);
```

### 2.2 Subscription Status Enum
```sql
CREATE TYPE subscription_status AS ENUM (
    'trialing',
    'active',
    'past_due',
    'cancelled',
    'expired',
    'paused',
    'pending'
);
```

---

## 3. API Endpoints

### 3.1 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, return JWT |
| POST | `/api/auth/refresh` | Refresh access token |

### 3.2 Plans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/plans` | List all active plans |
| GET | `/api/plans/{id}` | Get plan details with features |
| GET | `/api/plans/features` | Get feature matrix |

### 3.3 Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/subscribe/checkout` | Create checkout session |
| GET | `/api/subscribe/status` | Get current subscription status |
| POST | `/api/subscribe/cancel` | Cancel at period end |
| POST | `/api/subscribe/reactivate` | Reactivate cancelled |
| POST | `/api/subscribe/upgrade` | Upgrade plan |
| POST | `/api/subscribe/downgrade` | Downgrade plan |
| GET | `/api/subscribe/invoices` | List payment invoices |

### 3.4 License
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/license/validate` | Validate license + device |
| POST | `/api/license/activate` | Activate on device |
| POST | `/api/license/deactivate` | Remove device |
| GET | `/api/license/my` | Get user's license info |
| POST | `/api/license/transfer` | Transfer to new user |
| GET | `/api/license/devices` | List activated devices |

### 3.5 Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/stripe` | Stripe webhook receiver |
| POST | `/api/webhooks/paypal` | PayPal webhook receiver |
| POST | `/api/webhooks/paddle` | Paddle webhook receiver |

### 3.6 Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/subscribers` | List all subscribers |
| GET | `/api/admin/subscribers/{id}` | Subscriber details |
| POST | `/api/admin/license/revoke/{id}` | Revoke license |
| POST | `/api/admin/license/grant` | Manual license grant |
| POST | `/api/admin/subscription/override` | Override subscription |
| GET | `/api/admin/metrics` | MRR, ARR, churn metrics |
| GET | `/api/admin/revenue` | Revenue analytics |
| GET | `/api/admin/audit-log` | Subscription audit log |

---

## 4. License Key System

### 4.1 Key Format
```
XXXX-XXXX-XXXX-XXXX-XXXX
```
Format: `XXXX-XXXX-XXXX-XXXX-XXXX` (20 chars + 4 dashes = 24 total)

### 4.2 Key Structure (HMAC-SHA256)
```
payload = user_id + plan_id + timestamp + random
signature = HMAC-SHA256(payload, server_secret_key)
key = base32(payload + signature[:8])
```

### 4.3 Validation Flow
```
1. Parse license key into components
2. Verify HMAC signature
3. Check expiration timestamp
4. Validate user_id exists and matches
5. Check plan_id matches subscription
6. Verify device fingerprint
7. Update last_validated_at timestamp
8. Return decoded license info
```

---

## 5. Grace Period & Trial Logic

### 5.1 Trial Period
- New users get configurable trial days (default: 7)
- Trial converts automatically to paid on payment success
- Trial ends → grace period begins → features restricted

### 5.2 Grace Period
- Configurable per plan (default: 3 days)
- All features remain accessible during grace
- Daily email notifications during grace
- After grace: features locked, user prompted to renew

### 5.3 Renewal Reminders
- 7 days before expiry
- 3 days before expiry
- 1 day before expiry
- Day of expiry
- 1 day after expiry (grace started)
- Daily during grace period

---

## 6. Feature Gating (Frontend)

### 6.1 Plan Features Matrix
```typescript
interface PlanFeatures {
  // Core features
  basicAccess: boolean;      // Free tier
  analytics: boolean;        // Pro+
  exportPdf: boolean;        // Pro+
  apiAccess: boolean;        // Enterprise
  prioritySupport: boolean;  // Pro+

  // Limits
  maxMembers: number;
  maxStaff: number;
  maxTrainers: number;
  maxClasses: number;
  storageLimitMb: number;
}
```

### 6.2 FeatureGate Component
```tsx
<FeatureGate feature="analytics" fallback={<LockedOverlay />}>
  <AnalyticsDashboard />
</FeatureGate>
```

### 6.3 useLicense Hook
```typescript
const { isActive, plan, features, expiresAt } = useLicense();
```

---

## 7. Payment Gateway Integration

### 7.1 Stripe
- Checkout Sessions for new subscriptions
- Customer Portal for management
- Webhook events: checkout.session.completed, invoice.paid, customer.subscription.updated/deleted

### 7.2 PayPal
- Subscription API with Billing Plans
- Webhook events: BILLING.SUBSCRIPTION.CREATED, PAYMENT.SALE.COMPLETED, BILLING.SUBSCRIPTION.CANCELLED

### 7.3 Paddle
- Checkout API for purchases
- Webhook events: subscription.created, subscription.paid, subscription.cancelled, subscription.payment_failed

---

## 8. Rate Limiting

### 8.1 Trial Account Limits
- License validation: 100/hour
- API requests: 500/hour
- Prevents abuse during trial period

### 8.2 Production Limits
- License validation: 1000/hour
- API requests: 10000/hour

---

## 9. Email Notifications

### 9.1 Notification Types
- `trial_started` - Welcome email with trial details
- `trial_expiring` - X days before trial ends
- `trial_expired` - Trial ended, upgrade prompt
- `subscription_created` - Payment confirmed
- `subscription_renewed` - Renewal successful
- `subscription_cancelled` - Cancellation confirmed
- `subscription_expired` - Subscription ended
- `payment_failed` - Payment issue
- `payment_recovered` - Payment succeeded after failure
- `grace_period_started` - Features at risk
- `license_revoked` - Admin action notification

---

## 10. Open Source Libraries & References

### 10.1 Used Libraries
- **stripe-java**: Official Stripe Java SDK
- **paypal-java-subscription**: PayPal SDK for subscriptions
- **bucket4j**: Rate limiting implementation
- **jjwt**: JWT token handling
- **spring-boot-starter-mail**: Email notifications
- **spring-boot-starter-data-redis**: Caching

### 10.2 Reference Repositories
- [Subscription-Billing-System-with-Stripe](https://github.com/chelbapolandaa/Subscription-Billing-System-with-Stripe) - Node.js + Stripe
- [Laravel Subscriptions](https://github.com/laravelcm/laravel-subscriptions) - PHP Laravel approach
- [Licensify](https://github.com/nogipx/licensify) - License key best practices
- [BillaBear](https://github.com/billabear/billabear) - Open-source billing system

---

## 11. Security Considerations

### 11.1 PCI Compliance
- Never store raw card numbers (use gateway tokens)
- Use HTTPS for all communications
- Validate webhook signatures
- Implement idempotency for payment operations

### 11.2 License Security
- HMAC-SHA256 signatures
- Hardware fingerprinting for device binding
- Server-side validation only (no client-side bypass)
- Rate limiting on validation endpoints
- Audit logging for all license operations

---

## 12. Implementation Order

1. Database migrations (Flyway)
2. Entity models and repositories
3. Core services (Subscription, License, Payment)
4. License key generation/validation
5. Payment gateway integrations
6. Webhook handlers
7. Grace period and trial logic
8. Email notification service
9. Admin API endpoints
10. Frontend subscription dashboard
11. Feature gating components
12. Rate limiting
13. Testing suite
14. Documentation
