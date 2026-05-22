package io.staysmart.service;

import io.staysmart.dto.review.ReviewDto;
import io.staysmart.dto.review.ReviewRequest;
import io.staysmart.entity.Listing;
import io.staysmart.entity.Review;
import io.staysmart.entity.User;
import io.staysmart.enums.NotificationType;
import io.staysmart.enums.Role;
import io.staysmart.exception.BadRequestException;
import io.staysmart.exception.ForbiddenException;
import io.staysmart.exception.NotFoundException;
import io.staysmart.mapper.ReviewMapper;
import io.staysmart.repository.ListingRepository;
import io.staysmart.repository.ReviewRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ListingRepository listingRepository;
    private final ReviewMapper reviewMapper;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;

    public ReviewService(
            ReviewRepository reviewRepository,
            ListingRepository listingRepository,
            ReviewMapper reviewMapper,
            CurrentUserService currentUserService,
            NotificationService notificationService
    ) {
        this.reviewRepository = reviewRepository;
        this.listingRepository = listingRepository;
        this.reviewMapper = reviewMapper;
        this.currentUserService = currentUserService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> getByListing(UUID listingId) {
        return reviewRepository.findByListingIdOrderByCreatedAtDesc(listingId)
                .stream()
                .map(reviewMapper::toDto)
                .toList();
    }

    @Transactional
    @CacheEvict(value = "listings", allEntries = true)
    public ReviewDto create(UUID listingId, ReviewRequest request) {
        User user = currentUserService.getCurrentUser();
        Listing listing = findListing(listingId);

        if (listing.getOwner().getId().equals(user.getId())) {
            throw new ForbiddenException("Нельзя оставить отзыв на свое объявление");
        }

        if (reviewRepository.existsByListingIdAndUserId(listingId, user.getId())) {
            throw new BadRequestException("Вы уже оставили отзыв");
        }

        Review review = Review.builder()
                .listing(listing)
                .user(user)
                .rating(request.rating())
                .comment(request.text())
                .build();

        reviewRepository.save(review);
        refreshListingRating(listing);

        return reviewMapper.toDto(review);
    }

    @Transactional
    @CacheEvict(value = "listings", allEntries = true)
    public ReviewDto update(UUID id, ReviewRequest request) {
        User user = currentUserService.getCurrentUser();
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Отзыв не найден"));

        if (!review.getUser().getId().equals(user.getId()) && !user.getRoles().contains(Role.ADMIN)) {
            throw new ForbiddenException("Нет доступа");
        }

        review.setRating(request.rating());
        review.setComment(request.text());
        refreshListingRating(review.getListing());

        if (user.getRoles().contains(Role.ADMIN) && !review.getUser().getId().equals(user.getId())) {
            notificationService.create(
                    review.getUser().getId(),
                    NotificationType.REVIEW_UPDATED,
                    "Администратор обновил отзыв",
                    "Отзыв к объявлению был отредактирован администратором.",
                    "/listings/" + review.getListing().getId()
            );
        }

        return reviewMapper.toDto(review);
    }

    private void refreshListingRating(Listing listing) {
        listing.setRating(reviewRepository.calculateAverageRating(listing.getId()));
        listing.setReviewsCount(reviewRepository.countByListing(listing.getId()));
    }

    private Listing findListing(UUID id) {
        return listingRepository.findWithImagesById(id)
                .orElseThrow(() -> new NotFoundException("Объявление не найдено"));
    }
}
