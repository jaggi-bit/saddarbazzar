package com.sadarbazar.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class ProductDTO {

    // --- Response ---
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private UUID id;
        private String sku;
        private String name;
        private String description;
        private BigDecimal price;
        private BigDecimal compareAtPrice;
        private Integer stockQuantity;
        private Boolean isActive;
        private Boolean isFeatured;
        private String imageUrl;
        private List<String> additionalImages;
        private Integer weightGrams;
        private CategorySummary category;

        @Getter
        @Setter
        @NoArgsConstructor
        @AllArgsConstructor
        @Builder
        public static class CategorySummary {
            private UUID id;
            private String name;
            private String slug;
        }
    }

    // --- List Item (lighter than full response) ---
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ListItem {
        private UUID id;
        private String name;
        private BigDecimal price;
        private BigDecimal compareAtPrice;
        private String imageUrl;
        private String categoryName;
        private Boolean isFeatured;
        private Integer stockQuantity;
    }

    // --- Create Request ---
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotBlank(message = "SKU is required")
        private String sku;

        @NotBlank(message = "Product name is required")
        @Size(max = 255, message = "Name must not exceed 255 characters")
        private String name;

        private String description;

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be at least 0.01")
        private BigDecimal price;

        private BigDecimal compareAtPrice;

        @NotNull(message = "Stock quantity is required")
        @Min(value = 0, message = "Stock cannot be negative")
        private Integer stockQuantity;

        private UUID categoryId;
        private Boolean isActive;
        private Boolean isFeatured;
        private String imageUrl;
        private List<String> additionalImages;
        private Integer weightGrams;
    }

    // --- Update Request ---
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        @Size(max = 255, message = "Name must not exceed 255 characters")
        private String name;

        private String description;

        @DecimalMin(value = "0.01", message = "Price must be at least 0.01")
        private BigDecimal price;

        private BigDecimal compareAtPrice;

        @Min(value = 0, message = "Stock cannot be negative")
        private Integer stockQuantity;

        private UUID categoryId;
        private Boolean isActive;
        private Boolean isFeatured;
        private String imageUrl;
        private List<String> additionalImages;
        private Integer weightGrams;
    }
}
