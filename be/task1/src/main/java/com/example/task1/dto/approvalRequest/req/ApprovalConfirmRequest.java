package com.example.task1.dto.approvalRequest.req;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalConfirmRequest {
    private String approvalStatus; // "approved" hoặc "rejected"
    private String feedback; // Phản hồi của approver, có thể là lý do từ chối hoặc ghi chú khi duyệt
}
