package com.example.task1.dto.workflow.req;

import com.example.task1.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowStepRequest {
    int stepOrder;
    String stepName;
    Role requiredRole;
    String specificApproverId;  // nullable

}
