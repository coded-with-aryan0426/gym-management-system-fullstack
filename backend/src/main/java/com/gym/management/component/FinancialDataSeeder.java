package com.gym.management.component;

import com.gym.management.model.Transaction;
import com.gym.management.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class FinancialDataSeeder implements CommandLineRunner {

        private final TransactionRepository transactionRepository;

        @Override
        public void run(String... args) throws Exception {
                // Only seed if we have very little data (e.g. < 50 records)
                // User asked to "add data", so we might want to just append if it's low.
                // Let's ensure we have a good baseline.
                if (transactionRepository.count() > 100) {
                        log.info("Sufficient financial data exists ({} records). Skipping seed.",
                                        transactionRepository.count());
                        return;
                }

                log.info("Seeding comprehensive financial data (6 months past + 2 months future)...");
                List<Transaction> transactions = new ArrayList<>();
                LocalDateTime now = LocalDateTime.now();
                Random random = new Random();

                // Time range: -6 months to +2 months
                LocalDateTime startDate = now.minusMonths(6).withDayOfMonth(1);
                LocalDateTime endDate = now.plusMonths(2).withDayOfMonth(28);

                // 1. RECURRING EXPENSES (Rent, Internet, Utilities, Salaries)
                LocalDateTime current = startDate;
                while (current.isBefore(endDate)) {
                        // Rent - 1st of month
                        transactions.add(createTransaction(
                                        current.withDayOfMonth(1).plusHours(9),
                                        "EXPENSE",
                                        "Rent",
                                        "Gym Space Rent - " + current.getMonth(),
                                        new BigDecimal("45000"),
                                        current.isAfter(now) ? "Pending" : "Completed",
                                        "EXP-RENT-" + current.getYear() + "-" + current.getMonthValue()));

                        // Salaries - 5th of month
                        transactions.add(createTransaction(
                                        current.withDayOfMonth(5).plusHours(10),
                                        "EXPENSE",
                                        "Salaries",
                                        "Staff Salaries - " + current.getMonth(),
                                        new BigDecimal("65000"),
                                        current.isAfter(now) ? "Pending" : "Completed",
                                        "EXP-SAL-" + current.getYear() + "-" + current.getMonthValue()));

                        // Internet - 10th of month
                        transactions.add(createTransaction(
                                        current.withDayOfMonth(10).plusHours(11),
                                        "EXPENSE",
                                        "Utilities",
                                        "Internet Bill - " + current.getMonth(),
                                        new BigDecimal("1200"),
                                        current.isAfter(now) ? "Pending" : "Completed",
                                        "EXP-NET-" + current.getYear() + "-" + current.getMonthValue()));

                        // Electricity - 15th of month (Varying amount)
                        BigDecimal electricity = new BigDecimal(4000 + random.nextInt(2000));
                        transactions.add(createTransaction(
                                        current.withDayOfMonth(15).plusHours(14),
                                        "EXPENSE",
                                        "Utilities",
                                        "Electricity Bill - " + current.getMonth(),
                                        electricity,
                                        current.isAfter(now) ? "Pending" : "Completed",
                                        "EXP-POW-" + current.getYear() + "-" + current.getMonthValue()));

                        current = current.plusMonths(1);
                }

                // 2. DAILY/WEEKLY INCOME (Memberships, PT, POS)
                // Generate random transactions across the timeline
                int days = 240; // approx 8 months
                for (int i = 0; i < days; i++) {
                        LocalDateTime day = startDate.plusDays(i);

                        // Skip if day is far in future and not a scheduled thing (let's keep future
                        // randoms low)
                        if (day.isAfter(now.plusMonths(2)))
                                continue;

                        // Random number of transactions per day (0 to 5)
                        int dailyTxCount = random.nextInt(4); // 0, 1, 2, 3

                        for (int j = 0; j < dailyTxCount; j++) {
                                // Mix of types
                                int typeRoll = random.nextInt(100);

                                if (typeRoll < 60) {
                                        // 60% Membership
                                        String[] plans = { "Monthly Access", "Quarterly Plan", "Annual Membership",
                                                        "Day Pass" };
                                        BigDecimal[] prices = { new BigDecimal("1500"), new BigDecimal("4000"),
                                                        new BigDecimal("12000"), new BigDecimal("500") };
                                        int planIdx = random.nextInt(plans.length);

                                        String status = "Completed";
                                        if (day.isAfter(now))
                                                status = "Pending"; // Future memberships scheduled
                                        else if (random.nextInt(20) == 0)
                                                status = "Pending"; // Occasional pending data in past

                                        transactions.add(createTransaction(
                                                        day.plusHours(8 + random.nextInt(12)),
                                                        "INCOME",
                                                        "Membership",
                                                        "New Signup - " + plans[planIdx],
                                                        prices[planIdx],
                                                        status,
                                                        "INV-" + day.getYear() + day.getDayOfYear() + "-" + j));

                                } else if (typeRoll < 85) {
                                        // 25% Personal Training
                                        transactions.add(createTransaction(
                                                        day.plusHours(7 + random.nextInt(13)),
                                                        "INCOME",
                                                        "Personal Training",
                                                        "PT Session / Package",
                                                        new BigDecimal("1500"),
                                                        day.isAfter(now) ? "Pending" : "Completed",
                                                        "PT-" + day.getYear() + day.getDayOfYear() + "-" + j));
                                } else {
                                        // 15% POS / Supplement
                                        String[] items = { "Protein Shake", "Water Bottle", "Protein Bar", "T-Shirt" };
                                        BigDecimal[] costs = { new BigDecimal("250"), new BigDecimal("50"),
                                                        new BigDecimal("150"), new BigDecimal("800") };
                                        int itemIdx = random.nextInt(items.length);

                                        if (day.isBefore(now)) { // POS usually immediate
                                                transactions.add(createTransaction(
                                                                day.plusHours(8 + random.nextInt(13)),
                                                                "INCOME",
                                                                "Merchandise",
                                                                "POS Sale - " + items[itemIdx],
                                                                costs[itemIdx],
                                                                "Completed",
                                                                "POS-" + day.getYear() + day.getDayOfYear() + "-" + j));
                                        }
                                }
                        }
                }

                // 3. One-off Expenses (Maintenance, Equipment)
                for (int i = 0; i < 12; i++) {
                        LocalDateTime randDate = startDate.plusDays(random.nextInt(180));
                        if (randDate.isAfter(now))
                                continue;

                        transactions.add(createTransaction(
                                        randDate.plusHours(10),
                                        "EXPENSE",
                                        "Equipment",
                                        "Equipment Maintenance / Repair",
                                        new BigDecimal(2000 + random.nextInt(8000)),
                                        "Completed",
                                        "MAINT-" + i));
                }

                transactionRepository.saveAll(transactions);
                log.info("Successfully seeded {} financial transactions.", transactions.size());
        }

        private Transaction createTransaction(LocalDateTime dateTime, String type, String category, String description,
                        BigDecimal amount, String status, String ref) {
                return Transaction.builder()
                                .dateTime(dateTime)
                                .type(type)
                                .category(category)
                                .description(description)
                                .amount(amount)
                                .status(status)
                                .referenceNumber(ref)
                                .createdBy("System")
                                .build();
        }
}
