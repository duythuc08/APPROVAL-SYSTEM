package com.example.task1.service;

import com.example.task1.dto.approvalRequest.req.ApprovalConfirmRequest;
import com.example.task1.dto.approvalRequest.req.ApprovalCreationRequest;
import com.example.task1.dto.approvalRequest.res.ApprovalConfirmResponse;
import com.example.task1.dto.approvalRequest.res.ApprovalResponse;
import com.example.task1.entity.ApprovalRequests;
import com.example.task1.entity.Products;
import com.example.task1.entity.Users;
import com.example.task1.enums.ApprovalRequestsStatus;
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
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public Page<ApprovalResponse> getApprovalRequests(Specification<ApprovalRequests> spec, Pageable pageable) {
        Page<ApprovalRequests> approvalPage = approvalRequestRepository.findAll(spec, pageable);
        return approvalPage.map(approvalRequestMapper::toApprovalResponse);
    }

    @PreAuthorize("hasRole('ROLE_APPROVER')")
    public Page<ApprovalResponse> getMyApproverApproval(Specification<ApprovalRequests> spec, Pageable pageable) {
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        Users currentUser = userRepository.findByUserName(userName)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + userName));
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
                .orElseThrow(() -> new RuntimeException("User not found with username: " + userName));
        Specification<ApprovalRequests> userSpec = (root, query, cb) ->
                cb.equal(root.get("creatorUser").get("userId"), creatorUser.getUserId());
        return approvalRequestRepository.findAll(Specification.where(userSpec).and(spec), pageable)
                .map(approvalRequestMapper::toApprovalResponse);
    }

    public ApprovalResponse getApprovalRequest(long approvalRequestId) {
         ApprovalRequests approvalRequests = approvalRequestRepository.findApprovalRequestsByApprovalRequestId(approvalRequestId)
                .orElseThrow(() -> new RuntimeException("Approval request not found with id: " + approvalRequestId));
        return approvalRequestMapper.toApprovalResponse(approvalRequests);
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    public ApprovalResponse createApprovalRequest(ApprovalCreationRequest approvalRequests) {

        ApprovalRequests newApproval = approvalRequestMapper.ToApprovalRequests(approvalRequests);

        String creatorUserName = SecurityContextHolder.getContext().getAuthentication().getName();
        Users creatorUser = userRepository.findByUserName(creatorUserName)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + creatorUserName));

        Users approver = userRepository.findByUserId(approvalRequests.getCurrentApproverId())
                .orElseThrow(() -> new RuntimeException("Approver not found with id: " + approvalRequests.getCurrentApproverId()));

        Set<Products> products = new HashSet<>(productRepository.findAllById(approvalRequests.getProductQuantities().keySet()));
        if(products.isEmpty())
            throw new RuntimeException("No products found with ids: " + approvalRequests.getProductQuantities().keySet());


        newApproval.setCreatedAt(LocalDateTime.now());
        newApproval.setCreatorUser(creatorUser);
        newApproval.setCurrentApprover(approver);
        newApproval.setProducts(products);
        newApproval.setProductQuantities(approvalRequests.getProductQuantities());
        newApproval.setApprovalStatus(ApprovalRequestsStatus.PENDING.name());

        return  approvalRequestMapper.toApprovalResponse(approvalRequestRepository.save(newApproval));
    }


    @Transactional
    @PreAuthorize("hasRole('ROLE_APPROVER')")
    public ApprovalConfirmResponse confirmApproval(ApprovalConfirmRequest approvalConfirmRequest,Long id) {
        ApprovalRequests approvalRequest = approvalRequestRepository.findApprovalRequestsByApprovalRequestId(id)
                .orElseThrow(() -> new RuntimeException("Approval request not found with id: " + id));

        if(!approvalRequest.getCurrentApprover().getUserName().equals(SecurityContextHolder.getContext().getAuthentication().getName()))
            throw new RuntimeException("You are not the approver of this request");

        if(!approvalRequest.getApprovalStatus().equals(ApprovalRequestsStatus.PENDING.name()))
            throw new RuntimeException("This request has already been processed");

        if (ApprovalRequestsStatus.APPROVED.name().equals(approvalConfirmRequest.getApprovalStatus())) {
            Map<Long, Integer> quantities = approvalRequest.getProductQuantities();
            for (Products product : approvalRequest.getProducts()) {
                int requestedQty = quantities.getOrDefault(product.getProductId(), 0);
                int remaining = product.getProductQuantity() - requestedQty;
                if (remaining < 0)
                    throw new RuntimeException(
                        "Tồn kho không đủ cho sản phẩm: " + product.getProductName()
                        + " (tồn: " + product.getProductQuantity() + ", yêu cầu: " + requestedQty + ")"
                    );
                product.setProductQuantity(remaining);
            }
            productRepository.saveAll(approvalRequest.getProducts());
        }
        approvalRequest.setUpdatedAt(LocalDateTime.now());
        approvalRequest.setApprovalStatus(approvalConfirmRequest.getApprovalStatus());
        approvalRequest.setFeedback(approvalConfirmRequest.getFeedback());
        return approvalRequestMapper.toApprovalConfirmResponse(approvalRequestRepository.save(approvalRequest));
    }
}
