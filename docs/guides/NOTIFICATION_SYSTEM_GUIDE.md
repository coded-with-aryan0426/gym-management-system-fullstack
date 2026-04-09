# 🔔 Notification System - Complete Guide

## Overview
The AthlonX notification system is now **event-driven** and **proactive**, automatically notifying gym owners of important business events, membership changes, payments, and more.

---

## ✨ What's New

### 1. **Real-Time Event Listeners** (NotificationEventService)
Automatically creates notifications when gym events happen:

#### Member Events
- ✅ **New Member Signup** - When user registers with MEMBER role
- ✅ **Membership Purchased** - When member buys a plan
- ✅ **PT Session Booked** - When member books with trainer
- ✅ **Class Full Alert** - When class reaches capacity

#### Payment Events
- ✅ **Payment Received** - Successful transaction
- ✅ **Payment Failed** - Failed transaction with reason
- ✅ **Pending Payment Alert** - Old unpaid invoices

#### Trainer Events
- ✅ **Trainer Leave Request** - Leave application received
- ✅ **Trainer Performance** - Attendance/rating updates

#### System Alerts
- ✅ **Low Attendance Warning** - Members not checking in
- ✅ **Membership Expiring** - Upcoming expiry dates
- ✅ **Equipment Maintenance** - Maintenance due

### 2. **Scheduled Monitoring Tasks** (NotificationScheduler)
Background jobs that run automatically:

| Time | Task | Details |
|------|------|---------|
| **Daily 2:00 AM** | Check Expiring Memberships | Find active memberships ending within 7 days |
| **Daily 3:00 AM** | Check Pending Payments | Find pending transactions >7 days old (urgent) |
| **Daily 8:00 PM** | Daily Revenue Report | Today's total revenue summary |
| **Mon 9:00 AM** | Weekly Attendance Report | Attendance trends and peak hours |
| **Daily 4:00 AM** | Cleanup Old Data | Delete archived notifications >90 days |

---

## 📊 Notification Types & Details

### MEMBER Notifications
```
Title: "New Member Signup - Rajesh Sharma"
Message: "New member joined: Rajesh Sharma (rajesh@email.com). 
          Their account is ready for membership assignment."
Priority: normal
Link: /members?search=Rajesh Sharma
```

### MEMBERSHIP Notifications
```
Title: "Membership Expiring Soon - Priya Singh"
Message: "🔔 Priya Singh's membership expires in 3 days (2026-04-05). 
          Consider sending renewal reminder or offering renewal incentive."
Priority: high (if <3 days), normal (if 3-7 days)
Link: /members?search=Priya Singh
```

### PAYMENT Notifications
```
Title: "Payment Received - Rahul Sharma"
Message: "Payment of Rs. 2,999 received from Rahul Sharma for Premium membership. 
          Transaction successful."
Priority: normal
Link: /financials

---

Title: "Payment Failed - Vikram Patel"
Message: "⚠️ Payment of Rs. 5,999 from Vikram Patel failed. 
          Reason: Insufficient Funds. Member may need follow-up."
Priority: high
Link: /members?search=Vikram Patel

---

Title: "Pending Payment - Rs. 1,500"
Message: "⚠️ Payment of Rs. 1,500 is PENDING for 10 days. 
          Consider follow-up or manual payment verification."
Priority: urgent (if >7 days), high (if 3-7 days)
Link: /financials
```

### BOOKING Notifications
```
Title: "PT Session Booked - Anjali Verma"
Message: "Anjali Verma booked a PT session with Rohan Kumar on 2026-04-02. 
          Trainer will receive assignment notification."
Priority: normal
Link: /pt-sessions

---

Title: "Class Full - Yoga Morning Batch"
Message: "Class 'Yoga Morning Batch' by Kavya Singh has reached full capacity. 
          Consider adding another session."
Priority: high
Link: /classes
```

### TRAINER Notifications
```
Title: "Trainer Leave Request - Rohit Malhotra"
Message: "Rohit Malhotra has applied for leave from 2026-04-15 to 2026-04-20. 
          Reason: Medical. Please review and approve/deny in staff settings."
Priority: high
Link: /staff
```

### ALERT Notifications
```
Title: "Low Attendance Alert"
Message: "⚠️ Low attendance alert: Only 15 members attended in the last 7 days. 
          Consider running promotions or engagement campaigns."
Priority: high
Link: /members
```

### REPORT Notifications
```
Title: "Daily Revenue Report"
Message: "💰 Today's Revenue: Rs. 45,320. 
          Check the Financials dashboard for detailed breakdown."
Priority: normal
Link: /financials

---

Title: "Weekly Attendance Report"
Message: "Check the Members section for attendance trends, peak hours, 
          and inactive member insights."
Priority: normal
Link: /members
```

---

## 🏗️ Architecture

### Event Flow
```
Gym Event (e.g., Member Signup)
        ↓
Service Layer (e.g., AuthService.registerMember())
        ↓
NotificationEventService.notifyNewMemberSignup()
        ↓
Create Notification record in DB
        ↓
Owner receives notification in dashboard
```

### Scheduled Tasks Flow
```
Spring @Scheduled Cron Job (e.g., 2 AM daily)
        ↓
NotificationScheduler.checkExpiringMemberships()
        ↓
Query MembershipRepository for expiring memberships
        ↓
For each expiring membership:
   NotificationEventService.createNotification()
        ↓
Owner sees fresh notifications next time dashboard loads
```

---

## 🔌 Integration Points

### To Enable Event Notifications, Add Calls to:

#### 1. **AuthService / UserService** (New Member Signup)
```java
// After user creation
notificationEventService.notifyNewMemberSignup(newUser);
```

