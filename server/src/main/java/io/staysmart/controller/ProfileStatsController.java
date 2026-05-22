package io.staysmart.controller;

import io.staysmart.dto.profile.ProfileStatsDto;
import io.staysmart.service.ProfileStatsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProfileStatsController {

    private final ProfileStatsService profileStatsService;

    public ProfileStatsController(ProfileStatsService profileStatsService) {
        this.profileStatsService = profileStatsService;
    }

    @GetMapping("/api/profile/stats")
    public ProfileStatsDto getMyStats() {
        return profileStatsService.getMyStats();
    }
}
