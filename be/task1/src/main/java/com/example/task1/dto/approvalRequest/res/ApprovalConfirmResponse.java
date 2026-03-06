package com.example.task1.dto.approvalRequest.res;

import com.example.task1.entity.Products;
import com.example.task1.entity.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalConfirmResponse {
    private Long approvalRequestId;
    private String title;
    private String approvalDescription;
    private Set<Products> products;
    private Users creatorUser;
    private Users currentApprover;
    private String approvalStatus; // "approved" hoặc "rejected"
    private String feedback; // Phản hồi của approver, có thể là lý do từ chối hoặc ghi chú khi duyệt
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
