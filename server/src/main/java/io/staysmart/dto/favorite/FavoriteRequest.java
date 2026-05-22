package io.staysmart.dto.favorite;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record FavoriteRequest(
        @NotNull
        UUID listingId
) {
}
