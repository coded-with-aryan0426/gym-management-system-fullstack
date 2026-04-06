CREATE SEQUENCE subscription_plan_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE subscription_plans (
    id RAW(16) DEFAULT sys_guid() PRIMARY KEY,
    name VARCHAR2(50) NOT NULL UNIQUE,
    display_name VARCHAR2(100) NOT NULL,
    description CLOB,
    tier_level NUMBER(10) NOT NULL DEFAULT 0,
    price_monthly NUMBER(10,2) NOT NULL,
    price_quarterly NUMBER(10,2),
    price_yearly NUMBER(10,2),
    price_usd_monthly NUMBER(10,2),
    price_usd_quarterly NUMBER(10,2),
    price_usd_yearly NUMBER(10,2),
    currency VARCHAR2(10) DEFAULT 'INR',
    trial_days NUMBER(10) DEFAULT 0,
    grace_period_days NUMBER(10) DEFAULT 3,
    max_devices NUMBER(10) DEFAULT 1,
    features CLOB DEFAULT '{}',
    is_active NUMBER(1) DEFAULT 1,
    is_featured NUMBER(1) DEFAULT 0,
    sort_order NUMBER(10) DEFAULT 0,
    gateway_plans CLOB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_subscriptions (
    id RAW(16) DEFAULT sys_guid() PRIMARY KEY,
    user_id RAW(16) NOT NULL,
    plan_id RAW(16) NOT NULL,
    status VARCHAR2(50) NOT NULL DEFAULT 'trialing',
    billing_cycle VARCHAR2(20) NOT NULL DEFAULT 'monthly',
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    grace_period_end TIMESTAMP,
    cancel_at_period_end NUMBER(1) DEFAULT 0,
    cancelled_at TIMESTAMP,
    auto_renew NUMBER(1) DEFAULT 1,
    gateway VARCHAR2(50),
    gateway_subscription_id VARCHAR2(255),
    gateway_customer_id VARCHAR2(255),
    previous_plan_id RAW(16),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_subs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_subs_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
    CONSTRAINT fk_user_subs_prev_plan FOREIGN KEY (previous_plan_id) REFERENCES subscription_plans(id)
);

CREATE TABLE license_keys (
    id RAW(16) DEFAULT sys_guid() PRIMARY KEY,
    user_id RAW(16) NOT NULL,
    subscription_id RAW(16),
    license_key VARCHAR2(255) UNIQUE NOT NULL,
    plan_name VARCHAR2(50) NOT NULL,
    plan_tier NUMBER(10) NOT NULL DEFAULT 0,
    max_devices NUMBER(10) DEFAULT 1,
    activated_devices CLOB DEFAULT '[]',
    hardware_fingerprint VARCHAR2(255),
    expires_at TIMESTAMP NOT NULL,
    last_validated_at TIMESTAMP,
    is_revoked NUMBER(1) DEFAULT 0,
    revoked_at TIMESTAMP,
    revoke_reason VARCHAR2(255),
    is_transferable NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_license_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_license_subscription FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id)
);

CREATE TABLE subscription_payments (
    id RAW(16) DEFAULT sys_guid() PRIMARY KEY,
    user_id RAW(16) NOT NULL,
    subscription_id RAW(16),
    license_id RAW(16),
    gateway VARCHAR2(50) NOT NULL,
    gateway_payment_id VARCHAR2(255),
    gateway_invoice_id VARCHAR2(255),
    amount NUMBER(10,2) NOT NULL,
    currency VARCHAR2(10) NOT NULL,
    status VARCHAR2(50) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR2(100),
    card_last4 VARCHAR2(4),
    card_brand VARCHAR2(50),
    billing_cycle VARCHAR2(20),
    description VARCHAR2(500),
    metadata CLOB DEFAULT '{}',
    paid_at TIMESTAMP,
    failed_at TIMESTAMP,
    refunded_at TIMESTAMP,
    refund_amount NUMBER(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_subscription FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id),
    CONSTRAINT fk_payment_license FOREIGN KEY (license_id) REFERENCES license_keys(id)
);

CREATE TABLE webhook_events (
    id RAW(16) DEFAULT sys_guid() PRIMARY KEY,
    gateway VARCHAR2(50) NOT NULL,
    event_id VARCHAR2(255) NOT NULL,
    event_type VARCHAR2(255) NOT NULL,
    payload CLOB NOT NULL,
    processed NUMBER(1) DEFAULT 0,
    processed_at TIMESTAMP,
    processing_error CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_webhook_gateway_event UNIQUE (gateway, event_id)
);

CREATE TABLE license_activations (
    id RAW(16) DEFAULT sys_guid() PRIMARY KEY,
    license_id RAW(16) NOT NULL,
    device_id VARCHAR2(255) NOT NULL,
    device_name VARCHAR2(255),
    device_fingerprint VARCHAR2(255) NOT NULL,
    ip_address VARCHAR2(45),
    activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP,
    is_active NUMBER(1) DEFAULT 1,
    CONSTRAINT fk_activation_license FOREIGN KEY (license_id) REFERENCES license_keys(id) ON DELETE CASCADE,
    CONSTRAINT uk_activation_license_device UNIQUE (license_id, device_fingerprint)
);

