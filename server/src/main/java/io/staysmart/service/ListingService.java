package io.staysmart.service;

import io.staysmart.dto.common.PageResponse;
import io.staysmart.dto.listing.ListingDto;
import io.staysmart.dto.listing.ListingRequest;
import io.staysmart.entity.Listing;
import io.staysmart.entity.ListingImage;
import io.staysmart.entity.User;
import io.staysmart.enums.ListingStatus;
import io.staysmart.enums.NotificationType;
import io.staysmart.enums.Role;
import io.staysmart.enums.VerifiedType;
import io.staysmart.exception.BadRequestException;
import io.staysmart.exception.ForbiddenException;
import io.staysmart.exception.NotFoundException;
import io.staysmart.mapper.ListingMapper;
import io.staysmart.repository.ListingImageRepository;
import io.staysmart.repository.ListingRepository;
import io.staysmart.repository.ListingSearchParams;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ListingService {

    private final ListingRepository listingRepository;
    private final ListingImageRepository imageRepository;
    private final ListingMapper listingMapper;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;
    private final UploadService uploadService;

    public ListingService(
            ListingRepository listingRepository,
            ListingImageRepository imageRepository,
            ListingMapper listingMapper,
            CurrentUserService currentUserService,
            NotificationService notificationService,
            UploadService uploadService
    ) {
        this.listingRepository = listingRepository;
        this.imageRepository = imageRepository;
        this.listingMapper = listingMapper;
        this.currentUserService = currentUserService;
        this.notificationService = notificationService;
        this.uploadService = uploadService;
    }

    @Transactional(readOnly = true)
    public PageResponse<ListingDto> getAll(ListingSearchParams params) {
        int page = Math.max(params.page(), 1);
        int limit = Math.max(params.limit(), 1);
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<UUID> listingIds = listingRepository.findActiveListingIds(params, pageable);
        UUID currentUserId = currentUserService.getCurrentUserId().orElse(null);
        List<Listing> listings = findListingsWithImages(listingIds.getContent());

        return new PageResponse<>(
                listings.stream().map(listing -> listingMapper.toDto(listing, currentUserId)).toList(),
                page,
                limit,
                listingIds.getTotalElements()
        );
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "listings", key = "#id.toString() + ':' + @currentUserService.getCurrentUserId().orElse(null)")
    public ListingDto getById(UUID id) {
        Listing listing = findListing(id);
        UUID currentUserId = currentUserService.getCurrentUserId().orElse(null);

        if (listing.getStatus() != ListingStatus.ACTIVE && !canManage(listing, currentUserId)) {
            throw new ForbiddenException("Нет доступа к объявлению");
        }

        return listingMapper.toDto(listing, currentUserId);
    }

    @Transactional(readOnly = true)
    public List<ListingDto> getMyListings() {
        User user = currentUserService.getCurrentUser();

        return listingRepository.findByOwnerId(user.getId())
                .stream()
                .map(listing -> listingMapper.toDto(listing, user.getId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ListingDto> getReviewListings() {
        UUID currentUserId = currentUserService.getCurrentUserId().orElse(null);

        return listingRepository.findListingsOnReview()
                .stream()
                .map(listing -> listingMapper.toDto(listing, currentUserId))
                .toList();
    }

    @Transactional
    @CacheEvict(value = "listings", allEntries = true)
    public ListingDto create(ListingRequest request) {
        return create(request, null);
    }

    @Transactional
    @CacheEvict(value = "listings", allEntries = true)
    public ListingDto create(ListingRequest request, MultipartFile[] images) {
        validateFields(request);

        User owner = currentUserService.getCurrentUser();

        if (!owner.getRoles().contains(Role.ADMIN) && owner.getVerifiedStatus() != VerifiedType.VERIFIED) {
            throw new ForbiddenException("Размещать объявления могут только подтвержденные пользователи");
        }

        List<String> imageUrls = uploadRequiredImages(images);
        validateImages(imageUrls);

        Listing listing = Listing.builder()
                .title(request.title())
                .description(request.description())
                .city(request.city())
                .address(request.address())
                .price(request.price())
                .maxGuests(request.maxGuests())
                .type(request.type())
                .status(ListingStatus.REVIEW)
                .owner(owner)
                .rating(0)
                .reviewsCount(0)
                .build();

        listingRepository.save(listing);
        replaceImages(listing, imageUrls);

        return listingMapper.toDto(listing, owner.getId());
    }

    @Transactional
    @CacheEvict(value = "listings", allEntries = true)
    public ListingDto update(UUID id, ListingRequest request) {
        return update(id, request, null);
    }

    @Transactional
    @CacheEvict(value = "listings", allEntries = true)
    public ListingDto update(UUID id, ListingRequest request, MultipartFile[] images) {
        validateFields(request);

        User user = currentUserService.getCurrentUser();
        Listing listing = findListing(id);

        if (!canManage(listing, user.getId())) {
            throw new ForbiddenException("Нет доступа");
        }

        List<String> imageUrls = buildImageUrls(request.images(), images);
        validateImages(imageUrls);

        listing.setTitle(request.title());
        listing.setDescription(request.description());
        listing.setCity(request.city());
        listing.setAddress(request.address());
        listing.setPrice(request.price());
        listing.setMaxGuests(request.maxGuests());
        listing.setType(request.type());

        if (user.getRoles().contains(Role.ADMIN) && request.status() != null) {
            listing.setStatus(request.status());
        } else if (listing.getStatus() == ListingStatus.ACTIVE) {
            listing.setStatus(ListingStatus.REVIEW);
        }

        replaceImages(listing, imageUrls);

        return listingMapper.toDto(listing, user.getId());
    }

    @Transactional
    @CacheEvict(value = "listings", allEntries = true)
    public void delete(UUID id) {
        User user = currentUserService.getCurrentUser();
        Listing listing = findListing(id);

        if (!canManage(listing, user.getId())) {
            throw new ForbiddenException("Нет доступа");
        }

        listingRepository.delete(listing);
    }

    @Transactional
    @CacheEvict(value = "listings", allEntries = true)
    public ListingDto approve(UUID id) {
        Listing listing = findListing(id);
        listing.setStatus(ListingStatus.ACTIVE);
        listing.setRejectionReason(null);

        notificationService.create(
                listing.getOwner().getId(),
                NotificationType.LISTING_APPROVED,
                "Объявление подтверждено",
                "Объявление \"" + listing.getTitle() + "\" прошло проверку и появилось в каталоге.",
                "/listings/" + listing.getId()
        );

        UUID currentUserId = currentUserService.getCurrentUserId().orElse(null);
        return listingMapper.toDto(listing, currentUserId);
    }

    @Transactional
    @CacheEvict(value = "listings", allEntries = true)
    public ListingDto reject(UUID id, String reason) {
        Listing listing = findListing(id);
        listing.setStatus(ListingStatus.BLOCKED);
        listing.setRejectionReason(reason);

        notificationService.create(
                listing.getOwner().getId(),
                NotificationType.LISTING_REJECTED,
                "Объявление не прошло проверку",
                "Объявление \"" + listing.getTitle() + "\" заблокировано. Причина: " + reason,
                "/my-listings"
        );

        UUID currentUserId = currentUserService.getCurrentUserId().orElse(null);
        return listingMapper.toDto(listing, currentUserId);
    }

    private Listing findListing(UUID id) {
        return listingRepository.findWithImagesById(id)
                .orElseThrow(() -> new NotFoundException("Объявление не найдено"));
    }

    @Transactional(readOnly = true)
    public List<ListingDto> getListingsByIds(List<UUID> ids) {
        return findListingsWithImages(ids)
            .stream()
            .filter(listing -> listing.getStatus() == ListingStatus.ACTIVE)
            .map(listing -> listingMapper.toDto(listing, null))
            .toList();
    }

    private List<Listing> findListingsWithImages(List<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }

        Map<UUID, Listing> listingsById = listingRepository.findWithImagesByIds(ids)
                .stream()
                .collect(Collectors.toMap(Listing::getId, Function.identity()));

        return ids.stream()
                .map(listingsById::get)
                .filter(listing -> listing != null)
                .toList();
    }

    private void validateFields(ListingRequest request) {
        checkText(request.title(), 4, 80, "Название должно быть от 4 до 80 символов");
        checkText(request.description(), 20, 1000, "Описание должно быть от 20 до 1000 символов");
        checkText(request.city(), 2, 120, "Укажите город");
        checkText(request.address(), 4, 255, "Укажите адрес");

        if (request.price() < 1) {
            throw new BadRequestException("Цена должна быть больше 0");
        }

        if (request.maxGuests() < 1 || request.maxGuests() > 20) {
            throw new BadRequestException("Количество гостей должно быть от 1 до 20");
        }

        if (request.type() == null) {
            throw new BadRequestException("Выберите тип жилья");
        }
    }

    private void validateImages(List<String> images) {
        if (images == null || images.isEmpty()) {
            throw new BadRequestException("Добавьте хотя бы 1 фотографию");
        }

        if (images.size() > 10) {
            throw new BadRequestException("Максимум 10 фотографий");
        }
    }

    private void checkText(String value, int min, int max, String message) {
        if (value == null || value.isBlank() || value.length() < min || value.length() > max) {
            throw new BadRequestException(message);
        }
    }

    private void replaceImages(Listing listing, List<String> urls) {
        imageRepository.deleteByListingId(listing.getId());
        listing.getImages().clear();

        List<String> uniqueUrls = urls.stream()
                .filter(url -> url != null && !url.isBlank())
                .distinct()
                .toList();

        List<ListingImage> images = new ArrayList<>();

        for (int index = 0; index < uniqueUrls.size(); index++) {
            images.add(ListingImage.builder()
                    .listing(listing)
                    .url(uniqueUrls.get(index))
                    .orderIndex(index)
                    .build());
        }

        imageRepository.saveAll(images);
        listing.getImages().addAll(images);
    }

    private List<String> uploadRequiredImages(MultipartFile[] images) {
        if (!hasFiles(images)) {
            throw new BadRequestException("Добавьте хотя бы 1 фотографию");
        }

        checkFilesCount(images);
        return uploadService.uploadListingImages(images);
    }

    private List<String> buildImageUrls(List<String> imageUrls, MultipartFile[] images) {
        List<String> urls = new ArrayList<>();

        if (imageUrls != null) {
            addUrls(urls, imageUrls);
        }

        if (hasFiles(images)) {
            checkFilesCount(images);
            addUrls(urls, uploadService.uploadListingImages(images));
        }

        return urls;
    }

    private void addUrls(List<String> urls, List<String> newUrls) {
        for (String url : newUrls) {
            if (url != null && !url.isBlank() && !urls.contains(url)) {
                urls.add(url);
            }
        }
    }

    private boolean hasFiles(MultipartFile[] files) {
        return files != null && files.length > 0;
    }

    private void checkFilesCount(MultipartFile[] files) {
        if (files.length > 10) {
            throw new BadRequestException("Максимум 10 фотографий");
        }
    }

    private boolean canManage(Listing listing, UUID userId) {
        if (userId == null) {
            return false;
        }

        User user = currentUserService.getCurrentUser();
        return user.getRoles().contains(Role.ADMIN) || listing.getOwner().getId().equals(userId);
    }
}
