package com.gym.management.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class SchemaFixConfig {

    private static final Logger logger = LoggerFactory.getLogger(SchemaFixConfig.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void fixSchema() {
        try {
            logger.info("Attempting to fix message_attachments schema...");
            // Oracle syntax to modify column to allow NULL
            jdbcTemplate.execute("ALTER TABLE message_attachments MODIFY (message_id NULL)");
            logger.info("Successfully altered message_attachments.message_id to be nullable.");
        } catch (Exception e) {
            // It might fail if table doesn't exist or other reasons, but usually safe to
            // ignore if it's already correct?
            // However, we want to know if it fails.
            // If it fails because column is already nullable, that's fine.
            logger.warn("Schema fix warning (might be already applied): " + e.getMessage());
        }
    }
}
