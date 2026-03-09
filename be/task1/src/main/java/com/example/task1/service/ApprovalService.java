package com.example.task1.service;

import com.example.task1.dto.approvalRequest.req.ApprovalConfirmRequest;
import com.example.task1.dto.approvalRequest.req.ApprovalCreationRequest;
import com.example.task1.dto.approvalRequest.res.ApprovalConfirmResponse;
import com.example.task1.dto.approvalRequest.res.ApprovalResponse;
import com.example.task1.dto.notification.req.NotificationRequest;
import com.example.task1.entity.ApprovalRequests;
import com.example.task1.entity.Products;
import com.example.task1.entity.Users;
import com.example.task1.enums.ApprovalRequestsStatus;
import com.example.task1.enums.NotificationType;
import com.example.task1.exception.AppException;
import com.example.task1.exception.ErrorCode;
import com.example.task1.mapper.ApprovalRequestMapper;
import com.example.task1.repository.ApprovalRequestRepository;
import com.example.task1.repository.ProductRepository;
import com.example.task1.repository.UserRepository;
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
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApprovalService {
    private final ApprovalRequestRepository approvalRequestRepository;
    private final ApprovalRequestMapper approvalRequestMapper;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public Page<ApprovalResponse> getApprovalRequests(Specification<ApprovalRequests> spec, Pageable pageable) {
        Page<ApprovalRequests> approvalPage = approvalRequestRepository.findAll(spec, pageable);
        return approvalPage.map(approvalRequestMapper::toApprovalResponse);
    }

    @PreAuthorize("hasRole('ROLE_APPROVER')")
    public Page<ApprovalResponse> getMyApproverApproval(Specification<ApprovalRequests> spec, Pageable pageable) {
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        Users currentUser = userRepository.findByUserName(userName)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Specification<ApprovalRequests> approverSpec = (root, query, cb) -> cb.and(
                cb.equal(root.get("currentApprover").get("userId"), currentUser.getUserId()),
                cb.equal(root.get("approvalStatus"), ApprovalRequestsStatus.PENDING.name())
        );
        return approvalRequestRepository.findAll(Specification.where(approverSpec).and(spec), pageable)
                .map(approvalRequestMapper::toApprovalResponse);
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    public Page<ApprovalResponse> getMyUserApproval(Specification<ApprovalRequests> spec, Pageable pageable) {
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        Users creatorUser = userRepository.findByUserName(userName)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Specification<ApprovalRequests> userSpec = (root, query, cb) ->
                cb.equal(root.get("creatorUser").get("userId"), creatorUser.getUserId());
        return approvalRequestRepository.findAll(Specification.where(userSpec).and(spec), pageable)
                .map(approvalRequestMapper::toApprovalResponse);
    }

    public ApprovalResponse getApprovalRequest(long approvalRequestId) {
        ApprovalRequests approvalRequests = approvalRequestRepository.findApprovalRequestsByApprovalRequestId(approvalRequestId)
                .orElseThrow(() -> new AppException(ErrorCode.APPROVAL_NOT_FOUND));
        return approvalRequestMapper.toApprovalResponse(approvalRequests);
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    public ApprovalResponse createApprovalRequest(ApprovalCreationRequest approvalRequests) {
        ApprovalRequests newApproval = approvalRequestMapper.ToApprovalRequests(approvalRequests);

        String creatorUserName = SecurityContextHolder.getContext().getAuthentication().getName();
        Users creatorUser = userRepository.findByUserName(creatorUserName)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Users approver = userRepository.findByUserId(approvalRequests.getCurrentApproverId())
                .orElseThrow(() -> new AppException(ErrorCode.APPROVER_NOT_FOUND));

        Set<Products> products = new HashSet<>(productRepository.findAllById(approvalRequests.getProductQuantities().keySet()));
        if (products.isEmpty())
            throw new AppException(ErrorCode.PRODUCTS_NOT_FOUND);

        newApproval.setCreatedAt(LocalDateTime.now());
        newApproval.setCreatorUser(creatorUser);
        newApproval.setCurrentApprover(approver);
        newApproval.setProducts(products);
        newApproval.setProductQuantities(approvalRequests.getProductQuantities());
        newApproval.setApprovalStatus(ApprovalRequestsStatus.PENDING.name());

        NotificationRequest notificationRequest = new NotificationRequest();
        notificationRequest.setRecipient(newApproval.getCurrentApprover().getUserName());
        notificationRequest.setContent("Bạn có yêu cầu phê duyệt mới \"" + newApproval.getTitle()
                + "\" từ " + newApproval.getCreatorUser().getName());
        notificationRequest.setAdminContent(newApproval.getCreatorUser().getName()
                + " đã gửi yêu cầu \"" + newApproval.getTitle()
                + "\" cho " + newApproval.getCurrentApprover().getName());
        notificationRequest.setNotificationType(NotificationType.NEW_REQUEST);
        notificationService.send(notificationRequest);

        return approvalRequestMapper.toApprovalResponse(approvalRequestRepository.save(newApproval));
    }

    @Transactional
    @PreAuthorize("hasRole('ROLE_APPROVER')")
    public ApprovalConfirmResponse confirmApproval(ApprovalConfirmRequest approvalConfirmRequest, Long id) {
        ApprovalRequests approvalRequest = approvalRequestRepository.findApprovalRequestsByApprovalRequestId(id)
                .orElseThrow(() -> new AppException(ErrorCode.APPROVAL_NOT_FOUND));

        if (!approvalRequest.getCurrentApprover().getUserName().equals(SecurityContextHolder.getContext().getAuthentication().getName()))
            throw new AppException(ErrorCode.NOT_APPROVER_OF_REQUEST);

        if (!approvalRequest.getApprovalStatus().equals(ApprovalRequestsStatus.PENDING.name()))
            throw new AppException(ErrorCode.APPROVAL_ALREADY_PROCESSED);

        if (ApprovalRequestsStatus.APPROVED.name().equals(approvalConfirmRequest.getApprovalStatus())) {
            Map<Long, Integer> quantities = approvalRequest.getProductQuantities();
            for (Products product : approvalRequest.getProducts()) {
                int requestedQty = quantities.getOrDefault(product.getProductId(), 0);
                int remaining = product.getProductQuantity() - requestedQty;
                if (remaining < 0)
                    throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
                product.setProductQuantity(remaining);
            }
            productRepository.saveAll(approvalRequest.getProducts());
        }
        approvalRequest.setUpdatedAt(LocalDateTime.now());
        approvalRequest.setApprovalStatus(approvalConfirmRequest.getApprovalStatus());
        approvalRequest.setFeedback(approvalConfirmRequest.getFeedback());

        NotificationRequest notificationRequest = new NotificationRequest();
        notificationRequest.setRecipient(approvalRequest.getCreatorUser().getUserName());

        String title = approvalRequest.getTitle();
        String approverName = approvalRequest.getCurrentApprover().getName();
        String creatorName = approvalRequest.getCreatorUser().getName();
        String feedback = approvalRequest.getFeedback();
        boolean isApproved = ApprovalRequestsStatus.APPROVED.name().equals(approvalRequest.getApprovalStatus());

        if (isApproved) {
            notificationRequest.setContent("Yêu cầu \"" + title + "\" đã được " + approverName + " phê duyệt ");
            notificationRequest.setAdminContent(approverName + " đã phê duyệt yêu cầu \"" + title + "\" của " + creatorName);
            notificationRequest.setNotificationType(NotificationType.REQUEST_APPROVED);
        } else {
            notificationRequest.setContent("Yêu cầu \"" + title + "\" đã bị " + approverName + " từ chối");
            notificationRequest.setAdminContent(approverName + " đã từ chối yêu cầu \"" + title + "\" của " + creatorName);
            notificationRequest.setNotificationType(NotificationType.REQUEST_REJECTED);
        }
        notificationService.send(notificationRequest);
        return approvalRequestMapper.toApprovalConfirmResponse(approvalRequestRepository.save(approvalRequest));
    }
}
