package com.example.task1.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.BatchSize;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "approval_requests", indexes = {
        @Index(name = "idx_ar_status",   columnList = "approval_status"),
        @Index(name = "idx_ar_creator",  columnList = "creator_user_id"),
        @Index(name = "idx_ar_approver", columnList = "approver_id"),
        @Index(name = "idx_ar_created",  columnList = "created_at"),
})
public class ApprovalRequests {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long approvalRequestId;

    private String title;
    private String approvalDescription;
    private String approvalStatus; // e.g., "PENDING", "APPROVED", "REJECTED"

    @Column(name = "feedback") // Ép tên cột cho chắc chắn
    private String feedback;
    @ManyToMany
    @BatchSize(size = 25)
    @JoinTable(
            name = "approval_request_products",
            joinColumns = @JoinColumn(name = "approval_request_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private Set<Products> products;

    @ElementCollection
    @BatchSize(size = 25)
    @CollectionTable(
            name = "approval_request_quantities",
            joinColumns = @JoinColumn(name = "approval_request_id")
    )
    @MapKeyColumn(name = "product_id")
    @Column(name = "quantity")
    private Map<Long, Integer> productQuantities = new HashMap<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "creator_user_id")
    private Users creatorUser;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "approver_id")
    private Users currentApprover;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
