package com.example.task1.service;

import com.example.task1.dto.notification.req.NotificationRequest;
import com.example.task1.entity.ApprovalRequests;
import com.example.task1.enums.NotificationType;
import com.example.task1.repository.ApprovalRequestRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DeadlineScheduler {
    private final ApprovalRequestRepository approvalRequestRepository;
    private final NotificationService notificationService;

    @Scheduled(fixedRate = 60000) // Chay moi 1 phut
    @Transactional
    public void rejectExpiredRequests() {
        List<ApprovalRequests> expired = approvalRequestRepository
                .findByApprovalStatusAndCurrentStepDeadlineBefore("PENDING", LocalDateTime.now());

        for (ApprovalRequests approval : expired) {
            approval.setApprovalStatus("REJECTED");
            approval.setUpdatedAt(LocalDateTime.now());
            approval.setCurrentStepDeadline(null);
            approvalRequestRepository.save(approval);

            // Gui notification cho creator
            NotificationRequest noti = new NotificationRequest();
            noti.setRecipient(approval.getCreatorUser().getUserName());
            noti.setContent("Yêu cầu \"" + approval.getTitle()
                    + "\" đã tự động b từ chối do hết hạn duyệt.");
            noti.setAdminContent("Yêu cầu \"" + approval.getTitle()
                    + "\" cua " + approval.getCreatorUser().getName()
                    + " đã bị tự động từ chối do hết hạn.");
            noti.setNotificationType(NotificationType.REQUEST_REJECTED);
            notificationService.send(noti);

            log.info("Auto-rejected approval request #{} due to deadline expiry", approval.getApprovalRequestId());
        }
    }
}
