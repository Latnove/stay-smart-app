package io.staysmart.entity;

import io.staysmart.enums.Role;
import io.staysmart.enums.VerifiedType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, unique = true, length = 64)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 32)
    private Set<Role> roles;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private VerifiedType verifiedStatus;

    @Column(length = 512)
    private String verificationReason;

    @Column(nullable = false)
    private boolean blocked;

    @Column(nullable = false)
    private boolean emailVerified;

    @Column(length = 512)
    private String blockReason;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UserDocument> documents = new ArrayList<>();

    @OneToMany(mappedBy = "owner")
    @Builder.Default
    private List<Listing> listings = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (roles == null || roles.isEmpty()) {
            roles = new HashSet<>(Set.of(Role.USER));
        }

        if (verifiedStatus == null) {
            verifiedStatus = VerifiedType.NONE;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
