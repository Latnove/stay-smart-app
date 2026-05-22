package io.staysmart.controller;

import io.staysmart.dto.notification.NotificationDto;
import io.staysmart.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationDto> getMyNotifications() {
        return notificationService.getMyNotifications();
    }

    @PatchMapping("/{id}/read")
    public NotificationDto markNotificationAsRead(@PathVariable UUID id) {
        return notificationService.markAsRead(id);
    }

    @PatchMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllNotificationsAsRead() {
        notificationService.markAllAsRead();
    }
}
