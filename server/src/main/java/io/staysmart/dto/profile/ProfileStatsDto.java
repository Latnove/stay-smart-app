package io.staysmart.dto.profile;

public record ProfileStatsDto(
        long bookings,
        long listings,
        long favorites,
        long reviews
) {
}
