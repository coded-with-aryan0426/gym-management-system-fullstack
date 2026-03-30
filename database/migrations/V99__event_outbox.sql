-- Outbox Pattern - Transactional Event Store
-- Ensures events are NEVER lost, even if server crashes

CREATE TABLE IF NOT EXISTS event_outbox (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL UNIQUE,
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    operation VARCHAR(10) NOT NULL, -- CREATE, UPDATE, DELETE
    payload JSON,
    tenant_id BIGINT NOT NULL,
    actor_id BIGINT,
    sequence_number BIGINT NOT NULL,
    version BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PUBLISHED, FAILED
    retry_count INT DEFAULT 0,
    last_error TEXT,
    INDEX idx_status_created (status, created_at),
    INDEX idx_tenant_sequence (tenant_id, sequence_number),
    INDEX idx_published (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sequence generator for events per tenant
CREATE TABLE IF NOT EXISTS event_sequences (
    tenant_id BIGINT PRIMARY KEY,
    current_sequence BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
