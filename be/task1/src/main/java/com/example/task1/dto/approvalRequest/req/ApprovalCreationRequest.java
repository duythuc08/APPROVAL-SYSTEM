package com.example.task1.dto.approvalRequest.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalCreationRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String approvalDescription;

    @NotEmpty(message = "Product quantities must not be empty")
    private Map<Long, Integer> productQuantities;

    @NotBlank(message = "Approver is required")
    private String currentApproverId;
}
