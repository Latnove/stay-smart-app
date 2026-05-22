--liquibase formatted sql logicalFilePath:db/changelog/v1/changelog-001-init.sql

--changeset staysmart:007-remove-email-verification-expiration
ALTER TABLE email_verification_tokens
    DROP COLUMN IF EXISTS expires_at;
