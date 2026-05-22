package io.staysmart.external;

import io.staysmart.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Map;

@Service
@Slf4j
public class TurnstileService {

    private final RestClient restClient;
    private final String secretKey;
    private final String verifyUrl;

    public TurnstileService(
            RestClient.Builder restClientBuilder,
            @Value("${app.turnstile.secret-key}") String secretKey,
            @Value("${app.turnstile.verify-url}") String verifyUrl
    ) {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();

        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofSeconds(5));

        this.restClient = restClientBuilder.requestFactory(requestFactory).build();
        this.secretKey = secretKey;
        this.verifyUrl = verifyUrl;
    }

    public void verify(String token, String remoteIp) {
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Капча обязательна");
        }

        if (secretKey == null || secretKey.isBlank()) {
            throw new BadRequestException("Капча не настроена на сервере");
        }

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("secret", secretKey);
        body.add("response", token);

        if (remoteIp != null && !remoteIp.isBlank()) {
            body.add("remoteip", remoteIp);
        }

        Map<?, ?> response;

        try {
            response = restClient.post()
                    .uri(verifyUrl)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientException e) {
            log.warn("Turnstile verification request failed", e);
            throw new BadRequestException("Не удалось проверить капчу");
        }

        if (response == null || !Boolean.TRUE.equals(response.get("success"))) {
            log.warn("Turnstile verification failed: {}", response);
            throw new BadRequestException("Капча не пройдена");
        }
    }
}
