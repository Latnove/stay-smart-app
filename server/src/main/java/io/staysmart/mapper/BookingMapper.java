package io.staysmart.mapper;

import io.staysmart.dto.booking.BookingDto;
import io.staysmart.dto.listing.ListingDto;
import io.staysmart.dto.user.UserDto;
import io.staysmart.entity.Booking;
import io.staysmart.enums.BookingStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.UUID;

@Component
public class BookingMapper {

    private final ListingMapper listingMapper;
    private final UserMapper userMapper;

    public BookingMapper(ListingMapper listingMapper, UserMapper userMapper) {
        this.listingMapper = listingMapper;
        this.userMapper = userMapper;
    }

    public BookingDto toDto(Booking booking, UUID currentUserId) {
        BookingStatus status = getVisibleStatus(booking);
        ListingDto listing = booking.getListing() == null ? null : listingMapper.toDto(booking.getListing(), currentUserId);
        UserDto user = booking.getUser() == null ? null : userMapper.toDto(booking.getUser());

        return new BookingDto(
                booking.getId(),
                booking.getListing().getId(),
                listing,
                booking.getUser().getId(),
                user,
                booking.getStartDate(),
                booking.getEndDate(),
                booking.getListing().getPrice(),
                booking.getTotalPrice(),
                status,
                booking.getCreatedAt(),
                booking.getUpdatedAt()
        );
    }

    private BookingStatus getVisibleStatus(Booking booking) {
        if (booking.getStatus() == BookingStatus.ACTIVE && !booking.getStartDate().isAfter(LocalDate.now())) {
            return BookingStatus.PROVIDED;
        }

        return booking.getStatus();
    }
}
