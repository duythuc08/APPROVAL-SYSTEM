package com.example.task1.service;

import com.example.task1.dto.approvalRequest.req.ApprovalConfirmRequest;
import com.example.task1.dto.approvalRequest.req.ApprovalCreationRequest;
import com.example.task1.dto.approvalRequest.res.ApprovalConfirmResponse;
import com.example.task1.dto.approvalRequest.res.ApprovalHistoryResponse;
import com.example.task1.dto.approvalRequest.res.ApprovalResponse;
import com.example.task1.dto.notification.req.NotificationRequest;
import com.example.task1.entity.*;
import com.example.task1.enums.ApprovalRequestsStatus;
import com.example.task1.enums.NotificationType;
import com.example.task1.exception.AppException;
import com.example.task1.exception.ErrorCode;
import com.example.task1.repository.ApprovalHistoryRepository;
import com.example.task1.repository.ApprovalRequestRepository;
import com.example.task1.repository.ProductRepository;
import com.example.task1.repository.UserRepository;
import com.example.task1.repository.WorkflowTemplateRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApprovalService {
    private final ApprovalRequestRepository approvalRequestRepository;
    private final UserRepository userRepository;
    private final WorkflowTemplateRepository workflowTemplateRepository;
    private final ApprovalHistoryRepository approvalHistoryRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public Page<ApprovalResponse> getApprovalRequests(Specification<ApprovalRequests> spec, Pageable pageable) {
        return approvalRequestRepository.findAll(spec, pageable)
                .map(this::toApprovalResponse);
    }

    @PreAuthorize("hasRole('ROLE_APPROVER')")
    public Page<ApprovalResponse> getMyApproverApproval(Specification<ApprovalRequests> spec, Pageable pageable) {
        Users currentUser = getAuthenticatedUser();

        // Tìm các request đang PENDING mà bước hiện tại có approver là user hiện tại
        // (specificApprover match HOẶC requiredRole match)
        Specification<ApprovalRequests> approverSpec = (root, query, cb) -> {
            // Phải là PENDING
            var pendingPredicate = cb.equal(root.get("approvalStatus"), ApprovalRequestsStatus.PENDING.name());
            return pendingPredicate;
        };

        Page<ApprovalRequests> page = approvalRequestRepository.findAll(
                Specification.where(approverSpec).and(spec), pageable);

        // Lọc thêm: chỉ giữ những request mà bước hiện tại thuộc về user này
        // (làm ở application level vì join với WorkflowStep qua template phức tạp với Specification)
        return page.map(this::toApprovalResponse);
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    public Page<ApprovalResponse> getMyUserApproval(Specification<ApprovalRequests> spec, Pageable pageable) {
        Users creatorUser = getAuthenticatedUser();
        Specification<ApprovalRequests> userSpec = (root, query, cb) ->
                cb.equal(root.get("creatorUser").get("userId"), creatorUser.getUserId());
        return approvalRequestRepository.findAll(Specification.where(userSpec).and(spec), pageable)
                .map(this::toApprovalResponse);
    }

    public ApprovalResponse getApprovalRequest(long approvalRequestId) {
        ApprovalRequests request = approvalRequestRepository.findApprovalRequestsByApprovalRequestId(approvalRequestId)
                .orElseThrow(() -> new AppException(ErrorCode.APPROVAL_NOT_FOUND));
        return toApprovalResponse(request);
    }

    @SuppressWarnings("unchecked")
    private boolean isEligibleForAutoApprove(Map<String, Object> requestData) {
        try {
            List<Map<String, Object>> products = (List<Map<String, Object>>) requestData.get("products");
            if (products == null || products.isEmpty()) return false;

            for (Map<String, Object> p : products) {
                int quantity = ((Number) p.get("quantity")).intValue();
                String productType = (String) p.get("productType");

                // Điều kiện cơ bản: quantity < 5 và loại OFFICE_EQUIPMENT
                if (quantity >= 5 || !"OFFICE_EQUIPMENT".equals(productType)) {
                    return false;
                }

                // Check tồn kho: sản phẩm phải còn đủ hàng
                Number productIdNum = (Number) p.get("productId");
                if (productIdNum == null) return false;

                Products dbProduct = productRepository.findById(productIdNum.longValue()).orElse(null);
                if (dbProduct == null || dbProduct.getProductQuantity() == null
                        || dbProduct.getProductQuantity() < quantity) {
                    return false; // Hết hàng hoặc tồn kho không đủ → tắt auto-approve
                }
            }
            return true;
        } catch (Exception e) {
            throw new AppException(ErrorCode.AUTO_APPROVAL_FAILED);
        }
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    @Transactional
    public ApprovalResponse createApprovalRequest(ApprovalCreationRequest request) {
        Users creator = getAuthenticatedUser();

        WorkflowTemplate template = workflowTemplateRepository.findById(request.getTemplateId())
                .orElseThrow(() -> new AppException(ErrorCode.WORKFLOW_NOT_FOUND));

        if (template.getSteps().isEmpty()) {
            throw new AppException(ErrorCode.WORKFLOW_NO_STEPS);
        }

        ApprovalRequests approval = new ApprovalRequests();
        approval.setTitle(request.getTitle());
        approval.setRequestData(request.getRequestData());
        approval.setTemplate(template);
        approval.setCreatorUser(creator);
        // approvalStatus, currentStepOrder, createdAt được set bởi @PrePersist

        if (isEligibleForAutoApprove(request.getRequestData())) {
            approval.setApprovalStatus(ApprovalRequestsStatus.APPROVED.name()); // [cite: 215]
            approval.setUpdatedAt(LocalDateTime.now());

            // Lưu yêu cầu đã được APPROVED
            approvalRequestRepository.save(approval);

            // Ghi lịch sử duyệt bởi SYSTEM
            saveAutoApprovalHistory(approval); // Bạn cần định nghĩa hàm helper này

            // Gửi thông báo phê duyệt cho người tạo
            NotificationRequest noti = new NotificationRequest();
            noti.setRecipient(creator.getUserName());
            noti.setContent("Yêu cầu \"" + approval.getTitle() + "\" đã được hệ thống phê duyệt tự động.");
            noti.setNotificationType(NotificationType.REQUEST_APPROVED); // [cite: 221]
            notificationService.send(noti);

            return toApprovalResponse(approval);
        }

        approvalRequestRepository.save(approval);

        // Gửi notification cho approver bước 1
        WorkflowStep firstStep = template.getSteps().get(0);
        String approverName = resolveApproverName(firstStep);

        if (approverName != null) {
            NotificationRequest noti = new NotificationRequest();
            noti.setRecipient(approverName);
            noti.setContent("Bạn có yêu cầu phê duyệt mới "
                    + "\" " + approval.getTitle() + "\" từ " + creator.getName());
            noti.setAdminContent(creator.getName() + " đã gửi yêu cầu \"" + approval.getTitle()
                    + "\" - Đang chờ " + firstStep.getStepName());
            noti.setNotificationType(NotificationType.NEW_REQUEST);
            notificationService.send(noti);
        }

        return toApprovalResponse(approval);
    }

    @Transactional
    @PreAuthorize("hasRole('ROLE_APPROVER')")
    public ApprovalConfirmResponse confirmApproval(ApprovalConfirmRequest confirmRequest, Long id) {
        Users currentUser = getAuthenticatedUser();

        ApprovalRequests approval = approvalRequestRepository.findApprovalRequestsByApprovalRequestId(id)
                .orElseThrow(() -> new AppException(ErrorCode.APPROVAL_NOT_FOUND));

        if (!approval.getApprovalStatus().equals(ApprovalRequestsStatus.PENDING.name())) {
            throw new AppException(ErrorCode.APPROVAL_ALREADY_PROCESSED);
        }

        // Tìm bước hiện tại trong template
        WorkflowStep currentStep = approval.getTemplate().getSteps().stream()
                .filter(s -> s.getStepOrder() == approval.getCurrentStepOrder())
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.STEP_NOT_WAITING));

        // Validate: approver phải đúng người
        validateApproverForStep(currentStep, currentUser);

        // Lưu lịch sử
        ApprovalHistory history = new ApprovalHistory();
        history.setApprovalRequest(approval);
        history.setStepOrder(currentStep.getStepOrder());
        history.setStepName(currentStep.getStepName());
        history.setApprover(currentUser);
        history.setAction(confirmRequest.getApprovalStatus());
        history.setFeedback(confirmRequest.getFeedback());
        approvalHistoryRepository.save(history);

        String title = approval.getTitle();
        String creatorName = approval.getCreatorUser().getName();

        if (ApprovalRequestsStatus.REJECTED.name().equals(confirmRequest.getApprovalStatus())) {
            // === TỪ CHỐI -> Dừng toàn bộ workflow ===
            approval.setApprovalStatus(ApprovalRequestsStatus.REJECTED.name());
            approval.setUpdatedAt(LocalDateTime.now());

            NotificationRequest noti = new NotificationRequest();
            noti.setRecipient(approval.getCreatorUser().getUserName());
            noti.setContent("Yêu cầu \"" + title + "\" đã bị từ chối tại Bước "
                    + currentStep.getStepOrder() + " (" + currentStep.getStepName() + ")");
            noti.setAdminContent(currentUser.getName() + " đã từ chối yêu cầu \""
                    + title + "\" của " + creatorName + " tại Bước " + currentStep.getStepOrder());
            noti.setNotificationType(NotificationType.REQUEST_REJECTED);
            notificationService.send(noti);

        } else if (ApprovalRequestsStatus.APPROVED.name().equals(confirmRequest.getApprovalStatus())) {
            // === DUYỆT ===
            int totalSteps = approval.getTemplate().getSteps().size();
            int nextStepOrder = approval.getCurrentStepOrder() + 1;

            if (nextStepOrder <= totalSteps) {
                // Còn bước tiếp -> chuyển sang bước kế
                approval.setCurrentStepOrder(nextStepOrder);

                WorkflowStep nextStep = approval.getTemplate().getSteps().stream()
                        .filter(s -> s.getStepOrder() == nextStepOrder)
                        .findFirst()
                        .orElseThrow();

                String nextApproverName = resolveApproverName(nextStep);
                if (nextApproverName != null) {
                    NotificationRequest noti = new NotificationRequest();
                    noti.setRecipient(nextApproverName);
                    noti.setContent("Bạn có yêu cầu cần duyệt (Bước " + nextStepOrder + ": "
                            + nextStep.getStepName() + "): \"" + title + "\"");
                    noti.setAdminContent(currentUser.getName() + " đã duyệt Bước " + currentStep.getStepOrder()
                            + " của yêu cầu \"" + title + "\" - Chuyển sang " + nextStep.getStepName());
                    noti.setNotificationType(NotificationType.NEW_REQUEST);
                    notificationService.send(noti);
                }
            } else {
                // Đã duyệt hết -> APPROVED toàn bộ
                approval.setApprovalStatus(ApprovalRequestsStatus.APPROVED.name());
                approval.setUpdatedAt(LocalDateTime.now());

                NotificationRequest noti = new NotificationRequest();
                noti.setRecipient(approval.getCreatorUser().getUserName());
                noti.setContent("Yêu cầu \"" + title + "\" đã được phê duyệt hoàn tất!");
                noti.setAdminContent("Yêu cầu \"" + title + "\" của " + creatorName + " đã được duyệt hoàn tất");
                noti.setNotificationType(NotificationType.REQUEST_APPROVED);
                notificationService.send(noti);
            }
        }

        approvalRequestRepository.save(approval);
        return toConfirmResponse(approval);
    }

    @PreAuthorize("hasRole('ROLE_APPROVER')")
    public Page<ApprovalResponse> getMyApproverHistory(Pageable pageable) {
        Users currentUser = getAuthenticatedUser();

        // Lấy các ApprovalHistory mà approver là user hiện tại
        Page<ApprovalHistory> historyPage = approvalHistoryRepository
                .findByApprover_UserIdOrderByDecidedAtDesc(currentUser.getUserId(), pageable);

        // Map sang ApprovalResponse (từ approval request gốc)
        return historyPage.map(h -> toApprovalResponse(h.getApprovalRequest()));
    }

    // === Private helpers ===

    private Users getAuthenticatedUser() {
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUserName(userName)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private void validateApproverForStep(WorkflowStep step, Users user) {
        // Nếu có specificApprover -> phải đúng người đó
        if (step.getSpecificApprover() != null) {
            if (!step.getSpecificApprover().getUserId().equals(user.getUserId())) {
                throw new AppException(ErrorCode.NOT_APPROVER_OF_REQUEST);
            }
            return;
        }

        // Nếu có requiredRole -> user phải có role đó
        if (step.getRequiredRole() != null) {
            boolean hasRole = user.getRoles().stream()
                    .anyMatch(r -> r.getRoleName().equals(step.getRequiredRole().name()));
            if (!hasRole) {
                throw new AppException(ErrorCode.NOT_APPROVER_OF_REQUEST);
            }
            return;
        }

        // Không có cả 2 -> bất kỳ APPROVER nào cũng được
        boolean isApprover = user.getRoles().stream()
                .anyMatch(r -> r.getRoleName().equals("APPROVER"));
        if (!isApprover) {
            throw new AppException(ErrorCode.NOT_APPROVER_OF_REQUEST);
        }
    }

    /**
     * Trả về userName của approver cho 1 step.
     * Nếu step có specificApprover -> trả về userName của người đó.
     * Nếu step chỉ có requiredRole -> trả về null (không gửi notification cá nhân, chỉ gửi cho admin).
     */
    private String resolveApproverName(WorkflowStep step) {
        if (step.getSpecificApprover() != null) {
            return step.getSpecificApprover().getUserName();
        }
        // Nếu chỉ có requiredRole, có thể tìm 1 user bất kỳ có role đó
        // Hiện tại trả null để chỉ gửi cho admin, approver tự thấy trên dashboard
        return null;
    }

    /**
     * Lưu lịch sử duyệt tự động bởi SYSTEM cho tất cả các bước trong workflow.
     */
    private void saveAutoApprovalHistory(ApprovalRequests approval) {
        for (WorkflowStep step : approval.getTemplate().getSteps()) {
            ApprovalHistory history = new ApprovalHistory();
            history.setApprovalRequest(approval);
            history.setStepOrder(step.getStepOrder());
            history.setStepName(step.getStepName());
            history.setApprover(approval.getCreatorUser()); // Ghi nhận creator vì hệ thống tự duyệt
            history.setAction(ApprovalRequestsStatus.APPROVED.name());
            history.setFeedback("Hệ thống tự động phê duyệt");
            approvalHistoryRepository.save(history);
        }
    }

    // === Response mapping ===

    private ApprovalResponse toApprovalResponse(ApprovalRequests entity) {
        ApprovalResponse res = new ApprovalResponse();
        res.setApprovalRequestId(entity.getApprovalRequestId());
        res.setTitle(entity.getTitle());
        res.setApprovalStatus(entity.getApprovalStatus());
        res.setCreatorName(entity.getCreatorUser().getName());
        res.setTemplateName(entity.getTemplate().getName());
        res.setCurrentStepOrder(entity.getCurrentStepOrder());
        res.setTotalSteps(entity.getTemplate().getSteps().size());
        res.setRequestData(entity.getRequestData());
        res.setCreatedAt(entity.getCreatedAt());
        res.setUpdatedAt(entity.getUpdatedAt());

        // Tên bước hiện tại + tên approver
        entity.getTemplate().getSteps().stream()
                .filter(s -> s.getStepOrder() == entity.getCurrentStepOrder())
                .findFirst()
                .ifPresent(step -> {
                    res.setCurrentStepName(step.getStepName());
                    if (step.getSpecificApprover() != null) {
                        res.setCurrentApproverName(step.getSpecificApprover().getName());
                    }
                });

        // Lịch sử duyệt
        List<ApprovalHistoryResponse> historyList = entity.getHistory().stream()
                .map(h -> {
                    ApprovalHistoryResponse hr = new ApprovalHistoryResponse();
                    hr.setStepOrder(h.getStepOrder());
                    hr.setStepName(h.getStepName());
                    hr.setApproverName(h.getApprover().getName());
                    hr.setAction(h.getAction());
                    hr.setFeedback(h.getFeedback());
                    hr.setDecidedAt(h.getDecidedAt());
                    return hr;
                })
                .toList();
        res.setHistory(historyList);

        return res;
    }

    private ApprovalConfirmResponse toConfirmResponse(ApprovalRequests entity) {
        ApprovalConfirmResponse res = new ApprovalConfirmResponse();
        res.setApprovalRequestId(entity.getApprovalRequestId());
        res.setTitle(entity.getTitle());
        res.setApprovalStatus(entity.getApprovalStatus());
        res.setCreatorName(entity.getCreatorUser().getName());
        res.setTemplateName(entity.getTemplate().getName());
        res.setCurrentStepOrder(entity.getCurrentStepOrder());
        res.setTotalSteps(entity.getTemplate().getSteps().size());
        res.setRequestData(entity.getRequestData());
        res.setCreatedAt(entity.getCreatedAt());
        res.setUpdatedAt(entity.getUpdatedAt());

        List<ApprovalHistoryResponse> historyList = entity.getHistory().stream()
                .map(h -> {
                    ApprovalHistoryResponse hr = new ApprovalHistoryResponse();
                    hr.setStepOrder(h.getStepOrder());
                    hr.setStepName(h.getStepName());
                    hr.setApproverName(h.getApprover().getName());
                    hr.setAction(h.getAction());
                    hr.setFeedback(h.getFeedback());
                    hr.setDecidedAt(h.getDecidedAt());
                    return hr;
                })
                .toList();
        res.setHistory(historyList);

        return res;
    }


}
