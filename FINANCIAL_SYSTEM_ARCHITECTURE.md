# Gym Management Financial System - Architecture Plan

## Executive Summary

This document outlines a comprehensive financial management system upgrade for the gym management SaaS application. The system provides payment gateway integration, automated income tracking, expense management, financial reporting, bank reconciliation, multi-currency support, and compliance features.

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Financial   │  │ Payment     │  │ Expense     │  │ Bank        │     │
│  │ Dashboard   │  │ Gateway UI  │  │ Manager     │  │ Connect UI  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ HTTPS
┌────────────────────────────────▼────────────────────────────────────────┐
│                      API GATEWAY (Spring Boot)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ Rate Limit  │  │ Auth/AuthZ  │  │ Validation  │  │ Routing     │       │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────────┐
│                    FINANCIAL MICROSERVICES                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐        │
│  │ Payment Gateway  │  │ Income Tracking  │  │ Expense          │        │
│  │ Service         │  │ Service         │  │ Management       │        │
│  │ (Stripe/PayPal) │  │                 │  │ Service         │        │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐        │
│  │ Bank Connect     │  │ Reporting        │  │ Compliance       │        │
│  │ Service (Plaid)  │  │ Service         │  │ Service          │        │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘        │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────────┐
│                         DATA LAYER                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ PostgreSQL  │  │ Redis Cache │  │ File Store │  │ Event Store │     │
│  │ (Primary)   │  │ (Sessions)  │  │ (Receipts)  │  │ (Audit Log) │     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Module 1: Payment Gateway Integration

### 1.1 Supported Gateways

| Gateway | Status | Features |
|---------|--------|----------|
| Stripe | Primary | Cards, Bank Transfer, Wallets, Subscriptions |
| PayPal | Secondary | Cards, PayPal Balance, BNPL |
| Square | Planned | In-person + Online |
| Razorpay | Existing | Indian payments (UPI, Cards) |

### 1.2 API Design

```java
// Payment Gateway Controller
POST   /api/v1/payments/checkout          - Create payment session
POST   /api/v1/payments/confirm          - Confirm payment
POST   /api/v1/payments/cancel           - Cancel payment
GET    /api/v1/payments/{id}             - Get payment details
GET    /api/v1/payments/history          - Payment history
POST   /api/v1/payments/{id}/refund      - Process refund
POST   /api/v1/payments/webhook/{gateway} - Webhook handler

// Subscription Controller
POST   /api/v1/subscriptions/checkout    - Create subscription
GET    /api/v1/subscriptions/{id}        - Get subscription
POST   /api/v1/subscriptions/{id}/cancel - Cancel subscription
POST   /api/v1/subscriptions/{id}/update - Update subscription

// Gateway Controller
GET    /api/v1/gateways                 - List supported gateways
POST   /api/v1/gateways/connect          - Connect new gateway
DELETE /api/v1/gateways/{id}             - Disconnect gateway
GET    /api/v1/gateways/{id}/balance     - Get gateway balance
```

### 1.3 Security Implementation

```java
// Webhook Signature Verification
public class WebhookSecurity {
    // Stripe: HMAC-SHA256 signature
    // PayPal: Webhook ID verification
    // Square: HMAC-SHA256 signature

    public boolean verifyStripeSignature(byte[] payload, String signature, String secret) {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(), "HmacSHA256");
        mac.init(secretKey);
        String computedHash = Base64.getEncoder().encodeToString(mac.doFinal(payload));
        return computedHash.equals(signature);
    }
}
```

---

## Module 2: Income Tracking System

### 2.1 Income Categories

| Category | Auto-Categorization | Description |
|----------|-------------------|-------------|
| MEMBERSHIP_FEE | ✅ | Monthly/yearly memberships |
| PT_SESSION | ✅ | Personal training sessions |
| CLASS_FEE | ✅ | Group class payments |
| JOINING_FEE | ✅ | New member registration |
| PRODUCT_SALE | ✅ | Supplements, merchandise |
| OTHER | Manual | Miscellaneous income |

### 2.2 API Design

```java
// Income Controller
GET    /api/v1/income                    - List all income (paginated)
GET    /api/v1/income/summary            - Income summary by period
GET    /api/v1/income/by-category        - Income breakdown by category
GET    /api/v1/income/recurring          - Recurring income items
POST   /api/v1/income/manual            - Add manual income entry
PUT    /api/v1/income/{id}               - Update income entry
DELETE /api/v1/income/{id}              - Delete income entry

// Recurring Income
POST   /api/v1/income/recurring          - Create recurring income
PUT    /api/v1/income/recurring/{id}     - Update recurring setup
DELETE /api/v1/income/recurring/{id}     - Delete recurring setup
```

