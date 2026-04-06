# Subscription & Licensing System

A comprehensive paid software licensing system with feature unlocking, subscription management, and multi-gateway payment integration.

## Features

### Core Features
- **Feature Gating** - Lock premium features behind subscription validation
- **Multiple Subscription Tiers** - Free, Starter, Professional, Enterprise plans
- **Flexible Billing** - Monthly, quarterly, and yearly billing cycles
- **Trial Periods** - Configurable trial days per plan (7-30 days)
- **Grace Period** - Post-expiry access period before feature lockout
- **License Key Generation** - HMAC-SHA256 signed license keys
- **Device Activation** - Track and manage activated devices

### Payment Gateways
- **Stripe** - Full subscription support with webhooks
- **PayPal** - Subscription API integration
- **Paddle** - SaaS-friendly payment processing

### Admin Features
- **Subscriber Management** - View and manage all subscribers
- **License Monitoring** - Track license usage and revoke if needed
- **Revenue Metrics** - MRR, ARR, churn rate analytics
- **Manual Overrides** - Grant/revoke licenses manually

### Security
- **PCI Compliance** - No card data stored on our servers
- **HMAC Signatures** - Tamper-proof license key validation
- **Rate Limiting** - Prevent abuse of trial accounts
- **Webhook Verification** - Signature validation for all payment webhooks

## Quick Start

### Backend Setup

1. **Run Database Migration**
   ```bash
   sqlplus system/Oracle123@localhost:1521/FREE @V106__create_subscription_tables.sql
   ```

2. **Configure Environment**
   ```bash
   cd backend
   cp src/main/resources/application.properties.example application.properties
   # Edit application.properties with your settings
   ```

3. **Start Server**
   ```bash
   mvn spring-boot:run
   ```

### Frontend Integration

1. **Copy Components**
   - Copy `frontend/src/hooks/useLicense.ts` to your project
   - Copy `frontend/src/components/Paywall/` to your components
   - Copy `frontend/src/pages/PricingPage.tsx` to your pages
   - Copy `frontend/src/pages/SubscriptionDashboard.tsx` to your pages

2. **Add API Client**
   - Copy `frontend/src/api/subscriptionApi.ts` to your API folder

3. **Configure Environment**
   ```env
   VITE_API_URL=http://localhost:8082/api
   ```

## Project Structure

```
subscription-system/
├── backend/
│   ├── src/main/java/com/gym/subscription/
│   │   ├── config/          # Configuration classes
│   │   ├── controller/       # REST API endpoints
│   │   ├── dto/             # Data transfer objects
│   │   ├── entity/          # JPA entities
│   │   ├── enums/           # Enumerations
│   │   ├── exception/        # Exception handling
│   │   ├── repository/      # Data repositories
│   │   ├── scheduler/       # Scheduled tasks
│   │   ├── service/         # Business logic
│   │   └── webhook/         # Payment webhook handlers
│   └── src/main/resources/
│       ├── db/migration/    # Flyway migrations
│       └── application.properties
├── frontend/
│   └── src/
│       ├── api/             # API client
│       ├── components/      # React components
│       ├── hooks/           # Custom hooks
│       └── pages/           # Page components
└── API_INTEGRATION_GUIDE.md
```

## API Reference

### Authentication
All endpoints require `X-User-Id` header for user identification.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/plans` | List all plans |
| POST | `/api/subscribe/checkout` | Create checkout |
| GET | `/api/subscribe/status` | Get subscription status |
| POST | `/api/license/validate` | Validate license |
| POST | `/api/license/activate` | Activate device |
| POST | `/api/webhooks/stripe` | Stripe webhook |

See `API_INTEGRATION_GUIDE.md` for full documentation.

## Plan Configuration

| Plan | Monthly | Quarterly | Yearly | Trial Days |
|------|---------|-----------|--------|------------|
| Free | $0 | - | - | - |
| Starter | $29.99 | $79.99 | $249.99 | 7 |
| Professional | $79.99 | $199.99 | $699.99 | 14 |
| Enterprise | $199.99 | $499.99 | $1799.99 | 30 |

## Environment Variables

### Backend
```env
STRIPE_API_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
PAYPAL_CLIENT_ID=xxxxx
PADDLE_VENDOR_ID=xxxxx
LICENSE_SECRET_KEY=your-secret-key
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
APP_BASE_URL=https://yourdomain.com
```

### Frontend
```env
VITE_API_URL=https://yourdomain.com/api
```

## License

This project is proprietary software. All rights reserved.
