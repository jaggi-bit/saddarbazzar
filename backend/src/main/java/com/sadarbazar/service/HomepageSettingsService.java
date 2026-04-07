package com.sadarbazar.service;

import com.sadarbazar.dto.HomepageSettingsDTO;
import com.sadarbazar.entity.HomepageSettings;
import com.sadarbazar.repository.HomepageSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HomepageSettingsService {

    private final HomepageSettingsRepository repository;

    /**
     * Get the singleton homepage settings. Creates defaults if none exist.
     */
    public HomepageSettingsDTO.Response getSettings() {
        HomepageSettings settings = getOrCreateSettings();
        return toResponse(settings);
    }

    /**
     * Update homepage settings.
     */
    @Transactional
    public HomepageSettingsDTO.Response updateSettings(HomepageSettingsDTO.UpdateRequest request) {
        HomepageSettings settings = getOrCreateSettings();

        if (request.getHeroBannerTitle() != null) settings.setHeroBannerTitle(request.getHeroBannerTitle());
        if (request.getHeroBannerSubtitle() != null) settings.setHeroBannerSubtitle(request.getHeroBannerSubtitle());
        if (request.getHeroBannerImageUrl() != null) settings.setHeroBannerImageUrl(request.getHeroBannerImageUrl());
        if (request.getHeroBannerLink() != null) settings.setHeroBannerLink(request.getHeroBannerLink());
        if (request.getFeaturedProductIds() != null) settings.setFeaturedProductIds(request.getFeaturedProductIds());
        if (request.getFeaturedCategoryIds() != null) settings.setFeaturedCategoryIds(request.getFeaturedCategoryIds());
        if (request.getPromoBarText() != null) settings.setPromoBarText(request.getPromoBarText());
        if (request.getShowPromoBar() != null) settings.setShowPromoBar(request.getShowPromoBar());
        if (request.getShowFeaturedProducts() != null) settings.setShowFeaturedProducts(request.getShowFeaturedProducts());
        if (request.getShowCategories() != null) settings.setShowCategories(request.getShowCategories());
        if (request.getShowNewArrivals() != null) settings.setShowNewArrivals(request.getShowNewArrivals());

        return toResponse(repository.save(settings));
    }

    private HomepageSettings getOrCreateSettings() {
        return repository.findAll().stream().findFirst()
                .orElseGet(() -> repository.save(HomepageSettings.builder().build()));
    }

    private HomepageSettingsDTO.Response toResponse(HomepageSettings s) {
        return HomepageSettingsDTO.Response.builder()
                .heroBannerTitle(s.getHeroBannerTitle())
                .heroBannerSubtitle(s.getHeroBannerSubtitle())
                .heroBannerImageUrl(s.getHeroBannerImageUrl())
                .heroBannerLink(s.getHeroBannerLink())
                .featuredProductIds(s.getFeaturedProductIds())
                .featuredCategoryIds(s.getFeaturedCategoryIds())
                .promoBarText(s.getPromoBarText())
                .showPromoBar(s.getShowPromoBar())
                .showFeaturedProducts(s.getShowFeaturedProducts())
                .showCategories(s.getShowCategories())
                .showNewArrivals(s.getShowNewArrivals())
                .build();
    }
}
