package com.medication.system.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "prescription_audit")
public class PrescriptionAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long prescriptionId;

    private String changedBy; // User ID or Name

    @Column(columnDefinition = "TEXT")
    private String oldData; // JSON

    @Column(columnDefinition = "TEXT")
    private String newData; // JSON

    private String changeReason;

    private LocalDateTime changedAt;

    private Integer version;

    @PrePersist
    protected void onCreate() {
        changedAt = LocalDateTime.now();
    }
}
