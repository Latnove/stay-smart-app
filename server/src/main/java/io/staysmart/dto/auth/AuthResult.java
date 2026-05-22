package io.staysmart.dto.auth;

public record AuthResult(
        AuthResponse response,
        String refreshToken
) {
}
