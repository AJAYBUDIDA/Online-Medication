package com.medication.system.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PrescriptionItemRequest {
    @NotBlank
    private String medicationName;

    @NotBlank
    private String dosage;

    private String frequency;

    @NotBlank
    private String duration;

    private String instructions;
}
