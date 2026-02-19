package com.medication.system.payload.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank
    @Email
    private String email;

    // Add other fields if needed, e.g., phone, address
}
