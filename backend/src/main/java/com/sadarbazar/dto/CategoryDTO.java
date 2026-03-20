package com.sadarbazar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;
import java.util.UUID;

public class CategoryDTO {

    // --- Response ---
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private UUID id;
        private String name;
        private String slug;
        private String description;
        private String imageUrl;
        private Boolean isActive;
        private Integer sortOrder;
        private UUID parentId;
        private List<Response> children;
    }

    // --- Create / Update ---
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotBlank(message = "Category name is required")
        @Size(max = 100, message = "Name must not exceed 100 characters")
        private String name;

        private String slug;
        private String description;
        private String imageUrl;
        private UUID parentId;
        private Integer sortOrder;
    }
}