### 2.3 DTO Models

```java
public class IncomeEntryDTO {
    private Long id;
    private String gymId;
    private IncomeCategory category;
    private BigDecimal amount;
    private String currency;
    private LocalDateTime receivedDate;
    private String description;
    private Long memberId;
    private String paymentMethod;
    private String transactionRef;
    private PaymentGateway gateway;
    private boolean isRecurring;
    private Long recurringScheduleId;
}

public class IncomeSummaryDTO {
    private BigDecimal totalIncome;
    private BigDecimal thisMonth;
    private BigDecimal lastMonth;
    private BigDecimal thisYear;
    private BigDecimal projectedMonthly;
    private Map<IncomeCategory, BigDecimal> byCategory;
    private BigDecimal percentageChange;
}
```

---

## Module 3: Expense Management

### 3.1 Expense Categories

| Category | Examples | Receipt Required |
|----------|----------|------------------|
| RENT | Monthly rent | Yes |
| UTILITIES | Electricity, water, internet | Yes |
| STAFF_SALARY | Trainer, receptionist salaries | No |
| EQUIPMENT | Treadmills, weights, machines | Yes |
| MAINTENANCE | Repairs, cleaning | Yes |
| SUPPLIES | Cleaning supplies, towels | Yes |
| MARKETING | Ads, promotions | Yes |
| INSURANCE | Business insurance | Yes |
| TAXES | GST, income tax | Yes |
| OTHER | Miscellaneous | Yes |

### 3.2 API Design

```java
// Expense Controller
GET    /api/v1/expenses                   - List expenses (filterable)
POST   /api/v1/expenses                   - Create expense
PUT    /api/v1/expenses/{id}              - Update expense
DELETE /api/v1/expenses/{id}              - Delete expense
GET    /api/v1/expenses/summary           - Expense summary
GET    /api/v1/expenses/by-category       - Category breakdown
GET    /api/v1/expenses/reports/quarterly - Quarterly report

// Receipt Management
POST   /api/v1/expenses/{id}/receipt      - Upload receipt
GET    /api/v1/expenses/{id}/receipt      - Download receipt
DELETE /api/v1/expenses/{id}/receipt      - Delete receipt

// Recurring Expenses
POST   /api/v1/expenses/recurring         - Create recurring expense
GET    /api/v1/expenses/recurring         - List recurring expenses
```

### 3.3 Receipt Upload Flow

```java
@PostMapping("/{id}/receipt")
public ResponseEntity<ReceiptDTO> uploadReceipt(
    @PathVariable Long id,
    @RequestParam("file") MultipartFile file
) {
    // Validate file
    validateFile(file);

    // Store with encryption
    String storedPath = fileStorageService.storeEncrypted(file, id);

    // Update expense record
    expenseService.attachReceipt(id, storedPath);

    return ResponseEntity.ok(new ReceiptDTO(storedPath));
}
```

---

## Module 4: Financial Dashboard

### 4.1 Dashboard Metrics

| Metric | Real-time | Calculation |
|--------|-----------|-------------|
| Total Revenue | Yes | Sum of all income |
| Total Expenses | Yes | Sum of all expenses |
| Net Profit | Yes | Revenue - Expenses |
| Profit Margin | Yes | (Net Profit / Revenue) × 100 |
| Cash Flow | Yes | Inflows - Outflows |
| Outstanding Dues | Yes | Pending member payments |
| Runway | Calculated | Cash / Monthly Burn |

### 4.2 Dashboard API

```java
@GetMapping("/dashboard")
public FinancialDashboardDTO getDashboard(
    @RequestParam String period,  // day, week, month, quarter, year
    @RequestParam(required = false) String gymId
) {
    return FinancialDashboardDTO.builder()
        .revenueMetrics(getRevenueMetrics(period))
        .expenseMetrics(getExpenseMetrics(period))
        .profitLoss(getProfitLoss(period))
        .cashFlow(getCashFlow(period))
        .alerts(getActiveAlerts())
        .recentTransactions(getRecentTransactions())
        .build();
}
```

### 4.3 Export Features

- **CSV Export**: All transaction tables
- **PDF Reports**: Branded financial statements
- **Excel Sheets**: Detailed breakdowns
- **Scheduled Reports**: Email automation

---

## Module 5: Bank Account Integration

### 5.1 Supported Services

