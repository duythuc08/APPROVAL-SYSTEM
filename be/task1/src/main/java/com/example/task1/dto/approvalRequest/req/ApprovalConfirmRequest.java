package com.example.task1.dto.approvalRequest.req;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalConfirmRequest {
    @NotBlank(message = "Approval status is required")
    private String approvalStatus;

    private String feedback;
}
