package com.gym.management.controller;

import com.gym.management.model.Notification;
import com.gym.management.model.User;
import com.gym.management.repository.NotificationRepository;
import com.gym.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * DEV-ONLY: Seeds realistic gym notification data for testing the notification center.
 * Accessible at /api/public/seed-notifications/{userId}
 */
@RestController
@RequestMapping("/api/public")
public class NotificationSeederController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/seed-notifications/{userId}")
    public ResponseEntity<?> seedNotifications(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        List<Notification> seeded = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        // ============ PAYMENT NOTIFICATIONS ============
        seeded.add(makeNotification(user, "Payment Received - Premium Plan",
                "Monthly payment of Rs. 2,999 received from Rahul Sharma for Premium Membership. Transaction ID: TXN-20260212-4821. Payment method: UPI (PhonePe).",
                "PAYMENT", "normal", false, false, false,
                "{\"amount\":\"2999\",\"member\":\"Rahul Sharma\",\"plan\":\"Premium\",\"txnId\":\"TXN-20260212-4821\"}",
                "/members", now.minusMinutes(12)));

        seeded.add(makeNotification(user, "Payment Failed - Auto-Renewal",
                "Auto-renewal payment of Rs. 1,499 failed for Priya Patel's Basic Membership. Card ending 4523 was declined. Please contact the member to update payment method.",
                "PAYMENT", "high", false, false, false,
                "{\"amount\":\"1499\",\"member\":\"Priya Patel\",\"plan\":\"Basic\",\"reason\":\"Card declined\"}",
                "/members", now.minusMinutes(45)));

        seeded.add(makeNotification(user, "Bulk Payment Collection Complete",
                "Monthly bulk payment collection completed. 87 out of 92 payments processed successfully. 5 payments failed and require manual follow-up. Total collected: Rs. 2,34,500.",
                "PAYMENT", "normal", true, false, false,
                "{\"amount\":\"234500\",\"successful\":\"87\",\"failed\":\"5\",\"total\":\"92\"}",
                "/finance", now.minusHours(3)));

        seeded.add(makeNotification(user, "Refund Processed - Amit Kumar",
                "Refund of Rs. 999 processed for Amit Kumar. Reason: Duplicate charge on quarterly membership. Refund will reflect in 5-7 business days.",
                "PAYMENT", "normal", false, false, false,
                "{\"amount\":\"999\",\"member\":\"Amit Kumar\",\"reason\":\"Duplicate charge\"}",
                "/finance", now.minusDays(1).minusHours(2)));

        // ============ MEMBERSHIP NOTIFICATIONS ============
        seeded.add(makeNotification(user, "5 Memberships Expiring This Week",
                "The following members have memberships expiring within 7 days: Neha Gupta (Feb 14), Vikram Singh (Feb 15), Anita Desai (Feb 16), Karthik Rajan (Feb 17), Pooja Mehta (Feb 18). Send renewal reminders now to retain them.",
                "MEMBERSHIP", "urgent", false, false, false,
                "{\"count\":\"5\",\"members\":\"Neha Gupta, Vikram Singh, Anita Desai, Karthik Rajan, Pooja Mehta\"}",
                "/members", now.minusMinutes(30)));

        seeded.add(makeNotification(user, "New Member Registration - Walk-in",
                "New walk-in member registered: Deepak Verma. Plan: 3-Month Basic (Rs. 3,999). Assigned to Trainer: John Smith. Start date: Today.",
                "MEMBERSHIP", "normal", false, false, false,
                "{\"member\":\"Deepak Verma\",\"plan\":\"3-Month Basic\",\"amount\":\"3999\",\"trainer\":\"John Smith\"}",
                "/members", now.minusHours(1)));

        seeded.add(makeNotification(user, "Membership Upgrade Request",
                "Sneha Reddy has requested an upgrade from Basic to Premium plan. Current plan expires on March 15. Pro-rated upgrade cost: Rs. 1,200. Approve or reject from member profile.",
                "MEMBERSHIP", "normal", false, false, false,
                "{\"member\":\"Sneha Reddy\",\"from\":\"Basic\",\"to\":\"Premium\",\"amount\":\"1200\"}",
                "/members", now.minusHours(5)));

        seeded.add(makeNotification(user, "14 Members Haven't Visited in 2 Weeks",
                "14 active members haven't checked in for over 14 days. This is a retention risk. Consider sending a personalized re-engagement message or offering a free PT session to bring them back.",
                "MEMBERSHIP", "high", false, false, false,
                "{\"count\":\"14\",\"daysSinceVisit\":\"14+\"}",
                "/members", now.minusDays(1)));

        // ============ BOOKING NOTIFICATIONS ============
        seeded.add(makeNotification(user, "Class Fully Booked - Morning Yoga",
                "Morning Yoga class (6:00 AM - 7:00 AM) is fully booked with 25/25 slots filled. 3 members are on the waitlist. Consider adding an extra batch if demand continues.",
                "BOOKING", "normal", false, false, false,
                "{\"class\":\"Morning Yoga\",\"time\":\"6:00 AM\",\"booked\":\"25\",\"capacity\":\"25\",\"waitlist\":\"3\"}",
                "/schedule", now.minusHours(2)));

        seeded.add(makeNotification(user, "PT Session Cancelled by Member",
                "Rohan Joshi cancelled their Personal Training session scheduled for today at 4:00 PM with Trainer Sarah Jones. Reason: Personal emergency. Slot is now available for rebooking.",
                "BOOKING", "normal", false, false, false,
                "{\"member\":\"Rohan Joshi\",\"trainer\":\"Sarah Jones\",\"time\":\"4:00 PM\",\"reason\":\"Personal emergency\"}",
                "/pt-sessions", now.minusHours(4)));

        seeded.add(makeNotification(user, "Low Attendance Alert - Zumba Evening",
                "Evening Zumba class (7:00 PM) has only 4 out of 20 bookings for tomorrow. This is significantly below average (15). Consider promoting on social media or sending push notifications.",
                "BOOKING", "high", false, false, false,
                "{\"class\":\"Zumba Evening\",\"booked\":\"4\",\"capacity\":\"20\",\"average\":\"15\"}",
                "/schedule", now.minusDays(1).minusHours(6)));

        // ============ SCHEDULE NOTIFICATIONS ============
        seeded.add(makeNotification(user, "Trainer Schedule Conflict Detected",
                "Schedule conflict detected: Trainer Andrew Jones is assigned to both 'Strength Training' (Hall A) and 'CrossFit Basics' (Hall B) from 10:00 AM - 11:00 AM on Feb 14. Please resolve this conflict.",
                "SCHEDULE", "urgent", false, false, false,
                "{\"trainer\":\"Andrew Jones\",\"class1\":\"Strength Training\",\"class2\":\"CrossFit Basics\",\"time\":\"10:00 AM - 11:00 AM\",\"date\":\"Feb 14\"}",
                "/schedule", now.minusMinutes(20)));

        seeded.add(makeNotification(user, "Weekly Schedule Published",
                "The weekly class schedule for Feb 17-23 has been published. 42 classes scheduled across 3 halls. 8 PT slots still available. All trainer assignments confirmed.",
                "SCHEDULE", "normal", true, false, false,
                "{\"week\":\"Feb 17-23\",\"classes\":\"42\",\"halls\":\"3\",\"openPTSlots\":\"8\"}",
                "/schedule", now.minusDays(2)));

        // ============ MEMBER NOTIFICATIONS ============
        seeded.add(makeNotification(user, "New Member Milestone - 100th Check-in",
                "Congratulations! Arjun Mehta has completed their 100th gym check-in today. Consider sending a congratulatory message or offering a small reward to celebrate their consistency.",
                "MEMBER", "normal", false, false, false,
                "{\"member\":\"Arjun Mehta\",\"milestone\":\"100 check-ins\"}",
                "/members", now.minusHours(6)));

        seeded.add(makeNotification(user, "Member Complaint Received",
                "Complaint submitted by Kavita Sharma: 'Air conditioning in the cardio area has not been working for 3 days. The area is extremely hot during afternoon sessions.' Priority: High. Please address this urgently.",
                "MEMBER", "urgent", false, false, false,
                "{\"member\":\"Kavita Sharma\",\"area\":\"Cardio Section\",\"issue\":\"AC not working\",\"days\":\"3\"}",
                "/settings", now.minusHours(1).minusMinutes(30)));

        seeded.add(makeNotification(user, "3 Members Completed Onboarding Today",
                "3 new members completed their fitness assessment and onboarding today: Ravi Iyer, Meera Nair, and Sanjay Kapoor. All have been assigned trainers and workout plans.",
                "MEMBER", "normal", false, false, false,
                "{\"count\":\"3\",\"members\":\"Ravi Iyer, Meera Nair, Sanjay Kapoor\"}",
                "/members", now.minusDays(1).minusHours(3)));

        // ============ TRAINER NOTIFICATIONS ============
        seeded.add(makeNotification(user, "Trainer Leave Request - William Harris",
                "Trainer William Harris has requested leave from Feb 18-20 (3 days). Reason: Family function. He has 6 PT sessions and 4 group classes scheduled during this period that need reassignment.",
                "TRAINER", "high", false, false, false,
                "{\"trainer\":\"William Harris\",\"dates\":\"Feb 18-20\",\"ptSessions\":\"6\",\"classes\":\"4\",\"reason\":\"Family function\"}",
                "/trainers", now.minusHours(2)));

        seeded.add(makeNotification(user, "Trainer Performance Report Ready",
                "Monthly trainer performance report for January is ready. Top performer: Jessica Brown (4.8/5 rating, 95% attendance). Lowest rated: Donald Taylor (3.2/5, needs improvement discussion).",
                "TRAINER", "normal", false, false, false,
                "{\"month\":\"January\",\"topTrainer\":\"Jessica Brown\",\"topRating\":\"4.8\",\"lowestTrainer\":\"Donald Taylor\",\"lowestRating\":\"3.2\"}",
                "/reports", now.minusDays(3)));

        seeded.add(makeNotification(user, "New Trainer Certification Upload",
                "Trainer Joshua Lee has uploaded a new certification: 'ACE Personal Trainer Certification (2026)'. Please verify and approve the document from the trainer management section.",
                "TRAINER", "normal", false, false, false,
                "{\"trainer\":\"Joshua Lee\",\"certification\":\"ACE Personal Trainer 2026\"}",
                "/trainers", now.minusDays(1)));

        // ============ INVENTORY NOTIFICATIONS ============
        seeded.add(makeNotification(user, "Low Stock Alert - Protein Supplements",
                "Protein supplement stock is critically low. Current inventory: Whey Protein (3 units), BCAA (5 units), Pre-workout (2 units). Reorder point reached. Place order immediately to avoid stockout.",
                "INVENTORY", "urgent", false, false, false,
                "{\"items\":\"Whey Protein: 3, BCAA: 5, Pre-workout: 2\",\"status\":\"Critical\"}",
                "/inventory", now.minusHours(8)));

        seeded.add(makeNotification(user, "Equipment Maintenance Due - Treadmills",
                "Scheduled maintenance is due for 4 treadmills (Units TM-01 to TM-04). Last serviced: Jan 12. Recommended service interval: 30 days. Contact vendor: FitEquip Services (9876543210).",
                "INVENTORY", "high", false, false, false,
                "{\"equipment\":\"Treadmills TM-01 to TM-04\",\"lastService\":\"Jan 12\",\"vendor\":\"FitEquip Services\"}",
                "/inventory", now.minusDays(2)));

        seeded.add(makeNotification(user, "New Equipment Delivered",
                "New equipment delivery received: 2x Assault Bikes, 1x Cable Machine (Dual Pulley), 10x Resistance Bands Set. All items inspected and in good condition. Installation scheduled for tomorrow.",
                "INVENTORY", "normal", false, false, false,
                "{\"items\":\"2x Assault Bikes, 1x Cable Machine, 10x Resistance Bands\",\"status\":\"Delivered\"}",
                "/inventory", now.minusDays(1).minusHours(5)));

        // ============ ANNOUNCEMENT NOTIFICATIONS ============
        seeded.add(makeNotification(user, "Gym Anniversary Offer Planning",
                "Your gym's 3rd anniversary is on March 1st! Last year's anniversary campaign brought in 45 new members. Start planning early: consider special offers, member appreciation events, and social media campaigns.",
                "ANNOUNCEMENT", "normal", true, false, false,
                "{\"date\":\"March 1\",\"years\":\"3\",\"lastYearMembers\":\"45\"}",
                null, now.minusDays(4)));

        seeded.add(makeNotification(user, "Holiday Hours Reminder - Set Schedule",
                "Republic Day (Jan 26) is approaching. Set your gym's holiday hours. Last year you operated 7 AM - 12 PM. Don't forget to notify members via app and WhatsApp broadcast.",
                "ANNOUNCEMENT", "normal", false, false, false,
                "{\"holiday\":\"Republic Day\",\"lastYearHours\":\"7 AM - 12 PM\"}",
                "/schedule", now.minusDays(5)));

        // ============ REPORT NOTIFICATIONS ============
        seeded.add(makeNotification(user, "Monthly Revenue Report - January",
                "January revenue report is ready. Total Revenue: Rs. 8,45,000 (+12% vs December). Active Members: 312. New Joins: 28. Churned: 8. Net Growth: +20 members. Top revenue source: Annual memberships (42%).",
                "REPORT", "normal", true, false, false,
                "{\"revenue\":\"845000\",\"growth\":\"12%\",\"members\":\"312\",\"newJoins\":\"28\",\"churned\":\"8\"}",
                "/reports", now.minusDays(6)));

        seeded.add(makeNotification(user, "Attendance Trend Alert",
                "Member attendance dropped 18% this week compared to last week's average. Possible causes: weather, exam season. Peak hours shifted from 6-8 AM to 7-9 AM. Consider adjusting trainer schedules.",
                "REPORT", "high", false, false, false,
                "{\"drop\":\"18%\",\"peakShift\":\"6-8 AM to 7-9 AM\"}",
                "/reports", now.minusDays(1).minusHours(8)));

        // ============ ALERT NOTIFICATIONS ============
        seeded.add(makeNotification(user, "Security Alert - After Hours Access",
                "Unauthorized access attempt detected at Main Entrance at 11:42 PM. Card ID: CARD-0892 (Expired member - Suresh Kumar). Security camera footage saved. Review recommended.",
                "ALERT", "urgent", false, false, false,
                "{\"location\":\"Main Entrance\",\"time\":\"11:42 PM\",\"member\":\"Suresh Kumar\",\"cardStatus\":\"Expired\"}",
                "/settings", now.minusHours(10)));

        seeded.add(makeNotification(user, "Fire Safety Inspection Due",
                "Annual fire safety inspection is due by Feb 28. Last inspection: Feb 25, 2025. Required documents: fire extinguisher service certificates, emergency exit maps, staff training records. Schedule with local fire department.",
                "ALERT", "high", false, false, false,
                "{\"deadline\":\"Feb 28\",\"lastInspection\":\"Feb 25, 2025\"}",
                null, now.minusDays(3)));

        seeded.add(makeNotification(user, "Water Dispenser Malfunction - Zone B",
                "Members reported that the water dispenser in Zone B (weight training area) is not cooling. Maintenance team notified. Estimated fix time: 4-6 hours. Temporary water cooler placed as backup.",
                "ALERT", "normal", false, false, false,
                "{\"location\":\"Zone B - Weight Training\",\"issue\":\"Water dispenser not cooling\",\"eta\":\"4-6 hours\"}",
                null, now.minusHours(5)));

        // ============ SYSTEM NOTIFICATIONS ============
        seeded.add(makeNotification(user, "Software Update Available - v3.2.1",
                "A new software update (v3.2.1) is available for your gym management system. New features: Automated WhatsApp reminders, improved attendance tracking, and new financial reports. Update during non-peak hours.",
                "SYSTEM", "normal", false, false, false,
                "{\"version\":\"3.2.1\",\"features\":\"WhatsApp reminders, Attendance tracking, Financial reports\"}",
                "/settings", now.minusDays(2)));

        seeded.add(makeNotification(user, "Database Backup Completed",
                "Daily database backup completed successfully at 3:00 AM. Backup size: 2.4 GB. All member records, financial data, and attendance logs backed up. Next backup: Tomorrow 3:00 AM.",
                "SYSTEM", "low", true, false, false,
                "{\"time\":\"3:00 AM\",\"size\":\"2.4 GB\",\"status\":\"Success\"}",
                null, now.minusHours(12)));

        seeded.add(makeNotification(user, "Biometric System Sync Error",
                "The biometric attendance system failed to sync 12 check-in records from the afternoon session (2:00 PM - 6:00 PM). Auto-retry scheduled. If the issue persists, contact support: help@gymsoft.in.",
                "SYSTEM", "high", false, false, false,
                "{\"failedRecords\":\"12\",\"period\":\"2:00 PM - 6:00 PM\",\"support\":\"help@gymsoft.in\"}",
                "/settings", now.minusHours(7)));

        // Save all
        notificationRepository.saveAll(seeded);

        return ResponseEntity.ok(Map.of(
                "message", "Seeded " + seeded.size() + " notifications for user " + userId,
                "count", seeded.size(),
                "userId", userId
        ));
    }

    @DeleteMapping("/clear-notifications/{userId}")
    public ResponseEntity<?> clearNotifications(@PathVariable Long userId) {
        List<Notification> all = notificationRepository.findByUserUserIdAndIsArchivedFalseOrderByCreatedAtDesc(userId);
        List<Notification> archived = notificationRepository.findByUserUserIdAndIsArchivedTrueOrderByCreatedAtDesc(userId);
        all.addAll(archived);
        notificationRepository.deleteAll(all);
        return ResponseEntity.ok(Map.of("message", "Cleared " + all.size() + " notifications for user " + userId, "count", all.size()));
    }

    private Notification makeNotification(User user, String title, String message, String type,
                                           String priority, boolean starred, boolean archived, boolean read,
                                           String metaData, String link, LocalDateTime createdAt) {
        Notification n = new Notification();
        n.setUser(user);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setPriority(priority);
        n.setIsStarred(starred);
        n.setIsArchived(archived);
        n.setIsRead(read);
        n.setMetaData(metaData);
        n.setLink(link);
        n.setCreatedAt(createdAt);
        return n;
    }
}
