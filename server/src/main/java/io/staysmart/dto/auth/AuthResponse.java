package io.staysmart.dto.auth;

import io.staysmart.dto.user.UserDto;

public record AuthResponse(
        UserDto user,
        String accessToken
) {
}
