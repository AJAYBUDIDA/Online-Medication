package com.medication.system.repository;

import com.medication.system.entity.MedicationReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicationReminderRepository extends JpaRepository<MedicationReminder, Long> {
    List<MedicationReminder> findByUserId(Long userId);
}
