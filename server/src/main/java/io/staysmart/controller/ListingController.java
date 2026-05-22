package io.staysmart.controller;

import io.staysmart.dto.common.PageResponse;
import io.staysmart.dto.listing.ListingDto;
import io.staysmart.dto.listing.ListingForm;
import io.staysmart.dto.listing.ListingRequest;
import io.staysmart.enums.ListingCategory;
import io.staysmart.enums.ListingStatus;
import io.staysmart.repository.ListingSearchParams;
import io.staysmart.service.ListingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/listings")
public class ListingController {

    private final ListingService listingService;

    public ListingController(ListingService listingService) {
        this.listingService = listingService;
    }

    @GetMapping
    public PageResponse<ListingDto> getListings(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "9") int limit,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String order,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer priceFrom,
            @RequestParam(required = false) Integer priceTo,
            @RequestParam(required = false) Integer minGuests,
            @RequestParam(required = false) Double ratingFrom,
            @RequestParam(required = false) Double ratingTo,
            @RequestParam(required = false) String category
    ) {
        List<ListingCategory> categories = category == null || category.isBlank()
                ? List.of()
                : Arrays.stream(category.split(","))
                .map(String::trim)
                .map(ListingCategory::fromValue)
                .toList();

        return listingService.getAll(new ListingSearchParams(
                page,
                limit,
                sortBy,
                order,
                city,
                priceFrom,
                priceTo,
                minGuests,
                ratingFrom,
                ratingTo,
                categories
        ));
    }

    @GetMapping("/my")
    public List<ListingDto> getMyListings() {
        return listingService.getMyListings();
    }

    @GetMapping("/{id}")
    public ListingDto getListingById(@PathVariable UUID id) {
        return listingService.getById(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ListingDto createListing(@Valid @ModelAttribute ListingForm form) {
        return listingService.create(toRequest(form, false), form.getImages());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ListingDto updateListing(
            @PathVariable UUID id,
            @Valid @ModelAttribute ListingForm form
    ) {
        return listingService.update(id, toRequest(form, true), form.getImages());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteListing(@PathVariable UUID id) {
        listingService.delete(id);
    }

    @PostMapping("/batch")
    public List<ListingDto> getListingsByIds(@RequestBody List<UUID> ids) {
        return listingService.getListingsByIds(ids);
    }

    private ListingRequest toRequest(ListingForm form, boolean withStatus) {
        String status = form.getStatus();

        return new ListingRequest(
                form.getTitle(),
                form.getDescription(),
                form.getCity(),
                form.getAddress(),
                form.getPrice(),
                form.getMaxGuests(),
                ListingCategory.fromValue(form.getType()),
                form.getImageUrls(),
                !withStatus || status == null || status.isBlank() ? null : ListingStatus.fromValue(status)
        );
    }
}
