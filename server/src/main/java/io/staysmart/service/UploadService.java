package io.staysmart.service;

import io.staysmart.external.CloudinaryService;
import io.staysmart.exception.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@Service
public class UploadService {

    private final CloudinaryService cloudinaryService;
    private final UserService userService;

    public UploadService(CloudinaryService cloudinaryService, UserService userService) {
        this.cloudinaryService = cloudinaryService;
        this.userService = userService;
    }

    public List<String> uploadListingImages(MultipartFile[] files) {
        checkFiles(files, 10, "Максимум 10 фотографий");
        return cloudinaryService.uploadImages(Arrays.asList(files), "listings");
    }

    public List<String> uploadDocuments(MultipartFile[] files) {
        checkFiles(files, 10, "Максимум 10 документов");
        List<String> urls = cloudinaryService.uploadDocuments(Arrays.asList(files), "documents");
        userService.addDocuments(urls);

        return urls;
    }

    private void checkFiles(MultipartFile[] files, int max, String message) {
        if (files == null || files.length == 0) {
            throw new BadRequestException("Добавьте хотя бы 1 файл");
        }

        if (files.length > max) {
            throw new BadRequestException(message);
        }
    }
}
