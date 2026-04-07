package com.sadarbazar.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.HttpURLConnection;
import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Pings configured third-party gateway endpoints to check availability and latency.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GatewayHealthService {

    @Value("${app.payment.api-key:}")
    private String paymentApiKey;

    @Value("${app.health.payment-ping-url:}")
    private String paymentPingUrl;

    @Value("${app.health.logistics-ping-url:}")
    private String logisticsPingUrl;

    public Map<String, Object> checkAll() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("payment", ping("Payment Gateway", paymentPingUrl));
        result.put("logistics", ping("Logistics Service", logisticsPingUrl));
        return result;
    }

    private Map<String, Object> ping(String label, String url) {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("label", label);

        if (url == null || url.isBlank()) {
            status.put("status", "NOT_CONFIGURED");
            status.put("latencyMs", 0);
            status.put("message", "No ping URL configured for " + label);
            return status;
        }

        long start = System.currentTimeMillis();
        try {
            HttpURLConnection conn = (HttpURLConnection) URI.create(url).toURL().openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            int responseCode = conn.getResponseCode();
            long latency = System.currentTimeMillis() - start;
            conn.disconnect();

            boolean isUp = responseCode >= 200 && responseCode < 500;
            status.put("status", isUp ? "UP" : "DOWN");
            status.put("latencyMs", latency);
            status.put("httpCode", responseCode);
        } catch (Exception e) {
            long latency = System.currentTimeMillis() - start;
            status.put("status", "DOWN");
            status.put("latencyMs", latency);
            status.put("message", e.getMessage());
            log.warn("Health check failed for {}: {}", label, e.getMessage());
        }

        return status;
    }
}
