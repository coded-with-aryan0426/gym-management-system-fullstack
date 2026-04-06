# Razorpay Payment Gateway Integration Guide

## Complete Implementation for Subscription Management System

---

## Table of Contents

1. [Razorpay Account Setup](#1-razorpay-account-setup)
2. [Payment Collection Integration](#2-payment-collection-integration)
3. [Subscription System Implementation](#3-subscription-system-implementation)
4. [Post-Payment Workflow](#4-post-payment-workflow)
5. [Payment Lifecycle Flowchart](#5-payment-lifecycle-flowchart)
6. [Security Implementation](#6-security-implementation)
7. [Testing Procedures](#7-testing-procedures)
8. [Error Handling & Logging](#8-error-handling--logging)

---

## 1. Razorpay Account Setup

### 1.1 Create Razorpay Account

1. **Sign Up**: Visit [dashboard.razorpay.com](https://dashboard.razorpay.com) and create an account
2. **Complete KYC**: Submit business documents for verification
3. **Wait for Activation**: Typically 24-48 hours

### 1.2 Generate API Keys

**Production Keys:**
1. Go to Dashboard → Settings → API Keys
2. Click "Generate" to create live keys
3. Copy and securely store:
   - `Key Id`: `rzp_live_XXXXXXXXXXXX`
   - `Key Secret`: `XXXXXXXXXXXXXXXXXXXXXXXX`

**Test Keys (for development):**
1. Enable "Test Mode" toggle
2. Generate test keys:
   - `Key Id`: `rzp_test_XXXXXXXXXXXX`
   - `Key Secret`: `XXXXXXXXXXXXXXXXXXXXXXXX`

### 1.3 Webhook Configuration

1. Go to Dashboard → Settings → Webhooks
2. Click "Add Webhook"
3. Configure:
   ```
   URL: https://yourdomain.com/api/webhooks/razorpay
   ```

4. **Select Events**:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
   - `subscription.ended`
   - `subscription.paused`

5. **Generate Webhook Secret**:
   - Click "Generate Secret"
   - Copy the secret: `whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### 1.4 Environment Configuration

```bash
# .env file
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
RAZORPAY_ACCOUNT_NUMBER=XXXXXXXXXXXXX  # For settlements
```

---

## 2. Payment Collection Integration

### 2.1 Frontend Integration

#### Install Razorpay SDK
```bash
npm install razorpay @types/razorpay
```

#### Create Payment Component
```tsx
// components/RazorpayCheckout.tsx
import { useCallback } from 'react';
import Razorpay from 'razorpay';

interface CheckoutOptions {
  amount: number;
  currency: string;
  orderId: string;
  userEmail: string;
  userPhone: string;
  userId: string;
  planId: string;
  planName: string;
  billingCycle: string;
  onSuccess: (paymentId: string) => void;
  onFailure: (error: any) => void;
}

export function useRazorpayCheckout() {
  const initiateCheckout = useCallback(async (options: CheckoutOptions) => {
    const {
      amount,
      currency,
      orderId,
      userEmail,
      userPhone,
      onSuccess,
      onFailure
    } = options;

    const razorpay = new Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    });

    const paymentOptions = {
      amount: amount * 100, // Razorpay expects paise
      currency: currency || 'INR',
      order_id: orderId,
      name: 'Gym Management',
      description: `Subscription - ${options.planName}`,
      image: '/logo.png',
      prefill: {
        name: '',
        email: userEmail,
        contact: userPhone,
      },
      notes: {
        user_id: options.userId,
        plan_id: options.planId,
        billing_cycle: options.billingCycle,
      },
      theme: {
        color: '#6366f1',
      },
      handler: function (response: any) {
        // Handle successful payment
        onSuccess(response.razorpay_payment_id);
      },
      modal: {
        ondismiss: function () {
          console.log('Payment modal closed');
        },
      },
    };

    razorpay.on('payment.failed', function (response: any) {
      onFailure({
        code: response.error.code,
        description: response.error.description,
        source: response.error.source,
        step: response.error.step,
        reason: response.error.reason,
        payment_id: response.error.metadata.payment_id,
        order_id: response.error.metadata.order_id,
      });
    });

    razorpay.open();
  }, []);

  return { initiateCheckout };
}
```

#### Usage in Checkout Page
```tsx
// pages/CheckoutPage.tsx
import { useState } from 'react';
import { useRazorpayCheckout } from '../hooks/useRazorpayCheckout';
import { subscriptionApi } from '../services/subscriptionApi';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const { initiateCheckout } = useRazorpayCheckout();

  const handleCheckout = async (planId: string, billingCycle: string) => {
    setLoading(true);
    try {
      // 1. Create order on backend
      const orderResponse = await subscriptionApi.createRazorpayOrder({
        userId: userId,
        planId: planId,
        billingCycle: billingCycle,
      });

      const orderData = orderResponse.data;

      // 2. Initiate Razorpay checkout
      await initiateCheckout({
        amount: orderData.amount / 100, // Convert back to rupees
        currency: 'INR',
        orderId: orderData.razorpayOrderId,
        userEmail: user.email,
        userPhone: user.phone,
        userId: userId,
        planId: planId,
        planName: orderData.planName,
        billingCycle: billingCycle,
        onSuccess: async (paymentId) => {
          // 3. Verify payment on backend
          await subscriptionApi.verifyPayment({
            razorpayOrderId: orderData.razorpayOrderId,
            razorpayPaymentId: paymentId,
          });
          // 4. Redirect to success page
          navigate('/subscription/activated');
        },
        onFailure: async (error) => {
          // Log failure
          await subscriptionApi.logPaymentFailure({
            orderId: orderData.razorpayOrderId,
            error: error,
          });
          // Show error message
          setError(error.description);
        },
      });
    } catch (err) {
      setError('Failed to initiate checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={() => handleCheckout('professional', 'yearly')} disabled={loading}>
      {loading ? 'Processing...' : 'Subscribe Now'}
    </button>
  );
}
```

### 2.2 Backend Order Creation

```java
// RazorpayPaymentService.java
@PostMapping("/create-order")
public ResponseEntity<Map<String, Object>> createOrder(
    @RequestBody CreateOrderRequest request) {

    User user = userRepository.findById(request.getUserId())
        .orElseThrow(() -> new RuntimeException("User not found"));

    PlanConfig plan = configLoader.getPlanById(request.getPlanId());
    if (plan == null) {
        throw new RuntimeException("Plan not found");
    }

    BigDecimal amount = configLoader.getPrice(request.getPlanId(), request.getBillingCycle());
    if (amount.compareTo(BigDecimal.ZERO) <= 0) {
        throw new RuntimeException("Invalid amount");
    }

    // Create order with Razorpay
    String razorpayOrderId = createRazorpayOrder(
        user.getId(),
        plan.getDisplayName(),
        amount,
        request.getBillingCycle()
    );

    // Save pending payment record
    SubscriptionPayment payment = SubscriptionPayment.builder()
        .user(user)
        .gateway("razorpay")
        .gatewayInvoiceId(razorpayOrderId)
        .amount(amount)
        .currency("INR")
        .status(PaymentStatus.PENDING)
        .build();
    paymentRepository.save(payment);

    return ResponseEntity.ok(Map.of(
        "razorpayOrderId", razorpayOrderId,
        "amount", amount.multiply(new BigDecimal("100")).intValue(),
        "currency", "INR",
        "planName", plan.getDisplayName()
    ));
}

private String createRazorpayOrder(String userId, String planName,
                                   BigDecimal amount, String billingCycle) {
    // For manual integration without Razorpay SDK:
    // Make HTTP call to Razorpay API

    String orderId = "order_" + UUID.randomUUID().toString().substring(0, 16);

    log.info("Created Razorpay order: {} for user: {}, amount: {} INR",
             orderId, userId, amount);

    return orderId;
}
```

---

## 3. Subscription System Implementation

### 3.1 Plan Creation Flow

```
User selects plan → Start Trial OR Checkout → Create Subscription → Activate
```

### 3.2 Trial Subscription Flow

```java
@PostMapping("/trial")
public ResponseEntity<SubscriptionDTO> startTrial(
    @RequestParam String userId,
    @RequestParam String planId) {

    // 1. Validate user doesn't have active subscription
    if (subscriptionRepository.existsByUserIdAndStatusIn(userId,
        List.of(SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING))) {
        throw new SubscriptionException("User already has an active subscription");
    }

    // 2. Get plan configuration
    PlanConfig plan = configLoader.getPlanById(planId);
    if (plan == null || plan.getTierLevel() == 0) {
        throw new SubscriptionException("Invalid plan for trial");
    }

    // 3. Calculate dates
    LocalDateTime now = LocalDateTime.now();
    LocalDateTime trialEnd = now.plusDays(plan.getTrialDays());
    LocalDateTime graceEnd = trialEnd.plusDays(plan.getGracePeriodDays());

    // 4. Create subscription
    Subscription subscription = Subscription.builder()
        .user(user)
        .planId(planId)
        .status(SubscriptionStatus.TRIALING)
        .trialStart(now)
        .trialEnd(trialEnd)
        .gracePeriodEnd(graceEnd)
        .currentPeriodStart(now)
        .currentPeriodEnd(graceEnd)
        .autoRenew(true)
        .build();

    subscriptionRepository.save(subscription);

    // 5. Generate license key
    licenseService.generateLicenseKey(user, subscription, plan);

    // 6. Send notification
    notificationService.sendTrialStartedNotification(subscription);

    return ResponseEntity.ok(toDTO(subscription));
}
```

### 3.3 Subscription Activation Flow

```java
@Transactional
public Subscription activateSubscription(String userId, String razorpayPaymentId,
                                         String razorpayOrderId, String billingCycle) {

    // 1. Verify payment with Razorpay
    if (!verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId)) {
        throw new PaymentException("Payment verification failed");
    }

    // 2. Get or create subscription
    Subscription subscription = subscriptionRepository
        .findTopByUserIdOrderByCreatedAtDesc(userId)
        .orElseThrow(() -> new SubscriptionException("No subscription found"));

    // 3. Update payment record
    SubscriptionPayment payment = paymentRepository
        .findByGatewayInvoiceIdAndGateway(razorpayOrderId, "razorpay")
        .orElseThrow(() -> new PaymentException("Payment record not found"));

    payment.setStatus(PaymentStatus.CAPTURED);
    payment.setGatewayPaymentId(razorpayPaymentId);
    payment.setPaidAt(LocalDateTime.now());
    paymentRepository.save(payment);

    // 4. Calculate period
    LocalDateTime now = LocalDateTime.now();
    LocalDateTime periodEnd = calculatePeriodEnd(now, billingCycle);

    // 5. Update subscription
    subscription.setStatus(SubscriptionStatus.ACTIVE);
    subscription.setGateway("razorpay");
    subscription.setGatewaySubscriptionId(razorpayOrderId);
    subscription.setBillingCycle(billingCycle);
    subscription.setCurrentPeriodStart(now);
    subscription.setCurrentPeriodEnd(periodEnd);
    subscription.setTrialStart(null);
    subscription.setTrialEnd(null);
    subscriptionRepository.save(subscription);

    // 6. Generate new license key
    PlanConfig plan = configLoader.getPlanById(subscription.getPlanId());
    licenseService.generateLicenseKey(user, subscription, plan);

    // 7. Send notification
    notificationService.sendSubscriptionActivatedNotification(subscription);

    // 8. Record change
    recordSubscriptionChange(subscription, "activated");

    return subscription;
}
```

### 3.4 Renewal Handling

```java
@PostMapping("/renew")
@Transactional
public ResponseEntity<SubscriptionDTO> renewSubscription(
    @RequestParam String userId,
    @RequestParam(required = false) String billingCycle) {

    Subscription subscription = subscriptionRepository
        .findTopByUserIdOrderByCreatedAtDesc(userId)
        .orElseThrow(() -> new SubscriptionException("No subscription found"));

    if (subscription.getStatus() != SubscriptionStatus.ACTIVE) {
        throw new SubscriptionException("Subscription is not active");
    }

    String cycle = billingCycle != null ? billingCycle : subscription.getBillingCycle();

    // Create new payment order
    CreateOrderRequest orderRequest = CreateOrderRequest.builder()
        .userId(userId)
        .planId(subscription.getPlanId())
        .billingCycle(cycle)
        .build();

    // This will redirect to Razorpay checkout
    CheckoutResponse checkout = paymentGatewayService.createCheckout(
        userId,
        CheckoutRequest.builder()
            .planId(subscription.getPlanId())
            .billingCycle(cycle)
            .gateway("razorpay")
            .build()
    );

    return ResponseEntity.ok(Map.of(
        "checkoutUrl", checkout.getCheckoutUrl(),
        "sessionId", checkout.getSessionId()
    ));
}
```

### 3.5 Cancellation Management

```java
@PostMapping("/cancel")
@Transactional
public ResponseEntity<SubscriptionDTO> cancelSubscription(
    @RequestParam String userId,
    @RequestParam(defaultValue = "false") boolean immediate) {

    Subscription subscription = subscriptionRepository
        .findTopByUserIdOrderByCreatedAtDesc(userId)
        .orElseThrow(() -> new SubscriptionException("No subscription found"));

    if (subscription.getStatus() == SubscriptionStatus.CANCELLED) {
        throw new SubscriptionException("Already cancelled");
    }

    SubscriptionStatus oldStatus = subscription.getStatus();

    if (immediate) {
        // Cancel immediately via Razorpay
        if (subscription.getGatewaySubscriptionId() != null) {
            cancelRazorpaySubscription(subscription.getGatewaySubscriptionId());
        }
        subscription.setStatus(SubscriptionStatus.CANCELLED);
        subscription.setCancelledAt(LocalDateTime.now());
    } else {
        // Cancel at period end
        subscription.setCancelAtPeriodEnd(true);
        // Don't change status yet - will be changed by scheduler
    }

    subscriptionRepository.save(subscription);

    // Record change
    recordSubscriptionChange(subscription, "cancelled",
        Map.of("immediate", immediate, "oldStatus", oldStatus.name()));

    // Send notification
    notificationService.sendCancellationNotification(subscription, immediate);

    return ResponseEntity.ok(toDTO(subscription));
}

private void cancelRazorpaySubscription(String subscriptionId) {
    // Call Razorpay API to cancel subscription
    // POST https://api.razorpay.com/v1/subscriptions/{subscription_id}/cancel
    log.info("Cancelling Razorpay subscription: {}", subscriptionId);
}
```

---

## 4. Post-Payment Workflow

### 4.1 Success Handling

```java
@Transactional
public void processPaymentSuccess(String razorpayOrderId, String razorpayPaymentId,
                                 String razorpaySignature) {
    // 1. Verify signature
    if (!verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
        throw new PaymentException("Invalid payment signature");
    }

    // 2. Get payment record
    SubscriptionPayment payment = paymentRepository
        .findByGatewayInvoiceIdAndGateway(razorpayOrderId, "razorpay")
        .orElseThrow(() -> new PaymentException("Payment not found"));

    if (payment.getStatus() == PaymentStatus.CAPTURED) {
        log.info("Payment already processed: {}", razorpayOrderId);
        return;
    }

    // 3. Update payment
    payment.setStatus(PaymentStatus.CAPTURED);
    payment.setGatewayPaymentId(razorpayPaymentId);
    payment.setPaidAt(LocalDateTime.now());
    paymentRepository.save(payment);

    // 4. Get user and subscription
    String userId = payment.getUser().getId();
    Subscription subscription = subscriptionRepository
        .findTopByUserIdOrderByCreatedAtDesc(userId)
        .orElse(null);

    if (subscription != null) {
        // 5. Activate or renew subscription
        if (subscription.getStatus() == SubscriptionStatus.TRIALING) {
            activateSubscription(userId, razorpayPaymentId, razorpayOrderId,
                                subscription.getBillingCycle());
        } else if (subscription.getStatus() == SubscriptionStatus.ACTIVE) {
            // Renew
            renewSubscription(subscription);
        }
    }

    // 6. Send confirmation email
    notificationService.sendPaymentConfirmedNotification(payment);

    // 7. Log success
    log.info("Payment successful: order={}, payment={}, user={}",
             razorpayOrderId, razorpayPaymentId, userId);
}
```

### 4.2 Failure Handling

```java
@Transactional
public void processPaymentFailure(String razorpayOrderId, String razorpayPaymentId,
                                 String reason, String source) {
    // 1. Get payment record
    SubscriptionPayment payment = paymentRepository
        .findByGatewayInvoiceIdAndGateway(razorpayOrderId, "razorpay")
        .orElse(null);

    if (payment != null) {
        // 2. Update payment status
        payment.setStatus(PaymentStatus.FAILED);
        payment.setFailedAt(LocalDateTime.now());
        paymentRepository.save(payment);
    }

    // 3. Get subscription and update status
    if (payment != null) {
        String userId = payment.getUser().getId();
        Subscription subscription = subscriptionRepository
            .findTopByUserIdOrderByCreatedAtDesc(userId)
            .orElse(null);

        if (subscription != null) {
            // Mark as past due
            subscription.setStatus(SubscriptionStatus.PAST_DUE);
            subscriptionRepository.save(subscription);

            // Send failure notification
            notificationService.sendPaymentFailedNotification(subscription, reason);

            // Record change
            recordSubscriptionChange(subscription, "payment_failed",
                Map.of("reason", reason, "source", source));
        }
    }

    // 4. Log failure
    log.warn("Payment failed: order={}, reason={}, source={}",
              razorpayOrderId, reason, source);
}
```

### 4.3 Email Notifications

```java
// NotificationService.java

public void sendTrialStartedNotification(Subscription subscription) {
    String subject = "Your " + subscription.getPlanName() + " Trial has Started!";
    String content = String.format("""
        Dear %s,

        Your %d-day FREE trial has started!

        Plan: %s
        Trial Ends: %s

        Enjoy full access to all features during your trial.

        Upgrade anytime before trial ends to keep access:
        %s/subscribe

        Questions? Reply to this email.
        """,
        subscription.getUser().getName(),
        subscription.getTrialDays(),
        subscription.getPlanName(),
        subscription.getTrialEnd().format(DateTimeFormatter),
        appBaseUrl
    );
    sendEmail(subscription.getUser(), subject, content);
}

public void sendPaymentFailedNotification(Subscription subscription, String reason) {
    String subject = "Payment Failed - Action Required";
    String content = String.format("""
        Dear %s,

        We couldn't process your payment for your %s subscription.

        Reason: %s

        Please update your payment method immediately:
        %s/settings/subscription?action=update_payment

        Your account will enter grace period after failed payment.

        Need help? Contact support.
        """,
        subscription.getUser().getName(),
        subscription.getPlanName(),
        reason,
        appBaseUrl
    );
    sendEmail(subscription.getUser(), subject, content);
}

public void sendSubscriptionActivatedNotification(Subscription subscription) {
    String subject = "Welcome to " + subscription.getPlanName() + "!";
    String content = String.format("""
        Dear %s,

        Your subscription is now ACTIVE!

        Plan: %s
        Amount: %s %s
        Next Billing: %s
        Billing Cycle: %s

        You now have full access to all features!

        Manage your subscription:
        %s/settings/subscription

        Thank you for choosing our service!
        """,
        subscription.getUser().getName(),
        subscription.getPlanName(),
        subscription.getPlanPrice(),
        subscription.getCurrency(),
        subscription.getCurrentPeriodEnd().format(DateTimeFormatter),
        subscription.getBillingCycle(),
        appBaseUrl
    );
    sendEmail(subscription.getUser(), subject, content);
}
```

---

## 5. Payment Lifecycle Flowchart

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PAYMENT LIFECYCLE                                 │
└─────────────────────────────────────────────────────────────────────────┘

                              START
                                │
                                ▼
                    ┌───────────────────────┐
                    │  User Selects Plan    │
                    │  Chooses Billing      │
                    │  Cycle (M/Q/Y)        │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  User clicks         │
                    │  "Subscribe Now"      │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Backend creates      │◄─────────────────┐
                    │  Razorpay Order       │                  │
                    └───────────┬───────────┘                  │
                                │                              │
                                ▼                              │
                    ┌───────────────────────┐                  │
                    │  Frontend opens       │                  │
                    │  Razorpay Checkout    │                  │
                    └───────────┬───────────┘                  │
                                │                              │
              ┌─────────────────┼─────────────────┐          │
              │                 │                 │          │
              ▼                 ▼                 ▼          │
    ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐ │
    │ User completes   │ │ User closes  │ │ Payment fails   │ │
    │ payment         │ │ modal        │ │ during checkout │ │
    └────────┬────────┘ └──────┬──────┘ └────────┬────────┘ │
             │                 │                 │            │
             ▼                 ▼                 ▼            │
    ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐    │
    │ Razorpay sends  │ │ Return to   │ │ Show error     │    │
    │ webhook         │ │ app         │ │ message        │    │
    │ payment.captured │ │ (no change) │ │ Log failure    │    │
    └────────┬────────┘ └─────────────┘ └─────────────────┘    │
             │                                                     │
             ▼                                                     │
    ┌─────────────────┐                                           │
    │ Backend receives│                                           │
    │ webhook         │                                           │
    └────────┬────────┘                                           │
             │                                                     │
             ▼                                                     │
    ┌─────────────────┐                                           │
    │ Verify webhook  │◄──────────────────────────────────────────┘
    │ signature       │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ Signature valid?│
    └────────┬────────┘
             │
       ┌─────┴─────┐
       │           │
      YES          NO
       │           │
       ▼           ▼
┌─────────────┐ ┌─────────────┐
│ Check if    │ │ Reject      │
│ already     │ │ Log error   │
│ processed   │ │ Return 400  │
└──────┬──────┘ └─────────────┘
       │
       ▼
┌─────────────┐
│ Already     │
│ processed?  │
└──────┬──────┘
       │
  ┌────┴────┐
  │         │
 YES        NO
  │         │
  ▼         ▼
Return    ┌─────────────────┐
200       │ Process payment │
          │ 1. Update DB    │
          │ 2. Activate sub │
          │ 3. Send email  │
          │ 4. Generate key│
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ Check if trial │
          │ or renewal     │
          └────────┬────────┘
                   │
            ┌──────┴──────┐
            │             │
         TRIAL        RENEWAL
            │             │
            ▼             ▼
    ┌─────────────┐ ┌─────────────┐
    │ Activate    │ │ Extend      │
    │ full sub    │ │ period      │
    └──────┬──────┘ └──────┬──────┘
           │             │
           ▼             ▼
    ┌─────────────────────────┐
    │ Send welcome/renewal   │
    │ email                  │
    └───────────┬─────────────┘
                │
                ▼
          ┌───────────┐
          │ SUCCESS   │
          │ Return 200│
          └───────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                    SUBSCRIPTION EXPIRY FLOW                             │
└─────────────────────────────────────────────────────────────────────────┘

         ┌──────────────────────────────────────┐
         │     DAILY SCHEDULED JOB               │
         │  (Runs at midnight)                   │
         └──────────────────┬───────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │ Find subscriptions      │
              │ where period_end < now  │
              │ AND status = ACTIVE     │
              └────────────┬────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │ For each subscription:  │
              └────────────┬────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
       ┌───────────┐ ┌──────────┐ ┌───────────┐
       │ cancel_at │ │ grace_   │ │ Normal    │
       │ period_end│ │ period   │ │ Expiry    │
       │ = true    │ │ exists   │ │           │
       └─────┬─────┘ └────┬─────┘ └─────┬─────┘
             │            │             │
             ▼            ▼             ▼
      ┌───────────┐ ┌───────────┐ ┌───────────┐
      │ Set status│ │ Set status│ │ Set status│
      │ =CANCELLED│ │ =PAST_DUE│ │ =EXPIRED  │
      └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
            │            │             │
            ▼            ▼             ▼
      ┌───────────┐ ┌───────────┐ ┌───────────┐
      │ Send      │ │ Send      │ │ Send      │
      │ cancelled │ │ grace     │ │ expired   │
      │ email     │ │ period    │ │ email     │
      │           │ │ email     │ │           │
      └───────────┘ └───────────┘ └───────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │ Send daily reminder      │
              │ during grace period     │
              └─────────────────────────┘
```

---

## 6. Security Implementation

### 6.1 Webhook Signature Verification

```java
@PostMapping("/razorpay")
public ResponseEntity<String> handleRazorpayWebhook(
    @RequestBody String payload,
    @RequestHeader("X-Razorpay-Signature") String signature) {

    // 1. Verify signature
    if (!razorpayPaymentService.verifyWebhookSignature(payload, signature)) {
        log.error("Invalid webhook signature");
        return ResponseEntity.status(400).body("Invalid signature");
    }

    // 2. Parse payload
    Map<String, Object> event = objectMapper.readValue(payload, Map.class);

    // 3. Check idempotency
    String eventId = extractEventId(event);
    if (webhookEventRepository.existsByGatewayAndEventId("razorpay", eventId)) {
        log.info("Webhook already processed: {}", eventId);
        return ResponseEntity.ok("OK");
    }

    // 4. Process event
    try {
        processRazorpayEvent(event);
        return ResponseEntity.ok("OK");
    } catch (Exception e) {
        log.error("Failed to process webhook: {}", e.getMessage());
        return ResponseEntity.status(500).body("Processing failed");
    }
}

public boolean verifyWebhookSignature(String payload, String signature) {
    try {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(
            razorpayWebhookSecret.getBytes(StandardCharsets.UTF_8),
            "HmacSHA256"
        );
        mac.init(secretKeySpec);
        byte[] computedHash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        String computedSignature = bytesToHex(computedHash);

        // Use timing-safe comparison
        return MessageDigest.isEqual(
            computedSignature.getBytes(),
            signature.getBytes()
        );
    } catch (Exception e) {
        log.error("Signature verification failed: {}", e.getMessage());
        return false;
    }
}
```

### 6.2 Payment Verification

```java
public boolean verifyPayment(String razorpayOrderId, String razorpayPaymentId,
                            String razorpaySignature) {
    try {
        // 1. Verify signature
        String data = razorpayOrderId + "|" + razorpayPaymentId;
        String expectedSignature = generateSignature(data, razorpayKeySecret);

        if (!expectedSignature.equals(razorpaySignature)) {
            log.error("Payment signature mismatch: expected={}, received={}",
                      expectedSignature, razorpaySignature);
            return false;
        }

        // 2. Optional: Verify with Razorpay API
        // This is recommended for high-value transactions
        Map<String, Object> paymentDetails = razorpayApi.getPayment(razorpayPaymentId);

        if (!"captured".equals(paymentDetails.get("status"))) {
            log.error("Payment not captured: {}", razorpayPaymentId);
            return false;
        }

        // 3. Verify amount matches
        BigDecimal capturedAmount = new BigDecimal(
            paymentDetails.get("amount").toString()
        ).divide(new BigDecimal("100"));

        SubscriptionPayment payment = paymentRepository
            .findByGatewayInvoiceIdAndGateway(razorpayOrderId, "razorpay")
            .orElse(null);

        if (payment != null && !capturedAmount.equals(payment.getAmount())) {
            log.error("Amount mismatch: expected={}, captured={}",
                      payment.getAmount(), capturedAmount);
            return false;
        }

        return true;
    } catch (Exception e) {
        log.error("Payment verification error: {}", e.getMessage());
        return false;
    }
}
```

### 6.3 Fraud Prevention

```java
@Service
@Slf4j
public class FraudPreventionService {

    @Value("${fraud.max.failures.per.hour:5}")
    private int maxFailuresPerHour;

    @Value("${fraud.max.attempt.amount:100000}")
    private BigDecimal maxAttemptAmount;

    public boolean isSuspicious(String userId, String ipAddress,
                               BigDecimal amount, int failedAttempts) {
        // 1. Check failure rate
        if (failedAttempts >= maxFailuresPerHour) {
            log.warn("High failure rate for user: {}, attempts: {}", userId, failedAttempts);
            return true;
        }

        // 2. Check amount threshold
        if (amount.compareTo(maxAttemptAmount) > 0) {
            log.warn("High value transaction: {} for user: {}", amount, userId);
            return true;
        }

        // 3. Check for multiple orders in short time
        if (hasMultipleRecentOrders(userId)) {
            log.warn("Multiple orders in short time for user: {}", userId);
            return true;
        }

        return false;
    }

    public void recordPaymentAttempt(String userId, String ipAddress,
                                   BigDecimal amount, boolean success) {
        // Record in Redis/cache for rate limiting
        // Store: userId, ipAddress, amount, timestamp, success/failure
    }
}
```

---

## 7. Testing Procedures

### 7.1 Test Card Details

**Razorpay Test Mode:**
```
Success Card:  4111 1111 1111 1111 | Any future CVV | Any future expiry
Failed Card:   4111 1111 1111 1111 | Any CVV | Any expiry
```

**Test UPI:**
```
Success: success@razorpay
Failure: failure@razorpay
```

### 7.2 Testing Checklist

#### Test Case 1: New Subscription with Trial
```
1. Select a paid plan
2. Click "Start Free Trial"
3. Verify trial period starts (7-30 days based on plan)
4. Verify email sent
5. Verify license key generated
6. Verify features accessible
```

#### Test Case 2: Trial to Paid Conversion
```
1. During trial, click "Subscribe Now"
2. Complete payment with test card
3. Verify webhook received
4. Verify subscription activated
5. Verify period dates correct
6. Verify email sent
7. Verify license key updated
```

#### Test Case 3: Renewal Flow
```
1. Go to subscription settings
2. Click "Renew"
3. Select billing cycle
4. Complete payment
5. Verify period extended
6. Verify receipt email
```

#### Test Case 4: Payment Failure
```
1. Use failed test card
2. Complete checkout
3. Verify failure webhook received
4. Verify subscription marked as past_due
5. Verify failure email sent
6. Verify user can retry
```

#### Test Case 5: Cancellation at Period End
```
1. Click "Cancel Subscription"
2. Do NOT choose immediate
3. Verify cancel_at_period_end = true
4. Verify still active until period end
5. Verify scheduled job cancels on time
```

#### Test Case 6: Grace Period
```
1. Let trial/period expire without cancellation
2. Verify grace period started
3. Verify features still work
4. Verify grace period email sent
5. After grace ends, verify features locked
```

### 7.3 Webhook Testing

**Using Razorpay Dashboard:**
1. Go to Dashboard → Webhooks
2. Select your webhook
3. Click "Send Test Webhook"
4. Select event type
5. Verify processing

**Using CLI:**
```bash
# Send test webhook locally
ngrok http 8080

# Then in Razorpay dashboard, use the ngrok URL
```

### 7.4 Production Verification

```bash
# 1. Check Razorpay Dashboard
# - Verify account is activated
# - Check settlements schedule

# 2. Verify API keys
# - Test with live key ID: rzp_live_...

# 3. Check webhook delivery
# - Dashboard → Webhooks → Delivery attempts

# 4. Monitor logs
tail -f logs/razorpay-webhook.log

# 5. Verify email delivery
# - Check sent emails match payment events
```

---

## 8. Error Handling & Logging

### 8.1 Error Categories

```java
public enum PaymentError {
    INVALID_SIGNATURE("PAYMENT_001", "Payment signature verification failed"),
    PAYMENT_NOT_FOUND("PAYMENT_002", "Payment record not found"),
    AMOUNT_MISMATCH("PAYMENT_003", "Payment amount mismatch"),
    DUPLICATE_PAYMENT("PAYMENT_004", "Payment already processed"),
    GATEWAY_ERROR("PAYMENT_005", "Payment gateway error"),
    SUBSCRIPTION_NOT_FOUND("PAYMENT_006", "Subscription not found"),
    SUBSCRIPTION_ALREADY_CANCELLED("PAYMENT_007", "Subscription already cancelled"),
    USER_NOT_FOUND("PAYMENT_008", "User not found");

    private final String code;
    private final String message;

    PaymentError(String code, String message) {
        this.code = code;
        this.message = message;
    }
}
```

### 8.2 Error Handling Service

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentErrorHandler {

    private final AlertService alertService;
    private final NotificationService notificationService;

    public void handlePaymentError(PaymentError error, Map<String, Object> context) {
        // 1. Log error
        log.error("Payment error: code={}, message={}, context={}",
                  error.getCode(), error.getMessage(), context);

        // 2. Create audit log entry
        createAuditLog(error, context);

        // 3. Alert for critical errors
        if (isCritical(error)) {
            alertService.sendPaymentAlert(error, context);
        }

        // 4. User notification for recoverable errors
        if (isRecoverable(error)) {
            notifyUser(context);
        }
    }

    private boolean isCritical(PaymentError error) {
        return error == PaymentError.INVALID_SIGNATURE ||
               error == PaymentError.DUPLICATE_PAYMENT ||
               error == PaymentError.AMOUNT_MISMATCH;
    }

    private boolean isRecoverable(PaymentError error) {
        return error == PaymentError.GATEWAY_ERROR ||
               error == PaymentError.PAYMENT_NOT_FOUND;
    }

    private void createAuditLog(PaymentError error, Map<String, Object> context) {
        // Save to database for audit trail
        PaymentAuditLog auditLog = PaymentAuditLog.builder()
            .errorCode(error.getCode())
            .errorMessage(error.getMessage())
            .razorpayOrderId((String) context.get("orderId"))
            .razorpayPaymentId((String) context.get("paymentId"))
            .userId((String) context.get("userId"))
            .ipAddress((String) context.get("ipAddress"))
            .timestamp(LocalDateTime.now())
            .build();
        auditLogRepository.save(auditLog);
    }
}
```

### 8.3 Logging Configuration

```xml
<!-- logback-spring.xml -->
<configuration>
    <appender name="PAYMENT_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/payment.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/payment.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>90</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <appender name="WEBHOOK_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/webhook.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/webhook.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>90</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <logger name="com.gym.subscription.service.RazorpayPaymentService" level="DEBUG" additivity="false">
        <appender-ref ref="PAYMENT_FILE" />
        <appender-ref ref="CONSOLE" />
    </logger>

    <logger name="com.gym.subscription.webhook" level="DEBUG" additivity="false">
        <appender-ref ref="WEBHOOK_FILE" />
        <appender-ref ref="CONSOLE" />
    </logger>
</configuration>
```

### 8.4 Retry Mechanism

```java
@Service
@Slf4j
public class WebhookRetryService {

    @Value("${webhook.max.retries:3}")
    private int maxRetries;

    @Scheduled(fixedDelay = 60000) // Every minute
    public void retryFailedWebhooks() {
        List<WebhookEvent> failedWebhooks = webhookEventRepository
            .findByProcessedFalseAndRetryCountLessThan(maxRetries);

        for (WebhookEvent webhook : failedWebhooks) {
            try {
                retryWebhook(webhook);
            } catch (Exception e) {
                log.error("Retry failed for webhook {}: {}",
                          webhook.getId(), e.getMessage());
                webhook.setRetryCount(webhook.getRetryCount() + 1);
                webhook.setLastError(e.getMessage());
                webhookEventRepository.save(webhook);
            }
        }
    }

    private void retryWebhook(WebhookEvent webhook) {
        log.info("Retrying webhook: {} (attempt {})",
                 webhook.getId(), webhook.getRetryCount() + 1);

        switch (webhook.getGateway()) {
            case "razorpay" -> razorpayWebhookHandler.processWebhook(
                webhook.getPayload(), "");
            case "stripe" -> stripeWebhookHandler.processWebhook(
                webhook.getPayload(), "");
            // etc.
        }

        webhook.setProcessed(true);
        webhook.setProcessedAt(LocalDateTime.now());
        webhookEventRepository.save(webhook);
    }
}
```

---

## Quick Reference: Environment Variables

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Application
APP_BASE_URL=https://yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# Database
DATABASE_URL=jdbc:oracle:thin:@//localhost:1521/FREE

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

---

## Support

For issues:
1. Check Razorpay Dashboard → Webhooks → Delivery attempts
2. Check application logs in `logs/webhook.log`
3. Verify API keys match dashboard
4. Ensure webhook URL is publicly accessible
