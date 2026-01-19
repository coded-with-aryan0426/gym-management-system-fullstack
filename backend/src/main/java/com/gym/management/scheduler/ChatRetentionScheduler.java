package com.gym.management.scheduler;

import com.gym.management.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class ChatRetentionScheduler {

    @Autowired
    private MessageRepository messageRepository;

    // Run every day at 3:00 AM
    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void cleanupOldMessages() {
        // Retention period: 1 year
        LocalDateTime cutoffDate = LocalDateTime.now().minusYears(1);
        
        messageRepository.softDeleteOlderThan(cutoffDate);
        
        System.out.println("Executed message retention cleanup at " + LocalDateTime.now());
    }
}
