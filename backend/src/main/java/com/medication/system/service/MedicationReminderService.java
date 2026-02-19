package com.medication.system.service;

import com.medication.system.entity.MedicationReminder;
import com.medication.system.repository.MedicationReminderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicationReminderService {

    @Autowired
    private MedicationReminderRepository reminderRepository;

    public MedicationReminder createReminder(MedicationReminder reminder) {
        return reminderRepository.save(reminder);
    }

    public List<MedicationReminder> getRemindersByUser(Long userId) {
        return reminderRepository.findByUserId(userId);
    }

    public void deleteReminder(Long id) {
        reminderRepository.deleteById(id);
    }

    public MedicationReminder toggleActive(Long id) {
        MedicationReminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reminder not found"));
        reminder.setActive(!reminder.isActive());
        return reminderRepository.save(reminder);
    }
}
