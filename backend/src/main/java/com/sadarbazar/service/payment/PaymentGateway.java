package com.sadarbazar.service.payment;

import com.sadarbazar.dto.CheckoutDTO;
import com.sadarbazar.entity.Order;

/**
 * Core abstraction for all payment gateways.
 * <p>
 * Implement this interface (or extend {@link AbstractPaymentGateway}) to add a new
 * payment provider (e.g., Safepay, Stripe, JazzCash, EasyPaisa).
 * <p>
 * The {@link PaymentGatewayFactory} auto-discovers all Spring beans implementing
 * this interface and resolves the correct one at runtime.
 */
public interface PaymentGateway {

    /**
     * Unique identifier for this gateway (e.g., "COD", "SAFEPAY", "STRIPE").
     * Must match the {@code paymentMethod} value sent from the frontend checkout form.
     */
    String getGatewayName();

    /**
     * Returns true if this gateway handles the given payment method string.
     */
    boolean supports(String paymentMethod);

    /**
     * Initialize a payment session with the external gateway.
     * For online gateways, this typically returns a redirect URL or session token.
     * For COD, this simply marks the order as created.
     *
     * @param order The persisted Order entity with calculated totals.
     * @return A response containing the payment URL (if applicable) and status.
     */
    CheckoutDTO.Response initializePayment(Order order);

    /**
     * Verify an incoming webhook payload from the payment provider.
     * Implementations should use HMAC-SHA256 or equivalent signature verification.
     *
     * @param payload   The raw request body bytes.
     * @param signature The signature header value from the gateway.
     * @return true if the signature is valid and the payload is authentic.
     */
    boolean verifyWebhook(String payload, String signature);
}
