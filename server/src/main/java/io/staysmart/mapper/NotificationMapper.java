package io.staysmart.mapper;

import io.staysmart.dto.notification.NotificationDto;
import io.staysmart.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationDto toDto(Notification notification) {
        return new NotificationDto(
                notification.getId(),
                notification.getUser().getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getText(),
                notification.getLink(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
