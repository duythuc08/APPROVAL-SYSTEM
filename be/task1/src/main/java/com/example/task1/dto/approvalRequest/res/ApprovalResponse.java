package com.example.task1.dto.approvalRequest.res;

import com.example.task1.entity.Products;
import com.example.task1.entity.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalResponse {
    Long approvalRequestId;
    String title;
    String approvalStatus;
    String creatorName;
    String templateName;                // Tên quy trình
    int currentStepOrder;
    int totalSteps;
    String currentStepName;            // "Trưởng phòng duyệt"
    String currentApproverName;        // Tính từ step hiện tại
    Map<String, Object> requestData;
    List<ApprovalHistoryResponse> history;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

}
