package io.staysmart.dto.upload;

import java.util.List;

public record UploadResponse(
        List<String> urls
) {
}
