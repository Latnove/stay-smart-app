package io.staysmart.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReasonRequest(
        @NotBlank
        @Size(max = 240)
        String reason
) {
}
