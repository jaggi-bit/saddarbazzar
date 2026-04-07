package com.sadarbazar.service.payment;

import com.sadarbazar.dto.CheckoutDTO;
import com.sadarbazar.entity.Order;
import com.sadarbazar.entity.enums.PaymentStatus;
import lombok.extern.slf4j.Slf4j;

/**
 * Template Method base class for payment gateways.
 * <p>
 * Handles cross-cutting concerns (logging, status transitions, validation).
 * Subclasses only need to override {@link #doInitialize(Order)} and
 * {@link #doVerifyWebhook(String, String)}.
 * <p>
 * <b>To add a new gateway:</b> extend this class, implement the two abstract
 * methods, and annotate with {@code @Service}. Spring will auto-register it.
 */
@Slf4j
public abstract class AbstractPaymentGateway implements PaymentGateway {

    @Override
    public boolean supports(String paymentMethod) {
        return getGatewayName().equalsIgnoreCase(paymentMethod);
    }

    /**
     * Template method: validates order, delegates to subclass, logs result.
     */
    @Override
    public final CheckoutDTO.Response initializePayment(Order order) {
        log.info("[{}] Initializing payment for Order {} — amount: {} PKR",
                getGatewayName(), order.getId(), order.getTotalAmount());

        // Set order to PENDING before gateway-specific logic
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setPaymentMethod(getGatewayName());

        CheckoutDTO.Response response = doInitialize(order);

        log.info("[{}] Payment initialized — status: {}, orderId: {}",
                getGatewayName(), response.getStatus(), order.getId());

        return response;
    }

    /**
     * Template method: delegates signature verification to subclass.
     */
    @Override
    public final boolean verifyWebhook(String payload, String signature) {
        if (signature == null || signature.isBlank()) {
            log.warn("[{}] Webhook rejected — missing signature header", getGatewayName());
            return false;
        }

        boolean valid = doVerifyWebhook(payload, signature);

        if (valid) {
            log.info("[{}] Webhook signature verified successfully", getGatewayName());
        } else {
            log.warn("[{}] Webhook signature verification FAILED", getGatewayName());
        }

        return valid;
    }

    /**
     * Gateway-specific payment initialization logic.
     * Override this to call your provider's API and return a checkout response.
     */
    protected abstract CheckoutDTO.Response doInitialize(Order order);

    /**
     * Gateway-specific webhook signature verification.
     * Override this to implement HMAC-SHA256 or equivalent.
     * Return false if the gateway does not support webhooks (e.g., COD).
     */
    protected abstract boolean doVerifyWebhook(String payload, String signature);
}
