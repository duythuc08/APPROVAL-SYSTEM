package com.example.task1.entity;

import com.example.task1.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "workflow_steps", indexes = {
        @Index(name = "idx_ws_template", columnList = "template_id")
})
public class WorkflowStep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private WorkflowTemplate template;

    @Column(nullable = false)
    private int stepOrder; // Thu tu: 1, 2, 3...

    @Column(nullable = false)
    private String stepName; // "Truong phong duyet", "Ke toan kiem tra"

    @Enumerated(EnumType.STRING)
    private Role requiredRole; // Role duoc phep duyet buoc nay (nullable neu chi dinh nguoi cu the)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specific_approver_id")
    private Users specificApprover; // Chi dinh dich danh 1 nguoi duyet (nullable neu dung role)

    private Integer deadlineHours; // So gio mac dinh de hoan thanh buoc (null = khong gioi han)
}