| Service | Status | Features |
|---------|--------|----------|
| Plaid | Primary | Account connect, transaction sync |
| Yodlee | Secondary | Alternative to Plaid |
| Manual | Always | CSV import, manual entry |

### 5.2 Plaid Integration Flow

```java
// Plaid Service
public class PlaidService {

    public String createLinkToken(String userId) {
        PlaidApi plaidApi = new PlaidApi(client);
        LinkTokenCreateRequest request = LinkTokenCreateRequest.builder()
            .user(ClientUserId.of(userId))
            .clientName("Gym Management")
            .products(List.of(Products.TRANSACTIONS))
            .countryCodes(List.of(CountryCode.US, CountryCode.IN))
            .language("en")
            .build();
        return plaidApi.linkTokenCreate(request).getLinkToken();
    }

    public String exchangePublicToken(String publicToken) {
        ItemPublicTokenExchangeRequest request = ItemPublicTokenExchangeRequest.builder()
            .publicToken(publicToken)
            .build();
        return plaidApi.itemPublicTokenExchange(request).getAccessToken();
    }

    public List<Transaction> syncTransactions(String accessToken) {
        // Fetch and categorize transactions
        // Match to gym expenses/income
    }
}
```

---

## Module 6: Automated Financial Reporting

### 6.1 Report Types

| Report | Frequency | Auto-Generate |
|--------|-----------|---------------|
| Daily Summary | Daily | Yes |
| Weekly Summary | Weekly | Yes |
| Monthly Statement | Monthly | Yes |
| Quarterly Report | Quarterly | Yes |
| Annual Report | Yearly | Yes |
| Tax Report | On-demand | Yes |
| Audit Report | On-demand | Yes |

### 6.2 Report Templates

```java
public enum FinancialReportType {
    INCOME_STATEMENT,      // Revenue - Expenses = Net Income
    BALANCE_SHEET,         // Assets = Liabilities + Equity
    CASH_FLOW_STATEMENT,   // Operating + Investing + Financing
    TRIAL_BALANCE,         // All account balances
    AGED_RECEIVABLES,      // Outstanding dues aging
    AGED_PAYABLES,         // Outstanding payments aging
    TAX_SUMMARY,           // Tax-deductible expenses
    MEMBER_RECEIVABLES     // Member payment status
}
```

### 6.3 Report Scheduling

```java
@Scheduled(cron = "0 0 6 1 * ?")  // 6 AM on 1st of month
public void generateMonthlyReport() {
    List<Gym> activeGyms = gymRepository.findActiveGyms();
    for (Gym gym : activeGyms) {
        MonthlyReport report = reportService.generateMonthlyReport(gym.getId());
        notificationService.sendReport(gym.getOwner(), report);
    }
}
```

---

## Module 7: Multi-Currency Support

### 7.1 Supported Currencies

| Currency | Code | Symbol | Decimal |
|----------|------|--------|---------|
| Indian Rupee | INR | ₹ | 2 |
| US Dollar | USD | $ | 2 |
| Euro | EUR | € | 2 |
| British Pound | GBP | £ | 2 |
| Australian Dollar | AUD | A$ | 2 |
| Canadian Dollar | CAD | C$ | 2 |
| UAE Dirham | AED | د.إ | 2 |
| Singapore Dollar | SGD | S$ | 2 |

### 7.2 Exchange Rate Integration

```java
public class ExchangeRateService {

    // Update rates daily from Open Exchange Rates API
    @Scheduled(cron = "0 0 0 * * ?")
    public void updateExchangeRates() {
        Map<String, BigDecimal> rates = externalApi.fetchRates("USD");
        exchangeRateCache.updateRates(rates);
    }

    // Convert amount between currencies
    public Money convert(Money amount, Currency targetCurrency) {
        BigDecimal rate = exchangeRateCache.getRate(
            amount.getCurrency(),
            targetCurrency
        );
        return new Money(
            amount.getAmount().multiply(rate),
            targetCurrency
        );
    }
}
```

---

## Module 8: Role-Based Access Control

### 8.1 Financial Roles

| Role | View Financials | Edit | Delete | Reports | Export |
|------|----------------|------|--------|---------|--------|
| OWNER | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| ADMIN | ✅ Full | ✅ Full | ❌ | ✅ Full | ✅ Full |
| ACCOUNTANT | ✅ Full | ✅ Limited | ❌ | ✅ Full | ✅ Limited |
| TRAINER | ❌ | ❌ | ❌ | Own Only | ❌ |
| MEMBER | ❌ | ❌ | ❌ | Own Only | ❌ |

