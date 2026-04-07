package com.sadarbazar.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

public class CheckoutDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        @NotBlank(message = "Shipping Name is required")
        private String shippingName;
        
        @NotBlank(message = "Shipping Address is required")
        private String shippingAddress;
        
        @NotBlank(message = "Shipping City is required")
        private String shippingCity;
        
        private String shippingPinCode;
        
        @NotBlank(message = "Shipping Phone is required")
        private String shippingPhone;
        
        @NotBlank(message = "Shipping Email is required")
        private String shippingEmail;

        @NotBlank(message = "Shipping Province is required")
        private String shippingProvince;

        @NotBlank(message = "Shipping District is required")
        private String shippingDistrict;

        private String shippingLandmark;

        @NotBlank(message = "Address Category is required")
        private String shippingAddressCategory;
        
        private String promoCode;
        private String orderNote;
        
        @NotBlank(message = "Payment method is required")
        private String paymentMethod; // SAFEPAY or COD
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private UUID orderId;
        private String paymentUrl;   // Redirect URL for online gateways
        private String paymentToken; // Session token from the gateway (optional)
        private BigDecimal totalAmount;
        private String status;
        private String message;
    }
}
