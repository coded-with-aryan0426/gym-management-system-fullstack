package com.gym.management.config;

import com.gym.management.model.AuditLog;
import com.gym.management.model.UserSession;
import com.gym.management.model.Gym;
import com.gym.management.model.User;
import com.gym.management.repository.AuditLogRepository;
import com.gym.management.repository.UserSessionRepository;
import com.gym.management.repository.GymRepository;
import com.gym.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Component
@Order(100) // Run after other initializers
public class AuditDataInitializer implements CommandLineRunner {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserSessionRepository userSessionRepository;

    @Autowired
    private GymRepository gymRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Only seed if tables are empty
            if (auditLogRepository.count() == 0) {
                seedAuditLogs();
            }
            if (userSessionRepository.count() == 0) {
                seedUserSessions();
            }
        } catch (Exception e) {
            System.out.println("Note: Could not seed audit data (tables may not exist yet): " + e.getMessage());
        }
    }

    private void seedAuditLogs() {
        System.out.println("Seeding audit logs...");

        // Try to find gym 41, or use first available gym
        Optional<Gym> gymOpt = gymRepository.findById(41L);
        if (!gymOpt.isPresent()) {
            List<Gym> gyms = gymRepository.findAll();
            if (gyms.isEmpty()) {
                System.out.println("No gyms found, skipping audit log seeding");
                return;
            }
            gymOpt = Optional.of(gyms.get(0));
        }
        Gym gym = gymOpt.get();

        // Try to find a user
        Optional<User> userOpt = userRepository.findByEmail("Aryan23@gmail.com");
        if (!userOpt.isPresent()) {
            List<User> users = userRepository.findAll();
            if (!users.isEmpty()) {
                userOpt = Optional.of(users.get(0));
            }
        }
        User user = userOpt.orElse(null);

        Random random = new Random();

        List<String> actions = Arrays.asList("LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE", "VIEW", "EXPORT");
        List<String> entities = Arrays.asList("MEMBER", "STAFF", "PLAN", "PAYMENT", "SETTINGS", "REPORT");
        List<String> userNames = Arrays.asList("Aryan", "Admin", "Trainer", "Manager");
        List<String> roles = Arrays.asList("OWNER", "STAFF", "TRAINER", "ADMIN");
        List<String> ipAddresses = Arrays.asList("192.168.1.100", "192.168.1.101", "10.0.0.50", "172.16.0.25");

        // Create 50 sample audit logs over the past 30 days
        for (int i = 0; i < 50; i++) {
            AuditLog log = new AuditLog();
            log.setGym(gym);
            if (user != null) {
                log.setUser(user);
            }

            String action = actions.get(random.nextInt(actions.size()));
            log.setAction(action);

            String entity = entities.get(random.nextInt(entities.size()));
            log.setEntity(entity);
            log.setEntityId(String.valueOf(random.nextInt(100) + 1));
            log.setEntityName("Sample " + entity + " " + (i + 1));

            String userName = userNames.get(random.nextInt(userNames.size()));
            log.setUserName(userName);
            log.setUserRole(roles.get(random.nextInt(roles.size())));

            log.setIpAddress(ipAddresses.get(random.nextInt(ipAddresses.size())));
            log.setLocation("Local Network");
            log.setDeviceType(random.nextBoolean() ? "desktop" : "mobile");
            log.setBrowser(random.nextBoolean() ? "Chrome" : "Firefox");
            log.setOs(random.nextBoolean() ? "macOS" : "Windows");

            // Set description based on action
            switch (action) {
                case "LOGIN":
                    log.setDetails("User " + userName + " logged in successfully");
                    log.setSeverity("info");
                    break;
                case "LOGOUT":
                    log.setDetails("User " + userName + " logged out");
                    log.setSeverity("info");
                    break;
                case "CREATE":
                    log.setDetails("Created new " + entity.toLowerCase());
                    log.setTarget(entity + " #" + log.getEntityId());
                    log.setChanges("{\"status\": \"ACTIVE\"}");
                    log.setSeverity("info");
                    break;
                case "UPDATE":
                    log.setDetails("Updated " + entity.toLowerCase() + " details");
                    log.setTarget(entity + " #" + log.getEntityId());
                    log.setChanges("{\"before\": {\"status\": \"INACTIVE\"}, \"after\": {\"status\": \"ACTIVE\"}}");
                    log.setSeverity("info");
                    break;
                case "DELETE":
                    log.setDetails("Deleted " + entity.toLowerCase());
                    log.setTarget(entity + " #" + log.getEntityId());
                    log.setSeverity("medium");
                    break;
                case "VIEW":
                    log.setDetails("Viewed " + entity.toLowerCase() + " details");
                    log.setTarget(entity + " #" + log.getEntityId());
                    log.setSeverity("info");
                    break;
                case "EXPORT":
                    log.setDetails("Exported " + entity.toLowerCase() + " data");
                    log.setSeverity("low");
                    break;
                default:
                    log.setDetails("Performed action: " + action);
                    log.setSeverity("info");
            }

            // Random timestamp within last 30 days
            int daysAgo = random.nextInt(30);
            int hoursAgo = random.nextInt(24);
            int minutesAgo = random.nextInt(60);
            log.setTimestamp(LocalDateTime.now().minusDays(daysAgo).minusHours(hoursAgo).minusMinutes(minutesAgo));

            auditLogRepository.save(log);
        }

        // Add a few security alerts
        for (int i = 0; i < 5; i++) {
            AuditLog securityLog = new AuditLog();
            securityLog.setGym(gym);
            securityLog.setAction("SECURITY_ALERT");
            securityLog.setEntity("SECURITY");
            securityLog.setUserName("System");
            securityLog.setIpAddress("unknown");
            securityLog.setDetails("Failed login attempt detected from suspicious IP");
            securityLog.setSeverity("high");
            securityLog.setTimestamp(LocalDateTime.now().minusDays(random.nextInt(7)));
            auditLogRepository.save(securityLog);
        }

        System.out.println("Seeded " + auditLogRepository.count() + " audit logs");
    }

    private void seedUserSessions() {
        System.out.println("Seeding user sessions...");

        // Try to find gym 41, or use first available gym
        Optional<Gym> gymOpt = gymRepository.findById(41L);
        if (!gymOpt.isPresent()) {
            List<Gym> gyms = gymRepository.findAll();
            if (gyms.isEmpty()) {
                System.out.println("No gyms found, skipping session seeding");
                return;
            }
            gymOpt = Optional.of(gyms.get(0));
        }
        Gym gym = gymOpt.get();

        // Try to find user
        Optional<User> userOpt = userRepository.findByEmail("Aryan23@gmail.com");
        if (!userOpt.isPresent()) {
            List<User> users = userRepository.findAll();
            if (users.isEmpty()) {
                System.out.println("No users found, skipping session seeding");
                return;
            }
            userOpt = Optional.of(users.get(0));
        }
        User user = userOpt.get();

        // Current active session
        UserSession activeSession = new UserSession();
        activeSession.setGym(gym);
        activeSession.setUser(user);
        activeSession.setTokenHash("current-session-" + System.currentTimeMillis());
        activeSession.setStatus("online");
        activeSession.setIpAddress("192.168.1.100");
        activeSession.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0");
        activeSession.setDeviceType("desktop");
        activeSession.setDevice("MacBook Pro");
        activeSession.setBrowser("Chrome");
        activeSession.setOs("macOS");
        activeSession.setLocation("Local Network");
        activeSession.setCreatedAt(LocalDateTime.now().minusHours(2));
        activeSession.setLastActiveAt(LocalDateTime.now());
        activeSession.setIsActive(true);
        userSessionRepository.save(activeSession);

        // Some past sessions
        String[] deviceTypes = { "desktop", "mobile", "tablet" };
        String[] browsers = { "Chrome", "Firefox", "Safari", "Edge" };
        String[] oses = { "macOS", "Windows 11", "iOS", "Android" };
        String[] devices = { "MacBook Pro", "iPhone 15", "iPad Air", "Dell XPS", "Samsung Galaxy" };

        Random random = new Random();
        for (int i = 0; i < 10; i++) {
            UserSession session = new UserSession();
            session.setGym(gym);
            session.setUser(user);
            session.setTokenHash("past-session-" + i + "-" + System.currentTimeMillis());
            session.setStatus("offline");
            session.setIpAddress("192.168.1." + (100 + random.nextInt(50)));
            session.setUserAgent("Mozilla/5.0 Sample User Agent");
            session.setDeviceType(deviceTypes[random.nextInt(deviceTypes.length)]);
            session.setDevice(devices[random.nextInt(devices.length)]);
            session.setBrowser(browsers[random.nextInt(browsers.length)]);
            session.setOs(oses[random.nextInt(oses.length)]);
            session.setLocation("Local Network");

            int daysAgo = random.nextInt(14) + 1;
            session.setCreatedAt(LocalDateTime.now().minusDays(daysAgo));
            session.setLastActiveAt(LocalDateTime.now().minusDays(daysAgo).plusHours(random.nextInt(8)));
            session.setLogoutAt(LocalDateTime.now().minusDays(daysAgo).plusHours(random.nextInt(8) + 1));
            session.setIsActive(false);
            userSessionRepository.save(session);
        }

        System.out.println("Seeded " + userSessionRepository.count() + " user sessions");
    }
}
