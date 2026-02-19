package com.medication.system.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name = "prescriptions")
public class Prescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    // Items are now separate to allow multiple medications per prescription
    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PrescriptionItem> items = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private PrescriptionStatus status;

    private String filePath; // Optional PDF

    private LocalDate issueDate;
    private LocalDate expiryDate;

    // Renewal fields
    private Integer renewalPeriod; // in days
    private Integer maxRenewals;
    private Integer renewalCount;

    private boolean active = true;

    // Dispensing fields
    private boolean isDispensed = false;
    private LocalDateTime dispensedAt;
    private Long pharmacistId;

    // Versioning for audit
    @Version
    private Integer version;

    // Audit fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public void addItem(PrescriptionItem item) {
        items.add(item);
        item.setPrescription(this);
    }

    public void removeItem(PrescriptionItem item) {
        items.remove(item);
        item.setPrescription(null);
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (issueDate == null) {
            issueDate = LocalDate.now();
        }
        if (renewalCount == null) {
            renewalCount = 0;
        }
        if (version == null) {
            version = 1;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
