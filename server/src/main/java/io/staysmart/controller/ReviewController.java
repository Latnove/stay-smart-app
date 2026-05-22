package io.staysmart.controller;

import io.staysmart.dto.review.ReviewDto;
import io.staysmart.dto.review.ReviewRequest;
import io.staysmart.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/api/listings/{listingId}/reviews")
    public List<ReviewDto> getListingReviews(@PathVariable UUID listingId) {
        return reviewService.getByListing(listingId);
    }

    @PostMapping("/api/listings/{listingId}/reviews")
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewDto createReview(@PathVariable UUID listingId, @Valid @RequestBody ReviewRequest request) {
        return reviewService.create(listingId, request);
    }

    @PutMapping("/api/reviews/{id}")
    public ReviewDto updateReview(@PathVariable UUID id, @Valid @RequestBody ReviewRequest request) {
        return reviewService.update(id, request);
    }
}
