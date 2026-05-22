package io.staysmart.repository;

import io.staysmart.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHashAndRevokedFalse(String tokenHash);

    @Modifying
    @Query("""
            update RefreshToken token
            set token.revoked = true
            where token.user.id = :userId
            """)
    void revokeAllForUser(UUID userId);
}
