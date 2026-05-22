package io.staysmart.repository;

import io.staysmart.entity.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, UUID> {

    Optional<EmailVerificationToken> findByTokenHashAndUsedAtIsNull(String tokenHash);

    @Modifying
    @Query("""
            update EmailVerificationToken token
            set token.usedAt = current_timestamp
            where token.user.id = :userId
              and token.usedAt is null
            """)
    void markUnusedTokensAsUsed(UUID userId);
}
