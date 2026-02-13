package com.gym.management.service;

import com.gym.management.dto.dashboard.*;
import com.gym.management.model.GymSettings;
import com.gym.management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Enhanced Dashboard Analytics Service
 * Provides real data for dashboard charts and analytics
 */
@Service
public class DashboardAnalyticsService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private CheckInRepository checkInRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private GymSettingsRepository gymSettingsRepository;

    /**
     * Get daily revenue trend for specified date range
     */
    public List<DailyRevenueDTO> getDailyRevenue(LocalDate from, LocalDate to) {
        List<DailyRevenueDTO> result = new ArrayList<>();
        
        LocalDate current = from;
        while (!current.isAfter(to)) {
            LocalDateTime startOfDay = current.atStartOfDay();
            LocalDateTime endOfDay = current.plusDays(1).atStartOfDay();
            
            // Get revenue for this day
            BigDecimal dailyRevenue = transactionRepository.getRevenueForDateRange(startOfDay, endOfDay);
            double revenue = dailyRevenue != null ? dailyRevenue.doubleValue() : 0.0;
            
            DailyRevenueDTO dto = new DailyRevenueDTO();
            dto.setDate(current);
            dto.setDay(current.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
            dto.setRevenue(revenue);
            dto.setSource("total"); // Can be enhanced to break down by source
            
            result.add(dto);
            current = current.plusDays(1);
        }
        
        return result;
    }

    /**
     * Get daily attendance trend for specified date range
     */
    public List<DailyAttendanceDTO> getDailyAttendance(LocalDate from, LocalDate to) {
        List<DailyAttendanceDTO> result = new ArrayList<>();
        
        LocalDate current = from;
        while (!current.isAfter(to)) {
            LocalDateTime startOfDay = current.atStartOfDay();
            LocalDateTime endOfDay = current.plusDays(1).atStartOfDay();
            
            // Get check-ins for this day
            List<?> checkIns = checkInRepository.findCheckInsForDateRange(startOfDay, endOfDay);
            int checkInCount = checkIns != null ? checkIns.size() : 0;
            
            // Get unique members (simplified - in real implementation would count distinct user_ids)
            int uniqueMembers = checkInCount; // Placeholder - should be actual distinct count
            
            // Calculate peak hour (simplified - would need actual implementation)
            int peakHour = 18; // Default peak hour
            
            DailyAttendanceDTO dto = new DailyAttendanceDTO();
            dto.setDate(current);
            dto.setDay(current.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
            dto.setCheckIns(checkInCount);
            dto.setUniqueMembers(uniqueMembers);
            dto.setPeakHour(peakHour);
            
            result.add(dto);
            current = current.plusDays(1);
        }
        
        return result;
    }

    /**
     * Get membership breakdown with real counts
     */
    public MembershipBreakdownDTO getMembershipBreakdown() {
        MembershipBreakdownDTO breakdown = new MembershipBreakdownDTO();
        
        // Get actual counts from database
        Integer active = membershipRepository.countActiveMemberships();
        Integer expiring = membershipRepository.countExpiringMemberships(LocalDate.now(), LocalDate.now().plusDays(7));
        Integer frozen = membershipRepository.countFrozenMemberships();
        Integer expired = membershipRepository.countExpiredMemberships();
        
        breakdown.setActive(active != null ? active : 0);
        breakdown.setExpiring(expiring != null ? expiring : 0);
        breakdown.setFrozen(frozen != null ? frozen : 0);
        breakdown.setExpired(expired != null ? expired : 0);
        breakdown.setTotal((active != null ? active : 0) + (expiring != null ? expiring : 0) + 
                          (frozen != null ? frozen : 0) + (expired != null ? expired : 0));
        
        return breakdown;
    }

    /**
     * Get revenue breakdown by source
     */
    public List<RevenueBySourceDTO> getRevenueBySource(LocalDate from, LocalDate to) {
        List<RevenueBySourceDTO> result = new ArrayList<>();
        
        LocalDate current = from;
        while (!current.isAfter(to)) {
            LocalDateTime startOfDay = current.atStartOfDay();
            LocalDateTime endOfDay = current.plusDays(1).atStartOfDay();
            
            // Get revenue by category (simplified - would need proper category mapping)
            BigDecimal membershipRevenue = transactionRepository.getRevenueByCategoryAndDateRange("MEMBERSHIP", startOfDay, endOfDay);
            BigDecimal ptRevenue = transactionRepository.getRevenueByCategoryAndDateRange("PT_SESSION", startOfDay, endOfDay);
            BigDecimal classRevenue = transactionRepository.getRevenueByCategoryAndDateRange("CLASS", startOfDay, endOfDay);
            BigDecimal supplementRevenue = transactionRepository.getRevenueByCategoryAndDateRange("SUPPLEMENT", startOfDay, endOfDay);
            BigDecimal otherRevenue = transactionRepository.getRevenueByCategoryAndDateRange("OTHER", startOfDay, endOfDay);
            
            double membership = membershipRevenue != null ? membershipRevenue.doubleValue() : 0.0;
            double pt = ptRevenue != null ? ptRevenue.doubleValue() : 0.0;
            double classes = classRevenue != null ? classRevenue.doubleValue() : 0.0;
            double supplements = supplementRevenue != null ? supplementRevenue.doubleValue() : 0.0;
            double other = otherRevenue != null ? otherRevenue.doubleValue() : 0.0;
            double total = membership + pt + classes + supplements + other;
            
            RevenueBySourceDTO dto = new RevenueBySourceDTO();
            dto.setPeriod(current);
            dto.setMembership(membership);
            dto.setPtSessions(pt);
            dto.setClasses(classes);
            dto.setSupplements(supplements);
            dto.setOther(other);
            dto.setTotal(total);
            
            result.add(dto);
            current = current.plusDays(1);
        }
        
        return result;
    }

    /**
     * Get overdue payments with member details
     */
    public List<OverduePaymentDTO> getOverduePayments(int limit) {
        // This would need a proper overdue payment query
        // For now, returning empty list as placeholder
        return new ArrayList<>();
    }

    /**
     * Get today's class schedule
     */
    public List<TodaysClassDTO> getTodaysClasses() {
        // This would need proper class scheduling system
        // For now, returning empty list as placeholder
        return new ArrayList<>();
    }

    /**
     * Get gym occupancy data
     */
    public OccupancyDTO getOccupancy() {
        OccupancyDTO occupancy = new OccupancyDTO();
        
        // Get current check-ins
        Long currentCount = checkInRepository.countActiveCheckIns();
        occupancy.setCurrentCount(currentCount != null ? currentCount.intValue() : 0);
        
        // Get max capacity from gym settings (default to 100 if not set)
        Integer maxCapacity = 100; // Default
        Optional<GymSettings> capacitySettings = gymSettingsRepository.findBySettingKey("max_capacity");
        if (capacitySettings.isPresent()) {
            try {
                maxCapacity = Integer.parseInt(capacitySettings.get().getSettingValue());
            } catch (NumberFormatException e) {
                maxCapacity = 100;
            }
        }
        
        occupancy.setMaxCapacity(maxCapacity);
        
        // Calculate percentage
        double percentage = maxCapacity > 0 ? (double) occupancy.getCurrentCount() / maxCapacity * 100 : 0;
        occupancy.setPercentage(percentage);
        
        // Simple trend calculation (compare with yesterday)
        occupancy.setTrend("stable"); // Placeholder - would need proper trend calculation
        
        return occupancy;
    }

    /**
     * Get monthly revenue progress vs target
     */
    public MonthlyProgressDTO getMonthlyProgress() {
        MonthlyProgressDTO progress = new MonthlyProgressDTO();
        
        LocalDate now = LocalDate.now();
        LocalDate firstDayOfMonth = now.withDayOfMonth(1);
        LocalDate lastDayOfMonth = now.withDayOfMonth(now.lengthOfMonth());
        
        // Get monthly target from settings (default to 500000)
        Double target = 500000.0; // Default ₹5L
        Optional<GymSettings> targetSettings = gymSettingsRepository.findBySettingKey("monthly_revenue_target");
        if (targetSettings.isPresent()) {
            try {
                target = Double.parseDouble(targetSettings.get().getSettingValue());
            } catch (NumberFormatException e) {
                target = 500000.0;
            }
        }
        
        progress.setTarget(target);
        
        // Get current month revenue
        LocalDateTime startOfMonth = firstDayOfMonth.atStartOfDay();
        LocalDateTime endOfMonth = lastDayOfMonth.plusDays(1).atStartOfDay();
        BigDecimal currentRevenue = transactionRepository.getTotalRevenue(startOfMonth, LocalDateTime.now());
        double current = currentRevenue != null ? currentRevenue.doubleValue() : 0.0;
        progress.setCurrent(current);
        
        // Calculate projected end-of-month revenue
        int daysElapsed = now.getDayOfMonth();
        int daysInMonth = now.lengthOfMonth();
        double dailyAverage = daysElapsed > 0 ? current / daysElapsed : 0;
        double projectedEnd = dailyAverage * daysInMonth;
        progress.setProjectedEnd(projectedEnd);
        
        progress.setDaysElapsed(daysElapsed);
        progress.setDaysInMonth(daysInMonth);
        progress.setDaysRemaining(daysInMonth - daysElapsed);
        
        // Determine status
        String status = "ON_TRACK";
        if (projectedEnd < target * 0.9) {
            status = "BEHIND";
        } else if (projectedEnd > target * 1.1) {
            status = "AHEAD";
        }
        progress.setStatus(status);
        
        return progress;
    }

    /**
     * Get comprehensive dashboard summary
     */
    public DashboardSummaryDTO getDashboardSummary() {
        LocalDate today = LocalDate.now();
        LocalDate weekAgo = today.minusDays(7);
        LocalDate monthAgo = today.minusDays(30);
        
        DashboardSummaryDTO summary = new DashboardSummaryDTO();
        
        // Get basic KPIs (these would come from existing OwnerDashboardController)
        // For now, using simplified calculations
        
        // Revenue trend for last 7 days
        summary.setRevenueTrend(getDailyRevenue(weekAgo, today));
        
        // Attendance trend for last 7 days
        summary.setAttendanceTrend(getDailyAttendance(weekAgo, today));
        
        // Membership breakdown
        summary.setMembershipBreakdown(getMembershipBreakdown());
        
        // Revenue by source for last 30 days
        summary.setRevenueBySource(getRevenueBySource(monthAgo, today));
        
        // Overdue payments
        summary.setOverduePayments(getOverduePayments(10));
        
        // Today's classes
        summary.setTodaysClasses(getTodaysClasses());
        
        // Occupancy
        summary.setOccupancy(getOccupancy());
        
        // Monthly progress
        summary.setMonthlyProgress(getMonthlyProgress());
        
        return summary;
    }
}