package io.staysmart.service;

import io.staysmart.dto.booking.BookingDto;
import io.staysmart.dto.booking.BookingRequest;
import io.staysmart.entity.Booking;
import io.staysmart.entity.Listing;
import io.staysmart.entity.User;
import io.staysmart.enums.BookingStatus;
import io.staysmart.enums.ListingStatus;
import io.staysmart.enums.NotificationType;
import io.staysmart.enums.Role;
import io.staysmart.exception.BadRequestException;
import io.staysmart.exception.ForbiddenException;
import io.staysmart.exception.NotFoundException;
import io.staysmart.mapper.BookingMapper;
import io.staysmart.repository.BookingRepository;
import io.staysmart.repository.ListingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ListingRepository listingRepository;
    private final BookingMapper bookingMapper;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;

    public BookingService(
            BookingRepository bookingRepository,
            ListingRepository listingRepository,
            BookingMapper bookingMapper,
            CurrentUserService currentUserService,
            NotificationService notificationService
    ) {
        this.bookingRepository = bookingRepository;
        this.listingRepository = listingRepository;
        this.bookingMapper = bookingMapper;
        this.currentUserService = currentUserService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<BookingDto> getListingBookings(UUID listingId) {
        UUID currentUserId = currentUserService.getCurrentUserId().orElse(null);

        return bookingRepository.findByListingId(listingId)
                .stream()
                .map(booking -> bookingMapper.toDto(booking, currentUserId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingDto> getMyBookings() {
        User user = currentUserService.getCurrentUser();

        return bookingRepository.findByUserId(user.getId())
                .stream()
                .map(booking -> bookingMapper.toDto(booking, user.getId()))
                .toList();
    }

    @Transactional
    public BookingDto create(UUID listingId, BookingRequest request) {
        User user = currentUserService.getCurrentUser();
        Listing listing = findListing(listingId);

        validatePeriod(request.startDate(), request.endDate());

        if (listing.getStatus() != ListingStatus.ACTIVE) {
            throw new BadRequestException("Объявление недоступно для бронирования");
        }

        if (listing.getOwner().getId().equals(user.getId())) {
            throw new BadRequestException("Нельзя бронировать свое объявление");
        }

        if (bookingRepository.existsIntersectingBooking(
                listingId,
                request.startDate(),
                request.endDate(),
                BookingStatus.CANCELLED
        )) {
            throw new BadRequestException("В выбранном периоде есть занятые даты");
        }

        Booking booking = Booking.builder()
                .user(user)
                .listing(listing)
                .startDate(request.startDate())
                .endDate(request.endDate())
                .totalPrice(calculateTotalPrice(listing, request.startDate(), request.endDate()))
                .status(BookingStatus.ACTIVE)
                .build();

        bookingRepository.save(booking);

        notificationService.create(
                listing.getOwner().getId(),
                NotificationType.BOOKING_CREATED,
                "Новое бронирование",
                user.getUsername() + " забронировал \"" + listing.getTitle() + "\".",
                "/listings/" + listing.getId()
        );

        return bookingMapper.toDto(booking, user.getId());
    }

    @Transactional
    public BookingDto changePeriod(UUID bookingId, BookingRequest request) {
        User user = currentUserService.getCurrentUser();
        Booking booking = findBooking(bookingId);

        checkBookingOwner(booking, user);
        validatePeriod(request.startDate(), request.endDate());
        checkActiveFutureBooking(booking);

        if (bookingRepository.existsIntersectingBookingExcept(
                booking.getListing().getId(),
                booking.getId(),
                request.startDate(),
                request.endDate(),
                BookingStatus.CANCELLED
        )) {
            throw new BadRequestException("В выбранном периоде есть занятые даты");
        }

        booking.setStartDate(request.startDate());
        booking.setEndDate(request.endDate());
        booking.setTotalPrice(calculateTotalPrice(booking.getListing(), request.startDate(), request.endDate()));

        notificationService.create(
                booking.getListing().getOwner().getId(),
                NotificationType.BOOKING_PERIOD_CHANGED,
                "Гость изменил срок аренды",
                "Бронирование " + booking.getId() + " перенесено на новые даты.",
                "/listings/" + booking.getListing().getId()
        );

        return bookingMapper.toDto(booking, user.getId());
    }

    @Transactional
    public BookingDto cancel(UUID bookingId) {
        User user = currentUserService.getCurrentUser();
        Booking booking = findBooking(bookingId);

        if (!canCancel(booking, user)) {
            throw new ForbiddenException("Недостаточно прав для отмены");
        }

        checkActiveFutureBooking(booking);
        booking.setStatus(BookingStatus.CANCELLED);

        User recipient = booking.getUser().getId().equals(user.getId())
                ? booking.getListing().getOwner()
                : booking.getUser();

        notificationService.create(
                recipient.getId(),
                NotificationType.BOOKING_CANCELLED,
                "Бронирование отменено",
                "Бронирование " + booking.getId() + " было отменено.",
                booking.getUser().getId().equals(recipient.getId()) ? "/my-bookings" : "/listings/" + booking.getListing().getId()
        );

        return bookingMapper.toDto(booking, user.getId());
    }

    private Booking findBooking(UUID id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Бронирование не найдено"));
    }

    private Listing findListing(UUID id) {
        return listingRepository.findWithImagesById(id)
                .orElseThrow(() -> new NotFoundException("Объявление не найдено"));
    }

    private void validatePeriod(LocalDate startDate, LocalDate endDate) {
        if (startDate.isBefore(LocalDate.now())) {
            throw new BadRequestException("Дата начала не может быть в прошлом");
        }

        if (endDate.isBefore(startDate)) {
            throw new BadRequestException("Дата окончания не может быть раньше даты начала");
        }
    }

    private int calculateTotalPrice(Listing listing, LocalDate startDate, LocalDate endDate) {
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        return Math.toIntExact(days * listing.getPrice());
    }

    private void checkBookingOwner(Booking booking, User user) {
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Нет доступа");
        }
    }

    private void checkActiveFutureBooking(Booking booking) {
        if (booking.getStatus() != BookingStatus.ACTIVE || !booking.getStartDate().isAfter(LocalDate.now())) {
            throw new BadRequestException("Эту бронь уже нельзя изменить");
        }
    }

    private boolean canCancel(Booking booking, User user) {
        return user.getRoles().contains(Role.ADMIN)
                || booking.getUser().getId().equals(user.getId())
                || booking.getListing().getOwner().getId().equals(user.getId());
    }
}
