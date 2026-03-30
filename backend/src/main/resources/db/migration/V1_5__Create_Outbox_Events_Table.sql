-- Outbox Pattern Table for Event Sourcing
-- Ensures event delivery even if server crashes after DB commit

CREATE TABLE IF NOT EXISTS outbox_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL UNIQUE,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT NOT NULL,
    operation VARCHAR(20) NOT NULL,
    payload JSON NOT NULL,
    tenant_id BIGINT NOT NULL,
    actor_id BIGINT,
    version BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    retry_count INT NOT NULL DEFAULT 0,
    last_retry_at TIMESTAMP NULL,
    error_message TEXT NULL,
    
    INDEX idx_unpublished (published_at, created_at),
    INDEX idx_tenant (tenant_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
