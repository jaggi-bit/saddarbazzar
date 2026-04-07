package com.sadarbazar.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Customer 360 View DTO — complete CRM snapshot.
 */
public class Customer360DTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private UUID userId;
        private String fullName;
        private String email;
        private String phoneNumber;
        private Instant memberSince;
        private BigDecimal ltv;           // Lifetime Value
        private BigDecimal aov;           // Average Order Value
        private long totalOrders;
        private String preferredPayment;
        private List<RecentOrder> recentOrders;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentOrder {
        private UUID id;
        private BigDecimal totalAmount;
        private String paymentStatus;
        private String fulfillmentStatus;
        private String paymentMethod;
        private Instant createdAt;
    }
}
