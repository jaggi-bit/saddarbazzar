package com.sadarbazar.logistics;

import com.sadarbazar.entity.Order;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Service;

/**
 * Fallback LogisticsFacade when no provider is configured.
 * Admin can manually enter tracking numbers via the dashboard.
 */
@Service
@ConditionalOnMissingBean(value = LogisticsFacade.class, ignored = ManualLogisticsFacade.class)
@Slf4j
public class ManualLogisticsFacade implements LogisticsFacade {

    @Override
    public String generateAwb(Order order) {
        log.info("[ManualLogistics] AWB requested for order {}. No courier configured — admin should enter tracking manually.", order.getId());
        throw new UnsupportedOperationException(
                "No logistics provider configured. Please set POSTEX_API_TOKEN in your environment variables, " +
                "or manually enter the tracking number in the order detail page.");
    }

    @Override
    public byte[] getShippingLabel(String trackingNumber) {
        throw new UnsupportedOperationException("No logistics provider configured for label printing.");
    }

    @Override
    public String getTrackingUrl(String trackingNumber) {
        return null;
    }

    @Override
    public String getProviderName() {
        return "Manual";
    }
}
