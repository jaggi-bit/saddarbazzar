package com.sadarbazar.service;

import com.sadarbazar.dto.PromotionDTO;
import com.sadarbazar.entity.Promotion;
import com.sadarbazar.entity.enums.DiscountType;
import com.sadarbazar.exception.BusinessException;
import com.sadarbazar.exception.ResourceNotFoundException;
import com.sadarbazar.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotionRepository;

    public List<PromotionDTO.Response> getAllPromotions() {
        return promotionRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public PromotionDTO.Response getPromotion(UUID id) {
        return toResponse(promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found: " + id)));
    }

    @Transactional
    public PromotionDTO.Response createPromotion(PromotionDTO.CreateRequest request) {
        if (promotionRepository.findByCodeIgnoreCase(request.getCode()).isPresent()) {
            throw new BusinessException("Promotion code '" + request.getCode() + "' already exists");
        }

        Promotion promo = Promotion.builder()
                .code(request.getCode().toUpperCase())
                .discountType(DiscountType.valueOf(request.getDiscountType().toUpperCase()))
                .value(request.getValue())
                .minOrderAmount(request.getMinOrderAmount())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .usageLimit(request.getUsageLimit())
                .validFrom(request.getValidFrom())
                .validUntil(request.getValidUntil())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return toResponse(promotionRepository.save(promo));
    }

    @Transactional
    public PromotionDTO.Response updatePromotion(UUID id, PromotionDTO.UpdateRequest request) {
        Promotion promo = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found: " + id));

        if (request.getCode() != null) promo.setCode(request.getCode().toUpperCase());
        if (request.getDiscountType() != null) promo.setDiscountType(DiscountType.valueOf(request.getDiscountType().toUpperCase()));
        if (request.getValue() != null) promo.setValue(request.getValue());
        if (request.getMinOrderAmount() != null) promo.setMinOrderAmount(request.getMinOrderAmount());
        if (request.getMaxDiscountAmount() != null) promo.setMaxDiscountAmount(request.getMaxDiscountAmount());
        if (request.getUsageLimit() != null) promo.setUsageLimit(request.getUsageLimit());
        if (request.getValidFrom() != null) promo.setValidFrom(request.getValidFrom());
        if (request.getValidUntil() != null) promo.setValidUntil(request.getValidUntil());
        if (request.getIsActive() != null) promo.setIsActive(request.getIsActive());

        return toResponse(promotionRepository.save(promo));
    }

    @Transactional
    public void deletePromotion(UUID id) {
        if (!promotionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Promotion not found: " + id);
        }
        promotionRepository.deleteById(id);
    }

    private PromotionDTO.Response toResponse(Promotion p) {
        return PromotionDTO.Response.builder()
                .id(p.getId())
                .code(p.getCode())
                .discountType(p.getDiscountType().name())
                .value(p.getValue())
                .minOrderAmount(p.getMinOrderAmount())
                .maxDiscountAmount(p.getMaxDiscountAmount())
                .usageLimit(p.getUsageLimit())
                .timesUsed(p.getTimesUsed())
                .validFrom(p.getValidFrom())
                .validUntil(p.getValidUntil())
                .isActive(p.getIsActive())
                .build();
    }
}
