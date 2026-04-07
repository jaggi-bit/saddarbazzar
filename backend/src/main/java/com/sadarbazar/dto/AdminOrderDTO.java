package com.sadarbazar.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class AdminOrderDTO {

    /**
     * Lightweight order summary for the admin orders table.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ListItem {
        private UUID id;
        private String customerName;
        private String customerPhone;
        private String shippingCity;
        private BigDecimal totalAmount;
        private String paymentMethod;
        private String paymentStatus;
        private String fulfillmentStatus;
        private Instant createdAt;
        private int itemCount;
    }

    /**
     * Full order detail with items for the admin order detail page.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Detail {
        private UUID id;
        
        // Customer Info
        private String customerName;
        private String customerEmail;
        private String customerPhone;
        
        // Shipping
        private String shippingName;
        private String shippingAddress;
        private String shippingCity;
        private String shippingPinCode;
        private String shippingPhone;
        private String orderNote;
        
        // Pricing
        private BigDecimal subtotalAmount;
        private BigDecimal shippingAmount;
        private BigDecimal discountAmount;
        private BigDecimal totalAmount;
        
        // Status
        private String paymentMethod;
        private String paymentStatus;
        private String fulfillmentStatus;
        private String paymentTransactionId;
        
        // Tracking
        private String trackingNumber;
        private String courierName;
        
        // Timestamps
        private Instant createdAt;
        
        // Items
        private List<OrderItemDTO> items;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemDTO {
        private UUID id;
        private String productName;
        private String productSku;
        private String productImageUrl;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal lineTotal;
    }

    /**
     * Request to update an order's fulfillment status.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateFulfillmentRequest {
        private String fulfillmentStatus;
        private String trackingNumber;
        private String courierName;
    }

    /**
     * Request to update an order's payment status.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdatePaymentRequest {
        private String paymentStatus;
        private String paymentTransactionId;
    }
}
