package io.staysmart.dto.listing;

import io.staysmart.enums.ListingCategory;
import io.staysmart.enums.ListingStatus;

import java.util.List;
import java.util.UUID;

public record ListingDto(
        UUID id,
        String title,
        String description,
        String city,
        String address,
        int price,
        int maxGuests,
        List<String> images,
        double rating,
        ListingCategory type,
        boolean isOwner,
        String ownerUsername,
        ListingStatus status
) {
}
