package io.staysmart.mapper;

import io.staysmart.generated.booking.dto.BookingDto;
import io.staysmart.generated.booking.dto.ListingDto;
import io.staysmart.generated.booking.dto.UserDto;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;

@Component
public class BookingApiMapper {

    public BookingDto toApiDto(io.staysmart.dto.booking.BookingDto booking) {
        if (booking == null) {
            return null;
        }

        return new BookingDto()
                .id(booking.id())
                .listingId(booking.listingId())
                .listing(toApiDto(booking.listing()))
                .userId(booking.userId())
                .user(toApiDto(booking.user()))
                .startDate(booking.startDate())
                .endDate(booking.endDate())
                .pricePerDay(booking.pricePerDay())
                .totalPrice(booking.totalPrice())
                .status(booking.status() == null ? null : BookingDto.StatusEnum.fromValue(booking.status().getValue()))
                .createdAt(toOffsetDateTime(booking.createdAt()))
                .updatedAt(toOffsetDateTime(booking.updatedAt()));
    }

    public io.staysmart.dto.booking.BookingRequest toServiceRequest(
            io.staysmart.generated.booking.dto.BookingRequest request
    ) {
        return new io.staysmart.dto.booking.BookingRequest(
                request.getStartDate(),
                request.getEndDate()
        );
    }

    private ListingDto toApiDto(io.staysmart.dto.listing.ListingDto listing) {
        if (listing == null) {
            return null;
        }

        return new ListingDto()
                .id(listing.id())
                .title(listing.title())
                .description(listing.description())
                .city(listing.city())
                .address(listing.address())
                .price(listing.price())
                .maxGuests(listing.maxGuests())
                .images(listing.images())
                .rating(listing.rating())
                .type(listing.type() == null ? null : ListingDto.TypeEnum.fromValue(listing.type().getValue()))
                .isOwner(listing.isOwner())
                .ownerUsername(listing.ownerUsername())
                .status(listing.status() == null ? null : ListingDto.StatusEnum.fromValue(listing.status().getValue()));
    }

    private UserDto toApiDto(io.staysmart.dto.user.UserDto user) {
        if (user == null) {
            return null;
        }

        return new UserDto()
                .id(user.id())
                .username(user.username())
                .email(user.email())
                .role(user.role() == null ? null : UserDto.RoleEnum.fromValue(user.role().getValue()))
                .verified(user.verified() == null ? null : UserDto.VerifiedEnum.fromValue(user.verified().getValue()))
                .createdAt(toOffsetDateTime(user.createdAt()))
                .blocked(user.blocked())
                .verificationReason(user.verificationReason())
                .blockReason(user.blockReason());
    }

    private OffsetDateTime toOffsetDateTime(LocalDateTime value) {
        if (value == null) {
            return null;
        }

        return value.atZone(ZoneId.systemDefault()).toOffsetDateTime();
    }
}
