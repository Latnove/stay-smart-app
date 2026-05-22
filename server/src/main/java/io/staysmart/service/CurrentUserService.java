package io.staysmart.service;

import io.staysmart.entity.User;
import io.staysmart.exception.UnauthorizedException;
import io.staysmart.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    User getCurrentUser() {
        UUID userId = getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Необходимо авторизоваться"));

        User user = userRepository.findWithDocumentsById(userId)
                .orElseThrow(() -> new UnauthorizedException("Пользователь не найден"));

        if (!user.isEmailVerified()) {
            throw new UnauthorizedException("Подтвердите почту перед входом");
        }

        return user;
    }

    public Optional<UUID> getCurrentUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || auth.getName() == null || auth.getName().equals("anonymousUser")) {
            return Optional.empty();
        }

        return Optional.of(UUID.fromString(auth.getName()));
    }
}
