package io.staysmart.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum NotificationType {
    BOOKING_CREATED("booking_created"),
    BOOKING_CANCELLED("booking_cancelled"),
    BOOKING_PERIOD_CHANGED("booking_period_changed"),
    REVIEW_UPDATED("review_updated"),
    USER_VERIFIED("user_verified"),
    USER_VERIFICATION_REJECTED("user_verification_rejected"),
    USER_BLOCKED("user_blocked"),
    USER_UNBLOCKED("user_unblocked"),
    LISTING_APPROVED("listing_approved"),
    LISTING_REJECTED("listing_rejected");

    private final String value;

    NotificationType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static NotificationType fromValue(String value) {
        for (NotificationType type : values()) {
            if (type.value.equalsIgnoreCase(value) || type.name().equalsIgnoreCase(value)) {
                return type;
            }
        }

        throw new IllegalArgumentException("Unknown notification type: " + value);
    }
}
