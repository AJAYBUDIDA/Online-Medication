package com.medication.system.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Pharmacist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String pharmacyName;
    private String licenseNumber;
    private String gstNumber;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}