CREATE TABLE subscription_changes (
    id RAW(16) DEFAULT sys_guid() PRIMARY KEY,
    user_id RAW(16) NOT NULL,
    subscription_id RAW(16),
    change_type VARCHAR2(50) NOT NULL,
    old_plan_id RAW(16),
    new_plan_id RAW(16),
    old_status VARCHAR2(50),
    new_status VARCHAR2(50),
    reason VARCHAR2(255),
    initiated_by VARCHAR2(50),
    gateway_action_id VARCHAR2(255),
    metadata CLOB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_change_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_change_subscription FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id),
    CONSTRAINT fk_change_old_plan FOREIGN KEY (old_plan_id) REFERENCES subscription_plans(id),
    CONSTRAINT fk_change_new_plan FOREIGN KEY (new_plan_id) REFERENCES subscription_plans(id)
);

CREATE TABLE subscription_notifications (
    id RAW(16) DEFAULT sys_guid() PRIMARY KEY,
    user_id RAW(16) NOT NULL,
    subscription_id RAW(16),
    notification_type VARCHAR2(50) NOT NULL,
    channel VARCHAR2(20) DEFAULT 'email',
    subject VARCHAR2(255),
    content CLOB,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    failed_at TIMESTAMP,
    failure_reason VARCHAR2(500),
    metadata CLOB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_subscription FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id)
);

CREATE TABLE trial_rate_limits (
    id RAW(16) DEFAULT sys_guid() PRIMARY KEY,
    user_id RAW(16) NOT NULL,
    endpoint VARCHAR2(255) NOT NULL,
    request_count NUMBER(10) DEFAULT 0,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    window_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rate_limit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_rate_limit_user_endpoint UNIQUE (user_id, endpoint)
);

CREATE INDEX idx_subs_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_subs_status ON user_subscriptions(status);
CREATE INDEX idx_subs_period_end ON user_subscriptions(current_period_end);
CREATE INDEX idx_license_user_id ON license_keys(user_id);
CREATE INDEX idx_license_key ON license_keys(license_key);
CREATE INDEX idx_license_expires ON license_keys(expires_at);
CREATE INDEX idx_payment_user_id ON subscription_payments(user_id);
CREATE INDEX idx_payment_status ON subscription_payments(status);
CREATE INDEX idx_webhook_processed ON webhook_events(processed, gateway);
CREATE INDEX idx_sub_changes_user ON subscription_changes(user_id);
CREATE INDEX idx_notifications_user ON subscription_notifications(user_id);

INSERT INTO subscription_plans (name, display_name, description, tier_level, price_monthly, price_quarterly, price_yearly, trial_days, grace_period_days, max_devices, features, is_active, is_featured, sort_order)
VALUES (
    'free',
    'Free Plan',
    'Basic access with limited features. Perfect for getting started.',
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    '{"basicAccess": true, "maxMembers": 10, "maxStaff": 2, "maxTrainers": 1, "maxClasses": 5, "analytics": false, "exportPdf": false, "apiAccess": false, "prioritySupport": false, "storageLimitMb": 100}',
    1,
    0,
    1
);

INSERT INTO subscription_plans (name, display_name, description, tier_level, price_monthly, price_quarterly, price_yearly, trial_days, grace_period_days, max_devices, features, is_active, is_featured, sort_order)
VALUES (
    'starter',
    'Starter Plan',
    'For small gyms and personal trainers. Includes basic analytics.',
    1,
    29.99,
    79.99,
    249.99,
    7,
    3,
    2,
    '{"basicAccess": true, "maxMembers": 100, "maxStaff": 5, "maxTrainers": 3, "maxClasses": 20, "analytics": true, "exportPdf": false, "apiAccess": false, "prioritySupport": false, "storageLimitMb": 1000}',
    1,
    0,
    2
);

INSERT INTO subscription_plans (name, display_name, description, tier_level, price_monthly, price_quarterly, price_yearly, trial_days, grace_period_days, max_devices, features, is_active, is_featured, sort_order)
VALUES (
    'professional',
    'Professional Plan',
    'For growing fitness studios. Full analytics and PDF exports.',
    2,
    79.99,
    199.99,
    699.99,
    14,
    5,
    5,
    '{"basicAccess": true, "maxMembers": 500, "maxStaff": 15, "maxTrainers": 10, "maxClasses": 100, "analytics": true, "exportPdf": true, "apiAccess": true, "prioritySupport": true, "storageLimitMb": 10000}',
    1,
    1,
    3
);

INSERT INTO subscription_plans (name, display_name, description, tier_level, price_monthly, price_quarterly, price_yearly, trial_days, grace_period_days, max_devices, features, is_active, is_featured, sort_order)
VALUES (
    'enterprise',
    'Enterprise Plan',
    'For large fitness chains and gyms. Unlimited access with dedicated support.',
    3,
    199.99,
    499.99,
    1799.99,
    30,
    7,
    -1,
    '{"basicAccess": true, "maxMembers": -1, "maxStaff": -1, "maxTrainers": -1, "maxClasses": -1, "analytics": true, "exportPdf": true, "apiAccess": true, "prioritySupport": true, "storageLimitMb": -1}',
    1,
    0,
    4
);
