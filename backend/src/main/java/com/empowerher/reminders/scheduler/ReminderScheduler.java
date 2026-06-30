package com.empowerher.reminders.scheduler;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.empowerher.reminders.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Component
public class ReminderScheduler {

    @Autowired
    private EmailService emailService;

    // Periodically run scheduler (every 60 seconds)
    @Scheduled(fixedDelay = 60000)
    public void processDueReminders() {
        System.out.println("Scheduler: Checking for due breast health reminders...");
        try {
            Firestore db = FirestoreClient.getFirestore();
            if (db == null) {
                System.err.println("Scheduler Error: Firestore database instance is null. Is Firebase Admin SDK initialized?");
                return;
            }

            CollectionReference remindersRef = db.collection("reminders");
            // Query reminders that are Active and have email notifications enabled
            Query query = remindersRef.whereEqualTo("status", "Active").whereEqualTo("emailNotification", true);
            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();

            LocalDateTime now = LocalDateTime.now();
            System.out.println("Scheduler: Found " + documents.size() + " active email reminders in system.");

            for (QueryDocumentSnapshot doc : documents) {
                processReminder(db, doc, now);
            }
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Scheduler execution failed: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected scheduler error: " + e.getMessage());
        }
    }

    private void processReminder(Firestore db, QueryDocumentSnapshot doc, LocalDateTime now) {
        String id = doc.getId();
        String title = doc.getString("title");
        String type = doc.getString("type");
        String note = doc.getString("note");
        String dateStr = doc.getString("date"); // e.g. "2026-07-12"
        String timeStr = doc.getString("time"); // e.g. "20:00"
        String repeat = doc.getString("repeat"); // Once, Monthly, Custom
        String nextReminderStr = doc.getString("nextReminder"); // e.g. "2026-07-12"
        String userEmail = doc.getString("userEmail");
        String userName = doc.getString("userName");

        if (userEmail == null || userEmail.trim().isEmpty()) {
            System.err.println("Scheduler Reminder [" + id + "]: Missing userEmail, skipping.");
            return;
        }

        if (nextReminderStr == null || nextReminderStr.isEmpty()) {
            nextReminderStr = dateStr;
        }
        if (timeStr == null || timeStr.isEmpty()) {
            timeStr = "08:00"; // fallback
        }
        if (userName == null || userName.isEmpty()) {
            userName = "EmpowerHer User";
        }

        try {
            LocalDate nextDate = LocalDate.parse(nextReminderStr);
            LocalTime schedTime = LocalTime.parse(timeStr);
            LocalDateTime scheduledDateTime = LocalDateTime.of(nextDate, schedTime);

            // Check if reminder is due
            if (now.isAfter(scheduledDateTime) || now.isEqual(scheduledDateTime)) {
                System.out.println("Scheduler: Reminder [" + id + "] is DUE! Sending email to " + userEmail);
                
                DocumentReference docRef = db.collection("reminders").document(id);

                try {
                    // Send Email
                    emailService.sendReminderEmail(userEmail, userName, title, note, nextReminderStr, timeStr);

                    // Calculate next scheduled date
                    String newNextReminder;
                    String newStatus = "Active";

                    if ("Once".equalsIgnoreCase(repeat)) {
                        newStatus = "Off"; // disable since it fires once
                        newNextReminder = nextReminderStr;
                    } else if ("Monthly".equalsIgnoreCase(repeat)) {
                        newNextReminder = nextDate.plusMonths(1).toString();
                    } else {
                        // Custom defaults to 2 weeks interval
                        newNextReminder = nextDate.plusWeeks(2).toString();
                    }

                    // Update Firestore document fields on success
                    Map<String, Object> updates = new HashMap<>();
                    updates.put("deliveryStatus", "Sent");
                    updates.put("lastSent", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                    updates.put("nextReminder", newNextReminder);
                    updates.put("status", newStatus);

                    docRef.update(updates).get();
                    System.out.println("Scheduler: Updated database status for reminder [" + id + "] to Sent.");

                } catch (Exception mailError) {
                    System.err.println("Scheduler: Failed to deliver email for reminder [" + id + "]: " + mailError.getMessage());
                    
                    // Update Firestore document fields on failure
                    Map<String, Object> updates = new HashMap<>();
                    updates.put("deliveryStatus", "Failed");
                    docRef.update(updates).get();
                }
            }
        } catch (Exception e) {
            System.err.println("Scheduler: Error parsing dates/times for reminder [" + id + "]: " + e.getMessage());
        }
    }
}
