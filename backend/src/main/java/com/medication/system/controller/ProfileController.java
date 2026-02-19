package com.medication.system.controller;

import com.medication.system.entity.*;
import com.medication.system.repository.*;
import com.medication.system.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    DoctorRepository doctorRepository;

    @Autowired
    PatientRepository patientRepository;

    @Autowired
    PharmacistRepository pharmacistRepository;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());

        // Fetch additional profile details based on role
        if (user.getRole() == Role.doctor) {
            Optional<Doctor> doctor = doctorRepository.findByUser_Id(user.getId());
            doctor.ifPresent(d -> {
                response.put("specialization", d.getSpecialization());
                response.put("licenseNumber", d.getLicenseNumber());
                response.put("hospitalName", d.getHospitalName());
            });
        } else if (user.getRole() == Role.patient) {
            Optional<Patient> patient = patientRepository.findByUser_Id(user.getId());
            patient.ifPresent(p -> {
                response.put("medicalHistory", p.getMedicalHistory());
                response.put("allergies", p.getAllergies());
                response.put("age", p.getAge());
            });
        } else if (user.getRole() == Role.pharmacist) {
            Optional<Pharmacist> pharmacist = pharmacistRepository.findByUser_Id(user.getId());
            pharmacist.ifPresent(p -> {
                response.put("pharmacyName", p.getPharmacyName());
                response.put("licenseNumber", p.getLicenseNumber());
                response.put("gstNumber", p.getGstNumber());
            });
        }

        return ResponseEntity.ok(response);
    }
}
