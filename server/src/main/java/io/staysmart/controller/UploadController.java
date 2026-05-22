package io.staysmart.controller;

import io.staysmart.dto.upload.UploadResponse;
import io.staysmart.service.UploadService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class UploadController {

    private final UploadService uploadService;

    public UploadController(UploadService uploadService) {
        this.uploadService = uploadService;
    }

    @PostMapping(value = "/api/uploads/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadResponse uploadImages(@RequestPart("files") MultipartFile[] files) {
        return new UploadResponse(uploadService.uploadListingImages(files));
    }

    @PostMapping(value = "/api/users/me/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadResponse uploadDocuments(@RequestPart("files") MultipartFile[] files) {
        return new UploadResponse(uploadService.uploadDocuments(files));
    }
}
