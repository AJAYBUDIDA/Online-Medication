package com.medication.system.controller;

import com.medication.system.entity.Patient;
import com.medication.system.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientRepository patientRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('doctor') or hasAuthority('admin') or hasAuthority('pharmacist')")
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientRepository.findAll());
    }
}
