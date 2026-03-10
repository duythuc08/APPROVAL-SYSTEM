package com.example.task1.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "approval_requests", indexes = {
        @Index(name = "idx_ar_status", columnList = "approval_status"),
        @Index(name = "idx_ar_creator", columnList = "creator_user_id"),
        @Index(name = "idx_ar_template", columnList = "template_id"),
        @Index(name = "idx_ar_created", columnList = "created_at"),
})
public class ApprovalRequests {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long approvalRequestId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String approvalStatus; // PENDING, APPROVED, REJECTED

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> requestData; // Du lieu tuy loai: san pham, nghi phep, tam ung...

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "template_id", nullable = false)
    private WorkflowTemplate template;

    private int currentStepOrder; // Buoc hien tai dang cho duyet (1-based)

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "creator_user_id", nullable = false)
    private Users creatorUser;

    @OneToMany(mappedBy = "approvalRequest", cascade = CascadeType.ALL)
    @OrderBy("stepOrder ASC")
    @BatchSize(size = 10)
    private List<ApprovalHistory> history = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime currentStepDeadline; // Han chot cua buoc hien tai (null = khong gioi han)

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.approvalStatus = "PENDING";
        this.currentStepOrder = 1;
    }
}
