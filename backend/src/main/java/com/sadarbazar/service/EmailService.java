package com.sadarbazar.service;

import com.sadarbazar.entity.Order;
import com.sadarbazar.entity.OrderItem;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.mail.from:noreply@sadarbazar.pk}")
    private String fromAddress;

    @Value("${app.mail.admin-email:admin@sadarbazar.pk}")
    private String adminEmail;

    @Value("${app.mail.enabled:true}")
    private boolean emailEnabled;

    // ==================== Order Confirmation ====================

    @Async("emailExecutor")
    public void sendOrderConfirmation(Order order) {
        if (!emailEnabled) { log.info("Email disabled, skipping order confirmation for {}", order.getId()); return; }

        String recipientEmail = getCustomerEmail(order);
        if (recipientEmail == null) { log.warn("No email for order {}, skipping confirmation", order.getId()); return; }

        try {
            Context ctx = buildOrderContext(order);
            String html = templateEngine.process("email/order-confirmation", ctx);
            sendHtml(recipientEmail, "Order Confirmed — Sadar Bazar #" + order.getId().toString().substring(0, 8), html);
            log.info("Order confirmation sent to {} for order {}", recipientEmail, order.getId());
        } catch (Exception e) {
            log.error("Failed to send order confirmation for {}: {}", order.getId(), e.getMessage());
        }
    }

    // ==================== Order Shipped ====================

    @Async("emailExecutor")
    public void sendOrderShippedNotification(Order order) {
        if (!emailEnabled) return;

        String recipientEmail = getCustomerEmail(order);
        if (recipientEmail == null) return;

        try {
            Context ctx = buildOrderContext(order);
            ctx.setVariable("trackingNumber", order.getTrackingNumber());
            ctx.setVariable("courierName", order.getCourierName() != null ? order.getCourierName() : "Courier");
            ctx.setVariable("trackingUrl", order.getTrackingNumber() != null
                    ? "https://postex.pk/tracking?trackingNumber=" + order.getTrackingNumber()
                    : "#");

            String html = templateEngine.process("email/order-shipped", ctx);
            sendHtml(recipientEmail, "Your Order Has Shipped! — Sadar Bazar", html);
            log.info("Shipped notification sent to {} for order {}", recipientEmail, order.getId());
        } catch (Exception e) {
            log.error("Failed to send shipped notification for {}: {}", order.getId(), e.getMessage());
        }
    }

    // ==================== Admin New Order Alert ====================

    @Async("emailExecutor")
    public void sendAdminNewOrderAlert(Order order) {
        if (!emailEnabled) return;

        try {
            Context ctx = buildOrderContext(order);
            String html = templateEngine.process("email/admin-new-order", ctx);
            sendHtml(adminEmail, "🛒 New Order #" + order.getId().toString().substring(0, 8) + " — Rs. " + order.getTotalAmount(), html);
            log.info("Admin alert sent for new order {}", order.getId());
        } catch (Exception e) {
            log.error("Failed to send admin alert for {}: {}", order.getId(), e.getMessage());
        }
    }

    // ==================== Helpers ====================

    private Context buildOrderContext(Order order) {
        Context ctx = new Context();
        ctx.setVariable("orderId", order.getId().toString().substring(0, 8).toUpperCase());
        ctx.setVariable("orderIdFull", order.getId().toString());
        ctx.setVariable("customerName", order.getShippingName());
        ctx.setVariable("customerPhone", order.getShippingPhone());
        ctx.setVariable("shippingAddress", order.getShippingAddress());
        ctx.setVariable("shippingCity", order.getShippingCity());
        ctx.setVariable("subtotal", order.getSubtotalAmount());
        ctx.setVariable("shipping", order.getShippingAmount());
        ctx.setVariable("discount", order.getDiscountAmount());
        ctx.setVariable("total", order.getTotalAmount());
        ctx.setVariable("paymentMethod", order.getPaymentMethod());
        ctx.setVariable("orderDate", order.getCreatedAt() != null
                ? DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")
                    .withZone(ZoneId.of("Asia/Karachi"))
                    .format(order.getCreatedAt())
                : "—");

        // Build items list
        List<Map<String, Object>> itemsList = new ArrayList<>();
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Map<String, Object> m = new HashMap<>();
                m.put("name", item.getProductName());
                m.put("sku", item.getProductSku());
                m.put("qty", item.getQuantity());
                m.put("price", item.getUnitPrice());
                m.put("total", item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                itemsList.add(m);
            }
        }
        ctx.setVariable("items", itemsList);

        return ctx;
    }

    private String getCustomerEmail(Order order) {
        if (order.getUser() != null && order.getUser().getEmail() != null) {
            return order.getUser().getEmail();
        }
        return order.getGuestEmail();
    }

    private void sendHtml(String to, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromAddress);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);
        mailSender.send(message);
    }
}
