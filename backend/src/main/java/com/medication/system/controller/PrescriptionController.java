package com.medication.system.controller;

import com.medication.system.entity.Prescription;
import com.medication.system.entity.PrescriptionAudit;
import com.medication.system.entity.PrescriptionStatus;
import com.medication.system.entity.Role;
import com.medication.system.payload.request.PrescriptionRequest;
import com.medication.system.service.FileStorageService;
import com.medication.system.service.PrescriptionService;
import com.medication.system.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @PreAuthorize("hasAuthority('doctor')")
    public ResponseEntity<?> createPrescription(
            @RequestPart("prescription") PrescriptionRequest prescriptionRequest,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        System.out.println("DEBUG: Received prescription creation request");
        System.out.println("DEBUG: Payload: " + prescriptionRequest);
        if (file != null) {
            System.out.println("DEBUG: File received: " + file.getOriginalFilename() + ", size: " + file.getSize());
        } else {
            System.out.println("DEBUG: No file received");
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        try {
            Prescription prescription = prescriptionService.createPrescription(prescriptionRequest, file,
                    userDetails.getId());
            System.out.println("DEBUG: Prescription created successfully with ID: " + prescription.getId());
            return ResponseEntity.ok(prescription);
        } catch (Exception e) {
            System.out.println("ERROR: Failed to create prescription: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error creating prescription: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('doctor')")
    public ResponseEntity<?> updatePrescription(@PathVariable Long id, @RequestBody PrescriptionRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        try {
            Prescription prescription = prescriptionService.updatePrescription(id, request, userDetails.getUsername());
            return ResponseEntity.ok(prescription);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    // @PreAuthorize("hasAuthority('doctor') or hasAuthority('patient') or
    // hasAuthority('pharmacist')")
    public ResponseEntity<List<Prescription>> getPrescriptions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        System.out.println(
                "DEBUG: User " + userDetails.getUsername() + " has authorities: " + userDetails.getAuthorities());
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        if (role.equals(Role.doctor.name())) {
            return ResponseEntity.ok(prescriptionService.getPrescriptionsByDoctor(userDetails.getId()));
        } else if (role.equals(Role.patient.name())) {
            return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatient(userDetails.getId()));
        } else if (role.equals(Role.pharmacist.name())) {
            return ResponseEntity.ok(prescriptionService.getAllPendingPrescriptions());
        }

        return ResponseEntity.badRequest().build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('pharmacist')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody PrescriptionStatus status) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        Prescription prescription = prescriptionService.updateStatus(id, status, userDetails.getUsername());
        return ResponseEntity.ok(prescription);
    }

    @PutMapping("/{id}/dispense")
    @PreAuthorize("hasAuthority('pharmacist')")
    public ResponseEntity<?> dispensePrescription(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        try {
            Prescription prescription = prescriptionService.dispensePrescription(id, userDetails.getId());
            return ResponseEntity.ok(prescription);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/renew")
    @PreAuthorize("hasAuthority('doctor')")
    public ResponseEntity<?> renewPrescription(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        try {
            Prescription prescription = prescriptionService.renewPrescription(id, userDetails.getUsername());
            return ResponseEntity.ok(prescription);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/audit")
    @PreAuthorize("hasAuthority('doctor') or hasAuthority('pharmacist') or hasAuthority('admin')")
    public ResponseEntity<List<PrescriptionAudit>> getAudit(@PathVariable Long id) {
        return ResponseEntity.ok(prescriptionService.getAuditLogs(id));
    }

    @GetMapping("/download/{filename:.+}")
    @PreAuthorize("hasAuthority('doctor') or hasAuthority('patient') or hasAuthority('pharmacist')")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        Resource file = fileStorageService.load(filename);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }
}
