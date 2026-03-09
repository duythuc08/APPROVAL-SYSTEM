package com.example.task1.entity;

import com.example.task1.enums.NotificationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String message;
    private String recipient; // Có thể là username hoặc userId
    private String content; // Nội dung chi tiết của thông báo
    @Enumerated(EnumType.STRING)
    private NotificationType type;
    private boolean isRead; // Trạng thái đã đọc hay chưa
    private LocalDateTime createdAt = LocalDateTime.now();
}
