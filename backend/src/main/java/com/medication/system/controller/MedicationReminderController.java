package com.medication.system.controller;

import com.medication.system.entity.MedicationReminder;
import com.medication.system.service.MedicationReminderService;
import com.medication.system.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reminders")
public class MedicationReminderController {

    @Autowired
    private MedicationReminderService reminderService;

    @PostMapping
    public ResponseEntity<MedicationReminder> createReminder(@RequestBody MedicationReminder reminder) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        reminder.setUserId(userDetails.getId());
        return ResponseEntity.ok(reminderService.createReminder(reminder));
    }

    @GetMapping
    public ResponseEntity<List<MedicationReminder>> getMyReminders() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        List<MedicationReminder> reminders = reminderService.getRemindersByUser(userDetails.getId());
        System.out.println("DEBUG: User " + userDetails.getUsername() + " (ID: " + userDetails.getId()
                + ") fetching reminders. Found: " + reminders.size());
        return ResponseEntity.ok(reminders);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReminder(@PathVariable Long id) {
        reminderService.deleteReminder(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<MedicationReminder> toggleReminder(@PathVariable Long id) {
        return ResponseEntity.ok(reminderService.toggleActive(id));
    }
}
