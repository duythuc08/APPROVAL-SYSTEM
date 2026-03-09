package com.example.task1.dto.approvalRequest.res;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalHistoryResponse {
    int stepOrder;
    String stepName;
    String approverName;
    String action;       // APPROVED / REJECTED
    String feedback;
    LocalDateTime decidedAt;

}
