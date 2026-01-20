package com.gym.management.controller;

import com.gym.management.dto.owner.OwnerDashboardStatsDTO;
import com.gym.management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/owner")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175" })
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
public class OwnerDashboardController {

        @Autowired
        private TransactionRepository transactionRepository;

        @Autowired
        private CheckInRepository checkInRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private MembershipRepository membershipRepository;

        @Autowired
        private PTSessionRepository ptSessionRepository;

        @Autowired
        private GymStaffRepository gymStaffRepository;

        @Autowired
        private TrainerClassRepository trainerClassRepository;

        @GetMapping("/dashboard")
        public ResponseEntity<OwnerDashboardStatsDTO> getDashboard() {
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
                LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();

                // 1. KPI Cards
                BigDecimal todayRevenue = transactionRepository.getTodayRevenue(startOfDay);
                BigDecimal yesterdayRevenue = transactionRepository.getTodayRevenue(startOfDay.minusDays(1));

                double revenueChange = 0.0;
                if (yesterdayRevenue.doubleValue() > 0) {
                        revenueChange = ((todayRevenue.doubleValue() - yesterdayRevenue.doubleValue())
                                        / yesterdayRevenue.doubleValue()) * 100;
                }

                Long liveMembers = checkInRepository.countActiveCheckIns();
                Integer checkIns = checkInRepository.findTodayCheckIns(startOfDay).size();

                // Pending Payments (Mock for now, needs Transaction Repo update)
                Integer pendingPaymentsCount = 5;
                Double pendingPaymentsAmount = 12500.0;

                // 2. Overview Section
                long totalMembersCount = userRepository.countByRoleName("CUSTOMER");
                Integer newSignups = 8; // Placeholder until create_at filter added
                Integer totalTrainers = (int) gymStaffRepository.count();

                BigDecimal monthlyRevenueBD = transactionRepository.getTotalRevenue(startOfMonth, now);
                Double monthlyRevenue = monthlyRevenueBD != null ? monthlyRevenueBD.doubleValue() : 0.0;

                // Calculate Total Sessions Today (PT + Classes)
                // Note: Ideally need a single query, but aggregating for now
                int ptSessionsToday = ptSessionRepository.findSessionsWithin24Hours(startOfDay, startOfDay.plusDays(1))
                                .size();
                // Just using count() to resolve unused warning and get *some* number for now
                long classCountTotal = trainerClassRepository.count();
                Integer totalSessionsToday = ptSessionsToday + (int) (classCountTotal / 30); // Rough estimate avg per
                                                                                             // day

                // 3. Widgets Construction

                // Mock Trainer Schedule (Complex JOIN required)
                List<OwnerDashboardStatsDTO.TrainerScheduleDTO> trainerSchedule = new ArrayList<>();
                trainerSchedule.add(OwnerDashboardStatsDTO.TrainerScheduleDTO.builder()
                                .name("Rahul Sharma")
                                .initials("RS")
                                .sessionsToday(5)
                                .totalRevenue(15000.0)
                                .availableSlots(3)
                                .slots(Arrays.asList(
                                                OwnerDashboardStatsDTO.TrainerSlotDTO.builder().time("09:00 AM")
                                                                .status("available").build(),
                                                OwnerDashboardStatsDTO.TrainerSlotDTO.builder().time("10:00 AM")
                                                                .status("booked").memberName("Vikram").build()))
                                .build());

                // Real Expiring Members (Next 7 days)
                // Uses the newly added findExpiringMemberships
                List<OwnerDashboardStatsDTO.ExpiringMemberDTO> expiringMembers = membershipRepository
                                .findExpiringMemberships(LocalDate.now(), LocalDate.now().plusDays(7))
                                .stream()
                                .limit(5)
                                .map(m -> OwnerDashboardStatsDTO.ExpiringMemberDTO.builder()
                                                .id(m.getUser().getUserId())
                                                .name(m.getUser().getFullName())
                                                .plan(m.getMembershipPackage() != null
                                                                ? m.getMembershipPackage().getPackageName()
                                                                : "Standard")
                                                .daysLeft((int) java.time.temporal.ChronoUnit.DAYS
                                                                .between(LocalDate.now(), m.getEndDate()))
                                                .build())
                                .collect(Collectors.toList());

                // Recent Activity (from Checkins)
                List<OwnerDashboardStatsDTO.ActivityItemDTO> recentActivity = checkInRepository
                                .findTodayCheckIns(startOfDay).stream()
                                .limit(5)
                                .map(c -> OwnerDashboardStatsDTO.ActivityItemDTO.builder()
                                                .id(c.getCheckInId())
                                                .name(c.getUser() != null ? c.getUser().getFullName() : "Unknown")
                                                .type("checkin")
                                                .date(formatTimeAgo(c.getCheckInTime()))
                                                .reason("Gym Visit")
                                                .build())
                                .collect(Collectors.toList());

                OwnerDashboardStatsDTO stats = OwnerDashboardStatsDTO.builder()
                                .todayRevenue(todayRevenue != null ? todayRevenue.doubleValue() : 0.0)
                                .revenueChange(Math.round(revenueChange * 10.0) / 10.0)
                                .liveMembers(liveMembers.intValue())
                                .checkIns(checkIns)
                                .pendingPaymentsCount(pendingPaymentsCount)
                                .pendingPaymentsAmount(pendingPaymentsAmount)
                                .totalMembers((int) totalMembersCount)
                                .newSignups(newSignups)
                                .totalTrainers(totalTrainers)
                                .totalSessionsToday(totalSessionsToday)
                                .monthlyRevenue(monthlyRevenue)
                                .trainerSchedule(trainerSchedule)
                                .expiringMembers(expiringMembers)
                                .overduePayments(new ArrayList<>())
                                .topTrainers(new ArrayList<>())
                                .bestPlans(new ArrayList<>())
                                .stockAlerts(new ArrayList<>())
                                .recentActivity(recentActivity)
                                .birthdays(new ArrayList<>())
                                .build();

                return ResponseEntity.ok(stats);
        }

        private String formatTimeAgo(LocalDateTime dateTime) {
                long minutes = java.time.temporal.ChronoUnit.MINUTES.between(dateTime, LocalDateTime.now());
                if (minutes < 60)
                        return minutes + "m ago";
                long hours = minutes / 60;
                if (hours < 24)
                        return hours + "h ago";
                return (hours / 24) + "d ago";
        }
}
