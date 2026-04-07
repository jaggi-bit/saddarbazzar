package com.sadarbazar.service;

import com.sadarbazar.dto.CheckoutDTO;
import com.sadarbazar.entity.*;
import com.sadarbazar.exception.BusinessException;
import com.sadarbazar.repository.CartRepository;
import com.sadarbazar.repository.OrderRepository;
import com.sadarbazar.service.payment.PaymentGateway;
import com.sadarbazar.service.payment.PaymentGatewayFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CheckoutService {

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final InventoryLockService inventoryLockService;
    private final PaymentGatewayFactory paymentGatewayFactory;
    private final EmailService emailService;
    
    @Transactional
    public CheckoutDTO.Response checkout(UUID userId, UUID guestSessionId, CheckoutDTO.Request request) {
        // Find cart
        Cart cart = null;
        if (userId != null) {
            cart = cartRepository.findByUserId(userId).orElse(null);
        } else if (guestSessionId != null) {
            cart = cartRepository.findByGuestSessionId(guestSessionId).orElse(null);
        }

        if (cart == null || cart.getItems().isEmpty()) {
            throw new BusinessException("Cart is empty or not found");
        }

        // Lock inventory
        boolean locked = inventoryLockService.lockInventory(cart.getId());
        if (!locked) {
            throw new BusinessException("Failed to lock inventory for checkout");
        }

        // Calculate Totals
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem item : cart.getItems()) {
            BigDecimal itemTotal = item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(itemTotal);
        }

        BigDecimal shippingAmount = new BigDecimal("200.00");
        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal.add(shippingAmount).subtract(discountAmount);

        // Create Order
        Order order = Order.builder()
                .user(userId != null ? cart.getUser() : null)
                .guestSessionId(guestSessionId)
                .shippingName(request.getShippingName())
                .shippingAddress(request.getShippingAddress())
                .shippingCity(request.getShippingCity())
                .shippingPinCode(request.getShippingPinCode())
                .shippingPhone(request.getShippingPhone())
                .shippingEmail(request.getShippingEmail())
                .shippingProvince(request.getShippingProvince())
                .shippingDistrict(request.getShippingDistrict())
                .shippingLandmark(request.getShippingLandmark())
                .shippingAddressCategory(request.getShippingAddressCategory())
                .orderNote(request.getOrderNote())
                .paymentMethod(request.getPaymentMethod())
                .subtotalAmount(subtotal)
                .shippingAmount(shippingAmount)
                .discountAmount(discountAmount)
                .totalAmount(totalAmount)
                .build();

        // Convert CartItems to OrderItems
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .product(cartItem.getProduct())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getProduct().getPrice())
                    .productName(cartItem.getProduct().getName())
                    .productSku(cartItem.getProduct().getSku())
                    .build();
            order.addItem(orderItem);
        }

        Order savedOrder = orderRepository.save(order);

        // Resolve and initialize payment via the gateway factory
        PaymentGateway gateway = paymentGatewayFactory.getGateway(request.getPaymentMethod());
        CheckoutDTO.Response response = gateway.initializePayment(savedOrder);
        
        orderRepository.save(savedOrder);

        // Clear cart
        cart.getItems().clear();
        cartRepository.save(cart);

        // Send emails asynchronously
        emailService.sendOrderConfirmation(savedOrder);
        emailService.sendAdminNewOrderAlert(savedOrder);

        return response;
    }
}
