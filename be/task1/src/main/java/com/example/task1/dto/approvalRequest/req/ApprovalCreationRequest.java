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
    Long templateId;
    Map<String, Object> requestData;
}
