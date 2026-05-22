package io.staysmart.repository;

import io.staysmart.entity.Listing;
import io.staysmart.enums.ListingStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ListingRepository extends JpaRepository<Listing, UUID>, ListingRepositoryCustom {

    @EntityGraph(attributePaths = {"images", "owner", "owner.roles"})
    Optional<Listing> findWithImagesById(UUID id);

    @EntityGraph(attributePaths = {"images", "owner", "owner.roles"})
    List<Listing> findByOwnerId(UUID ownerId);

    long countByOwnerId(UUID ownerId);

    @EntityGraph(attributePaths = {"images", "owner", "owner.roles"})
    List<Listing> findByStatus(ListingStatus status);

    @EntityGraph(attributePaths = {"images", "owner", "owner.roles"})
    @Query("""
            select l from Listing l
            where l.status = io.staysmart.enums.ListingStatus.REVIEW
            order by l.createdAt desc
            """)
    List<Listing> findListingsOnReview();

    @Query("""
            select distinct l from Listing l
            left join fetch l.images
            left join fetch l.owner owner
            left join fetch owner.roles
            where l.id in :ids
            """)
    List<Listing> findWithImagesByIds(List<UUID> ids);

    @Query("""
            select l from Listing l
            where l.status = io.staysmart.enums.ListingStatus.ACTIVE
              and l.rating >= (
                    select coalesce(avg(l2.rating), 0)
                    from Listing l2
                    where l2.status = io.staysmart.enums.ListingStatus.ACTIVE
              )
            order by l.rating desc
            """)
    List<Listing> findActiveListingsWithRatingNotLowerThanAverage();
}
