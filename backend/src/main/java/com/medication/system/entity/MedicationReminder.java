package com.medication.system.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalTime;

@Entity
@Data
public class MedicationReminder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String medicationName;
    private String dosage;

    @com.fasterxml.jackson.annotation.JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "HH:mm")
    private LocalTime reminderTime;

    // Frequency: "DAILY", "WEEKLY", etc.
    private String frequency;

    // Days if custom frequency (e.g., "MON,WED,FRI")
    private String days;

    private boolean isActive = true;
}
