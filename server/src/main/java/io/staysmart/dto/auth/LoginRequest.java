package io.staysmart.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank
        @Size(max = 255)
        String email,

        @NotBlank
        @Size(max = 128)
        String password,

        @NotBlank
        String captcha
) {
}
