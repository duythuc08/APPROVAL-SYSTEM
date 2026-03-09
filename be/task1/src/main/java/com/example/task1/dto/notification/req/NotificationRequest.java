package com.example.task1.dto.notification.req;

import com.example.task1.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {
    private String recipient;
    private String content;
    private String adminContent;
    private NotificationType notificationType;
}
