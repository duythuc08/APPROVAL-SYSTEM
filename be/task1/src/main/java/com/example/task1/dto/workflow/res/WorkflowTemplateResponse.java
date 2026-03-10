package com.example.task1.dto.workflow.res;

import com.example.task1.enums.ExecutionMode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowTemplateResponse {
    Long id;
    String name;
    String description;
    List<WorkflowStepResponse> steps;
    ExecutionMode executionMode;
}

