package io.staysmart.dto.notification;

import io.staysmart.enums.NotificationType;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationDto(
        UUID id,
        UUID userId,
        NotificationType type,
        String title,
        String text,
        String link,
        boolean isRead,
        LocalDateTime createdAt
) {
}
