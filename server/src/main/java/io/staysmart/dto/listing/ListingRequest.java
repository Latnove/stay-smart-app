package io.staysmart.dto.listing;

import io.staysmart.enums.ListingCategory;
import io.staysmart.enums.ListingStatus;

import java.util.List;

public record ListingRequest(
        String title,

        String description,

        String city,

        String address,

        int price,

        int maxGuests,

        ListingCategory type,

        List<String> images,

        ListingStatus status
) {
}
