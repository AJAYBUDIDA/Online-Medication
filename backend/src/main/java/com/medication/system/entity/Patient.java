package com.medication.system.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String medicalHistory;
    private String allergies;
    private String age;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}
