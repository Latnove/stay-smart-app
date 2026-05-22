package io.staysmart.mapper;

import io.staysmart.dto.listing.ListingDto;
import io.staysmart.entity.Listing;
import io.staysmart.entity.ListingImage;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Component
public class ListingMapper {

    public ListingDto toDto(Listing listing, UUID currentUserId) {
        List<String> images = listing.getImages() == null
                ? List.of()
                : listing.getImages()
                .stream()
                .sorted(Comparator.comparingInt(ListingImage::getOrderIndex))
                .map(ListingImage::getUrl)
                .distinct()
                .toList();

        boolean isOwner = currentUserId != null && listing.getOwner().getId().equals(currentUserId);

        return new ListingDto(
                listing.getId(),
                listing.getTitle(),
                listing.getDescription(),
                listing.getCity(),
                listing.getAddress(),
                listing.getPrice(),
                listing.getMaxGuests(),
                images,
                listing.getRating(),
                listing.getType(),
                isOwner,
                listing.getOwner().getUsername(),
                listing.getStatus()
        );
    }
}