### 8.2 Audit Logging

```java
@Entity
public class FinancialAuditLog {
    private Long id;
    private String gymId;
    private String userId;
    private String action;          // CREATE, UPDATE, DELETE, VIEW, EXPORT
    private String resourceType;   // EXPENSE, INCOME, REPORT
    private Long resourceId;
    private String oldValue;        // JSON
    private String newValue;        // JSON
    private String ipAddress;
    private String userAgent;
    private LocalDateTime timestamp;
}
```

---

## Module 9: Compliance Features

### 9.1 PCI-DSS Compliance

- **No card storage**: All payment data handled by gateways
- **Encrypted transmission**: TLS 1.3 for all API calls
- **Tokenization**: Use gateway tokens for recurring
- **Access logging**: All payment data access logged
- **Regular audits**: Quarterly security reviews

### 9.2 Tax Calculation

```java
public class TaxCalculationService {

    public TaxSummary calculateTax(BigDecimal amount, TaxType type, String state) {
        TaxRate rate = taxRateRepository.findByStateAndType(state, type);
        BigDecimal taxAmount = amount.multiply(rate.getRate());
        BigDecimal total = amount.add(taxAmount);

        return TaxSummary.builder()
            .taxType(type)
            .subTotal(amount)
            .taxRate(rate.getRate())
            .taxAmount(taxAmount)
            .total(total)
            .taxJurisdiction(state)
            .calculatedAt(LocalDateTime.now())
            .build();
    }

    public TaxReport generateTaxReport(int year, Long gymId) {
        List<TaxableTransaction> transactions =
            transactionRepository.findTaxableByYear(year, gymId);

        Map<TaxType, BigDecimal> breakdown = transactions.stream()
            .collect(groupingBy(
                TaxableTransaction::getTaxType,
                summing(TaxableTransaction::getTaxAmount)
            ));

        return TaxReport.builder()
            .year(year)
            .gymId(gymId)
            .totalTaxableIncome(calculateTotalIncome(transactions))
            .totalTaxApplicable(calculateTotalTax(breakdown))
            .breakdownByType(breakdown)
            .generatedAt(LocalDateTime.now())
            .build();
    }
}
```

---

## Module 10: Webhook Implementation

### 10.1 Webhook Events

```java
public enum WebhookEventType {
    // Payment Events
    PAYMENT_SUCCESS,
    PAYMENT_FAILED,
    PAYMENT_REFUNDED,

    // Subscription Events
    SUBSCRIPTION_CREATED,
    SUBSCRIPTION_RENEWED,
    SUBSCRIPTION_CANCELLED,
    SUBSCRIPTION_PAYMENT_FAILED,

    // Bank Events
    BANK_TRANSACTION_SYNCED,
    BANK_CONNECTION_ERROR,
    BANK_CONNECTION_EXPIRED
}
```

### 10.2 Webhook Processing

```java
@PostMapping("/webhook/{gateway}")
public ResponseEntity<Void> handleWebhook(
    @PathVariable String gateway,
    @RequestBody String payload,
    @RequestHeader("X-Signature") String signature
) {
    // 1. Verify signature
    webhookSecurity.verify(gateway, payload, signature);

    // 2. Parse event
    WebhookEvent event = webhookParser.parse(gateway, payload);

    // 3. Store event (idempotency)
    if (!webhookRepository.existsByEventId(event.getId())) {
        webhookRepository.save(event);
    }

    // 4. Process asynchronously
    webhookProcessor.processAsync(event);

    return ResponseEntity.ok().build();
}
```

---

## Database Schema

### Core Tables

