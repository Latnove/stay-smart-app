package io.staysmart.repository;

import io.staysmart.entity.ListingImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ListingImageRepository extends JpaRepository<ListingImage, UUID> {

    List<ListingImage> findByListingIdOrderByOrderIndexAsc(UUID listingId);

    void deleteByListingId(UUID listingId);
}
