package com.medication.system.repository;

import com.medication.system.entity.Pharmacist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PharmacistRepository extends JpaRepository<Pharmacist, Long> {
    Optional<Pharmacist> findByUser_Id(Long userId);
}
