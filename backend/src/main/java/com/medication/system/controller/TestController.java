package com.medication.system.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/all")
    public String allAccess() {
        return "Public Content.";
    }

    @GetMapping("/patient")
    @PreAuthorize("hasAuthority('patient')")
    public String patientAccess() {
        return "Patient Content.";
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasAuthority('doctor')")
    public String doctorAccess() {
        return "Doctor Content.";
    }

    @GetMapping("/pharmacist")
    @PreAuthorize("hasAuthority('pharmacist')")
    public String pharmacistAccess() {
        return "Pharmacist Content.";
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('admin')")
    public String adminAccess() {
        return "Admin Content.";
    }
}
