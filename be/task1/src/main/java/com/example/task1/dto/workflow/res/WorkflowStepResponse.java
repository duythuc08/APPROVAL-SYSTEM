package com.example.task1.dto.workflow.res;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowStepResponse {
    Long id;
    int stepOrder;
    String stepName;
    String requiredRole;
    String specificApproverName;  // nullable

}
