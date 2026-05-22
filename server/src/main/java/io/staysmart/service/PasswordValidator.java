package io.staysmart.service;

import io.staysmart.exception.BadRequestException;
import org.springframework.stereotype.Component;

@Component
public class PasswordValidator {

    public void validate(String password, String repeatPassword) {
        if (!password.equals(repeatPassword)) {
            throw new BadRequestException("Пароли не совпадают");
        }

        if (password.length() < 8 || password.length() > 32) {
            throw new BadRequestException("Пароль должен быть от 8 до 32 символов");
        }

        if (!password.matches(".*[A-Z].*")) {
            throw new BadRequestException("Нужна хотя бы одна заглавная буква");
        }

        if (!password.matches(".*[a-z].*")) {
            throw new BadRequestException("Нужна хотя бы одна строчная буква");
        }

        if (!password.matches(".*\\d.*")) {
            throw new BadRequestException("Нужна хотя бы одна цифра");
        }

        if (!password.matches(".*[^A-Za-z0-9].*")) {
            throw new BadRequestException("Нужен спецсимвол");
        }
    }
}
