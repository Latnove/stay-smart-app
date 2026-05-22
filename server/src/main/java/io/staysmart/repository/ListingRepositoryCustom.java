package io.staysmart.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ListingRepositoryCustom {

    Page<UUID> findActiveListingIds(ListingSearchParams params, Pageable pageable);
}
