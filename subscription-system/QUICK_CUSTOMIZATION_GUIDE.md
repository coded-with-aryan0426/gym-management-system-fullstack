# Subscription & Licensing System - Quick Customization Guide

## How to Change Prices and Plans WITHOUT Code Changes

### Method 1: Edit the JSON Configuration File

The entire subscription system is driven by a single JSON configuration file.

**Location:** `backend/src/main/resources/plans-config.json`

You can also place it at an external location:
```
~/.gym-subscription/plans-config.json
```

### Changing Prices

Find the `plans` array and update the `prices` section:

```json
{
  "plans": [
    {
      "id": "starter",
      "name": "Starter",
      "prices": {
        "monthly": 999,      // Change this to new monthly price
        "quarterly": 2699,   // Change this to new quarterly price
        "yearly": 9590       // Change this to new yearly price
      },
      "pricesUSD": {
        "monthly": 12,
        "quarterly": 32,
        "yearly": 115
      }
    }
  ]
}
```

**To change to any price:**
1. Just edit the number - no quotes needed for numbers
2. Prices are in INR by default
3. USD prices are optional (for international pricing)

### Adding a New Plan

Add a new object to the `plans` array:

```json
{
  "id": "ultimate",
  "name": "Ultimate",
  "displayName": "Ultimate",
  "description": "For massive gym chains",
  "gymTypes": ["large", "enterprise"],
  "tierLevel": 5,
  "prices": {
    "monthly": 49999,
    "quarterly": 134999,
    "yearly": 479990
  },
  "pricesUSD": {
    "monthly": 600,
    "quarterly": 1620,
    "yearly": 5760
  },
  "trialDays": 30,
  "gracePeriodDays": 14,
  "maxDevices": -1,
  "maxMembers": -1,
  "maxStaff": -1,
  "maxTrainers": -1,
  "maxClasses": -1,
  "features": {
    "memberManagement": true,
    "qrCheckin": true,
    "biometricCheckin": true,
    "brandedMobileApp": true,
    "trainerProfiles": -1,
    "ptSessionBooking": true,
    "paymentCollection": true,
    "multiGateway": true,
    "staffPayroll": true,
    "inventoryManagement": true,
    "analytics": true,
    "apiAccess": true,
    "whiteLabel": true,
    "multiLocation": true,
    "dedicatedSupport": true,
    "dietManagement": true,
    "workoutBuilder": true,
    "exerciseLibrary": true,
    "fitnessAssessment": true
  },
  "isActive": true,
  "isFeatured": false,
  "sortOrder": 5
}
```

### Changing Plan Features

Edit the `features` object in any plan:

```json
{
  "features": {
    "memberManagement": true,      // true/false to enable/disable
    "qrCheckin": true,
    "biometricCheckin": "2 Devices",  // Can be a string value
    "analytics": true,
    "apiAccess": true,
    "whiteLabel": false
  }
}
```

### Available Features

| Feature Key | Description | Value Type |
|------------|-------------|------------|
| memberManagement | Member management | boolean |
| qrCheckin | QR code check-in | boolean |
| biometricCheckin | Biometric check-in | boolean or string ("1 Device") |
| brandedMobileApp | White-label mobile app | boolean |
| trainerProfiles | Number of trainer profiles | number or -1 for unlimited |
| ptSessionBooking | PT session booking | boolean |
| paymentCollection | Payment collection | boolean |
| multiGateway | Multiple payment gateways | boolean |
| staffPayroll | Staff payroll management | boolean |
| inventoryManagement | Inventory management | boolean |
| analytics | Business analytics | boolean |
| apiAccess | API access | boolean |
| whiteLabel | White-label solution | boolean |
| multiLocation | Multiple locations | boolean |
| dedicatedSupport | Dedicated support | boolean |
| dietManagement | Diet/nutrition management | boolean |
| workoutBuilder | Workout plan builder | boolean |
| exerciseLibrary | Exercise library | boolean or number |
| fitnessAssessment | Fitness assessments | boolean |

