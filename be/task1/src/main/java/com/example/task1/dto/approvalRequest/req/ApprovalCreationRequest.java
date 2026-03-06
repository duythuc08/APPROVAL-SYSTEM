package com.example.task1.dto.approvalRequest.req;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalCreationRequest {
    private String title;
    private String approvalDescription;
    private Map<Long, Integer> productQuantities; // productId → số lượng yêu cầu
    private String currentApproverId;
}
