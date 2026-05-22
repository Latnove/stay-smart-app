package io.staysmart.external;

import io.staysmart.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

@Service
public class CloudinaryService {

    private final RestClient restClient;
    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;
    private final String uploadFolder;

    public CloudinaryService(
            RestClient.Builder restClientBuilder,
            @Value("${app.cloudinary.cloud-name}") String cloudName,
            @Value("${app.cloudinary.api-key}") String apiKey,
            @Value("${app.cloudinary.api-secret}") String apiSecret,
            @Value("${app.cloudinary.upload-folder}") String uploadFolder
    ) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(5));
        requestFactory.setReadTimeout(Duration.ofSeconds(10));

        this.restClient = restClientBuilder.requestFactory(requestFactory).build();
        this.cloudName = cloudName;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.uploadFolder = uploadFolder;
    }

    public List<String> uploadImages(List<MultipartFile> files, String folder) {
        validateFiles(files, true);

        return files.stream()
                .map(file -> upload(file, folder))
                .toList();
    }

    public List<String> uploadDocuments(List<MultipartFile> files, String folder) {
        validateFiles(files, false);

        return files.stream()
                .map(file -> upload(file, folder))
                .toList();
    }

    private String upload(MultipartFile file, String folder) {
        checkSettings();

        long timestamp = Instant.now().getEpochSecond();
        String targetFolder = uploadFolder + "/" + folder;
        String signature = sign("folder=" + targetFolder + "&timestamp=" + timestamp);

        ByteArrayResource resource;

        try {
            resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
        } catch (IOException e) {
            throw new BadRequestException("Не удалось прочитать файл");
        }

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", resource);
        body.add("api_key", apiKey);
        body.add("timestamp", String.valueOf(timestamp));
        body.add("folder", targetFolder);
        body.add("signature", signature);

        Map<?, ?> response;

        try {
            response = restClient.post()
                    .uri("https://api.cloudinary.com/v1_1/{cloudName}/auto/upload", cloudName)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientException e) {
            throw new BadRequestException("Cloudinary не принял файл");
        }

        Object secureUrl = response == null ? null : response.get("secure_url");

        if (secureUrl == null) {
            throw new BadRequestException("Не удалось загрузить файл в Cloudinary");
        }

        return String.valueOf(secureUrl);
    }

    private void validateFiles(List<MultipartFile> files, boolean onlyImages) {
        if (files == null || files.isEmpty()) {
            throw new BadRequestException("Выберите файлы");
        }

        if (files.size() > 10) {
            throw new BadRequestException("Максимум 10 файлов");
        }

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                throw new BadRequestException("Файл пустой");
            }

            if (file.getSize() > 5 * 1024 * 1024) {
                throw new BadRequestException("Файл должен быть меньше 5MB");
            }

            String contentType = file.getContentType();

            if (contentType == null || contentType.isBlank()) {
                throw new BadRequestException("Не удалось определить тип файла");
            }

            if (onlyImages && !contentType.startsWith("image/")) {
                throw new BadRequestException("Можно загружать только изображения");
            }

            if (!onlyImages && !contentType.startsWith("image/") && !"application/pdf".equals(contentType)) {
                throw new BadRequestException("Можно загружать изображения или PDF");
            }
        }
    }

    private void checkSettings() {
        if (isBlank(cloudName) || isBlank(apiKey) || isBlank(apiSecret)) {
            throw new BadRequestException("Cloudinary не настроен на сервере");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String sign(String payload) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            byte[] hash = digest.digest((payload + apiSecret).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new BadRequestException("Не удалось подписать запрос Cloudinary");
        }
    }
}
