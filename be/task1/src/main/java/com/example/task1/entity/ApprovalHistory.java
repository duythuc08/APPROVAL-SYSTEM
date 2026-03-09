package com.example.task1.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "approval_history", indexes = {
        @Index(name = "idx_ah_request", columnList = "approval_request_id"),
        @Index(name = "idx_ah_approver", columnList = "approver_id")
})
public class ApprovalHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approval_request_id", nullable = false)
    private ApprovalRequests approvalRequest;

    private int stepOrder; // Buoc thu may trong workflow

    private String stepName; // Ten buoc (copy tu WorkflowStep de luu lai lich su)

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "approver_id", nullable = false)
    private Users approver; // Ai da duyet

    @Column(nullable = false)
    private String action; // APPROVED / REJECTED

    private String feedback;

    private LocalDateTime decidedAt;

    @PrePersist
    protected void onCreate() {
        this.decidedAt = LocalDateTime.now();
    }
}
