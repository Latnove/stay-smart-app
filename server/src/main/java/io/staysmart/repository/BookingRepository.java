package io.staysmart.repository;

import io.staysmart.entity.Booking;
import io.staysmart.enums.BookingStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {

    @Override
    @EntityGraph(attributePaths = {"listing", "listing.images", "listing.owner", "listing.owner.roles", "user", "user.roles"})
    Optional<Booking> findById(UUID id);

    @EntityGraph(attributePaths = {"listing", "listing.images", "listing.owner", "listing.owner.roles", "user", "user.roles"})
    List<Booking> findByUserId(UUID userId);

    long countByUserId(UUID userId);

    @EntityGraph(attributePaths = {"listing", "listing.images", "listing.owner", "listing.owner.roles", "user", "user.roles"})
    List<Booking> findByListingId(UUID listingId);

    @Query("""
            select count(b) > 0 from Booking b
            where b.listing.id = :listingId
              and b.status <> :cancelledStatus
              and b.startDate <= :endDate
              and b.endDate >= :startDate
            """)
    boolean existsIntersectingBooking(
            UUID listingId,
            LocalDate startDate,
            LocalDate endDate,
            BookingStatus cancelledStatus
    );

    @Query("""
            select count(b) > 0 from Booking b
            where b.listing.id = :listingId
              and b.status <> :cancelledStatus
              and b.id <> :excludedBookingId
              and b.startDate <= :endDate
              and b.endDate >= :startDate
            """)
    boolean existsIntersectingBookingExcept(
            UUID listingId,
            UUID excludedBookingId,
            LocalDate startDate,
            LocalDate endDate,
            BookingStatus cancelledStatus
    );

    @Query("""
            select b from Booking b
            where b.status = io.staysmart.enums.BookingStatus.ACTIVE
              and b.startDate <= :today
            """)
    List<Booking> findBookingsToMarkProvided(LocalDate today);
}
