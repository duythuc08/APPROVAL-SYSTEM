package com.example.task1.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "approval_requests")
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
    @JoinTable(
            name = "approval_request_products",
            joinColumns = @JoinColumn(name = "approval_request_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private Set<Products> products;

    @ElementCollection
    @CollectionTable(
            name = "approval_request_quantities",
            joinColumns = @JoinColumn(name = "approval_request_id")
    )
    @MapKeyColumn(name = "product_id")
    @Column(name = "quantity")
    private Map<Long, Integer> productQuantities = new HashMap<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_user_id")
    private Users creatorUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id")
    private Users currentApprover;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
