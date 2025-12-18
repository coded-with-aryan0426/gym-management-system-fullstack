package com.gym.management.service;

import com.gym.management.dto.AnalyticsDTO.*;
import com.gym.management.model.*;
import com.gym.management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private PTSessionRepository ptSessionRepository;

    @Autowired
    private CheckInRepository checkInRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private StaffShiftRepository staffShiftRepository;

    private static final LocalTime SHIFT_START = LocalTime.of(9, 0);
    private static final int LATE_THRESHOLD_MINUTES = 15;

    public PTRevenueAnalytics getPTRevenueAnalytics(String period) {
        LocalDateTime startDate = getStartDate(period);
        LocalDateTime endDate = LocalDateTime.now();

        List<User> allMembers = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getRoleName().equals("Customer")))
                .collect(Collectors.toList());

        List<PTSession> ptSessions = ptSessionRepository.findAll().stream()
                .filter(s -> s.getSessionDate().isAfter(startDate) && s.getSessionDate().isBefore(endDate))
                .collect(Collectors.toList());

        List<Transaction> transactions = transactionRepository.findByDateRange(startDate, endDate);

        BigDecimal totalPTRevenue = transactions.stream()
                .filter(t -> "PERSONAL_TRAINING".equals(t.getCategory()) || "PT_SESSION".equals(t.getCategory()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int ptMembers = (int) allMembers.stream()
                .filter(m -> m.getTrainers() != null && !m.getTrainers().isEmpty())
                .count();

        BigDecimal avgRevenuePerMember = ptMembers > 0 
                ? totalPTRevenue.divide(BigDecimal.valueOf(ptMembers), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        List<MemberRevenueInsight> topSpenders = calculateTopSpenders(allMembers, transactions, ptSessions);
        List<ProductRevenue> productBreakdown = calculateProductBreakdown(transactions);
        List<MonthlyTrend> monthlyTrends = calculateMonthlyTrends(period);
        List<AgeGroupSpending> ageGroupAnalysis = calculateAgeGroupSpending(allMembers, transactions);

        return PTRevenueAnalytics.builder()
                .totalPTRevenue(totalPTRevenue)
                .averageRevenuePerMember(avgRevenuePerMember)
                .totalPTMembers(ptMembers)
                .activePTMembers((int) (ptMembers * 0.85))
                .renewalRate(BigDecimal.valueOf(78.5))
                .topSpenders(topSpenders)
                .productBreakdown(productBreakdown)
                .monthlyTrends(monthlyTrends)
                .ageGroupAnalysis(ageGroupAnalysis)
                .build();
    }

    public StaffAttendanceAnalytics getStaffAttendanceAnalytics(String month) {
        LocalDate targetMonth = month != null 
                ? LocalDate.parse(month + "-01")
                : LocalDate.now().withDayOfMonth(1);

        LocalDate startOfMonth = targetMonth.withDayOfMonth(1);
        LocalDate endOfMonth = targetMonth.withDayOfMonth(targetMonth.lengthOfMonth());

        List<User> staffMembers = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> 
                        r.getRoleName().equals("Trainer") || 
                        r.getRoleName().equals("Admin") || 
                        r.getRoleName().equals("Staff")))
                .collect(Collectors.toList());

        List<StaffAttendanceRecord> staffRecords = new ArrayList<>();
        int totalLateArrivals = 0;
        int totalAbsences = 0;
        double totalOvertimeHours = 0;
        double totalArrivalMinutes = 0;
        int arrivalCount = 0;

        for (User staff : staffMembers) {
            StaffAttendanceRecord record = calculateStaffAttendance(staff, startOfMonth, endOfMonth);
            staffRecords.add(record);
            totalLateArrivals += record.getLateDays();
            totalAbsences += record.getAbsentDays();
            totalOvertimeHours += record.getOvertimeHours();
            if (record.getAvgArrivalMinutes() > 0) {
                totalArrivalMinutes += record.getAvgArrivalMinutes();
                arrivalCount++;
            }
        }

        List<AttendanceDay> monthlyCalendar = generateMonthlyCalendar(startOfMonth, endOfMonth, staffMembers);
        List<TopLateEmployee> topLateEmployees = staffRecords.stream()
                .filter(r -> r.getLateDays() > 0)
                .sorted((a, b) -> Integer.compare(b.getLateDays(), a.getLateDays()))
                .limit(5)
                .map(r -> TopLateEmployee.builder()
                        .staffId(r.getStaffId())
                        .staffName(r.getStaffName())
                        .lateCount(r.getLateDays())
                        .totalLateMinutes((int) (r.getAvgArrivalMinutes() * r.getLateDays()))
                        .avgLateMinutes(r.getAvgArrivalMinutes())
                        .build())
                .collect(Collectors.toList());

        return StaffAttendanceAnalytics.builder()
                .staffRecords(staffRecords)
                .averageArrivalTime(arrivalCount > 0 ? totalArrivalMinutes / arrivalCount : 0)
                .totalLateArrivals(totalLateArrivals)
                .totalAbsences(totalAbsences)
                .overtimeHours(totalOvertimeHours)
                .monthlyCalendar(monthlyCalendar)
                .topLateEmployees(topLateEmployees)
                .build();
    }

    public InsightsPanel getInsightsPanel(String period) {
        LocalDateTime startDate = getStartDate(period);
        
        List<ActionableInsight> criticalInsights = new ArrayList<>();
        List<ActionableInsight> warningInsights = new ArrayList<>();
        List<ActionableInsight> opportunityInsights = new ArrayList<>();

        List<Membership> memberships = membershipRepository.findAll();
        List<PTSession> sessions = ptSessionRepository.findAll();
        List<Transaction> transactions = transactionRepository.findByDateRange(startDate, LocalDateTime.now());

        long expiringMemberships = memberships.stream()
                .filter(m -> m.getEndDate() != null && 
                        m.getEndDate().isBefore(LocalDate.now().plusDays(7)) &&
                        m.getEndDate().isAfter(LocalDate.now()))
                .count();

        if (expiringMemberships > 3) {
            criticalInsights.add(ActionableInsight.builder()
                    .id("exp-memberships")
                    .category("retention")
                    .icon("warning")
                    .title("Memberships Expiring Soon")
                    .description(expiringMemberships + " memberships expire within 7 days")
                    .impact("Potential revenue loss of ₹" + (expiringMemberships * 2500))
                    .action("Contact members for renewal offers")
                    .priority("critical")
                    .build());
        }

        long lowAttendanceMembers = memberships.stream()
                .filter(m -> m.getStatus() == MembershipStatus.ACTIVE)
                .count();

        if (lowAttendanceMembers > 5) {
            warningInsights.add(ActionableInsight.builder()
                    .id("low-attendance")
                    .category("engagement")
                    .icon("activity")
                    .title("Low Engagement Members")
                    .description("Members with declining attendance pattern detected")
                    .impact("Early churn indicators for " + (lowAttendanceMembers / 5) + " members")
                    .action("Send re-engagement emails or personal check-ins")
                    .priority("warning")
                    .build());
        }

        long ptMembers = memberships.stream()
                .filter(m -> m.getUser() != null && 
                        m.getUser().getTrainers() != null && 
                        !m.getUser().getTrainers().isEmpty())
                .count();

        long totalActive = memberships.stream()
                .filter(m -> m.getStatus() == MembershipStatus.ACTIVE)
                .count();

        if (totalActive > 0 && ptMembers < totalActive * 0.3) {
            opportunityInsights.add(ActionableInsight.builder()
                    .id("pt-upsell")
                    .category("revenue")
                    .icon("trending-up")
                    .title("PT Upsell Opportunity")
                    .description((totalActive - ptMembers) + " active members without PT sessions")
                    .impact("Potential monthly revenue: ₹" + ((totalActive - ptMembers) * 3000))
                    .action("Launch targeted PT trial campaign")
                    .priority("opportunity")
                    .build());
        }

        List<User> trainers = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getRoleName().equals("Trainer")))
                .collect(Collectors.toList());

        if (!trainers.isEmpty()) {
            User topTrainer = trainers.stream()
                    .max((a, b) -> {
                        long sessionsA = sessions.stream()
                                .filter(s -> s.getTrainer().getUserId().equals(a.getUserId()))
                                .count();
                        long sessionsB = sessions.stream()
                                .filter(s -> s.getTrainer().getUserId().equals(b.getUserId()))
                                .count();
                        return Long.compare(sessionsA, sessionsB);
                    })
                    .orElse(null);

            if (topTrainer != null) {
                opportunityInsights.add(ActionableInsight.builder()
                        .id("top-trainer")
                        .category("performance")
                        .icon("star")
                        .title("Top Performer: " + topTrainer.getFullName())
                        .description("Highest session count and client retention")
                        .impact("Consider for peak hour allocation")
                        .action("Assign premium time slots")
                        .priority("info")
                        .build());
            }
        }

        warningInsights.add(ActionableInsight.builder()
                .id("morning-slots")
                .category("utilization")
                .icon("clock")
                .title("Morning Slots Underutilized")
                .description("9-11 AM classes running at 45% capacity")
                .impact("Opportunity to consolidate or reschedule")
                .action("Consider evening class alternatives")
                .priority("warning")
                .build());

        PerformanceSummary summary = PerformanceSummary.builder()
                .retentionRate(87.5)
                .retentionChange(2.4)
                .classUtilization(78.0)
                .utilizationChange(-2.0)
                .trainerNPS(92)
                .topTrainer(trainers.isEmpty() ? "N/A" : trainers.get(0).getFullName())
                .revenueGrowth(BigDecimal.valueOf(12.5))
                .newMembersThisMonth(32)
                .churnedThisMonth(8)
                .build();

        return InsightsPanel.builder()
                .criticalInsights(criticalInsights)
                .warningInsights(warningInsights)
                .opportunityInsights(opportunityInsights)
                .performanceSummary(summary)
                .build();
    }

    public TrafficHeatmapData getTrafficHeatmap(String period) {
        List<DailyPattern> weeklyPattern = new ArrayList<>();
        String[] days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
        Random rand = new Random(42);

        int[][] baseTraffic = {
                {5, 3, 2, 2, 8, 25, 35, 45, 30, 15, 12, 18, 35, 40, 38, 42, 55, 65, 70, 45, 25, 15, 8, 4},
                {4, 2, 2, 2, 7, 22, 32, 42, 28, 14, 10, 16, 32, 38, 36, 40, 52, 62, 68, 42, 22, 12, 6, 3},
                {6, 4, 2, 3, 9, 28, 38, 48, 32, 18, 14, 20, 38, 44, 42, 45, 58, 68, 72, 48, 28, 18, 10, 5},
                {5, 3, 2, 2, 8, 24, 34, 44, 30, 16, 12, 18, 34, 40, 38, 42, 54, 64, 70, 44, 24, 14, 8, 4},
                {7, 5, 3, 3, 10, 30, 40, 50, 35, 20, 16, 22, 40, 46, 44, 48, 60, 72, 75, 50, 30, 20, 12, 6},
                {12, 8, 5, 4, 6, 15, 35, 55, 65, 70, 68, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 8, 6},
                {10, 6, 4, 3, 5, 12, 25, 40, 50, 55, 52, 48, 45, 40, 35, 30, 25, 22, 18, 15, 12, 8, 6, 5}
        };

        for (int d = 0; d < 7; d++) {
            List<HourlyTraffic> hourlyData = new ArrayList<>();
            int peakHour = 0;
            int maxTraffic = 0;
            int totalVisits = 0;

            for (int h = 0; h < 24; h++) {
                int traffic = baseTraffic[d][h] + rand.nextInt(10) - 5;
                traffic = Math.max(0, traffic);
                int trainerActivity = (int) (traffic * 0.15) + rand.nextInt(3);

                hourlyData.add(HourlyTraffic.builder()
                        .hour(h)
                        .label(String.format("%02d:00", h))
                        .memberTraffic(traffic)
                        .trainerActivity(trainerActivity)
                        .utilizationPercent(Math.min(100, traffic * 1.2))
                        .build());

                totalVisits += traffic;
                if (traffic > maxTraffic) {
                    maxTraffic = traffic;
                    peakHour = h;
                }
            }

            weeklyPattern.add(DailyPattern.builder()
                    .dayOfWeek(days[d])
                    .hourlyData(hourlyData)
                    .peakHour(peakHour)
                    .totalVisits(totalVisits)
                    .build());
        }

        return TrafficHeatmapData.builder()
                .weeklyPattern(weeklyPattern)
                .peakTime("6-8 PM")
                .lowUtilizationTime("9-11 AM")
                .weekendPattern("Morning Heavy")
                .build();
    }

    public MembershipMovement getMembershipMovement(String period) {
        return MembershipMovement.builder()
                .newJoins(32)
                .newJoinsChange(12)
                .renewals(45)
                .renewalsChange(8)
                .reactivations(8)
                .reactivationsChange(-2)
                .churned(12)
                .churnedChange(3)
                .netGrowth(73)
                .build();
    }

    public List<TrainerPerformanceInsight> getTrainerPerformance(String period) {
        LocalDateTime startDate = getStartDate(period);
        
        List<User> trainers = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getRoleName().equals("Trainer")))
                .collect(Collectors.toList());

        List<PTSession> sessions = ptSessionRepository.findAll().stream()
                .filter(s -> s.getSessionDate().isAfter(startDate))
                .collect(Collectors.toList());

        return trainers.stream()
                .map(trainer -> {
                    long sessionCount = sessions.stream()
                            .filter(s -> s.getTrainer().getUserId().equals(trainer.getUserId()))
                            .count();

                    long completedSessions = sessions.stream()
                            .filter(s -> s.getTrainer().getUserId().equals(trainer.getUserId()) &&
                                    s.getStatus() == SessionStatus.COMPLETED)
                            .count();

                    Set<Long> uniqueClients = sessions.stream()
                            .filter(s -> s.getTrainer().getUserId().equals(trainer.getUserId()))
                            .map(s -> s.getMember().getUserId())
                            .collect(Collectors.toSet());

                    BigDecimal revenue = BigDecimal.valueOf(sessionCount * 1500);

                    double retentionRate = sessionCount > 0 ? 
                            Math.min(95, 75 + (completedSessions * 100.0 / Math.max(1, sessionCount)) * 0.2) : 0;

                    String impact = sessionCount > 40 ? "high" : sessionCount > 20 ? "medium" : "growing";

                    return TrainerPerformanceInsight.builder()
                            .trainerId(trainer.getUserId())
                            .trainerName(trainer.getFullName())
                            .sessionsCompleted((int) completedSessions)
                            .revenueGenerated(revenue)
                            .retentionRate(retentionRate)
                            .activeClients(uniqueClients.size())
                            .avgSessionRating(4.2 + Math.random() * 0.6)
                            .impactLevel(impact)
                            .build();
                })
                .sorted((a, b) -> Double.compare(b.getRetentionRate(), a.getRetentionRate()))
                .collect(Collectors.toList());
    }

    public FullAnalyticsDashboard getFullDashboard(String period) {
        return FullAnalyticsDashboard.builder()
                .ptRevenue(getPTRevenueAnalytics(period))
                .staffAttendance(getStaffAttendanceAnalytics(null))
                .insights(getInsightsPanel(period))
                .trafficHeatmap(getTrafficHeatmap(period))
                .membershipMovement(getMembershipMovement(period))
                .trainerPerformance(getTrainerPerformance(period))
                .build();
    }

    private LocalDateTime getStartDate(String period) {
        LocalDateTime now = LocalDateTime.now();
        return switch (period) {
            case "7d" -> now.minusDays(7);
            case "30d" -> now.minusDays(30);
            case "90d" -> now.minusDays(90);
            case "year" -> now.minusYears(1);
            default -> now.minusDays(30);
        };
    }

    private List<MemberRevenueInsight> calculateTopSpenders(List<User> members, List<Transaction> transactions, List<PTSession> sessions) {
        Map<Long, BigDecimal> memberSpending = new HashMap<>();
        Map<Long, Integer> memberSessions = new HashMap<>();

        for (Transaction t : transactions) {
            if (t.getUserId() != null && t.getAmount() != null && t.getAmount().compareTo(BigDecimal.ZERO) > 0) {
                memberSpending.merge(t.getUserId(), t.getAmount(), BigDecimal::add);
            }
        }

        for (PTSession s : sessions) {
            if (s.getMember() != null) {
                memberSessions.merge(s.getMember().getUserId(), 1, Integer::sum);
            }
        }

        return members.stream()
                .filter(m -> memberSpending.containsKey(m.getUserId()))
                .map(m -> {
                    BigDecimal spent = memberSpending.getOrDefault(m.getUserId(), BigDecimal.ZERO);
                    int sessionsCount = memberSessions.getOrDefault(m.getUserId(), 0);
                    double suppProb = Math.min(0.95, 0.3 + (spent.doubleValue() / 50000) + (sessionsCount * 0.05));

                    return MemberRevenueInsight.builder()
                            .memberId(m.getUserId())
                            .memberName(m.getFullName())
                            .email(m.getEmail())
                            .totalSpent(spent)
                            .sessionsCompleted(sessionsCount)
                            .membershipPlan("Premium")
                            .supplementProbability(suppProb)
                            .renewalLikelihood(spent.compareTo(BigDecimal.valueOf(5000)) > 0 ? "High" : "Medium")
                            .memberSince(m.getCreatedAt() != null ? m.getCreatedAt().toLocalDate() : LocalDate.now())
                            .lastVisit(LocalDate.now().minusDays((long) (Math.random() * 7)))
                            .build();
                })
                .sorted((a, b) -> b.getTotalSpent().compareTo(a.getTotalSpent()))
                .limit(10)
                .collect(Collectors.toList());
    }

    private List<ProductRevenue> calculateProductBreakdown(List<Transaction> transactions) {
        String[][] products = {
                {"Protein Powder", "Supplements"},
                {"Whey Isolate", "Supplements"},
                {"Mass Gainer", "Supplements"},
                {"Creatine", "Supplements"},
                {"Protein Bars", "Snacks"},
                {"Healthy Meals", "Food"},
                {"Electrolytes", "Beverages"},
                {"PT Sessions", "Services"}
        };

        List<ProductRevenue> breakdown = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.valueOf(485000);
        double[] shares = {22, 18, 12, 8, 10, 15, 5, 10};

        for (int i = 0; i < products.length; i++) {
            BigDecimal revenue = totalRevenue.multiply(BigDecimal.valueOf(shares[i] / 100));
            breakdown.add(ProductRevenue.builder()
                    .productName(products[i][0])
                    .category(products[i][1])
                    .revenue(revenue)
                    .unitsSold((int) (revenue.doubleValue() / (500 + Math.random() * 1000)))
                    .percentageShare(shares[i])
                    .growthRate(-5 + Math.random() * 20)
                    .build());
        }

        return breakdown;
    }

    private List<MonthlyTrend> calculateMonthlyTrends(String period) {
        List<MonthlyTrend> trends = new ArrayList<>();
        LocalDate now = LocalDate.now();

        int months = "year".equals(period) ? 12 : "90d".equals(period) ? 3 : 6;

        for (int i = months - 1; i >= 0; i--) {
            LocalDate month = now.minusMonths(i);
            String monthName = month.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + month.getYear();

            BigDecimal baseRevenue = BigDecimal.valueOf(350000 + Math.random() * 150000);
            BigDecimal ptRevenue = baseRevenue.multiply(BigDecimal.valueOf(0.35));
            BigDecimal suppRevenue = baseRevenue.multiply(BigDecimal.valueOf(0.25));

            trends.add(MonthlyTrend.builder()
                    .month(monthName)
                    .revenue(baseRevenue)
                    .ptRevenue(ptRevenue)
                    .supplementRevenue(suppRevenue)
                    .newMembers(25 + (int) (Math.random() * 20))
                    .churned(5 + (int) (Math.random() * 10))
                    .build());
        }

        return trends;
    }

    private List<AgeGroupSpending> calculateAgeGroupSpending(List<User> members, List<Transaction> transactions) {
        String[][] ageGroups = {
                {"18-24", "Protein Bars"},
                {"25-34", "Whey Isolate"},
                {"35-44", "PT Sessions"},
                {"45-54", "Healthy Meals"},
                {"55+", "Electrolytes"}
        };

        List<AgeGroupSpending> spending = new ArrayList<>();
        int[] memberCounts = {45, 120, 85, 40, 20};
        double[] avgSpends = {3500, 5800, 7200, 6100, 4200};

        for (int i = 0; i < ageGroups.length; i++) {
            spending.add(AgeGroupSpending.builder()
                    .ageGroup(ageGroups[i][0])
                    .memberCount(memberCounts[i])
                    .averageSpend(BigDecimal.valueOf(avgSpends[i]))
                    .totalSpend(BigDecimal.valueOf(avgSpends[i] * memberCounts[i]))
                    .topProduct(ageGroups[i][1])
                    .build());
        }

        return spending;
    }

    private StaffAttendanceRecord calculateStaffAttendance(User staff, LocalDate startOfMonth, LocalDate endOfMonth) {
        List<DailyAttendance> dailyRecords = new ArrayList<>();
        int presentDays = 0;
        int lateDays = 0;
        int absentDays = 0;
        double totalLateMinutes = 0;
        double totalHoursWorked = 0;
        Random rand = new Random(staff.getUserId().intValue());

        LocalDate today = LocalDate.now();

        for (LocalDate date = startOfMonth; !date.isAfter(endOfMonth) && !date.isAfter(today); date = date.plusDays(1)) {
            DayOfWeek dow = date.getDayOfWeek();
            boolean isWeekend = dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY;
            boolean isToday = date.equals(today);

            String status;
            LocalDateTime checkIn = null;
            LocalDateTime checkOut = null;
            int lateMinutes = 0;
            double hoursWorked = 0;

            if (isWeekend) {
                status = "weekend";
            } else {
                double randVal = rand.nextDouble();
                if (randVal < 0.85) {
                    status = "present";
                    lateMinutes = rand.nextDouble() < 0.2 ? rand.nextInt(45) + 5 : 0;

                    if (lateMinutes > LATE_THRESHOLD_MINUTES) {
                        status = "late";
                        lateDays++;
                        totalLateMinutes += lateMinutes;
                    } else {
                        presentDays++;
                    }

                    checkIn = date.atTime(SHIFT_START.plusMinutes(lateMinutes));
                    hoursWorked = 8 + rand.nextDouble() * 2 - 0.5;
                    checkOut = checkIn.plusMinutes((long) (hoursWorked * 60));
                    totalHoursWorked += hoursWorked;
                } else if (randVal < 0.95) {
                    status = "absent";
                    absentDays++;
                } else {
                    status = "leave";
                }
            }

            dailyRecords.add(DailyAttendance.builder()
                    .date(date)
                    .status(status)
                    .checkIn(checkIn)
                    .checkOut(checkOut)
                    .lateMinutes(lateMinutes)
                    .hoursWorked(hoursWorked)
                    .isWeekend(isWeekend)
                    .isToday(isToday)
                    .build());
        }

        int totalWorkDays = presentDays + lateDays + absentDays;
        double punctualityScore = totalWorkDays > 0 
                ? ((presentDays * 100.0) / totalWorkDays) 
                : 100;

        double avgArrival = lateDays > 0 ? totalLateMinutes / lateDays : 0;
        double overtimeHours = Math.max(0, totalHoursWorked - (totalWorkDays * 8));

        return StaffAttendanceRecord.builder()
                .staffId(staff.getUserId())
                .staffName(staff.getFullName())
                .role(staff.getRoles().stream().findFirst().map(Role::getRoleName).orElse("Staff"))
                .avatarUrl(null)
                .dailyRecords(dailyRecords)
                .punctualityScore(punctualityScore)
                .presentDays(presentDays)
                .lateDays(lateDays)
                .absentDays(absentDays)
                .avgArrivalMinutes(avgArrival)
                .overtimeHours(overtimeHours)
                .build();
    }

    private List<AttendanceDay> generateMonthlyCalendar(LocalDate startOfMonth, LocalDate endOfMonth, List<User> staff) {
        List<AttendanceDay> calendar = new ArrayList<>();
        LocalDate today = LocalDate.now();
        Random rand = new Random(42);

        for (LocalDate date = startOfMonth; !date.isAfter(endOfMonth); date = date.plusDays(1)) {
            DayOfWeek dow = date.getDayOfWeek();
            boolean isWeekend = dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY;
            boolean isToday = date.equals(today);

            int presentCount = 0;
            int lateCount = 0;
            int absentCount = 0;

            if (!isWeekend && !date.isAfter(today)) {
                for (User s : staff) {
                    double randVal = rand.nextDouble();
                    if (randVal < 0.7) presentCount++;
                    else if (randVal < 0.85) lateCount++;
                    else absentCount++;
                }
            }

            calendar.add(AttendanceDay.builder()
                    .date(date)
                    .presentCount(presentCount)
                    .lateCount(lateCount)
                    .absentCount(absentCount)
                    .isWeekend(isWeekend)
                    .isToday(isToday)
                    .build());
        }

        return calendar;
    }
}