#### 2. **MembershipService** (Membership Purchase)
```java
// After membership created
notificationEventService.notifyMembershipPurchase(member, planName, amount);
```

#### 3. **TransactionService / PaymentService** (Payments)
```java
// On successful payment
notificationEventService.notifyPaymentReceived(member, amount, planName);

// On failed payment
notificationEventService.notifyPaymentFailed(member, amount, reason);
```

#### 4. **PTSessionService** (PT Booking)
```java
// After session booked
notificationEventService.notifyPTSessionBooked(member, trainer, sessionDate);
```

#### 5. **GymClassService** (Class Full)
```java
// When class reaches capacity
notificationEventService.notifyClassFullCapacity(className, trainer);
```

#### 6. **StaffLeaveService** (Trainer Leave)
```java
// When leave application submitted
notificationEventService.notifyTrainerLeaveRequest(trainer, fromDate, toDate, reason);
```

#### 7. **AttendanceService** (Low Attendance)
```java
// When attendance < threshold
notificationEventService.notifyLowAttendance(metric, count, period);
```

---

## 📱 Frontend Display

### Owner Notifications Dashboard
The dashboard (`/owner/notifications`) displays:

1. **Stats Bar** (top)
   - Total notifications
   - Unread count
   - Starred count
   - Urgent count

2. **Filters**
   - View: All | Unread | Starred | Archived
   - Type: Member | Membership | Payment | Booking | Trainer | Report | Alert | System
   - Priority: Urgent | High | Normal | Low

3. **Notifications Feed**
   - Title with priority badge
   - Message preview (truncated)
   - Type icon
   - Timestamp (relative: "2 mins ago")
   - Action buttons: Star, Archive, Delete, Read
   - Click → Deep link to relevant page

4. **Auto-Refresh**
   - Polls every 30 seconds
   - Silently updates when new notifications arrive
   - Toast error if fetch fails

---

## 🎯 Owner Notification Workflow

### Daily Routine
```
8:00 AM  → Owner logs in
         → Dashboard loads
         → Shows 3-5 new notifications from overnight
         
         - 1 Low Attendance Alert
         - 2 Membership Expiring (in 5 days)
         - 1 Pending Payment (9 days old)
         - 1 Daily Revenue Report (yesterday)

         → Owner clicks each notification
         → Deep links to Members, Financials, etc.
         → Takes action (send reminder, follow-up payment, etc.)

         → Star important notifications
         → Archive when done

Next 30 seconds
         → Dashboard auto-refreshes
         → Shows new member signup notification
         → Owner clicks → Goes to Members page
         → Assigns membership to new member
```

---

## 🔧 Configuration

### Notification Retention
- **Default**: Keep notifications for 90 days
- **Cleanup**: Automatic daily at 4:00 AM
- **To change**: Modify `LocalDateTime.minusDays(90)` in NotificationScheduler

### Scheduled Task Times
Edit `NotificationScheduler.java` cron expressions:
```java
@Scheduled(cron = "0 0 2 * * ?")    // 2:00 AM daily
@Scheduled(cron = "0 0 3 * * ?")    // 3:00 AM daily
@Scheduled(cron = "0 0 20 * * ?")   // 8:00 PM daily
@Scheduled(cron = "0 0 9 ? * MON")  // 9:00 AM every Monday
```

### Expiring Membership Window
Edit in `NotificationScheduler.checkExpiringMemberships()`:
```java
LocalDateTime sevenDaysFromNow = now.plusDays(7);  // Change to 14 for 2 weeks
```

---

## 📈 Benefits

✅ **Proactive Alerts** - Owner alerted before issues become problems
✅ **Revenue Protection** - Pending payments monitored automatically
✅ **Member Retention** - Expiry reminders sent proactively
✅ **Business Insights** - Daily/weekly reports on key metrics
✅ **Scalable** - Easy to add new event types via NotificationEventService
✅ **Deep Links** - Each notification navigates to relevant page
✅ **Smart Filtering** - Rich metadata for sorting/searching notifications
✅ **Fallback Safety** - Seed data generation on first access (backward compatible)

---

## 🚀 Future Enhancements

1. **Email Notifications** - Send important alerts via email
2. **SMS Alerts** - Critical alerts (payment failed, low attendance) via SMS
3. **WebSocket Real-Time** - Push notifications instead of polling
4. **Notification Rules** - Owner can customize which events trigger notifications
5. **Team Notifications** - Notify trainers/staff of relevant events
6. **Bulk Actions** - Mark all as read, bulk archive, etc.
7. **Search** - Full-text search on notification titles/messages
8. **Analytics** - Track notification engagement (which ones owner reads)

---

## 🐛 Troubleshooting

### Owner Dashboard is Empty
**Cause**: Scheduled tasks haven't run yet
**Fix**: Either wait for next scheduled time or trigger manually via:
```
POST /api/public/seed-notifications/{ownerId}
```

### Notifications Not Creating
**Cause**: Event service not being called
**Fix**: Ensure services are calling `notificationEventService.notify*()` methods

### Scheduled Tasks Not Running
**Cause**: Spring task scheduling not enabled
**Fix**: Ensure `@EnableScheduling` is on main application class

### Old Notifications Piling Up
**Cause**: Cleanup task not running
**Fix**: Check logs for NotificationScheduler errors

---

## 📚 File References

**Backend:**
- `NotificationEventService.java` - Event listeners
- `NotificationScheduler.java` - Scheduled tasks
- `NotificationService.java` - Core logic
- `NotificationController.java` - API endpoints
- `Notification.java` - Entity model
- `NotificationRepository.java` - Database queries

**Frontend:**
- `OwnerNotifications.tsx` - Dashboard component
- `notificationApi.ts` - API calls

---

**Last Updated:** 2026-03-30  
**Status:** Production Ready ✅
