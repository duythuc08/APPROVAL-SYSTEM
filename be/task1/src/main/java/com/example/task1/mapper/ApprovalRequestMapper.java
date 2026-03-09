package com.example.task1.mapper;

import com.example.task1.dto.approvalRequest.req.ApprovalCreationRequest;
import com.example.task1.entity.ApprovalRequests;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ApprovalRequestMapper {

    @Mapping(target = "approvalRequestId", ignore = true)
    @Mapping(target = "approvalStatus", ignore = true)
    @Mapping(target = "creatorUser", ignore = true)
    @Mapping(target = "template", ignore = true)
    @Mapping(target = "currentStepOrder", ignore = true)
    @Mapping(target = "history", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ApprovalRequests toApprovalRequests(ApprovalCreationRequest approvalCreationRequest);
}
