package io.staysmart.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum VerifiedType {
    NONE("none"),
    PENDING("pending"),
    VERIFIED("verified"),
    REJECTED("rejected");

    private final String value;

    VerifiedType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static VerifiedType fromValue(String value) {
        for (VerifiedType type : values()) {
            if (type.value.equalsIgnoreCase(value) || type.name().equalsIgnoreCase(value)) {
                return type;
            }
        }

        throw new IllegalArgumentException("Unknown verified type: " + value);
    }
}
