package com.example.task1.dto.approvalRequest.res;

import com.example.task1.entity.Products;
import com.example.task1.entity.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalResponse {
    private Long approvalRequestId;
    private String title;
    private String approvalDescription;
    private String ApprovalStatus; // e.g., "PENDING", "APPROVED", "REJECTED"
    private Set<Products> products;
    private Map<Long, Integer> productQuantities; // productId → số lượng yêu cầu
    private Users creatorUser;
    private Users currentApprover;
    private String feedback;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
