package com.example.task1.service;

import com.example.task1.dto.workflow.req.WorkflowStepRequest;
import com.example.task1.dto.workflow.req.WorkflowTemplateRequest;
import com.example.task1.dto.workflow.res.WorkflowStepResponse;
import com.example.task1.dto.workflow.res.WorkflowTemplateResponse;
import com.example.task1.entity.Users;
import com.example.task1.entity.WorkflowStep;
import com.example.task1.entity.WorkflowTemplate;
import com.example.task1.exception.AppException;
import com.example.task1.exception.ErrorCode;
import com.example.task1.repository.ApprovalRequestRepository;
import com.example.task1.repository.UserRepository;
import com.example.task1.repository.WorkflowTemplateRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkflowTemplateService {
    private final WorkflowTemplateRepository workflowTemplateRepository;
    private final ApprovalRequestRepository approvalRequestRepository;
    private final UserRepository userRepository;

    public List<WorkflowTemplateResponse> getAllTemplates() {
        return workflowTemplateRepository.findByActiveTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    public WorkflowTemplateResponse getTemplate(Long id) {
        WorkflowTemplate template = workflowTemplateRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.WORKFLOW_NOT_FOUND));
        return toResponse(template);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Transactional
    public WorkflowTemplateResponse createTemplate(WorkflowTemplateRequest request) {
        if (workflowTemplateRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.WORKFLOW_NAME_EXISTS);
        }
        if (request.getSteps() == null || request.getSteps().isEmpty()) {
            throw new AppException(ErrorCode.WORKFLOW_NO_STEPS);
        }

        WorkflowTemplate template = new WorkflowTemplate();
        template.setName(request.getName());
        template.setDescription(request.getDescription());

        for (WorkflowStepRequest stepReq : request.getSteps()) {
            WorkflowStep step = toStepEntity(stepReq, template);
            template.getSteps().add(step);
        }

        return toResponse(workflowTemplateRepository.save(template));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Transactional
    public WorkflowTemplateResponse updateTemplate(Long id, WorkflowTemplateRequest request) {
        WorkflowTemplate template = workflowTemplateRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.WORKFLOW_NOT_FOUND));

        if (!template.getName().equals(request.getName()) && workflowTemplateRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.WORKFLOW_NAME_EXISTS);
        }
        if (request.getSteps() == null || request.getSteps().isEmpty()) {
            throw new AppException(ErrorCode.WORKFLOW_NO_STEPS);
        }

        template.setName(request.getName());
        template.setDescription(request.getDescription());

        // Xoa steps cu, them steps moi (orphanRemoval = true se xoa trong DB)
        template.getSteps().clear();
        for (WorkflowStepRequest stepReq : request.getSteps()) {
            WorkflowStep step = toStepEntity(stepReq, template);
            template.getSteps().add(step);
        }

        return toResponse(workflowTemplateRepository.save(template));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Transactional
    public void deleteTemplate(Long id) {
        WorkflowTemplate template = workflowTemplateRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.WORKFLOW_NOT_FOUND));

        // Khong xoa that, chi vo hieu hoa
        template.setActive(false);
        workflowTemplateRepository.save(template);
    }

    // === Mapping helpers ===

    private WorkflowStep toStepEntity(WorkflowStepRequest req, WorkflowTemplate template) {
        WorkflowStep step = new WorkflowStep();
        step.setTemplate(template);
        step.setStepOrder(req.getStepOrder());
        step.setStepName(req.getStepName());
        step.setRequiredRole(req.getRequiredRole());

        if (req.getSpecificApproverId() != null && !req.getSpecificApproverId().isBlank()) {
            Users approver = userRepository.findByUserId(req.getSpecificApproverId())
                    .orElseThrow(() -> new AppException(ErrorCode.APPROVER_NOT_FOUND));
            step.setSpecificApprover(approver);
        }

        return step;
    }

    private WorkflowTemplateResponse toResponse(WorkflowTemplate template) {
        WorkflowTemplateResponse res = new WorkflowTemplateResponse();
        res.setId(template.getId());
        res.setName(template.getName());
        res.setDescription(template.getDescription());
        res.setSteps(template.getSteps().stream().map(this::toStepResponse).toList());
        return res;
    }

    private WorkflowStepResponse toStepResponse(WorkflowStep step) {
        WorkflowStepResponse res = new WorkflowStepResponse();
        res.setId(step.getId());
        res.setStepOrder(step.getStepOrder());
        res.setStepName(step.getStepName());
        res.setRequiredRole(step.getRequiredRole() != null ? step.getRequiredRole().name() : null);
        res.setSpecificApproverName(
                step.getSpecificApprover() != null ? step.getSpecificApprover().getName() : null
        );
        return res;
    }
}
