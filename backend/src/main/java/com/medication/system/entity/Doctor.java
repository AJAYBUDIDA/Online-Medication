package com.medication.system.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String specialization;
    private String licenseNumber;
    private String hospitalName;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}
