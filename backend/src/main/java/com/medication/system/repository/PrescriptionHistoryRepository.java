package com.medication.system.repository;

import com.medication.system.entity.Prescription;
import com.medication.system.entity.PrescriptionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionHistoryRepository extends JpaRepository<PrescriptionHistory, Long> {
    List<PrescriptionHistory> findByPrescription(Prescription prescription);
}
