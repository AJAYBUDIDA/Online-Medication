package com.medication.system.payload.request;

import lombok.Data;
import java.util.List;
import jakarta.validation.constraints.NotEmpty;

@Data
public class PrescriptionRequest {
    private Long patientId;

    @NotEmpty(message = "Prescription must have at least one medication")
    private List<PrescriptionItemRequest> items;

    private Integer renewalPeriod; // Optional
    private Integer maxRenewals; // Optional
}
