package com.example.task1.controller;

import com.example.task1.dto.ApiResponse;
import com.example.task1.dto.approvalRequest.req.ApprovalConfirmRequest;
import com.example.task1.dto.approvalRequest.req.ApprovalCreationRequest;
import com.example.task1.dto.approvalRequest.res.ApprovalConfirmResponse;
import com.example.task1.dto.approvalRequest.res.ApprovalResponse;
import com.example.task1.service.ApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/approval-requests")
@RequiredArgsConstructor
public class ApprovalController {
    private final ApprovalService approvalService;

    @GetMapping
    public ApiResponse<List<ApprovalResponse>> getAllApprovalRequests(){
        return ApiResponse.<List<ApprovalResponse>>builder()
                .result(approvalService.getApprovalRequests())
                .build();
    }

    @GetMapping("/myUser")
    public ApiResponse<List<ApprovalResponse>> getMyUserApprovalRequests(){
        return ApiResponse.<List<ApprovalResponse>>builder()
                .result(approvalService.getMyUserApproval())
                .build();
    }

    @GetMapping("/myApprover")
    public ApiResponse<List<ApprovalResponse>> getMyApproverApprovalRequests(){
        return ApiResponse.<List<ApprovalResponse>>builder()
                .result(approvalService.getMyApproverApproval())
                .build();
    }

    @GetMapping("/detail/{approvalRequestId}")
    public ApiResponse<ApprovalResponse> getApprovalRequestDetail(long approvalRequestId){
        return ApiResponse.<ApprovalResponse>builder()
                .result(approvalService.getApprovalRequest(approvalRequestId))
                .build();
    }

    @PostMapping("/create")
    public ApiResponse<ApprovalResponse> createApprovalRequest(@RequestBody ApprovalCreationRequest request){
        return ApiResponse.<ApprovalResponse>builder()
                .result(approvalService.createApprovalRequest(request))
                .build();
    }

    @PutMapping("/{id}/confirm")
    public ApiResponse<ApprovalConfirmResponse> confirmApprovalRequest(@PathVariable Long id, @RequestBody ApprovalConfirmRequest request){
        return ApiResponse.<ApprovalConfirmResponse>builder()
                .result(approvalService.confirmApproval(request,id))
                .build();
    }
}
