package io.staysmart.mapper;

import io.staysmart.dto.review.ReviewDto;
import io.staysmart.entity.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    private final UserMapper userMapper;

    public ReviewMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public ReviewDto toDto(Review review) {
        return new ReviewDto(
                review.getId(),
                review.getListing().getId(),
                userMapper.toDto(review.getUser()),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }
}
