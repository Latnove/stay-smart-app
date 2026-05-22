package io.staysmart.controller;

import io.staysmart.dto.admin.ReasonRequest;
import io.staysmart.dto.listing.ListingDto;
import io.staysmart.dto.user.AdminUserDto;
import io.staysmart.service.ListingService;
import io.staysmart.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;
    private final ListingService listingService;

    public AdminController(UserService userService, ListingService listingService) {
        this.userService = userService;
        this.listingService = listingService;
    }

    @GetMapping("/users")
    public List<AdminUserDto> getAdminUsers(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "all") String verificationFilter,
            @RequestParam(defaultValue = "newest") String sortOrder
    ) {
        return userService.getAdminUsers(search, verificationFilter, sortOrder);
    }

    @PatchMapping("/users/{id}/verify")
    public AdminUserDto verifyUser(@PathVariable UUID id) {
        return userService.verifyUser(id);
    }

    @PatchMapping("/users/{id}/reject-verification")
    public AdminUserDto rejectUserVerification(@PathVariable UUID id, @Valid @RequestBody ReasonRequest request) {
        return userService.rejectVerification(id, request.reason());
    }

    @PatchMapping("/users/{id}/block")
    public AdminUserDto blockUser(@PathVariable UUID id, @Valid @RequestBody ReasonRequest request) {
        return userService.blockUser(id, request.reason());
    }

    @PatchMapping("/users/{id}/unblock")
    public AdminUserDto unblockUser(@PathVariable UUID id) {
        return userService.unblockUser(id);
    }

    @GetMapping("/listings/review")
    public List<ListingDto> getReviewListings() {
        return listingService.getReviewListings();
    }

    @PatchMapping("/listings/{id}/approve")
    public ListingDto approveListing(@PathVariable UUID id) {
        return listingService.approve(id);
    }

    @PatchMapping("/listings/{id}/reject")
    public ListingDto rejectListing(@PathVariable UUID id, @Valid @RequestBody ReasonRequest request) {
        return listingService.reject(id, request.reason());
    }
}
