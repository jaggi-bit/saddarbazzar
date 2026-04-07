package com.sadarbazar.logistics.postex;

import com.sadarbazar.entity.Order;
import com.sadarbazar.logistics.LogisticsFacade;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * PostEx Merchant API v4.1.9 implementation of LogisticsFacade.
 * Activated when logistics.postex.token is configured.
 */
@Service
@ConditionalOnProperty(name = "logistics.postex.token", matchIfMissing = false)
@Slf4j
public class PostExLogisticsFacade implements LogisticsFacade {

    @Value("${logistics.postex.token}")
    private String apiToken;

    @Value("${logistics.postex.url}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public String generateAwb(Order order) {
        PostExOrderRequest payload = PostExOrderRequest.builder()
                .orderRefNumber(order.getId().toString())
                .invoicePayment(
                        "COD".equalsIgnoreCase(order.getPaymentMethod())
                                ? order.getTotalAmount().doubleValue()
                                : 0
                )
                .customerName(order.getShippingName())
                .customerPhone(order.getShippingPhone())
                .deliveryAddress(order.getShippingAddress())
                .cityName(order.getShippingCity())
                .orderType("1")
                .items(order.getItems() != null ? order.getItems().size() : 1)
                .invoiceDivision(0)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("token", apiToken);

        HttpEntity<PostExOrderRequest> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    baseUrl + "/order/v3/create-order",
                    HttpMethod.POST,
                    request,
                    Map.class
            );

            Map<String, Object> body = response.getBody();
            if (body == null) {
                throw new RuntimeException("PostEx returned empty response");
            }

            // Extract tracking number from response.dist.trackingNumber
            Map<String, Object> dist = (Map<String, Object>) body.get("dist");
            if (dist == null || !dist.containsKey("trackingNumber")) {
                log.error("PostEx response missing tracking number: {}", body);
                throw new RuntimeException("PostEx response missing tracking number");
            }

            String trackingNumber = dist.get("trackingNumber").toString();
            log.info("PostEx AWB generated: {} for order {}", trackingNumber, order.getId());
            return trackingNumber;

        } catch (Exception e) {
            log.error("PostEx AWB generation failed for order {}: {}", order.getId(), e.getMessage());
            throw new RuntimeException("PostEx API Error: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] getShippingLabel(String trackingNumber) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("token", apiToken);
        headers.setAccept(java.util.List.of(MediaType.APPLICATION_PDF, MediaType.ALL));

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<byte[]> response = restTemplate.exchange(
                    baseUrl + "/order/v1/get-invoice?trackingNumbers=" + trackingNumber,
                    HttpMethod.GET,
                    request,
                    byte[].class
            );
            return response.getBody();
        } catch (Exception e) {
            log.error("PostEx label retrieval failed for {}: {}", trackingNumber, e.getMessage());
            throw new RuntimeException("PostEx API Error: " + e.getMessage(), e);
        }
    }

    @Override
    public String getTrackingUrl(String trackingNumber) {
        return "https://postex.pk/tracking?trackingNumber=" + trackingNumber;
    }

    @Override
    public String getProviderName() {
        return "PostEx";
    }
}
