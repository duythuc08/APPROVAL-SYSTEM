package com.example.task1.mapper;

import com.example.task1.dto.approvalRequest.req.ApprovalCreationRequest;
import com.example.task1.dto.approvalRequest.res.ApprovalConfirmResponse;
import com.example.task1.dto.approvalRequest.res.ApprovalResponse;
import com.example.task1.entity.ApprovalRequests;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ApprovalRequestMapper {

    @Mapping(target = "currentApprover", ignore = true)
    @Mapping(target = "creatorUser", ignore = true)
    @Mapping(target = "approvalRequestId", ignore = true)
    @Mapping(target = "approvalStatus", ignore = true)
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "productQuantities", ignore = true)
    @Mapping(target = "feedback", ignore = true)
    ApprovalRequests ToApprovalRequests(ApprovalCreationRequest approvalCreationRequest);

    ApprovalResponse toApprovalResponse(ApprovalRequests approvalRequests);

    ApprovalConfirmResponse toApprovalConfirmResponse(ApprovalRequests approvalRequests);
}
