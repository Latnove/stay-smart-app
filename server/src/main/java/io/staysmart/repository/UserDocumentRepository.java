package io.staysmart.repository;

import io.staysmart.entity.UserDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserDocumentRepository extends JpaRepository<UserDocument, UUID> {

    List<UserDocument> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
