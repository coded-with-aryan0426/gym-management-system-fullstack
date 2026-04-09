package com.gym.management.service;

import com.gym.management.model.CheckIn;
import com.gym.management.model.CheckInMethod;
import com.gym.management.model.CheckInStatus;
import com.gym.management.model.User;
import com.gym.management.repository.CheckInRepository;
import com.gym.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired
    private CheckInRepository checkInRepository;

    @Autowired
    private UserRepository userRepository;

    public record CheckInResult(boolean success, String message, CheckIn checkIn) {}

    @Transactional
    public CheckInResult validateAndCheckIn(Long userId, Long gymId, CheckInMethod method,
                                            String deviceInfo, String ipAddress,
                                            Long operatorUserId, String notes) {
        if (userId == null) {
            return new CheckInResult(false, "User ID is required", null);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().plusDays(1).atStartOfDay();

        Optional<CheckIn> existing = checkInRepository.findActiveCheckInByUserIdAndDate(
                userId, startOfDay, endOfDay);
        if (existing.isPresent()) {
            CheckIn active = existing.get();
            return new CheckInResult(false,
                    "Member is already checked in since " +
                            active.getCheckInTime().toLocalTime().toString(),
                    active);
        }

        CheckIn checkIn = new CheckIn(user);
        checkIn.setCheckInMethod(method != null ? method : CheckInMethod.MANUAL);
        checkIn.setDeviceInfo(deviceInfo);
        checkIn.setIpAddress(ipAddress);
        checkIn.setOperatorUserId(operatorUserId);
        checkIn.setNotes(notes);
        checkIn.setStatus(CheckInStatus.ACTIVE);

        CheckIn saved = checkInRepository.save(checkIn);
        return new CheckInResult(true, "Checked in successfully", saved);
    }

    @Transactional
    public CheckInResult checkOut(Long checkInId, Long operatorUserId) {
        CheckIn checkIn = checkInRepository.findById(checkInId)
                .orElseThrow(() -> new RuntimeException("Check-in record not found: " + checkInId));

        if (checkIn.getCheckOutTime() != null) {
            return new CheckInResult(false, "Member has already checked out", checkIn);
        }

        checkIn.checkOut();
        if (operatorUserId != null) {
            checkIn.setOperatorUserId(operatorUserId);
        }
        CheckIn saved = checkInRepository.save(checkIn);
        return new CheckInResult(true, "Checked out successfully", saved);
    }

    public List<Map<String, Object>> getTodayAttendance(Long gymId, String role, int page, int size) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        Page<CheckIn> paged = checkInRepository.findByGymIdAndDateRangePaginated(
                gymId, startOfDay, LocalDateTime.now(), Pageable.ofSize(size).withPage(page));

        return paged.getContent().stream()
                .filter(c -> role == null || role.equalsIgnoreCase("all") || hasRole(c.getUser(), role))
                .map(this::toCheckInMap)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getLiveAttendance(Long gymId, String role) {
        List<CheckIn> active = gymId != null
                ? checkInRepository.findActiveCheckInsByGymId(gymId)
                : checkInRepository.findActiveCheckIns();

        return active.stream()
                .filter(c -> role == null || role.equalsIgnoreCase("all") || hasRole(c.getUser(), role))
                .map(c -> {
                    Map<String, Object> map = toCheckInMap(c);
                    map.put("minutesSince", ChronoUnit.MINUTES.between(c.getCheckInTime(), LocalDateTime.now()));
                    return map;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> getStats(Long gymId, String role) {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime startOfWeek = LocalDate.now().minusDays(7).atStartOfDay();
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        List<CheckIn> todayCheckIns = filterByRole(fetchTodayCheckIns(startOfToday, gymId), role);
        List<CheckIn> weekCheckIns = filterByRole(fetchRangeCheckIns(startOfWeek, LocalDateTime.now(), gymId), role);
        List<CheckIn> monthCheckIns = filterByRole(fetchRangeCheckIns(startOfMonth, LocalDateTime.now(), gymId), role);
        List<CheckIn> liveCheckIns = filterByRole(fetchActiveCheckIns(gymId), role);

        int todayCount = todayCheckIns.size();
        int weekCount = weekCheckIns.size();
        int monthCount = monthCheckIns.size();
        int liveCount = liveCheckIns.size();

        OptionalDouble avgDuration = monthCheckIns.stream()
                .filter(c -> c.getCheckInTime() != null && c.getCheckOutTime() != null)
                .mapToLong(c -> ChronoUnit.MINUTES.between(c.getCheckInTime(), c.getCheckOutTime()))
                .average();

        Integer busiestHour = computeBusiestHour(monthCheckIns);

        LocalDate weekStart = LocalDate.now().minusWeeks(1);
        LocalDate weekEnd = LocalDate.now();
        long thisWeekMembers = gymId != null
                ? checkInRepository.countUniqueMembersForWeek(gymId, weekStart, weekEnd)
                : 0;
        long lastWeekMembers = gymId != null
                ? checkInRepository.countUniqueMembersForWeek(gymId, weekStart.minusWeeks(1), weekStart)
                : 0;
        double retentionRate = lastWeekMembers > 0
                ? (thisWeekMembers * 100.0 / lastWeekMembers) : 0.0;

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("todayCheckIns", todayCount);
        stats.put("weekCheckIns", weekCount);
        stats.put("monthCheckIns", monthCount);
        stats.put("liveNow", liveCount);
        stats.put("avgSessionMinutes", avgDuration.isPresent() ? (int) avgDuration.getAsDouble() : 0);
        stats.put("peakCapacity", 120);
        stats.put("busiestHour", busiestHour);
        stats.put("retentionRate", retentionRate);
        return stats;
    }

    public List<Map<String, Object>> getTrends(Long gymId, LocalDate from, LocalDate to, String role) {
        List<Map<String, Object>> result = new ArrayList<>();
        LocalDate current = from;

        while (!current.isAfter(to)) {
            LocalDateTime startOfDay = current.atStartOfDay();
            LocalDateTime endOfDay = current.plusDays(1).atStartOfDay();

            List<CheckIn> checkIns = filterByRole(
                    fetchRangeCheckIns(startOfDay, endOfDay, gymId), role);

            int total = checkIns.size();
            long uniqueMembers = checkIns.stream()
                    .map(c -> c.getUser().getUserId()).distinct().count();
            long checkedOut = checkIns.stream()
                    .filter(c -> c.getCheckOutTime() != null).count();

            OptionalDouble avgDuration = checkIns.stream()
                    .filter(c -> c.getCheckInTime() != null && c.getCheckOutTime() != null)
                    .mapToLong(c -> ChronoUnit.MINUTES.between(c.getCheckInTime(), c.getCheckOutTime()))
                    .average();

            Integer busiestHour = computeBusiestHour(checkIns);

            Map<String, Object> day = new LinkedHashMap<>();
            day.put("date", current.toString());
            day.put("day", current.getDayOfWeek().toString().substring(0, 3));
            day.put("checkIns", total);
            day.put("uniqueMembers", uniqueMembers);
            day.put("checkedOut", checkedOut);
            day.put("avgDurationMinutes", avgDuration.isPresent() ? (int) avgDuration.getAsDouble() : 0);
            day.put("peakHour", busiestHour != null ? busiestHour : 18);
            result.add(day);
            current = current.plusDays(1);
        }
        return result;
    }

    public List<Map<String, Object>> getHeatmap(Long gymId, int weeks, String role) {
        LocalDateTime from = LocalDate.now().minusWeeks(weeks).atStartOfDay();
        LocalDateTime to = LocalDateTime.now();

        List<CheckIn> checkIns = filterByRole(
                fetchRangeCheckIns(from, to, gymId), role);

        Map<String, Long> counts = checkIns.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getCheckInTime().getDayOfWeek().getValue() + "_" + c.getCheckInTime().getHour(),
                        Collectors.counting()));

        List<Map<String, Object>> result = new ArrayList<>();
        String[] days = { "MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN" };

        for (int dow = 1; dow <= 7; dow++) {
            for (int hour = 5; hour <= 23; hour++) {
                String key = dow + "_" + hour;
                long count = counts.getOrDefault(key, 0L);

                Map<String, Object> cell = new HashMap<>();
                cell.put("day", days[dow - 1]);
                cell.put("hour", hour);
                cell.put("count", count);
                result.add(cell);
            }
        }
        return result;
    }

    public List<Map<String, Object>> getMemberHistory(Long userId, LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();
        List<CheckIn> checkIns = checkInRepository.findByUserUserIdAndDateRange(userId, start, end);
        return checkIns.stream().map(this::toCheckInMap).collect(Collectors.toList());
    }

    public Map<String, Object> getMemberStreak(Long userId) {
        List<CheckIn> allCheckIns = checkInRepository.findCompletedCheckInsByUserId(userId);

        int currentStreak = computeCurrentStreak(allCheckIns);
        int longestStreak = computeLongestStreak(allCheckIns);

        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        int visitsThisMonth = (int) allCheckIns.stream()
                .filter(c -> !c.getCheckInTime().isBefore(startOfMonth))
                .count();

        Map<String, Object> streak = new LinkedHashMap<>();
        streak.put("currentStreak", currentStreak);
        streak.put("longestStreak", longestStreak);
        streak.put("visitsThisMonth", visitsThisMonth);
        streak.put("totalVisits", allCheckIns.size());
        return streak;
    }

    public List<Map<String, Object>> getTrainerMembersAttendance(Long trainerId,
                                                                  LocalDate from, LocalDate to) {
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
        Set<User> assignedMembers = trainer.getCustomers();
        if (assignedMembers == null) assignedMembers = new HashSet<>();
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();

        return assignedMembers.stream().map(member -> {
            List<CheckIn> memberCheckIns = checkInRepository.findByUserUserIdAndDateRange(
                    member.getUserId(), start, end);

            CheckIn lastCheckIn = memberCheckIns.stream()
                    .max(Comparator.comparing(CheckIn::getCheckInTime)).orElse(null);
            boolean isInside = memberCheckIns.stream()
                    .anyMatch(c -> c.getStatus() == CheckInStatus.ACTIVE);

            int streak = computeCurrentStreak(
                    checkInRepository.findCompletedCheckInsByUserId(member.getUserId()));
            int monthVisits = (int) memberCheckIns.stream()
                    .filter(c -> !c.getCheckInTime().isBefore(LocalDate.now().withDayOfMonth(1).atStartOfDay()))
                    .count();

            Map<String, Object> map = new LinkedHashMap<>();
            map.put("memberId", member.getUserId());
            map.put("memberName", member.getFullName());
            map.put("email", member.getEmail());
            map.put("avatarUrl", member.getAvatarId());
            map.put("lastVisit", lastCheckIn != null ? lastCheckIn.getCheckInTime().toString() : null);
            map.put("visitsThisMonth", monthVisits);
            map.put("currentStreak", streak);
            map.put("isInside", isInside);
            map.put("checkInTime", isInside && lastCheckIn != null
                    ? lastCheckIn.getCheckInTime().toString() : null);
            return map;
        }).collect(Collectors.toList());
    }

    // ── Internal helpers ────────────────────────────────────────────────────────

    private List<CheckIn> fetchTodayCheckIns(LocalDateTime startOfDay, Long gymId) {
        return gymId != null
                ? checkInRepository.findTodayCheckIns(startOfDay, gymId)
                : checkInRepository.findTodayCheckIns(startOfDay);
    }

    private List<CheckIn> fetchRangeCheckIns(LocalDateTime start, LocalDateTime end, Long gymId) {
        return gymId != null
                ? checkInRepository.findCheckInsForDateRange(start, end, gymId)
                : checkInRepository.findCheckInsForDateRange(start, end);
    }

    private List<CheckIn> fetchActiveCheckIns(Long gymId) {
        return gymId != null
                ? checkInRepository.findActiveCheckInsByGymId(gymId)
                : checkInRepository.findActiveCheckIns();
    }

    private List<CheckIn> filterByRole(List<CheckIn> checkIns, String role) {
        if (role == null || role.equalsIgnoreCase("all")) return checkIns;
        return checkIns.stream()
                .filter(c -> hasRole(c.getUser(), role))
                .collect(Collectors.toList());
    }

    private boolean hasRole(User user, String roleName) {
        if (user == null || roleName == null) return false;
        return user.getRoles().stream()
                .anyMatch(r -> r.getRoleName().equalsIgnoreCase(roleName) ||
                        r.getRoleName().equalsIgnoreCase("ROLE_" + roleName));
    }

    private Integer computeBusiestHour(List<CheckIn> checkIns) {
        if (checkIns.isEmpty()) return null;
        Map<Integer, Long> hourCounts = checkIns.stream()
                .collect(Collectors.groupingBy(c -> c.getCheckInTime().getHour(), Collectors.counting()));
        return hourCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey).orElse(null);
    }

    private int computeCurrentStreak(List<CheckIn> checkIns) {
        if (checkIns.isEmpty()) return 0;
        Set<LocalDate> visitedDates = checkIns.stream()
                .map(c -> c.getCheckInTime().toLocalDate())
                .collect(Collectors.toSet());

        int streak = 0;
        LocalDate date = LocalDate.now();
        while (visitedDates.contains(date) || (streak == 0 && visitedDates.contains(date.minusDays(1)))) {
            if (visitedDates.contains(date)) streak++;
            date = date.minusDays(1);
            if (!visitedDates.contains(date) && streak > 0) break;
        }
        return streak;
    }

    private int computeLongestStreak(List<CheckIn> checkIns) {
        if (checkIns.isEmpty()) return 0;
        Set<LocalDate> visitedDates = checkIns.stream()
                .map(c -> c.getCheckInTime().toLocalDate())
                .collect(Collectors.toSet());

        List<LocalDate> sorted = visitedDates.stream().sorted().collect(Collectors.toList());
        int maxStreak = 1;
        int current = 1;
        for (int i = 1; i < sorted.size(); i++) {
            if (sorted.get(i).equals(sorted.get(i - 1).plusDays(1))) {
                current++;
                maxStreak = Math.max(maxStreak, current);
            } else {
                current = 1;
            }
        }
        return maxStreak;
    }

    private Map<String, Object> toCheckInMap(CheckIn c) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("checkInId", c.getCheckInId());
        map.put("userId", c.getUser() != null ? c.getUser().getUserId() : null);
        map.put("memberId", c.getUser() != null ? c.getUser().getUserId() : null);
        map.put("memberName", c.getUser() != null ? c.getUser().getFullName() : null);
        map.put("email", c.getUser() != null ? c.getUser().getEmail() : null);
        map.put("checkInTime", c.getCheckInTime());
        map.put("checkOutTime", c.getCheckOutTime());
        map.put("status", c.getStatus() != null ? c.getStatus().name() : null);
        map.put("checkInMethod", c.getCheckInMethod() != null ? c.getCheckInMethod().name() : null);
        map.put("method", c.getCheckInMethod() != null ? c.getCheckInMethod().name() : null);
        map.put("deviceInfo", c.getDeviceInfo());
        map.put("ipAddress", c.getIpAddress());
        map.put("operatorUserId", c.getOperatorUserId());
        map.put("notes", c.getNotes());
        map.put("role", c.getUser() != null ? getPrimaryRole(c.getUser()) : null);
        if (c.getCheckInTime() != null && c.getCheckOutTime() != null) {
            map.put("durationMinutes", ChronoUnit.MINUTES.between(c.getCheckInTime(), c.getCheckOutTime()));
        } else {
            map.put("durationMinutes", null);
        }
        return map;
    }

    private String getPrimaryRole(User user) {
        if (user.getRoles() == null || user.getRoles().isEmpty()) return "MEMBER";
        return user.getRoles().iterator().next().getRoleName().replace("ROLE_", "");
    }
}
