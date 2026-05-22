package io.staysmart.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordChangeRequest(
        @NotBlank
        String oldPassword,

        @NotBlank
        @Size(min = 8, max = 32)
        String password,

        @NotBlank
        String passwordRepeat
) {
}
