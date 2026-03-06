package com.example.task1.service;

import com.example.task1.dto.notification.req.NotificationRequest;
import com.example.task1.entity.Notification;
import com.example.task1.entity.Users;
import com.example.task1.exception.AppException;
import com.example.task1.exception.ErrorCode;
import com.example.task1.repository.NotificationRepository;
import com.example.task1.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    @Transactional
    public void send(NotificationRequest notificationRequest) {
        // 1. Luu va gui cho nguoi nhan chinh (Approver hoac User)
        Notification notification = createNotification(
                notificationRequest.getRecipient(),
                notificationRequest.getContent(),
                notificationRequest.getNotificationType()
        );
        notificationRepository.save(notification);
        messagingTemplate.convertAndSendToUser(notification.getRecipient(), "/queue/notifications", notification);

        // 2. Luu rieng cho tung Admin (moi admin co isRead rieng)
        List<Users> admins = userRepository.findByRoleName("ADMIN");
        for (Users admin : admins) {
            // Tranh gui trung neu admin cung la nguoi nhan chinh
            if (admin.getUserName().equals(notificationRequest.getRecipient())) continue;

            Notification adminNoti = createNotification(
                    admin.getUserName(),
                    notificationRequest.getContent(),
                    notificationRequest.getNotificationType()
            );
            notificationRepository.save(adminNoti);
        }

        // 3. Broadcast real-time cho tat ca admin dang online
        messagingTemplate.convertAndSend("/topic/admin-notifications", notification);
    }

    public List<Notification> getMyNotifications() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(username);
    }

    public long getMyUnreadCount() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return notificationRepository.countByRecipientAndIsRead(username, false);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!notification.getRecipient().equals(username)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Notification> unread = notificationRepository.findByRecipientOrderByCreatedAtDesc(username);
        unread.stream().filter(n -> !n.isRead()).forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    private Notification createNotification(String recipient, String content, com.example.task1.enums.NotificationType type) {
        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setContent(content);
        n.setType(type);
        n.setRead(false);
        return n;
    }
}
