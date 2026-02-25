package com.gym.management.seeder;

import com.gym.management.model.GymTask;
import com.gym.management.repository.GymTaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * GymTaskDataSeeder
 *
 * Inserts 20 diverse dummy tasks covering every possible field combination:
 * Priorities : LOW, MEDIUM, HIGH, URGENT
 * Statuses : PENDING, IN_PROGRESS, DONE
 * Categories : MAINTENANCE, FINANCE, MEMBERS, STAFF, CLASSES, GENERAL
 * Optional fields tested: description (null / filled), dueDate (null / past /
 * today / future),
 * assignedTo (null / set), createdBy, completedAt (null / set)
 */
@Component
public class GymTaskDataSeeder {

        private static final Logger log = LoggerFactory.getLogger(GymTaskDataSeeder.class);
        private static final Long GYM_ID = 1L;

        @Autowired
        private GymTaskRepository gymTaskRepository;

        /** Seed only if the table is empty (safe to call on startup). */
        @Transactional
        public int seedIfEmpty() {
                long count = gymTaskRepository.countByGymIdAndStatus(GYM_ID, "PENDING")
                                + gymTaskRepository.countByGymIdAndStatus(GYM_ID, "IN_PROGRESS")
                                + gymTaskRepository.countByGymIdAndStatus(GYM_ID, "DONE");
                if (count > 0) {
                        log.info("[GymTaskDataSeeder] {} tasks already exist — skipping.", count);
                        return 0;
                }
                return doSeed();
        }

        /** Always inserts fresh seed data (called from /api/tasks/seed endpoint). */
        @Transactional
        public int seed() {
                return doSeed();
        }

        private int doSeed() {
                List<GymTask> tasks = buildTasks();
                gymTaskRepository.saveAll(tasks);
                log.info("[GymTaskDataSeeder] Inserted {} dummy tasks.", tasks.size());
                return tasks.size();
        }

        // ─── Build all 20 tasks ──────────────────────────────────────────────────

