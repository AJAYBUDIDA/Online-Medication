package com.medication.system.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "prescription_history")
public class PrescriptionHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @Column(nullable = false)
    private String action; // CREATED, UPDATED, RENEWED, APPROVED, REJECTED

    private String changedBy; // Username or Role

    private LocalDateTime changeDate;

    @Column(length = 1000)
    private String details; // Description of what changed

    @PrePersist
    protected void onCreate() {
        changeDate = LocalDateTime.now();
    }
}
