package com.sadarbazar.logistics.postex;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

/**
 * Request payload for PostEx /order/v3/create-order API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostExOrderRequest {

    @JsonProperty("orderRefNumber")
    private String orderRefNumber;

    @JsonProperty("invoicePayment")
    private double invoicePayment;

    @JsonProperty("customerName")
    private String customerName;

    @JsonProperty("customerPhone")
    private String customerPhone;

    @JsonProperty("deliveryAddress")
    private String deliveryAddress;

    @JsonProperty("cityName")
    private String cityName;

    @JsonProperty("orderType")
    @Builder.Default
    private String orderType = "1"; // 1 = Normal

    @JsonProperty("items")
    private int items;

    @JsonProperty("invoiceDivision")
    @Builder.Default
    private int invoiceDivision = 0;
}
