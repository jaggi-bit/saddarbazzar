package com.sadarbazar.service.payment.gateways;

import com.sadarbazar.dto.CheckoutDTO;
import com.sadarbazar.entity.Order;
import com.sadarbazar.entity.enums.PaymentStatus;
import com.sadarbazar.service.payment.AbstractPaymentGateway;
import org.springframework.stereotype.Service;

/**
 * Cash on Delivery — no external API, no webhooks.
 * The order is created immediately with PENDING payment status.
 * Payment is collected physically upon delivery.
 */
@Service
public class CodPaymentGateway extends AbstractPaymentGateway {

    @Override
    public String getGatewayName() {
        return "COD";
    }

    @Override
    protected CheckoutDTO.Response doInitialize(Order order) {
        // COD requires no external payment initialization
        order.setPaymentStatus(PaymentStatus.PENDING);

        return CheckoutDTO.Response.builder()
                .orderId(order.getId())
                .totalAmount(order.getTotalAmount())
                .status("ORDER_CREATED")
                .message("Order successfully placed with Cash on Delivery")
                .build();
    }

    @Override
    protected boolean doVerifyWebhook(String payload, String signature) {
        // COD has no webhook — always reject
        return false;
    }
}
