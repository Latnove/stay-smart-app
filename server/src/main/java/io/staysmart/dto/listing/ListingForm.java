package io.staysmart.dto.listing;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
public class ListingForm {

    @NotBlank
    @Size(min = 4, max = 80)
    private String title;

    @NotBlank
    @Size(min = 20, max = 1000)
    private String description;

    @NotBlank
    @Size(min = 2, max = 120)
    private String city;

    @NotBlank
    @Size(min = 4, max = 255)
    private String address;

    @NotNull
    @Min(1)
    @Max(1_000_000)
    private Integer price;

    @NotNull
    @Min(1)
    @Max(20)
    private Integer maxGuests;

    @NotBlank
    @Pattern(regexp = "apartment|house|room")
    private String type;

    @Pattern(regexp = "review|active|blocked")
    private String status;

    private List<@Size(max = 1000) String> imageUrls;

    private MultipartFile[] images;
}
