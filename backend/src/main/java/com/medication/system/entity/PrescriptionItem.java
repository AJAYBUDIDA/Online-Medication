package com.medication.system.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "prescription_items")
public class PrescriptionItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "prescription_id")
    @JsonIgnore
    private Prescription prescription;

    private String medicationName;
    private String dosage;
    private String frequency;
    private String duration;
    private String instructions;
}
