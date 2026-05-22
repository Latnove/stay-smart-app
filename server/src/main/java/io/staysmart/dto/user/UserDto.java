package io.staysmart.dto.user;

import io.staysmart.enums.Role;
import io.staysmart.enums.VerifiedType;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserDto(
        UUID id,
        String username,
        String email,
        Role role,
        VerifiedType verified,
        LocalDateTime createdAt,
        Boolean blocked,
        String verificationReason,
        String blockReason
) {
}