### Limits (max* fields)

| Field | Description | Value |
|-------|-------------|-------|
| maxMembers | Maximum members | number or -1 for unlimited |
| maxDevices | Maximum devices | number or -1 for unlimited |
| maxStaff | Maximum staff | number or -1 for unlimited |
| maxTrainers | Maximum trainers | number or -1 for unlimited |
| maxClasses | Maximum classes | number or -1 for unlimited |

### Trial Days

```json
{
  "trialDays": 7   // Change to any number of trial days
}
```

### Grace Period

```json
{
  "gracePeriodDays": 3  // Days after expiry before features lock
}
```

### Currency Settings

```json
{
  "currency": {
    "default": "INR",
    "symbol": "₹",
    "supported": ["INR", "USD", "EUR"]
  }
}
```

### Billing Discounts

```json
{
  "billing": {
    "discounts": {
      "yearly": 20,     // 20% discount for yearly
      "quarterly": 10   // 10% discount for quarterly
    }
  }
}
```

## Method 2: Admin API (No File Editing)

You can also update prices via the Admin API:

### Update a Plan's Price

```bash
# Update monthly price for starter plan
curl -X PATCH "http://localhost:8082/api/admin/plans/starter/price/monthly?price=1999"

# Update yearly price for professional plan
curl -X PATCH "http://localhost:8082/api/admin/plans/professional/price/yearly?price=39999"
```

### Update Full Plan

```bash
curl -X PUT "http://localhost:8082/api/admin/plans/professional" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Pro Plan",
    "prices": {
      "monthly": 3999,
      "quarterly": 10799,
      "yearly": 38390
    },
    "trialDays": 21
  }'
```

### Get Current Configuration

```bash
curl "http://localhost:8082/api/subscribe/config"
```

## Reload Configuration Without Restart

```bash
curl -X POST "http://localhost:8082/api/subscribe/config/reload"
```

This will reload the JSON config file without restarting the server.

## Example: Full Plan Update

To change your Professional plan to ₹3,999/month, ₹10,799/quarterly, ₹38,390/yearly with 21 trial days:

### Option 1: Edit JSON

```json
{
  "id": "professional",
  "name": "Professional",
  "displayName": "Professional",
  "prices": {
    "monthly": 3999,
    "quarterly": 10799,
    "yearly": 38390
  },
  "pricesUSD": {
    "monthly": 48,
    "quarterly": 130,
    "yearly": 460
  },
  "trialDays": 21,
  ...
}
```

### Option 2: Use API

```bash
curl -X PUT "http://localhost:8082/api/admin/plans/professional" \
  -H "Content-Type: application/json" \
  -d '{
    "prices": {
      "monthly": 3999,
      "quarterly": 10799,
      "yearly": 38390
    },
    "pricesUSD": {
      "monthly": 48,
      "quarterly": 130,
      "yearly": 460
    },
    "trialDays": 21
  }'
```

## Quick Reference

| What You Want | Where to Change |
|--------------|-----------------|
| Change price | `plans[].prices.monthly/quarterly/yearly` |
| Change USD price | `plans[].pricesUSD.monthly/quarterly/yearly` |
| Change trial days | `plans[].trialDays` |
| Change grace period | `plans[].gracePeriodDays` |
| Change max members | `plans[].maxMembers` |
| Enable/disable feature | `plans[].features.featureName` |
| Change plan name | `plans[].displayName` |
| Add new plan | Add new object to `plans[]` array |
| Change currency | `currency.default` and `currency.symbol` |
| Change discounts | `billing.discounts.yearly/quarterly` |

## Questions?

The system is designed so you NEVER need to touch code to:
- Change prices
- Add/remove plans
- Enable/disable features
- Adjust trial periods
- Modify grace periods
- Change billing cycles
- Update limits

Just edit the JSON file and reload!
