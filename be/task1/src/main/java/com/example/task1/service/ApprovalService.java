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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
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
    public List<ApprovalResponse> getApprovalRequests() {
        return approvalRequestRepository.findAll()
                .stream()
                .map(approvalRequestMapper::toApprovalResponse).toList();
    }

    @PreAuthorize("hasRole('ROLE_APPROVER')")
    public List<ApprovalResponse> getMyApproverApproval() {
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        Users currentUser = userRepository.findByUserName(userName)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + userName));
        return approvalRequestRepository.findApprovalRequestsByCurrentApprover_UserIdAndApprovalStatus(currentUser.getUserId(), ApprovalRequestsStatus.PENDING.name())
                .stream()
                .map(approvalRequestMapper::toApprovalResponse).toList();
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    public List<ApprovalResponse> getMyUserApproval() {
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        Users creatorUser = userRepository.findByUserName(userName)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + userName));
        return approvalRequestRepository.findApprovalRequestsByCreatorUser_UserId(creatorUser.getUserId())
                .stream()
                .map(approvalRequestMapper::toApprovalResponse).toList();
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
