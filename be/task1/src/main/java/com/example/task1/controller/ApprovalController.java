package com.example.task1.controller;

import com.example.task1.dto.ApiResponse;
import com.example.task1.dto.approvalRequest.req.ApprovalConfirmRequest;
import com.example.task1.dto.approvalRequest.req.ApprovalCreationRequest;
import com.example.task1.dto.approvalRequest.res.ApprovalConfirmResponse;
import com.example.task1.dto.approvalRequest.res.ApprovalResponse;
import com.example.task1.entity.ApprovalRequests;
import com.example.task1.service.ApprovalService;
import com.turkraft.springfilter.boot.Filter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/approval-requests")
@RequiredArgsConstructor
public class ApprovalController {
    private final ApprovalService approvalService;

    @GetMapping
    public ApiResponse<Page<ApprovalResponse>> getAllApprovalRequests(@Filter Specification<ApprovalRequests> spec, Pageable pageable) {
        return ApiResponse.<Page<ApprovalResponse>>builder()
                .result(approvalService.getApprovalRequests(spec, pageable))
                .build();
    }

    @GetMapping("/myUser")
    public ApiResponse<Page<ApprovalResponse>> getMyUserApprovalRequests(@Filter Specification<ApprovalRequests> spec, Pageable pageable) {
        return ApiResponse.<Page<ApprovalResponse>>builder()
                .result(approvalService.getMyUserApproval(spec, pageable))
                .build();
    }

    @GetMapping("/myApprover")
    public ApiResponse<Page<ApprovalResponse>> getMyApproverApprovalRequests(@Filter Specification<ApprovalRequests> spec, Pageable pageable) {
        return ApiResponse.<Page<ApprovalResponse>>builder()
                .result(approvalService.getMyApproverApproval(spec, pageable))
                .build();
    }

    @GetMapping("/detail/{approvalRequestId}")
    public ApiResponse<ApprovalResponse> getApprovalRequestDetail(@PathVariable long approvalRequestId) {
        return ApiResponse.<ApprovalResponse>builder()
                .result(approvalService.getApprovalRequest(approvalRequestId))
                .build();
    }

    @PostMapping("/create")
    public ApiResponse<ApprovalResponse> createApprovalRequest(@Valid @RequestBody ApprovalCreationRequest request) {
        return ApiResponse.<ApprovalResponse>builder()
                .result(approvalService.createApprovalRequest(request))
                .build();
    }

    @PutMapping("/{id}/confirm")
    public ApiResponse<ApprovalConfirmResponse> confirmApprovalRequest(@PathVariable Long id,
                                                                       @Valid @RequestBody ApprovalConfirmRequest request) {
        return ApiResponse.<ApprovalConfirmResponse>builder()
                .result(approvalService.confirmApproval(request, id))
                .build();
    }
}
