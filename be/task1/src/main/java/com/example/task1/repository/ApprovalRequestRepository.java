package com.example.task1.repository;

import com.example.task1.entity.ApprovalRequests;
import com.example.task1.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApprovalRequestRepository extends JpaRepository<ApprovalRequests,String> {
    Optional<ApprovalRequests> findApprovalRequestsByApprovalRequestId(Long approvalRequestId);

    List<ApprovalRequests> findApprovalRequestsByCreatorUser_UserId(String creatorUserId);
    List<ApprovalRequests> findApprovalRequestsByCurrentApprover_UserIdAndApprovalStatus(String currentApproverUserId, String approvalStatus);
    boolean existsByTitle(String title);
}
