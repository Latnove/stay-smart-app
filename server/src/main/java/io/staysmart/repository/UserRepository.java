package io.staysmart.repository;


import io.staysmart.entity.User;
import io.staysmart.enums.VerifiedType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    @Override
    @EntityGraph(attributePaths = {"roles", "documents"})
    List<User> findAll();

    @EntityGraph(attributePaths = {"roles", "documents"})
    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = {"roles", "documents"})
    Optional<User> findByUsername(String username);

    @EntityGraph(attributePaths = {"roles", "documents"})
    Optional<User> findWithDocumentsById(UUID id);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    @EntityGraph(attributePaths = {"roles", "documents"})
    List<User> findByVerifiedStatus(VerifiedType verifiedStatus);

    @Query("""
            select distinct u from User u
            left join fetch u.documents
            where lower(u.email) like lower(concat('%', :search, '%'))
               or lower(u.username) like lower(concat('%', :search, '%'))
            """)
    List<User> searchUsers(String search);

    @Query("""
            select u from User u
            left join fetch u.documents
            where u.blocked = true
            order by u.createdAt desc
            """)
    List<User> findBlockedUsers();
}
