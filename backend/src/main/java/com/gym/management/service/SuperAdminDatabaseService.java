package com.gym.management.service;

import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;
import java.util.*;

@Service
public class SuperAdminDatabaseService {

    public Map<String, Object> getDatabaseHealth() {
        Map<String, Object> health = new HashMap<>();
        
        // Get system metrics
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        
        // CPU load (0-100)
        double cpuLoad = osBean.getSystemLoadAverage();
        int cpuPercent = cpuLoad > 0 ? (int) Math.min(cpuLoad * 10, 100) : 25; // Mock reasonable value
        
        // Memory usage
        long usedMemory = memoryBean.getHeapMemoryUsage().getUsed();
        long maxMemory = memoryBean.getHeapMemoryUsage().getMax();
        int memoryPercent = (int) ((usedMemory * 100) / maxMemory);
        
        // Mock active connections (would come from HikariCP in production)
        int activeConnections = 12;
        int maxConnections = 20;
        int connectionPercent = (activeConnections * 100) / maxConnections;
        
        health.put("cpu", cpuPercent);
        health.put("memory", memoryPercent);
        health.put("connections", connectionPercent);
        health.put("activeConnections", activeConnections);
        health.put("maxConnections", maxConnections);
        health.put("status", cpuPercent < 80 && memoryPercent < 80 ? "healthy" : "warning");
        
        return health;
    }

    public List<Map<String, Object>> getTableSizes() {
        // Mock table sizes - in production would query pg_class
        List<Map<String, Object>> tables = new ArrayList<>();
        
        addTable(tables, "users", 45200, 1247);
        addTable(tables, "gyms", 12800, 342);
        addTable(tables, "memberships", 89600, 2845);
        addTable(tables, "transactions", 156000, 4521);
        addTable(tables, "gym_staff", 24500, 789);
        addTable(tables, "classes", 67800, 1923);
        addTable(tables, "bookings", 134000, 3876);
        addTable(tables, "equipment", 18900, 567);
        
        tables.sort((a, b) -> ((Integer) b.get("sizeKb")).compareTo((Integer) a.get("sizeKb")));
        
        return tables;
    }

    private void addTable(List<Map<String, Object>> tables, String name, int sizeKb, int rows) {
        Map<String, Object> table = new HashMap<>();
        table.put("name", name);
        table.put("sizeKb", sizeKb);
        table.put("sizeFormatted", formatSize(sizeKb));
        table.put("rows", rows);
        tables.add(table);
    }

    private String formatSize(int sizeKb) {
        if (sizeKb < 1024) {
            return sizeKb + " KB";
        } else {
            double sizeMb = sizeKb / 1024.0;
            return String.format("%.1f MB", sizeMb);
        }
    }
}
