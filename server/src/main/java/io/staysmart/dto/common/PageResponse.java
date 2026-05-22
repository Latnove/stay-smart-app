package io.staysmart.dto.common;

import java.util.List;

public record PageResponse<T>(
        List<T> items,
        int page,
        int limit,
        long total
) {
}