```sql
-- Payment Gateway Connections
CREATE TABLE payment_gateway_connection (
    id BIGSERIAL PRIMARY KEY,
    gym_id BIGINT REFERENCES gyms(id),
    gateway VARCHAR(50) NOT NULL,
    gateway_account_id VARCHAR(255),
    access_token_encrypted BYTEA,
    refresh_token_encrypted BYTEA,
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Financial Transactions
CREATE TABLE financial_transaction (
    id BIGSERIAL PRIMARY KEY,
    gym_id BIGINT REFERENCES gyms(id),
    type VARCHAR(20) NOT NULL,  -- INCOME, EXPENSE
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    amount_in_base_currency DECIMAL(15,2),
    exchange_rate DECIMAL(15,10),
    transaction_date DATE NOT NULL,
    description TEXT,
    reference_number VARCHAR(100),
    payment_method VARCHAR(50),
    gateway_transaction_id VARCHAR(255),
    gateway VARCHAR(50),
    receipt_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'COMPLETED',
    member_id BIGINT REFERENCES members(id),
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Recurring Financial Items
CREATE TABLE recurring_financial_item (
    id BIGSERIAL PRIMARY KEY,
    gym_id BIGINT REFERENCES gyms(id),
    type VARCHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    frequency VARCHAR(20) NOT NULL,  -- DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
    next_execution_date DATE,
    description TEXT,
    payment_method VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    last_executed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bank Connections
CREATE TABLE bank_connection (
    id BIGSERIAL PRIMARY KEY,
    gym_id BIGINT REFERENCES gyms(id),
    plaid_item_id VARCHAR(255),
    plaid_access_token_encrypted BYTEA,
    institution_name VARCHAR(255),
    account_mask VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Financial Audit Log
CREATE TABLE financial_audit_log (
    id BIGSERIAL PRIMARY KEY,
    gym_id BIGINT REFERENCES gyms(id),
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(20) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id BIGINT,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Exchange Rates
CREATE TABLE exchange_rate (
    id BIGSERIAL PRIMARY KEY,
    base_currency VARCHAR(3) NOT NULL,
    target_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(15,6) NOT NULL,
    fetched_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(base_currency, target_currency)
);
```

---

## Implementation Priority

| Phase | Module | Effort | Value |
|-------|--------|--------|-------|
| 1 | Payment Gateway (Stripe) | Medium | High |
| 2 | Income Tracking | Medium | High |
| 3 | Expense Management | Medium | High |
| 4 | Financial Dashboard | Low | High |
| 5 | Basic Reporting | Medium | Medium |
| 6 | Tax Calculation | Medium | Medium |
| 7 | Multi-Currency | Low | Low |
| 8 | Bank Connect (Plaid) | High | Medium |
| 9 | Advanced Reports | Medium | Medium |
| 10 | Compliance Features | Ongoing | Required |

---

## Testing Strategy

### Unit Tests
- Service layer business logic
- Tax calculations
- Currency conversions
- Webhook signature verification

### Integration Tests
- Payment gateway sandbox testing
- Database transactions
- API endpoint testing
- File upload/download

### Security Testing
- Penetration testing
- PCI-DSS compliance audit
- Webhook replay attack prevention
- SQL injection prevention

### Financial Accuracy
- Reconciliation with bank statements
- Audit trail verification
- Round-off error testing
- Currency conversion accuracy

---

## API Documentation

All endpoints documented using OpenAPI/Swagger:
- `/api/v1/docs` - Swagger UI
- `/api/v1/api-docs.yaml` - OpenAPI spec

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Payments | 100 | 1 minute |
| Reports | 30 | 1 minute |
| File Upload | 20 | 1 minute |
| General | 1000 | 1 hour |

---

## Error Handling

```java
public enum FinancialErrorCode {
    PAYMENT_FAILED("FIN_001", "Payment processing failed"),
    GATEWAY_CONNECTION_ERROR("FIN_002", "Payment gateway unavailable"),
    INVALID_AMOUNT("FIN_003", "Invalid payment amount"),
    DUPLICATE_TRANSACTION("FIN_004", "Duplicate transaction detected"),
    INSUFFICIENT_FUNDS("FIN_005", "Insufficient funds"),
    BANK_SYNC_FAILED("FIN_006", "Bank synchronization failed"),
    EXPENSE_CATEGORY_INVALID("FIN_007", "Invalid expense category"),
    RECEIPT_UPLOAD_FAILED("FIN_008", "Receipt upload failed"),
    REPORT_GENERATION_FAILED("FIN_009", "Report generation failed"),
    EXCHANGE_RATE_UNAVAILABLE("FIN_010", "Exchange rate not available"),
    UNAUTHORIZED_FINANCIAL_ACCESS("FIN_011", "Unauthorized access to financial data");
}
```

---

## Future Enhancements

1. **AI-Powered Insights**: Anomaly detection, spending predictions
2. **Cash Flow Forecasting**: ML-based predictions
3. **Receipt Scanning**: OCR for auto-populating expenses
4. **Cheque Tracking**: Cheque payment management
5. **Petty Cash Management**: Cash drawer tracking
6. **Asset Depreciation**: Equipment value tracking
7. **Budget vs Actual**: Variance analysis
8. **KPI Alerts**: Custom threshold notifications

---

*Document Version: 1.0*
*Last Updated: 2026-04-06*
