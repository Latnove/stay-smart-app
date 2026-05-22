package io.staysmart.service;

import io.staysmart.exception.BadRequestException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
@Slf4j
public class EmailService {

    private final JavaMailSender javaMailSender;
    private final String from;
    private final String sender;
    private final String frontendUrl;

    public EmailService(
            JavaMailSender javaMailSender,
            @Value("${app.email.from}") String from,
            @Value("${spring.application.name}") String sender,
            @Value("${app.frontend-url}") String frontendUrl
    ) {
        this.javaMailSender = javaMailSender;
        this.from = from;
        this.sender = sender;
        this.frontendUrl = frontendUrl;
    }

    public void sendVerificationMail(String email, String username, String code) {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            helper.setFrom(from, sender);
            helper.setTo(email);
            helper.setSubject("Подтверждение почты Stay Smart");
            helper.setText(buildVerificationContent(username, code), true);

            javaMailSender.send(mimeMessage);
        } catch (MessagingException | UnsupportedEncodingException | MailException e) {
            log.warn("Verification mail was not sent to {}", email, e);
            throw new BadRequestException("Не удалось отправить письмо подтверждения");
        }
    }

    private String buildVerificationContent(String username, String code) {
        String url = frontendUrl + "/verification?code=" + URLEncoder.encode(code, StandardCharsets.UTF_8);

        return """
                <div style="font-family: Arial, sans-serif; color: #1f2937;">
                  <h2>Подтверждение почты</h2>
                  <p>Здравствуйте, %s!</p>
                  <p>Чтобы завершить регистрацию в Stay Smart, подтвердите почту.</p>
                  <p>
                    <a href="%s" style="display:inline-block;padding:12px 18px;background:#2f6df6;color:#ffffff;text-decoration:none;border-radius:8px;">
                      Подтвердить почту
                    </a>
                  </p>
                  <p>Если кнопка не работает, откройте ссылку вручную:</p>
                  <p><a href="%s">%s</a></p>
                </div>
                """.formatted(username, url, url, url);
    }
}
