package io.staysmart.service;

import io.jsonwebtoken.Claims;
import io.staysmart.dto.auth.AuthResponse;
import io.staysmart.dto.auth.AuthResult;
import io.staysmart.dto.auth.LoginRequest;
import io.staysmart.dto.auth.MessageResponse;
import io.staysmart.dto.auth.RegisterRequest;
import io.staysmart.dto.auth.VerifyEmailRequest;
import io.staysmart.entity.EmailVerificationToken;
import io.staysmart.entity.RefreshToken;
import io.staysmart.entity.User;
import io.staysmart.enums.Role;
import io.staysmart.enums.VerifiedType;
import io.staysmart.exception.BadRequestException;
import io.staysmart.exception.UnauthorizedException;
import io.staysmart.external.TurnstileService;
import io.staysmart.mapper.UserMapper;
import io.staysmart.repository.EmailVerificationTokenRepository;
import io.staysmart.repository.RefreshTokenRepository;
import io.staysmart.repository.UserRepository;
import io.staysmart.security.JwtProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final TokenHashService tokenHashService;
    private final UserMapper userMapper;
    private final PasswordValidator passwordValidator;
    private final TurnstileService turnstileService;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            EmailVerificationTokenRepository emailVerificationTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtProvider jwtProvider,
            TokenHashService tokenHashService,
            UserMapper userMapper,
            PasswordValidator passwordValidator,
            TurnstileService turnstileService,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtProvider = jwtProvider;
        this.tokenHashService = tokenHashService;
        this.userMapper = userMapper;
        this.passwordValidator = passwordValidator;
        this.turnstileService = turnstileService;
        this.emailService = emailService;
    }

    @Transactional
    public MessageResponse register(RegisterRequest request, HttpServletRequest servletRequest) {
        turnstileService.verify(request.captcha(), servletRequest.getRemoteAddr());
        passwordValidator.validate(request.password(), request.repeatPassword());

        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email уже занят");
        }

        if (userRepository.existsByUsername(request.username())) {
            throw new BadRequestException("Username уже занят");
        }

        User user = User.builder()
                .email(request.email())
                .username(request.username())
                .passwordHash(passwordEncoder.encode(request.password()))
                .roles(new HashSet<>(Set.of(Role.USER)))
                .verifiedStatus(VerifiedType.NONE)
                .emailVerified(false)
                .blocked(false)
                .build();

        userRepository.save(user);
        sendVerificationMail(user);

        return new MessageResponse("Мы отправили письмо для подтверждения почты");
    }

    @Transactional
    public AuthResult login(LoginRequest request, HttpServletRequest servletRequest) {
        turnstileService.verify(request.captcha(), servletRequest.getRemoteAddr());

        String login = request.email().trim();
        User user = userRepository.findByEmail(login)
                .or(() -> userRepository.findByUsername(login))
                .orElseThrow(() -> new UnauthorizedException("Неверная почта или пароль"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Неверная почта или пароль");
        }

        if (user.isBlocked()) {
            throw new UnauthorizedException("Аккаунт заблокирован");
        }

        if (!user.isEmailVerified()) {
            throw new UnauthorizedException("Подтвердите почту перед входом");
        }

        return createAuthResult(user);
    }

    @Transactional
    public AuthResult refresh(String token) {
        if (token == null || token.isBlank()) {
            throw new UnauthorizedException("Refresh token недействителен");
        }

        if (!jwtProvider.validateRefreshToken(token)) {
            throw new UnauthorizedException("Refresh token недействителен");
        }

        String tokenHash = tokenHashService.hash(token);
        RefreshToken savedToken = refreshTokenRepository.findByTokenHashAndRevokedFalse(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Refresh token недействителен"));

        if (savedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            savedToken.setRevoked(true);
            throw new UnauthorizedException("Refresh token истек");
        }

        Claims claims = jwtProvider.getRefreshClaims(token);
        UUID userId = UUID.fromString(claims.getSubject());
        User user = userRepository.findWithDocumentsById(userId)
                .orElseThrow(() -> new UnauthorizedException("Пользователь не найден"));

        if (!user.isEmailVerified()) {
            savedToken.setRevoked(true);
            throw new UnauthorizedException("Подтвердите почту перед входом");
        }

        savedToken.setRevoked(true);

        return createAuthResult(user);
    }

    @Transactional
    public AuthResult verifyEmail(VerifyEmailRequest request) {
        String tokenHash = tokenHashService.hash(request.code());

        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByTokenHashAndUsedAtIsNull(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Ссылка подтверждения недействительна"));

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        verificationToken.setUsedAt(LocalDateTime.now());
        emailVerificationTokenRepository.markUnusedTokensAsUsed(user.getId());

        return createAuthResult(user);
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }

        String tokenHash = tokenHashService.hash(refreshToken);
        refreshTokenRepository.findByTokenHashAndRevokedFalse(tokenHash)
                .ifPresent(token -> token.setRevoked(true));
    }

    private AuthResult createAuthResult(User user) {
        String accessToken = jwtProvider.generateAccessToken(user);
        String refreshToken = jwtProvider.generateRefreshToken(user);

        RefreshToken savedToken = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHashService.hash(refreshToken))
                .expiresAt(LocalDateTime.now().plusDays(jwtProvider.getRefreshDays()))
                .revoked(false)
                .build();

        refreshTokenRepository.save(savedToken);

        return new AuthResult(new AuthResponse(userMapper.toDto(user), accessToken), refreshToken);
    }

    private void sendVerificationMail(User user) {
        String code = generateVerificationCode();

        EmailVerificationToken token = EmailVerificationToken.builder()
                .user(user)
                .tokenHash(tokenHashService.hash(code))
                .build();

        emailVerificationTokenRepository.save(token);
        emailService.sendVerificationMail(user.getEmail(), user.getUsername(), code);
    }

    private String generateVerificationCode() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
