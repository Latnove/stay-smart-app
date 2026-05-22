package io.staysmart.dto.booking;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record BookingRequest(
        @NotNull
        LocalDate startDate,

        @NotNull
        LocalDate endDate
) {
}
