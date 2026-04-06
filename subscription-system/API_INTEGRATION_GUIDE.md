# Subscription & Licensing System - Integration Guide

## Overview

This document provides integration instructions for the Subscription & Licensing System.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ useLicense   │  │ FeatureGate  │  │ PricingPage     │  │
│  │ Hook         │  │ Component    │  │ Component       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │ REST API
┌────────────────────────────▼────────────────────────────────┐
│                   BACKEND (Spring Boot)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Subscription │  │   License    │  │    Payment       │  │
│  │  Controller  │  │  Controller  │  │   Gateway        │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Webhook    │  │  Scheduler   │  │  Notification    │  │
│  │  Handlers    │  │              │  │    Service       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
   ┌─────────┐          ┌─────────┐          ┌─────────┐
   │ Stripe  │          │ PayPal  │          │ Paddle  │
   └─────────┘          └─────────┘          └─────────┘
```

## Database Schema

### Tables

1. `subscription_plans` - Plan definitions
2. `user_subscriptions` - User subscriptions
3. `license_keys` - License key management
4. `subscription_payments` - Payment records
5. `webhook_events` - Webhook idempotency
6. `license_activations` - Device activations
7. `subscription_changes` - Audit trail
8. `subscription_notifications` - Notification log
9. `trial_rate_limits` - Rate limiting

## API Endpoints

### Plans

```
GET  /api/plans                    - List all active plans
GET  /api/plans/{id}              - Get plan details
GET  /api/plans/features           - Get feature matrix
```

### Subscriptions

```
POST /api/subscribe/checkout       - Create checkout session
GET  /api/subscribe/status        - Get subscription status
POST /api/subscribe/trial         - Start trial
POST /api/subscribe/activate      - Activate subscription
POST /api/subscribe/upgrade       - Upgrade plan
POST /api/subscribe/downgrade      - Downgrade plan
POST /api/subscribe/cancel         - Cancel subscription
POST /api/subscribe/reactivate     - Reactivate subscription
POST /api/subscribe/renew          - Renew subscription
```

### Licenses

```
POST /api/license/validate         - Validate license
POST /api/license/activate         - Activate device
POST /api/license/deactivate       - Deactivate device
GET  /api/license/my              - Get license info
GET  /api/license/devices         - List activated devices
POST /api/license/transfer        - Transfer license
```

### Webhooks

```
POST /api/webhooks/stripe          - Stripe webhook
POST /api/webhooks/paypal          - PayPal webhook
POST /api/webhooks/paddle          - Paddle webhook
```

### Admin

```
GET  /api/admin/subscribers        - List subscribers
GET  /api/admin/subscribers/{id}  - Subscriber details
POST /api/admin/license/revoke     - Revoke license
POST /api/admin/license/grant      - Grant license
POST /api/admin/subscription/override - Override subscription
GET  /api/admin/metrics           - Get metrics
GET  /api/admin/revenue           - Get revenue data
```

## Frontend Integration

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
VITE_API_URL=http://localhost:8082/api
```

### 3. Use the License Hook

```tsx
import { useLicense } from './hooks/useLicense';

function MyComponent() {
  const { isActive, plan, features, canAccessFeature } = useLicense();

  if (!isActive) {
    return <Paywall />;
  }

  return <PremiumContent />;
}
```

### 4. Use Feature Gate

```tsx
import { FeatureGate } from './components/Paywall/FeatureGate';

function Dashboard() {
  return (
    <div>
      <BasicStats />

      <FeatureGate feature="analytics">
        <AnalyticsDashboard />
      </FeatureGate>

      <FeatureGate feature="exportPdf">
        <ExportButton />
      </FeatureGate>
    </div>
  );
}
```

### 5. Pricing Page

```tsx
import { PricingPage } from './pages/PricingPage';

function App() {
  const handleSelectPlan = (plan, billingCycle) => {
    // Redirect to checkout
    window.location.href = `/checkout?plan=${plan.id}&cycle=${billingCycle}`;
  };

  return <PricingPage onSelectPlan={handleSelectPlan} />;
}
```

## Backend Integration

### 1. Configure Database

Update `application.properties`:

```properties
spring.datasource.url=jdbc:oracle:thin:@//localhost:1521/FREE
spring.datasource.username=system
spring.datasource.password=Oracle123
```

### 2. Configure Payment Gateways

```properties
stripe.api.key=sk_test_xxxxx
stripe.webhook.secret=whsec_xxxxx
paypal.client.id=xxxxx
paddle.vendor.id=xxxxx
```

### 3. Configure Email

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

### 4. Run Migrations

Execute the SQL migration file:
```bash
sqlplus system/Oracle123@localhost:1521/FREE @V106__create_subscription_tables.sql
```

### 5. Start the Service

```bash
cd backend
mvn spring-boot:run
```

## Payment Gateway Setup

### Stripe

1. Create Stripe account at stripe.com
2. Get API keys from Dashboard
3. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Configure events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### PayPal

1. Create PayPal developer account
2. Create app in Developer Dashboard
3. Set up webhook: `https://yourdomain.com/api/webhooks/paypal`
4. Subscribe to events:
   - `BILLING.SUBSCRIPTION.CREATED`
   - `PAYMENT.SALE.COMPLETED`
   - `BILLING.SUBSCRIPTION.CANCELLED`

### Paddle

1. Create Paddle account
2. Configure webhook: `https://yourdomain.com/api/webhooks/paddle`
3. Set up product/pricing in Paddle dashboard

## License Key Format

License keys follow format: `XXXX-XXXX-XXXX-XXXX-XXXX`

Structure:
- Part 1: User ID prefix (8 chars)
- Part 2: Plan ID prefix (4 chars)
- Part 3: Timestamp
- Part 4: Random hex (8 chars)
- Part 5: HMAC signature (16 chars)

## Rate Limiting

| Account Type | License Validation | API Requests |
|-------------|-------------------|--------------|
| Trial       | 100/hour          | 500/hour     |
| Paid        | 1000/hour         | 10000/hour   |

## Grace Period Behavior

1. Subscription expires → Enters grace period
2. All features remain accessible during grace
3. Daily reminder emails sent
4. After grace period → Features locked
5. User must renew to regain access

## Trial Period Behavior

1. New user starts trial (7-30 days based on plan)
2. Full access to plan features
3. Trial converts to paid on successful payment
4. If no payment → Moved to free tier
5. Trial can only be started once per plan

## Support

For issues and questions, contact support@yourdomain.com
