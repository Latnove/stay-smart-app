package io.staysmart.mapper;

import io.staysmart.dto.user.AdminUserDto;
import io.staysmart.dto.user.UserDto;
import io.staysmart.entity.User;
import io.staysmart.entity.UserDocument;
import io.staysmart.enums.Role;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
public class UserMapper {

    public UserDto toDto(User user) {
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                getMainRole(user),
                user.getVerifiedStatus(),
                user.getCreatedAt(),
                user.isBlocked(),
                user.getVerificationReason(),
                user.getBlockReason()
        );
    }

    public AdminUserDto toAdminDto(User user) {
        List<String> documents = user.getDocuments() == null
                ? List.of()
                : user.getDocuments()
                .stream()
                .sorted(Comparator.comparing(UserDocument::getCreatedAt).reversed())
                .map(UserDocument::getUrl)
                .toList();

        return new AdminUserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                getMainRole(user),
                user.getVerifiedStatus(),
                user.getCreatedAt(),
                user.isBlocked(),
                user.getVerificationReason(),
                user.getBlockReason(),
                documents
        );
    }

    private Role getMainRole(User user) {
        if (user.getRoles() != null && user.getRoles().contains(Role.ADMIN)) {
            return Role.ADMIN;
        }

        return Role.USER;
    }
}
