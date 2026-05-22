package io.staysmart.repository;

import io.staysmart.entity.Listing;
import io.staysmart.enums.ListingStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ListingRepositoryImpl implements ListingRepositoryCustom {

    private final EntityManager entityManager;

    public ListingRepositoryImpl(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Override
    public Page<UUID> findActiveListingIds(ListingSearchParams params, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<UUID> query = cb.createQuery(UUID.class);
        Root<Listing> root = query.from(Listing.class);

        query.select(root.get("id"))
                .where(buildPredicates(params, cb, root).toArray(Predicate[]::new))
                .orderBy(resolveOrder(params, cb, root));

        TypedQuery<UUID> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult(Math.toIntExact(pageable.getOffset()));
        typedQuery.setMaxResults(pageable.getPageSize());

        return new PageImpl<>(typedQuery.getResultList(), pageable, count(params));
    }

    private long count(ListingSearchParams params) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Long> query = cb.createQuery(Long.class);
        Root<Listing> root = query.from(Listing.class);

        query.select(cb.countDistinct(root))
                .where(buildPredicates(params, cb, root).toArray(Predicate[]::new));

        return entityManager.createQuery(query).getSingleResult();
    }

    private List<Predicate> buildPredicates(ListingSearchParams params, CriteriaBuilder cb, Root<Listing> root) {
        List<Predicate> predicates = new ArrayList<>();
        predicates.add(cb.equal(root.get("status"), ListingStatus.ACTIVE));

        if (params.city() != null && !params.city().isBlank()) {
            predicates.add(cb.like(cb.lower(root.get("city")), "%" + params.city().toLowerCase() + "%"));
        }
        if (params.priceFrom() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("price"), params.priceFrom()));
        }
        if (params.priceTo() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("price"), params.priceTo()));
        }
        if (params.minGuests() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("maxGuests"), params.minGuests()));
        }
        if (params.ratingFrom() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("rating"), params.ratingFrom()));
        }
        if (params.ratingTo() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("rating"), params.ratingTo()));
        }
        if (params.categories() != null && !params.categories().isEmpty()) {
            predicates.add(root.get("type").in(params.categories()));
        }

        return predicates;
    }

    private Order resolveOrder(ListingSearchParams params, CriteriaBuilder cb, Root<Listing> root) {
        Path<?> sortPath = switch (params.sortBy() == null ? "name" : params.sortBy()) {
            case "price" -> root.get("price");
            case "rating" -> root.get("rating");
            default -> root.get("title");
        };

        return "desc".equalsIgnoreCase(params.order()) ? cb.desc(sortPath) : cb.asc(sortPath);
    }
}
