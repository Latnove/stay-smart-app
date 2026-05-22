package io.staysmart.controller;

import io.staysmart.dto.auth.AuthResponse;
import io.staysmart.dto.auth.AuthResult;
import io.staysmart.dto.auth.LoginRequest;
import io.staysmart.dto.auth.MessageResponse;
import io.staysmart.dto.auth.RegisterRequest;
import io.staysmart.dto.auth.VerifyEmailRequest;
import io.staysmart.dto.user.UserDto;
import io.staysmart.security.JwtProvider;
import io.staysmart.service.AuthService;
import io.staysmart.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String REFRESH_COOKIE = "refreshToken";

    private final AuthService authService;
    private final UserService userService;
    private final JwtProvider jwtProvider;

    public AuthController(AuthService authService, UserService userService, JwtProvider jwtProvider) {
        this.authService = authService;
        this.userService = userService;
        this.jwtProvider = jwtProvider;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse register(@Valid @RequestBody RegisterRequest request, HttpServletRequest servletRequest) {
        return authService.register(request, servletRequest);
    }

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse
    ) {
        AuthResult result = authService.login(request, servletRequest);
        addRefreshCookie(servletResponse, result.refreshToken());
        return result.response();
    }

    @PostMapping("/refresh")
    public AuthResponse refreshToken(
            @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken,
            HttpServletResponse servletResponse
    ) {
        AuthResult result = authService.refresh(refreshToken);
        addRefreshCookie(servletResponse, result.refreshToken());
        return result.response();
    }

    @PostMapping("/verify-email")
    public AuthResponse verifyEmail(@Valid @RequestBody VerifyEmailRequest request, HttpServletResponse servletResponse) {
        AuthResult result = authService.verifyEmail(request);
        addRefreshCookie(servletResponse, result.refreshToken());
        return result.response();
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(
            @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken,
            HttpServletResponse servletResponse
    ) {
        authService.logout(refreshToken);
        clearRefreshCookie(servletResponse);
    }

    @GetMapping("/me")
    public UserDto getMe() {
        return userService.getMe();
    }

    private void addRefreshCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, refreshToken)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(Duration.ofDays(jwtProvider.getRefreshDays()))
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(Duration.ZERO)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }
}
