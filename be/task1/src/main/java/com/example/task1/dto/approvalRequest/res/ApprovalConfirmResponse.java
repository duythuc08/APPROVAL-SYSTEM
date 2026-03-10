package com.example.task1.dto.approvalRequest.res;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalConfirmResponse {
    private Long approvalRequestId;
    private String title;
    private String approvalStatus;
    private String creatorName;
    private String templateName;
    private int currentStepOrder;
    private int totalSteps;
    private Map<String, Object> requestData;
    private List<ApprovalHistoryResponse> history;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime currentStepDeadline; // nullable
}
