package com.medication.system.scheduler;

import com.medication.system.entity.Prescription;
import com.medication.system.entity.PrescriptionStatus;
import com.medication.system.repository.PrescriptionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@EnableScheduling
public class PrescriptionScheduler {

    private static final Logger logger = LoggerFactory.getLogger(PrescriptionScheduler.class);

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    // Run every day at midnight
    @Scheduled(cron = "0 0 0 * * ?")
    public void markExpiredPrescriptions() {
        logger.info("Running expiry scheduler...");

        List<Prescription> activePrescriptions = prescriptionRepository.findByStatus(PrescriptionStatus.APPROVED);
        activePrescriptions.addAll(prescriptionRepository.findByStatus(PrescriptionStatus.RENEWED));

        LocalDate today = LocalDate.now();

        for (Prescription p : activePrescriptions) {
            if (p.getExpiryDate() != null && p.getExpiryDate().isBefore(today)) {
                p.setStatus(PrescriptionStatus.EXPIRED);
                p.setActive(false);
                prescriptionRepository.save(p);
                logger.info("Prescription {} marked as EXPIRED", p.getId());
            }
        }
    }
}
