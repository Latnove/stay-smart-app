package io.staysmart.repository;

import io.staysmart.enums.ListingCategory;

import java.util.List;

public record ListingSearchParams(
        int page,
        int limit,
        String sortBy,
        String order,
        String city,
        Integer priceFrom,
        Integer priceTo,
        Integer minGuests,
        Double ratingFrom,
        Double ratingTo,
        List<ListingCategory> categories
) {
}
