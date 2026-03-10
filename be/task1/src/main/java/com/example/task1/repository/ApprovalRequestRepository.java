package com.example.task1.repository;

import com.example.task1.entity.ApprovalRequests;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApprovalRequestRepository extends JpaRepository<ApprovalRequests, Long>, JpaSpecificationExecutor<ApprovalRequests> {
    Optional<ApprovalRequests> findApprovalRequestsByApprovalRequestId(Long approvalRequestId);
    boolean existsByTitle(String title);
    List<ApprovalRequests> findByApprovalStatusAndCurrentStepDeadlineBefore(String status, LocalDateTime deadline);
}
