package com.sadarbazar.service.payment;

import com.sadarbazar.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Factory that resolves the correct {@link PaymentGateway} at runtime.
 * <p>
 * Spring auto-injects all beans implementing {@link PaymentGateway}.
 * Adding a new gateway requires zero changes to this class.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentGatewayFactory {

    private final List<PaymentGateway> gateways;

    /**
     * Resolve a gateway by the payment method string (e.g., "COD", "SAFEPAY").
     *
     * @throws BusinessException if no gateway supports the given method.
     */
    public PaymentGateway getGateway(String paymentMethod) {
        return gateways.stream()
                .filter(g -> g.supports(paymentMethod))
                .findFirst()
                .orElseThrow(() -> {
                    log.error("No payment gateway registered for method: {}", paymentMethod);
                    return new BusinessException(
                            "Unsupported payment method: " + paymentMethod +
                            ". Available methods: " + getAvailableMethods());
                });
    }

    /**
     * Returns a comma-separated list of all registered gateway names.
     */
    public String getAvailableMethods() {
        return gateways.stream()
                .map(PaymentGateway::getGatewayName)
                .reduce((a, b) -> a + ", " + b)
                .orElse("none");
    }
}
