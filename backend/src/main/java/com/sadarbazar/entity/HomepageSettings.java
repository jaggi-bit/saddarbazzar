package com.sadarbazar.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Singleton settings entity for admin-managed homepage content.
 * Only one row exists in this table.
 */
@Entity
@Table(name = "homepage_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomepageSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "hero_banner_title")
    @Builder.Default
    private String heroBannerTitle = "Welcome to Sadar Bazar";

    @Column(name = "hero_banner_subtitle")
    @Builder.Default
    private String heroBannerSubtitle = "Your favourite online shopping destination in Pakistan";

    @Column(name = "hero_banner_image_url")
    private String heroBannerImageUrl;

    @Column(name = "hero_banner_link")
    private String heroBannerLink;

    @ElementCollection
    @CollectionTable(name = "homepage_featured_products", joinColumns = @JoinColumn(name = "settings_id"))
    @Column(name = "product_id")
    @Builder.Default
    private List<UUID> featuredProductIds = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "homepage_featured_categories", joinColumns = @JoinColumn(name = "settings_id"))
    @Column(name = "category_id")
    @Builder.Default
    private List<UUID> featuredCategoryIds = new ArrayList<>();

    @Column(name = "promo_bar_text")
    @Builder.Default
    private String promoBarText = "Free Shipping on Orders Over Rs. 3,000!";

    @Column(name = "show_promo_bar")
    @Builder.Default
    private Boolean showPromoBar = true;

    @Column(name = "show_featured_products")
    @Builder.Default
    private Boolean showFeaturedProducts = true;

    @Column(name = "show_categories")
    @Builder.Default
    private Boolean showCategories = true;

    @Column(name = "show_new_arrivals")
    @Builder.Default
    private Boolean showNewArrivals = true;
}
