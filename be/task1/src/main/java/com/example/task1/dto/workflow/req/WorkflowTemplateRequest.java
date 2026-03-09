package com.example.task1.dto.workflow.req;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowTemplateRequest {
    String name;
    String description;
    List<WorkflowStepRequest> steps;
}
