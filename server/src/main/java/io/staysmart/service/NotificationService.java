package io.staysmart.service;

import io.staysmart.dto.notification.NotificationDto;
import io.staysmart.entity.Notification;
import io.staysmart.entity.User;
import io.staysmart.enums.NotificationType;
import io.staysmart.exception.ForbiddenException;
import io.staysmart.exception.NotFoundException;
import io.staysmart.mapper.NotificationMapper;
import io.staysmart.repository.NotificationRepository;
import io.staysmart.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;
    private final CurrentUserService currentUserService;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            NotificationMapper notificationMapper,
            CurrentUserService currentUserService,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.notificationMapper = notificationMapper;
        this.currentUserService = currentUserService;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getMyNotifications() {
        UUID userId = currentUserService.getCurrentUser().getId();

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(notificationMapper::toDto)
                .toList();
    }

    @Transactional
    public NotificationDto markAsRead(UUID id) {
        UUID userId = currentUserService.getCurrentUser().getId();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Уведомление не найдено"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Нет доступа");
        }

        notification.setRead(true);

        return notificationMapper.toDto(notification);
    }

    @Transactional
    public void markAllAsRead() {
        UUID userId = currentUserService.getCurrentUser().getId();
        notificationRepository.markAllAsRead(userId);
    }

    @Transactional
    public NotificationDto create(UUID userId, NotificationType type, String title, String text, String link) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .text(text)
                .link(link)
                .read(false)
                .build();

        notificationRepository.save(notification);
        NotificationDto dto = notificationMapper.toDto(notification);

        send(userId, dto);

        return dto;
    }

    private void send(UUID userId, NotificationDto dto) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/notifications", dto);
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/notifications", dto);
            }
        });
    }
}
