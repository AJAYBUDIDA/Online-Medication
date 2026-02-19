package com.medication.system.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medication.system.entity.*;
import com.medication.system.payload.request.PrescriptionItemRequest;
import com.medication.system.payload.request.PrescriptionRequest;
import com.medication.system.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private PrescriptionAuditRepository auditRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private FileStorageService fileStorageService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public Prescription createPrescription(PrescriptionRequest request, MultipartFile file, Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Prescription prescription = new Prescription();
        prescription.setDoctor(doctor);
        prescription.setPatient(patient);
        prescription.setStatus(PrescriptionStatus.PENDING_APPROVAL); // Default per requirements
        prescription.setIssueDate(LocalDate.now());

        // Process Items
        for (PrescriptionItemRequest itemRequest : request.getItems()) {
            PrescriptionItem item = new PrescriptionItem();
            item.setMedicationName(itemRequest.getMedicationName());
            item.setDosage(itemRequest.getDosage());
            item.setFrequency(itemRequest.getFrequency());
            item.setDuration(itemRequest.getDuration());
            item.setInstructions(itemRequest.getInstructions());
            prescription.addItem(item);
        }

        // Set expiry based on first item's duration or default
        // Logic can be more complex to find max duration
        prescription.setExpiryDate(LocalDate.now().plusDays(30));

        if (request.getRenewalPeriod() != null) {
            prescription.setRenewalPeriod(request.getRenewalPeriod());
        }
        if (request.getMaxRenewals() != null) {
            prescription.setMaxRenewals(request.getMaxRenewals());
        }

        if (file != null && !file.isEmpty()) {
            String fileName = fileStorageService.save(file);
            prescription.setFilePath(fileName);
        }

        Prescription saved = prescriptionRepository.save(prescription);
        logAudit(saved, "CREATED", "Doctor " + doctor.getId(), "Prescription created", null);

        // Notify patient
        notificationService.sendNotification(saved.getPatient().getId(),
                "You have received a new prescription from Dr. " + doctor.getUser().getUsername());

        return saved;
    }

    @Transactional
    public Prescription updatePrescription(Long id, PrescriptionRequest request, String changedBy) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        String oldData = serializeJson(prescription);

        // Clear old items and add new ones (Simplified update strategy)
        prescription.getItems().clear();
        for (PrescriptionItemRequest itemRequest : request.getItems()) {
            PrescriptionItem item = new PrescriptionItem();
            item.setMedicationName(itemRequest.getMedicationName());
            item.setDosage(itemRequest.getDosage());
            item.setFrequency(itemRequest.getFrequency());
            item.setDuration(itemRequest.getDuration());
            item.setInstructions(itemRequest.getInstructions());
            prescription.addItem(item);
        }

        if (request.getRenewalPeriod() != null)
            prescription.setRenewalPeriod(request.getRenewalPeriod());
        if (request.getMaxRenewals() != null)
            prescription.setMaxRenewals(request.getMaxRenewals());

        Prescription saved = prescriptionRepository.save(prescription);
        logAudit(saved, "UPDATED", changedBy, "Prescription updated", oldData);

        return saved;
    }

    public List<Prescription> getPrescriptionsByDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        return prescriptionRepository.findByDoctor(doctor);
    }

    public List<Prescription> getPrescriptionsByPatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return prescriptionRepository.findByPatient(patient);
    }

    public List<Prescription> getAllPendingPrescriptions() {
        return prescriptionRepository.findByStatus(PrescriptionStatus.PENDING_APPROVAL);
    }

    @Transactional
    public Prescription updateStatus(Long id, PrescriptionStatus status, String changedBy) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        String oldData = serializeJson(prescription);

        prescription.setStatus(status);
        Prescription saved = prescriptionRepository.save(prescription);

        logAudit(saved, status.name(), changedBy, "Status updated to " + status, oldData);

        if (status == PrescriptionStatus.APPROVED) {
            notificationService.sendNotification(saved.getPatient().getId(),
                    "Your prescription for " + saved.getItems().size() + " medication(s) has been APPROVED.");
        } else if (status == PrescriptionStatus.REJECTED) {
            notificationService.sendNotification(saved.getPatient().getId(),
                    "Your prescription for " + saved.getItems().size()
                            + " medication(s) has been REJECTED. Please contact your doctor.");
        }

        return saved;
    }

    @Transactional
    public Prescription renewPrescription(Long id, String changedBy) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        if (prescription.getMaxRenewals() != null && prescription.getRenewalCount() >= prescription.getMaxRenewals()) {
            throw new RuntimeException("Maximum renewals reached");
        }

        String oldData = serializeJson(prescription);

        prescription.setStatus(PrescriptionStatus.RENEWED);
        prescription.setRenewalCount(prescription.getRenewalCount() + 1);

        // Extend expiry
        int renewalDays = prescription.getRenewalPeriod() != null ? prescription.getRenewalPeriod() : 30;
        prescription.setExpiryDate(prescription.getExpiryDate().plusDays(renewalDays));

        Prescription saved = prescriptionRepository.save(prescription);
        logAudit(saved, "RENEWED", changedBy, "Prescription renewed", oldData);

        return saved;
    }

    public List<PrescriptionAudit> getAuditLogs(Long prescriptionId) {
        return auditRepository.findByPrescriptionIdOrderByVersionDesc(prescriptionId);
    }

    // ... existing audit code ...

    @Transactional
    public Prescription dispensePrescription(Long id, Long pharmacistId) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        if (prescription.getStatus() != PrescriptionStatus.APPROVED
                && prescription.getStatus() != PrescriptionStatus.RENEWED) {
            throw new RuntimeException("Prescription must be APPROVED or RENEWED to be dispensed");
        }

        if (prescription.getExpiryDate().isBefore(LocalDate.now())) {
            prescription.setStatus(PrescriptionStatus.EXPIRED);
            prescriptionRepository.save(prescription);
            throw new RuntimeException("Prescription has expired");
        }

        String oldData = serializeJson(prescription);

        prescription.setDispensed(true);
        prescription.setDispensedAt(LocalDateTime.now());
        prescription.setPharmacistId(pharmacistId);
        // prescription.setStatus(PrescriptionStatus.DISPENSED); // Uncomment if
        // DISPENSED status exists in Enum

        Prescription saved = prescriptionRepository.save(prescription);
        logAudit(saved, "DISPENSED", "Pharmacist " + pharmacistId, "Prescription dispensed", oldData);

        notificationService.sendNotification(saved.getPatient().getId(),
                "Your prescription for " + saved.getItems().size() + " medication(s) has been DISPENSED.");

        return saved;
    }

    // Auto-Expiry Cron Job (Runs every day at midnight)
    // @Scheduled(cron = "0 0 0 * * ?")
    // For checks, we can run it every minute for testing: @Scheduled(cron = "0 * *
    // * * ?")
    @org.springframework.scheduling.annotation.Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void checkExpiry() {
        List<Prescription> activePrescriptions = prescriptionRepository.findByStatus(PrescriptionStatus.APPROVED);
        activePrescriptions.addAll(prescriptionRepository.findByStatus(PrescriptionStatus.PENDING_APPROVAL));
        activePrescriptions.addAll(prescriptionRepository.findByStatus(PrescriptionStatus.RENEWED));

        LocalDate today = LocalDate.now();

        for (Prescription p : activePrescriptions) {
            if (p.getExpiryDate() != null && p.getExpiryDate().isBefore(today)) {
                String oldData = serializeJson(p);
                p.setStatus(PrescriptionStatus.EXPIRED);
                Prescription saved = prescriptionRepository.save(p);
                logAudit(saved, "EXPIRED", "SYSTEM", "Auto-expired due to date", oldData);
            }
        }
    }

    private void logAudit(Prescription prescription, String reason, String changedBy, String details, String oldData) {
        PrescriptionAudit audit = new PrescriptionAudit();
        audit.setPrescriptionId(prescription.getId());
        audit.setChangedBy(changedBy);
        audit.setChangeReason(reason + ": " + details);
        audit.setOldData(oldData);
        audit.setNewData(serializeJson(prescription));
        audit.setVersion(prescription.getVersion()); // Version is handled by JPA @Version
        auditRepository.save(audit);
    }

    private String serializeJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return "Error serializing data: " + e.getMessage();
        }
    }
}
