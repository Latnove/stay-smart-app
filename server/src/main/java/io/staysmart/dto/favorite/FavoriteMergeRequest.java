package io.staysmart.dto.favorite;

import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record FavoriteMergeRequest(
        @Size(max = 100)
        List<UUID> listingIds
) {
}
