package io.staysmart.repository;

import io.staysmart.entity.Favorite;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface FavoriteRepository extends JpaRepository<Favorite, UUID> {

    @EntityGraph(attributePaths = {"listing", "listing.images", "listing.owner", "listing.owner.roles"})
    List<Favorite> findByUserIdOrderByCreatedAtDesc(UUID userId);

    boolean existsByUserIdAndListingId(UUID userId, UUID listingId);

    long countByUserId(UUID userId);

    void deleteByUserIdAndListingId(UUID userId, UUID listingId);

    @Query("""
            select f.listing.id from Favorite f
            where f.user.id = :userId
              and f.listing.status = io.staysmart.enums.ListingStatus.ACTIVE
            order by f.createdAt desc
            """)
    List<UUID> findFavoriteListingIds(UUID userId);
}
