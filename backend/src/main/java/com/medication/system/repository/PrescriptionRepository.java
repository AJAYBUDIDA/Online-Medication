package com.medication.system.repository;

import com.medication.system.entity.Doctor;
import com.medication.system.entity.Patient;
import com.medication.system.entity.Prescription;
import com.medication.system.entity.PrescriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByDoctor(Doctor doctor);

    List<Prescription> findByPatient(Patient patient);

    List<Prescription> findByStatus(PrescriptionStatus status);
}
