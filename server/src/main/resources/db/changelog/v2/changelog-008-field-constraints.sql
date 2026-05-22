--liquibase formatted sql

--changeset staysmart:008-field-constraints
ALTER TABLE listings
    ADD CONSTRAINT chk_listings_price CHECK (price BETWEEN 1 AND 1000000),
    ADD CONSTRAINT chk_listings_max_guests CHECK (max_guests BETWEEN 1 AND 20),
    ADD CONSTRAINT chk_listings_rating CHECK (rating BETWEEN 0 AND 5),
    ADD CONSTRAINT chk_listings_reviews_count CHECK (reviews_count >= 0);

ALTER TABLE users
    ADD CONSTRAINT chk_users_username_length CHECK (length(username) BETWEEN 4 AND 20);

ALTER TABLE reviews
    ADD CONSTRAINT chk_reviews_comment_length CHECK (length(comment) <= 1000);

CREATE INDEX idx_listings_status_city ON listings(status, city);
CREATE INDEX idx_favorites_user_created_at ON favorites(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_read_created_at ON notifications(user_id, is_read, created_at DESC);
