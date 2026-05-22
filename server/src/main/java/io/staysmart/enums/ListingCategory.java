package io.staysmart.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ListingCategory {
    APARTMENT("apartment"),
    HOUSE("house"),
    ROOM("room");

    private final String value;

    ListingCategory(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ListingCategory fromValue(String value) {
        for (ListingCategory category : values()) {
            if (category.value.equalsIgnoreCase(value) || category.name().equalsIgnoreCase(value)) {
                return category;
            }
        }

        throw new IllegalArgumentException("Unknown listing category: " + value);
    }
}
