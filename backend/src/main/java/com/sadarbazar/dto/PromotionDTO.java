package com.sadarbazar.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class PromotionDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private UUID id;
        private String code;
        private String discountType;
        private BigDecimal value;
        private BigDecimal minOrderAmount;
        private BigDecimal maxDiscountAmount;
        private Integer usageLimit;
        private Integer timesUsed;
        private Instant validFrom;
        private Instant validUntil;
        private Boolean isActive;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        private String code;
        private String discountType; // PERCENT or FIXED
        private BigDecimal value;
        private BigDecimal minOrderAmount;
        private BigDecimal maxDiscountAmount;
        private Integer usageLimit;
        private Instant validFrom;
        private Instant validUntil;
        private Boolean isActive;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private String code;
        private String discountType;
        private BigDecimal value;
        private BigDecimal minOrderAmount;
        private BigDecimal maxDiscountAmount;
        private Integer usageLimit;
        private Instant validFrom;
        private Instant validUntil;
        private Boolean isActive;
    }
}
