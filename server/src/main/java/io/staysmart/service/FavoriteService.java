package io.staysmart.service;

import io.staysmart.entity.Favorite;
import io.staysmart.entity.Listing;
import io.staysmart.entity.User;
import io.staysmart.dto.listing.ListingDto;
import io.staysmart.enums.ListingStatus;
import io.staysmart.mapper.ListingMapper;
import io.staysmart.repository.FavoriteRepository;
import io.staysmart.repository.ListingRepository;
import io.staysmart.exception.BadRequestException;
import io.staysmart.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final CurrentUserService currentUserService;
    private final ListingRepository listingRepository;
    private final ListingMapper listingMapper;

    public FavoriteService(
            FavoriteRepository favoriteRepository,
            CurrentUserService currentUserService,
            ListingRepository listingRepository,
            ListingMapper listingMapper
    ) {
        this.favoriteRepository = favoriteRepository;
        this.currentUserService = currentUserService;
        this.listingRepository = listingRepository;
        this.listingMapper = listingMapper;
    }

    @Transactional(readOnly = true)
    public List<UUID> getMyFavorites() {
        User user = currentUserService.getCurrentUser();
        return favoriteRepository.findFavoriteListingIds(user.getId());
    }

    @Transactional(readOnly = true)
    public List<ListingDto> getMyFavoriteListings() {
        User user = currentUserService.getCurrentUser();

        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(Favorite::getListing)
                .filter(listing -> listing.getStatus() == ListingStatus.ACTIVE)
                .map(listing -> listingMapper.toDto(listing, user.getId()))
                .toList();
    }

    @Transactional
    public List<UUID> add(UUID listingId) {
        User user = currentUserService.getCurrentUser();
        Listing listing = findListing(listingId);

        if (listing.getStatus() != ListingStatus.ACTIVE) {
            throw new BadRequestException("Можно добавить только активное объявление");
        }

        addFavorite(user, listing);
        return getMyFavorites();
    }

    @Transactional
    public List<UUID> merge(List<UUID> listingIds) {
        User user = currentUserService.getCurrentUser();

        if (listingIds != null) {
            for (UUID listingId : new HashSet<>(listingIds)) {
                if (listingId != null) {
                    addFavorite(user, listingId);
                }
            }
        }

        return getMyFavorites();
    }

    @Transactional
    public List<UUID> remove(UUID listingId) {
        User user = currentUserService.getCurrentUser();
        favoriteRepository.deleteByUserIdAndListingId(user.getId(), listingId);

        return getMyFavorites();
    }

    private void addFavorite(User user, UUID listingId) {
        if (!favoriteRepository.existsByUserIdAndListingId(user.getId(), listingId)) {
            Listing listing = findListing(listingId);
            if (listing.getStatus() != ListingStatus.ACTIVE) {
                return;
            }

            addFavorite(user, listing);
        }
    }

    private void addFavorite(User user, Listing listing) {
        if (favoriteRepository.existsByUserIdAndListingId(user.getId(), listing.getId())) {
            return;
        }

        Favorite favorite = Favorite.builder()
                .user(user)
                .listing(listing)
                .build();

        favoriteRepository.save(favorite);
    }

    private Listing findListing(UUID id) {
        return listingRepository.findWithImagesById(id)
                .orElseThrow(() -> new NotFoundException("Объявление не найдено"));
    }
}
