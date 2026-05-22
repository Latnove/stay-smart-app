package io.staysmart.dto.booking;

import io.staysmart.dto.listing.ListingDto;
import io.staysmart.dto.user.UserDto;
import io.staysmart.enums.BookingStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record BookingDto(
        UUID id,
        UUID listingId,
        ListingDto listing,
        UUID userId,
        UserDto user,
        LocalDate startDate,
        LocalDate endDate,
        int pricePerDay,
        int totalPrice,
        BookingStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
