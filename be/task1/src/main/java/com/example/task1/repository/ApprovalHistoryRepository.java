package com.example.task1.repository;

import com.example.task1.entity.ApprovalHistory;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface ApprovalHistoryRepository extends JpaRepository<ApprovalHistory,Long> {
    List<ApprovalHistory> findByApprovalRequest_ApprovalRequestIdOrderByStepOrderAsc(Long approvalRequestApprovalRequestId);

    Page<ApprovalHistory> findByApprover_UserIdOrderByDecidedAtDesc(String userId, Pageable pageable);
}
