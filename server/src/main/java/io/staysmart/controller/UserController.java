package io.staysmart.controller;

import io.staysmart.dto.user.PasswordChangeRequest;
import io.staysmart.dto.user.UserDto;
import io.staysmart.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PatchMapping("/me/password")
    public UserDto changePassword(@Valid @RequestBody PasswordChangeRequest request) {
        return userService.changePassword(request);
    }
}
