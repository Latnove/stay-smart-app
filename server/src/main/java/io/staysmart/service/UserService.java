package io.staysmart.service;

import io.staysmart.dto.user.AdminUserDto;
import io.staysmart.dto.user.PasswordChangeRequest;
import io.staysmart.dto.user.UserDto;
import io.staysmart.entity.User;
import io.staysmart.entity.UserDocument;
import io.staysmart.enums.Role;
import io.staysmart.enums.VerifiedType;
import io.staysmart.exception.BadRequestException;
import io.staysmart.exception.ForbiddenException;
import io.staysmart.exception.NotFoundException;
import io.staysmart.mapper.UserMapper;
import io.staysmart.repository.UserDocumentRepository;
import io.staysmart.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserDocumentRepository userDocumentRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final CurrentUserService currentUserService;
    private final PasswordValidator passwordValidator;
    private final NotificationService notificationService;
    private final String adminEmail;
    private final String adminUsername;
    private final String adminPassword;

    public UserService(
            UserRepository userRepository,
            UserDocumentRepository userDocumentRepository,
            PasswordEncoder passwordEncoder,
            UserMapper userMapper,
            CurrentUserService currentUserService,
            PasswordValidator passwordValidator,
            NotificationService notificationService,
            @Value("${app.admin.email}") String adminEmail,
            @Value("${app.admin.username}") String adminUsername,
            @Value("${app.admin.password}") String adminPassword
    ) {
        this.userRepository = userRepository;
        this.userDocumentRepository = userDocumentRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.currentUserService = currentUserService;
        this.passwordValidator = passwordValidator;
        this.notificationService = notificationService;
        this.adminEmail = adminEmail;
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
    }

    @PostConstruct
    @Transactional
    public void createAdminIfMissing() {
        Optional<User> adminByEmail = userRepository.findByEmail(adminEmail);
        if (adminByEmail.isPresent()) {
            User admin = adminByEmail.get();
            setupAdmin(admin);
            userRepository.save(admin);
            return;
        }

        Optional<User> adminByUsername = userRepository.findByUsername(adminUsername);
        if (adminByUsername.isPresent()) {
            User admin = adminByUsername.get();
            admin.setEmail(adminEmail);
            setupAdmin(admin);
            userRepository.save(admin);
            return;
        }

        User admin = User.builder()
                .email(adminEmail)
                .username(adminUsername)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .roles(new HashSet<>(Set.of(Role.ADMIN, Role.USER)))
                .verifiedStatus(VerifiedType.VERIFIED)
                .emailVerified(true)
                .build();

        userRepository.save(admin);
    }

    private void setupAdmin(User user) {
        if (user.getRoles() == null) {
            user.setRoles(new HashSet<>());
        }

        user.getRoles().add(Role.ADMIN);
        user.getRoles().add(Role.USER);
        user.setPasswordHash(passwordEncoder.encode(adminPassword));
        user.setVerifiedStatus(VerifiedType.VERIFIED);
        user.setEmailVerified(true);
        user.setBlocked(false);
        user.setBlockReason(null);
        user.setVerificationReason(null);
    }

    @Transactional(readOnly = true)
    public UserDto getMe() {
        return userMapper.toDto(currentUserService.getCurrentUser());
    }

    @Transactional(readOnly = true)
    public List<AdminUserDto> getAdminUsers(String search, String verificationFilter, String sortOrder) {
        List<User> users;

        if (search != null && !search.isBlank()) {
            users = userRepository.searchUsers(search.trim());
        } else if ("blocked".equals(verificationFilter)) {
            users = userRepository.findBlockedUsers();
        } else if (verificationFilter != null && !"all".equals(verificationFilter)) {
            users = userRepository.findByVerifiedStatus(VerifiedType.fromValue(verificationFilter));
        } else {
            users = userRepository.findAll();
        }

        Comparator<User> comparator = Comparator.comparing(User::getCreatedAt);
        if (!"oldest".equals(sortOrder)) {
            comparator = comparator.reversed();
        }

        return users.stream()
                .sorted(comparator)
                .map(userMapper::toAdminDto)
                .toList();
    }

    @Transactional
    public UserDto changePassword(PasswordChangeRequest request) {
        User user = currentUserService.getCurrentUser();

        if (!passwordEncoder.matches(request.oldPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Старый пароль неверный");
        }

        if (passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadRequestException("Новый пароль должен отличаться от старого");
        }

        passwordValidator.validate(request.password(), request.passwordRepeat());
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        return userMapper.toDto(user);
    }

    @Transactional
    public UserDto addDocuments(List<String> urls) {
        User user = currentUserService.getCurrentUser();

        for (String url : urls) {
            UserDocument document = UserDocument.builder()
                    .user(user)
                    .url(url)
                    .build();
            userDocumentRepository.save(document);
        }

        user.setVerifiedStatus(VerifiedType.PENDING);
        user.setVerificationReason(null);

        return userMapper.toDto(user);
    }

    @Transactional
    public AdminUserDto verifyUser(UUID userId) {
        User user = findUser(userId);
        user.setVerifiedStatus(VerifiedType.VERIFIED);
        user.setVerificationReason(null);

        notificationService.create(
                user.getId(),
                io.staysmart.enums.NotificationType.USER_VERIFIED,
                "Документы подтверждены",
                "Администратор проверил ваши документы. Теперь профиль отмечен как подтвержденный.",
                "/profile"
        );

        return userMapper.toAdminDto(user);
    }

    @Transactional
    public AdminUserDto rejectVerification(UUID userId, String reason) {
        User user = findUser(userId);
        user.setVerifiedStatus(VerifiedType.REJECTED);
        user.setVerificationReason(reason);

        notificationService.create(
                user.getId(),
                io.staysmart.enums.NotificationType.USER_VERIFICATION_REJECTED,
                "Верификация отклонена",
                "Администратор отклонил документы. Причина: " + reason,
                "/profile"
        );

        return userMapper.toAdminDto(user);
    }

    @Transactional
    public AdminUserDto blockUser(UUID userId, String reason) {
        User user = findUser(userId);

        if (user.getRoles().contains(Role.ADMIN)) {
            throw new ForbiddenException("Администратора нельзя заблокировать");
        }

        user.setBlocked(true);
        user.setBlockReason(reason);

        notificationService.create(
                user.getId(),
                io.staysmart.enums.NotificationType.USER_BLOCKED,
                "Аккаунт заблокирован",
                "Администратор заблокировал аккаунт. Причина: " + reason,
                "/profile"
        );

        return userMapper.toAdminDto(user);
    }

    @Transactional
    public AdminUserDto unblockUser(UUID userId) {
        User user = findUser(userId);
        user.setBlocked(false);
        user.setBlockReason(null);

        notificationService.create(
                user.getId(),
                io.staysmart.enums.NotificationType.USER_UNBLOCKED,
                "Аккаунт разблокирован",
                "Администратор снял блокировку. Вы снова можете пользоваться сервисом.",
                "/profile"
        );

        return userMapper.toAdminDto(user);
    }

    private User findUser(UUID id) {
        return userRepository.findWithDocumentsById(id)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
    }
}
