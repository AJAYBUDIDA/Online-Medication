package com.medication.system.payload.request;

import com.medication.system.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    private Role role;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    // Additional fields for profile creation
    private String specialization; // For Doctor
    private String licenseNumber; // For Doctor/Pharmacist
    private String hospitalName; // For Doctor
    private String pharmacyName; // For Pharmacist
    private String gstNumber; // For Pharmacist
    private String medicalHistory; // For Patient
    private String allergies; // For Patient
    private String age; // For Patient
}
