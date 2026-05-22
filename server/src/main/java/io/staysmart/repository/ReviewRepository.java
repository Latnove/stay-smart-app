package io.staysmart.repository;

import io.staysmart.entity.Review;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {

    @Override
    @EntityGraph(attributePaths = {"user", "user.roles", "listing", "listing.owner", "listing.owner.roles"})
    Optional<Review> findById(UUID id);

    @EntityGraph(attributePaths = {"user", "user.roles", "listing", "listing.owner"})
    List<Review> findByListingIdOrderByCreatedAtDesc(UUID listingId);

    Optional<Review> findByListingIdAndUserId(UUID listingId, UUID userId);

    boolean existsByListingIdAndUserId(UUID listingId, UUID userId);

    long countByUserId(UUID userId);

    @Query("""
            select coalesce(avg(r.rating), 0)
            from Review r
            where r.listing.id = :listingId
            """)
    double calculateAverageRating(UUID listingId);

    @Query("""
            select count(r)
            from Review r
            where r.listing.id = :listingId
            """)
    int countByListing(UUID listingId);
}
