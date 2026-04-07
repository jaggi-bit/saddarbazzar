package com.sadarbazar.logistics;

import com.sadarbazar.entity.Order;

/**
 * Facade interface for all logistics/courier providers.
 * Any new courier (TCS, Leopards, etc.) implements this interface.
 */
public interface LogisticsFacade {

    /**
     * Generate an Air Waybill (AWB) / tracking number for the given order.
     * @return the tracking number assigned by the courier.
     */
    String generateAwb(Order order);

    /**
     * Retrieve a printable shipping label (PDF bytes) for the given tracking number.
     */
    byte[] getShippingLabel(String trackingNumber);

    /**
     * Get the public tracking URL for customers.
     */
    String getTrackingUrl(String trackingNumber);

    /**
     * @return the human-readable name of this provider (e.g., "PostEx").
     */
    String getProviderName();
}
