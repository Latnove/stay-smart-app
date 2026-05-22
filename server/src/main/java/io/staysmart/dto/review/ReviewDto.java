package io.staysmart.dto.review;

import io.staysmart.dto.user.UserDto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ReviewDto(
        UUID id,
        UUID listingId,
        UserDto author,
        int rating,
        String text,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