        private List<GymTask> buildTasks() {
                List<GymTask> list = new ArrayList<>();
                LocalDate today = LocalDate.now();
                LocalDateTime now = LocalDateTime.now();

                /*
                 * ─────────────────────────── PENDING column (7 tasks)
                 * ────────────────────────────
                 */

                // 1. MAINTENANCE / URGENT / PENDING / overdue / with description / assigned
                list.add(t("Fix Broken Treadmill #4",
                                "Belt is slipping and display shows error code E-02. " +
                                                "Member complained of vibration noise during incline. " +
                                                "Needs immediate inspection by equipment technician.",
                                "PENDING", "URGENT", "MAINTENANCE",
                                today.minusDays(3), "Rahul Sharma", "Admin",
                                null, now.minusHours(5), now.minusHours(5)));

                // 2. FINANCE / HIGH / PENDING / future due / with description / assigned
                list.add(t("Submit Q4 Revenue Report",
                                "Compile monthly membership fee collections, PT session revenue, " +
                                                "and supplement sales. Submit to owner by end of quarter.",
                                "PENDING", "HIGH", "FINANCE",
                                today.plusDays(7), "Priya Mehta", "Admin",
                                null, now.minusDays(2), now.minusDays(2)));

                // 3. MEMBERS / MEDIUM / PENDING / near due / NO description / assigned
                list.add(t("Send Renewal Reminders",
                                null,
                                "PENDING", "MEDIUM", "MEMBERS",
                                today.plusDays(2), "Front Desk", "Admin",
                                null, now.minusHours(10), now.minusHours(10)));

                // 4. STAFF / LOW / PENDING / NO due date / with description / assigned
                list.add(t("Update Employee Contact List",
                                "Collect updated phone numbers and emergency contacts from all 14 " +
                                                "staff members and add to the HR portal.",
                                "PENDING", "LOW", "STAFF",
                                null, "HR Manager", "Admin",
                                null, now.minusDays(1), now.minusDays(1)));

                // 5. CLASSES / HIGH / PENDING / future due / with description / assigned
                list.add(t("Schedule Zumba Classes for March",
                                "Coordinate with instructor Kavita for availability. " +
                                                "Book Studio B Mon/Wed/Fri 6–7 PM. Post on notice board and app.",
                                "PENDING", "HIGH", "CLASSES",
                                today.plusDays(4), "Kavita Joshi", "Owner",
                                null, now.minusHours(2), now.minusHours(2)));

                // 6. GENERAL / MEDIUM / PENDING / tomorrow due / with description / NO assignee
                list.add(t("Restock Water Dispenser Bottles",
                                "Order 5 jars of 20L Bisleri from local vendor. " +
                                                "Last stock ran out on Tuesday.",
                                "PENDING", "MEDIUM", "GENERAL",
                                today.plusDays(1), null, "Admin",
                                null, now.minusHours(8), now.minusHours(8)));

                // 7. MAINTENANCE / MEDIUM / PENDING / NO due / with description / NO assignee
                list.add(t("Lubricate All Cable Machine Pulleys",
                                "Routine quarterly maintenance. 6 cable machines need lubrication " +
                                                "and bolt tightening. Schedule during low-traffic Tuesday morning.",
                                "PENDING", "MEDIUM", "MAINTENANCE",
                                null, null, "Admin",
                                null, now.minusHours(30), now.minusHours(30)));

                /*
                 * ─────────────────────────── IN_PROGRESS column (7 tasks)
                 * ────────────────────────────
                 */

                // 8. MAINTENANCE / HIGH / IN_PROGRESS / future due / assigned
                list.add(t("Annual AC Servicing — Main Floor",
                                "4 ACs on the main workout floor due for annual service. " +
                                                "Technician from CoolAir Pvt Ltd confirmed for Thursday 10 AM.",
                                "IN_PROGRESS", "HIGH", "MAINTENANCE",
                                today.plusDays(5), "Amit Kumar", "Admin",
                                null, now.minusDays(3), now.minusHours(1)));

                // 9. FINANCE / URGENT / IN_PROGRESS / OVERDUE / assigned
                list.add(t("Clear GST Payment — Jan & Feb",
                                "Two months GST pending. Interest applicable after the 20th. " +
                                                "CA Ramesh has documents ready. NEFT transfer to be initiated.",
                                "IN_PROGRESS", "URGENT", "FINANCE",
                                today.minusDays(1), "Priya Mehta", "Owner",
                                null, now.minusDays(7), now.minusHours(3)));

                // 10. MEMBERS / MEDIUM / IN_PROGRESS / future due / assigned
                list.add(t("Onboard 12 New Trial Members",
                                "15 trial signups from last weekend's fitness camp. Assign lockers, " +
                                                "create profiles in CRM, schedule induction with trainer.",
                                "IN_PROGRESS", "MEDIUM", "MEMBERS",
                                today.plusDays(3), "Sunita Rao", "Admin",
                                null, now.minusDays(2), now.minusHours(6)));

                // 11. STAFF / LOW / IN_PROGRESS / future due / NO description / assigned
                list.add(t("Prepare Monthly Payroll Sheet",
                                null,
                                "IN_PROGRESS", "LOW", "STAFF",
                                today.plusDays(10), "Accounts", "Admin",
                                null, now.minusDays(1), now.minusHours(4)));

                // 12. CLASSES / URGENT / IN_PROGRESS / due TODAY / assigned
                list.add(t("Find Substitute for Yoga Class Tomorrow",
                                "Regular instructor Meera is on sick leave for 3 days. " +
                                                "Urgently find substitute or reschedule 7 AM and 5 PM slots.",
                                "IN_PROGRESS", "URGENT", "CLASSES",
                                today, "Schedule Manager", "Owner",
                                null, now.minusHours(14), now.minusMinutes(30)));

                // 13. GENERAL / HIGH / IN_PROGRESS / future due / assigned
                list.add(t("Install CCTV in Locker Room Corridor",
                                "4-camera IP CCTV system ordered. Electrician confirmed installation " +
                                                "slot this Thursday 10 AM–2 PM. Ensure area is clear.",
                                "IN_PROGRESS", "HIGH", "GENERAL",
                                today.plusDays(2), "Ravi Electricals", "Admin",
                                null, now.minusDays(4), now.minusHours(12)));

                // 14. MEMBERS / URGENT / IN_PROGRESS / OVERDUE / assigned
                list.add(t("Handle Membership Freeze Requests (11 Pending)",
                                "11 members requested freeze (medical/travel). Each needs supporting " +
                                                "document, freeze updated in system, and confirmation email sent.",
                                "IN_PROGRESS", "URGENT", "MEMBERS",
                                today.minusDays(2), "Sunita Rao", "Admin",
                                null, now.minusDays(5), now.minusHours(2)));

                /*
                 * ─────────────────────────── DONE column (6 tasks)
                 * ────────────────────────────
                 */

                // 15. MAINTENANCE / LOW / DONE / with completedAt
                list.add(t("Replace Broken Mirror — Cardio Section",
                                "2 m × 1.5 m mirror panel cracked on the left wall. " +
                                                "New mirror received and installed by vendor.",
                                "DONE", "LOW", "MAINTENANCE",
                                today.minusDays(5), "Deepak Interiors", "Admin",
                                now.minusDays(2), now.minusDays(6), now.minusDays(2)));

                // 16. FINANCE / MEDIUM / DONE / with completedAt
                list.add(t("Renew Gym Insurance Policy",
                                "Annual insurance policy expired. New policy from Oriental Insurance " +
                                                "activated for 2025–26 with enhanced equipment coverage.",
                                "DONE", "MEDIUM", "FINANCE",
                                today.minusDays(10), "Priya Mehta", "Owner",
                                now.minusDays(8), now.minusDays(15), now.minusDays(8)));

                // 17. MEMBERS / HIGH / DONE / with completedAt
                list.add(t("Resolve Payment Dispute — Arjun Malhotra",
                                "Member claimed double charge in Jan. Verified billing history, " +
                                                "confirmed system glitch, issued full refund of ₹2,500 via UPI.",
                                "DONE", "HIGH", "MEMBERS",
                                today.minusDays(3), "Front Desk", "Admin",
                                now.minusDays(1), now.minusDays(4), now.minusDays(1)));

                // 18. STAFF / HIGH / DONE / with completedAt
                list.add(t("Conduct Staff Safety Training",
                                "Mandatory fire safety and first-aid training for all 14 staff. " +
                                                "Completed with trainer from SafeZone Solutions. Certificates issued.",
                                "DONE", "HIGH", "STAFF",
                                today.minusDays(7), "All Staff", "Owner",
                                now.minusDays(6), now.minusDays(12), now.minusDays(6)));

                // 19. CLASSES / LOW / DONE / NO description / with completedAt
                list.add(t("Print and Post Feb Class Timetable",
                                null,
                                "DONE", "LOW", "CLASSES",
                                today.minusDays(14), "Receptionist", "Admin",
                                now.minusDays(13), now.minusDays(16), now.minusDays(13)));

                // 20. GENERAL / URGENT / DONE / with completedAt — emergency scenario
                list.add(t("Emergency Water Pipe Repair — Basement",
                                "Burst pipe in basement caused flooding near pump room. " +
                                                "Emergency plumber called at 6 AM. Resolved in 4 hours. Damage report filed.",
                                "DONE", "URGENT", "GENERAL",
                                today.minusDays(2), "Shankar Plumbing", "Admin",
                                now.minusDays(2), now.minusDays(2), now.minusDays(2)));

                return list;
        }

        // ─── Builder helper ──────────────────────────────────────────────────────
        private GymTask t(String title, String description,
                        String status, String priority, String category,
                        LocalDate dueDate, String assignedTo, String createdBy,
                        LocalDateTime completedAt,
                        LocalDateTime createdAt, LocalDateTime updatedAt) {

                GymTask g = new GymTask();
                g.setGymId(GYM_ID);
                g.setTitle(title);
                g.setDescription(description);
                g.setStatus(status);
                g.setPriority(priority);
                g.setCategory(category);
                g.setDueDate(dueDate);
                g.setAssignedTo(assignedTo);
                g.setCreatedBy(createdBy);
                g.setCompletedAt(completedAt);
                g.setCreatedAt(createdAt);
                g.setUpdatedAt(updatedAt);
                return g;
        }
}
