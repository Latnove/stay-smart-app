package io.staysmart.controller;

import io.staysmart.generated.booking.api.BookingsApi;
import io.staysmart.generated.booking.dto.BookingDto;
import io.staysmart.generated.booking.dto.BookingRequest;
import io.staysmart.mapper.BookingApiMapper;
import io.staysmart.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
public class BookingController implements BookingsApi {

    private final BookingService bookingService;
    private final BookingApiMapper bookingApiMapper;

    public BookingController(BookingService bookingService, BookingApiMapper bookingApiMapper) {
        this.bookingService = bookingService;
        this.bookingApiMapper = bookingApiMapper;
    }

    @Override
    public ResponseEntity<List<BookingDto>> getListingBookings(UUID listingId) {
        List<BookingDto> bookings = bookingService.getListingBookings(listingId)
                .stream()
                .map(bookingApiMapper::toApiDto)
                .toList();

        return ResponseEntity.ok(bookings);
    }

    @Override
    public ResponseEntity<BookingDto> createBooking(UUID listingId, BookingRequest request) {
        BookingDto booking = bookingApiMapper.toApiDto(
                bookingService.create(listingId, bookingApiMapper.toServiceRequest(request))
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    @Override
    public ResponseEntity<List<BookingDto>> getMyBookings() {
        List<BookingDto> bookings = bookingService.getMyBookings()
                .stream()
                .map(bookingApiMapper::toApiDto)
                .toList();

        return ResponseEntity.ok(bookings);
    }

    @Override
    public ResponseEntity<BookingDto> changeBookingPeriod(UUID id, BookingRequest request) {
        BookingDto booking = bookingApiMapper.toApiDto(
                bookingService.changePeriod(id, bookingApiMapper.toServiceRequest(request))
        );

        return ResponseEntity.ok(booking);
    }

    @Override
    public ResponseEntity<BookingDto> cancelBooking(UUID id) {
        return ResponseEntity.ok(bookingApiMapper.toApiDto(bookingService.cancel(id)));
    }
}
