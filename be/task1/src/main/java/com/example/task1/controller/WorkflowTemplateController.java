package com.example.task1.controller;

import com.example.task1.dto.ApiResponse;
import com.example.task1.dto.workflow.req.WorkflowTemplateRequest;
import com.example.task1.dto.workflow.res.WorkflowTemplateResponse;
import com.example.task1.service.WorkflowTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/workflows")
@RequiredArgsConstructor
public class WorkflowTemplateController {
    private final WorkflowTemplateService workflowTemplateService;

    @GetMapping
    public ApiResponse<List<WorkflowTemplateResponse>> getAllTemplates() {
        return ApiResponse.<List<WorkflowTemplateResponse>>builder()
                .result(workflowTemplateService.getAllTemplates())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<WorkflowTemplateResponse> getTemplate(@PathVariable Long id) {
        return ApiResponse.<WorkflowTemplateResponse>builder()
                .result(workflowTemplateService.getTemplate(id))
                .build();
    }

    @PostMapping("/create")
    public ApiResponse<WorkflowTemplateResponse> createTemplate(@Valid @RequestBody WorkflowTemplateRequest request) {
        return ApiResponse.<WorkflowTemplateResponse>builder()
                .result(workflowTemplateService.createTemplate(request))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<WorkflowTemplateResponse> updateTemplate(@PathVariable Long id,
                                                                 @Valid @RequestBody WorkflowTemplateRequest request) {
        return ApiResponse.<WorkflowTemplateResponse>builder()
                .result(workflowTemplateService.updateTemplate(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteTemplate(@PathVariable Long id) {
        workflowTemplateService.deleteTemplate(id);
        return ApiResponse.<Void>builder().build();
    }
}
