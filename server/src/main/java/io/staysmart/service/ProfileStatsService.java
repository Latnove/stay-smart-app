package io.staysmart.service;

import io.staysmart.dto.profile.ProfileStatsDto;
import io.staysmart.entity.User;
import io.staysmart.repository.BookingRepository;
import io.staysmart.repository.FavoriteRepository;
import io.staysmart.repository.ListingRepository;
import io.staysmart.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ProfileStatsService {

    private final CurrentUserService currentUserService;
    private final BookingRepository bookingRepository;
    private final ListingRepository listingRepository;
    private final FavoriteRepository favoriteRepository;
    private final ReviewRepository reviewRepository;

    public ProfileStatsService(
            CurrentUserService currentUserService,
            BookingRepository bookingRepository,
            ListingRepository listingRepository,
            FavoriteRepository favoriteRepository,
            ReviewRepository reviewRepository
    ) {
        this.currentUserService = currentUserService;
        this.bookingRepository = bookingRepository;
        this.listingRepository = listingRepository;
        this.favoriteRepository = favoriteRepository;
        this.reviewRepository = reviewRepository;
    }

    @Transactional(readOnly = true)
    public ProfileStatsDto getMyStats() {
        User user = currentUserService.getCurrentUser();
        UUID userId = user.getId();

        return new ProfileStatsDto(
                bookingRepository.countByUserId(userId),
                listingRepository.countByOwnerId(userId),
                favoriteRepository.countByUserId(userId),
                reviewRepository.countByUserId(userId)
        );
    }
}
