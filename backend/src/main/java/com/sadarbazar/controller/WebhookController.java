package com.sadarbazar.controller;

import com.sadarbazar.entity.Order;
import com.sadarbazar.entity.enums.PaymentStatus;
import com.sadarbazar.repository.OrderRepository;
import com.sadarbazar.service.payment.PaymentGateway;
import com.sadarbazar.service.payment.PaymentGatewayFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Receives webhook callbacks from payment providers.
 * <p>
 * The webhook URL to configure in your payment provider dashboard is:
 * {@code https://yourdomain.com/api/v1/webhooks/payment-status}
 */
@Slf4j
@RestController
@RequestMapping("/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private final PaymentGatewayFactory paymentGatewayFactory;
    private final OrderRepository orderRepository;

    /**
     * Universal webhook endpoint for all payment gateways.
     * <p>
     * The gateway is identified by the {@code gateway} query parameter.
     * The signature is read from the {@code X-Webhook-Signature} header.
     * <p>
     * Configure your provider to POST to:
     * {@code /api/v1/webhooks/payment-status?gateway=ONLINE}
     *
     * @param gateway   The gateway name (must match a registered PaymentGateway).
     * @param signature The HMAC signature from the provider's header.
     * @param payload   The raw JSON body.
     */
    @PostMapping("/payment-status")
    public ResponseEntity<Map<String, String>> handlePaymentWebhook(
            @RequestParam(defaultValue = "ONLINE") String gateway,
            @RequestHeader(value = "X-Webhook-Signature", required = false) String signature,
            @RequestBody String payload) {

        log.info("Webhook received for gateway '{}', payload length: {} bytes", gateway, payload.length());

        try {
            // 1. Resolve gateway
            PaymentGateway paymentGateway = paymentGatewayFactory.getGateway(gateway);

            // 2. Verify signature
            if (!paymentGateway.verifyWebhook(payload, signature)) {
                log.warn("Webhook signature verification FAILED for gateway '{}'", gateway);
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Invalid webhook signature"));
            }

            // 3. Extract order ID from payload
            // NOTE: Replace this with your gateway-specific payload parsing.
            // Most gateways include the order_id in the JSON body.
            UUID orderId = extractOrderId(payload);
            if (orderId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Could not extract order_id from webhook payload"));
            }

            // 4. Update order status
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                log.warn("Webhook: Order {} not found", orderId);
                return ResponseEntity.status(404)
                        .body(Map.of("error", "Order not found"));
            }

            Order order = orderOpt.get();
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setPaymentTransactionId(extractTransactionId(payload));
            orderRepository.save(order);

            log.info("Order {} marked as PAID via webhook from '{}'", orderId, gateway);
            return ResponseEntity.ok(Map.of("status", "success", "orderId", orderId.toString()));

        } catch (Exception e) {
            log.error("Webhook processing error: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal server error processing webhook"));
        }
    }

    /**
     * Extract the order ID from the webhook payload.
     * <p>
     * TODO: Replace with gateway-specific JSON parsing.
     * Most providers include an {@code order_id} or {@code reference_id} field.
     */
    private UUID extractOrderId(String payload) {
        try {
            // Simple JSON field extraction — works for payloads containing "order_id": "uuid"
            String marker = "\"order_id\"";
            int idx = payload.indexOf(marker);
            if (idx == -1) return null;

            // Find the value after the colon
            int colonIdx = payload.indexOf(':', idx);
            int quoteStart = payload.indexOf('"', colonIdx + 1);
            int quoteEnd = payload.indexOf('"', quoteStart + 1);
            
            if (quoteStart == -1 || quoteEnd == -1) return null;
            
            String uuidStr = payload.substring(quoteStart + 1, quoteEnd);
            return UUID.fromString(uuidStr);
        } catch (Exception e) {
            log.warn("Could not parse order_id from webhook payload: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extract the transaction ID from the webhook payload.
     */
    private String extractTransactionId(String payload) {
        try {
            String marker = "\"transaction_id\"";
            int idx = payload.indexOf(marker);
            if (idx == -1) return null;

            int colonIdx = payload.indexOf(':', idx);
            int quoteStart = payload.indexOf('"', colonIdx + 1);
            int quoteEnd = payload.indexOf('"', quoteStart + 1);
            
            if (quoteStart == -1 || quoteEnd == -1) return null;
            
            return payload.substring(quoteStart + 1, quoteEnd);
        } catch (Exception e) {
            return null;
        }
    }
}
