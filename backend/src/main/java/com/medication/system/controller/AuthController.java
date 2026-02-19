package com.medication.system.controller;

import com.medication.system.entity.*;
import com.medication.system.payload.request.LoginRequest;
import com.medication.system.payload.request.SignupRequest;
import com.medication.system.payload.response.JwtResponse;
import com.medication.system.payload.response.MessageResponse;
import com.medication.system.repository.*;
import com.medication.system.security.jwt.JwtUtils;
import com.medication.system.service.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    DoctorRepository doctorRepository;

    @Autowired
    PatientRepository patientRepository;

    @Autowired
    PharmacistRepository pharmacistRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User();
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setUsername(signUpRequest.getUsername());
        user.setRole(signUpRequest.getRole());

        User savedUser = userRepository.save(user);

        // Create specific profile based on role
        switch (user.getRole()) {
            case doctor:
                Doctor doctor = new Doctor();
                doctor.setUser(savedUser);
                doctor.setSpecialization(signUpRequest.getSpecialization());
                doctor.setLicenseNumber(signUpRequest.getLicenseNumber());
                doctor.setHospitalName(signUpRequest.getHospitalName());
                doctorRepository.save(doctor);
                break;
            case patient:
                Patient patient = new Patient();
                patient.setUser(savedUser);
                patient.setMedicalHistory(signUpRequest.getMedicalHistory());
                patient.setAllergies(signUpRequest.getAllergies());
                patient.setAge(signUpRequest.getAge());
                patientRepository.save(patient);
                break;
            case pharmacist:
                Pharmacist pharmacist = new Pharmacist();
                pharmacist.setUser(savedUser);
                pharmacist.setPharmacyName(signUpRequest.getPharmacyName());
                pharmacist.setLicenseNumber(signUpRequest.getLicenseNumber());
                pharmacist.setGstNumber(signUpRequest.getGstNumber());
                pharmacistRepository.save(pharmacist);
                break;
            case admin:
                // Admin might not need a separate profile table for now
                break;
        }

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
