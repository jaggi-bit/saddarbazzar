package com.sadarbazar.dto;

import lombok.*;

import java.util.List;
import java.util.UUID;

/**
 * DTO for admin-managed homepage content settings.
 * Controls what sections appear on the landing page and their content.
 */
public class HomepageSettingsDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private String heroBannerTitle;
        private String heroBannerSubtitle;
        private String heroBannerImageUrl;
        private String heroBannerLink;
        private List<UUID> featuredProductIds;
        private List<UUID> featuredCategoryIds;
        private String promoBarText;          // Top promo banner text
        private Boolean showPromoBar;
        private Boolean showFeaturedProducts;
        private Boolean showCategories;
        private Boolean showNewArrivals;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private String heroBannerTitle;
        private String heroBannerSubtitle;
        private String heroBannerImageUrl;
        private String heroBannerLink;
        private List<UUID> featuredProductIds;
        private List<UUID> featuredCategoryIds;
        private String promoBarText;
        private Boolean showPromoBar;
        private Boolean showFeaturedProducts;
        private Boolean showCategories;
        private Boolean showNewArrivals;
    }
}
