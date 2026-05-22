package io.staysmart.controller;

import io.staysmart.dto.favorite.FavoriteMergeRequest;
import io.staysmart.dto.favorite.FavoriteRequest;
import io.staysmart.dto.listing.ListingDto;
import io.staysmart.service.FavoriteService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @GetMapping
    public List<UUID> getMyFavorites() {
        return favoriteService.getMyFavorites();
    }

    @GetMapping("/listings")
    public List<ListingDto> getMyFavoriteListings() {
        return favoriteService.getMyFavoriteListings();
    }

    @PostMapping
    public List<UUID> addFavorite(@Valid @RequestBody FavoriteRequest request) {
        return favoriteService.add(request.listingId());
    }

    @PostMapping("/merge")
    public List<UUID> mergeFavorites(@Valid @RequestBody FavoriteMergeRequest request) {
        return favoriteService.merge(request.listingIds());
    }

    @DeleteMapping("/{listingId}")
    public List<UUID> removeFavorite(@PathVariable UUID listingId) {
        return favoriteService.remove(listingId);
    }
}
