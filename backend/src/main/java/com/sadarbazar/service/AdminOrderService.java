package com.sadarbazar.service;

import com.sadarbazar.dto.AdminDashboardDTO;
import com.sadarbazar.dto.AdminOrderDTO;
import com.sadarbazar.dto.PagedResponse;
import com.sadarbazar.entity.Order;
import com.sadarbazar.entity.enums.FulfillmentStatus;
import com.sadarbazar.entity.enums.PaymentStatus;
import com.sadarbazar.exception.ResourceNotFoundException;
import com.sadarbazar.repository.OrderRepository;
import com.sadarbazar.repository.ProductRepository;
import com.sadarbazar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminOrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /**
     * Dashboard statistics: counts, revenue, recent orders.
     */
    public AdminDashboardDTO.Stats getDashboardStats() {
        List<AdminOrderDTO.ListItem> recentOrders = orderRepository
                .findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(this::toListItem)
                .collect(Collectors.toList());

        return AdminDashboardDTO.Stats.builder()
                .totalOrders(orderRepository.count())
                .totalRevenue(orderRepository.sumPaidRevenue())
                .pendingOrders(orderRepository.countByFulfillmentStatus(FulfillmentStatus.PENDING))
                .processingOrders(orderRepository.countByFulfillmentStatus(FulfillmentStatus.PROCESSING))
                .shippedOrders(orderRepository.countByFulfillmentStatus(FulfillmentStatus.SHIPPED))
                .deliveredOrders(orderRepository.countByFulfillmentStatus(FulfillmentStatus.DELIVERED))
                .canceledOrders(orderRepository.countByFulfillmentStatus(FulfillmentStatus.CANCELED))
                .totalProducts(productRepository.count())
                .totalCustomers(userRepository.count())
                .recentOrders(recentOrders)
                .build();
    }

    /**
     * Paginated order list with optional filters.
     */
    public PagedResponse<AdminOrderDTO.ListItem> getOrders(
            String status, String search, int page, int size, String sortBy, String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Order> orderPage;

        if (search != null && !search.isBlank()) {
            orderPage = orderRepository.searchOrders(search.trim(), pageable);
        } else if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            try {
                FulfillmentStatus fulfillmentStatus = FulfillmentStatus.valueOf(status.toUpperCase());
                orderPage = orderRepository.findByFulfillmentStatus(fulfillmentStatus, pageable);
            } catch (IllegalArgumentException e) {
                orderPage = orderRepository.findAll(pageable);
            }
        } else {
            orderPage = orderRepository.findAll(pageable);
        }

        List<AdminOrderDTO.ListItem> items = orderPage.getContent()
                .stream().map(this::toListItem).collect(Collectors.toList());

        return PagedResponse.<AdminOrderDTO.ListItem>builder()
                .content(items)
                .page(orderPage.getNumber())
                .size(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .last(orderPage.isLast())
                .build();
    }

    /**
     * Detailed order view with all items.
     */
    public AdminOrderDTO.Detail getOrderDetail(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        List<AdminOrderDTO.OrderItemDTO> items = order.getItems().stream()
                .map(item -> AdminOrderDTO.OrderItemDTO.builder()
                        .id(item.getId())
                        .productName(item.getProductName())
                        .productSku(item.getProductSku())
                        .productImageUrl(item.getProduct() != null ? item.getProduct().getImageUrl() : null)
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .lineTotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .build())
                .collect(Collectors.toList());

        return AdminOrderDTO.Detail.builder()
                .id(order.getId())
                .customerName(order.getShippingName())
                .customerEmail(order.getUser() != null ? order.getUser().getEmail() : order.getGuestEmail())
                .customerPhone(order.getShippingPhone())
                .shippingName(order.getShippingName())
                .shippingAddress(order.getShippingAddress())
                .shippingCity(order.getShippingCity())
                .shippingPinCode(order.getShippingPinCode())
                .shippingPhone(order.getShippingPhone())
                .orderNote(order.getOrderNote())
                .subtotalAmount(order.getSubtotalAmount())
                .shippingAmount(order.getShippingAmount())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus().name())
                .fulfillmentStatus(order.getFulfillmentStatus().name())
                .paymentTransactionId(order.getPaymentTransactionId())
                .trackingNumber(order.getTrackingNumber())
                .courierName(order.getCourierName())
                .createdAt(order.getCreatedAt())
                .items(items)
                .build();
    }

    /**
     * Update fulfillment status and optional tracking info.
     */
    @Transactional
    public AdminOrderDTO.Detail updateFulfillmentStatus(UUID orderId, AdminOrderDTO.UpdateFulfillmentRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        FulfillmentStatus newStatus = FulfillmentStatus.valueOf(request.getFulfillmentStatus().toUpperCase());
        order.setFulfillmentStatus(newStatus);

        if (request.getTrackingNumber() != null) {
            order.setTrackingNumber(request.getTrackingNumber());
        }
        if (request.getCourierName() != null) {
            order.setCourierName(request.getCourierName());
        }

        orderRepository.save(order);
        log.info("Order {} fulfillment updated to {} by admin", orderId, newStatus);

        return getOrderDetail(orderId);
    }

    /**
     * Update payment status.
     */
    @Transactional
    public AdminOrderDTO.Detail updatePaymentStatus(UUID orderId, AdminOrderDTO.UpdatePaymentRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        PaymentStatus newStatus = PaymentStatus.valueOf(request.getPaymentStatus().toUpperCase());
        order.setPaymentStatus(newStatus);

        if (request.getPaymentTransactionId() != null) {
            order.setPaymentTransactionId(request.getPaymentTransactionId());
        }

        orderRepository.save(order);
        log.info("Order {} payment updated to {} by admin", orderId, newStatus);

        return getOrderDetail(orderId);
    }

    // --- Mapping ---

    private AdminOrderDTO.ListItem toListItem(Order order) {
        return AdminOrderDTO.ListItem.builder()
                .id(order.getId())
                .customerName(order.getShippingName())
                .customerPhone(order.getShippingPhone())
                .shippingCity(order.getShippingCity())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus().name())
                .fulfillmentStatus(order.getFulfillmentStatus().name())
                .createdAt(order.getCreatedAt())
                .itemCount(order.getItems().size())
                .build();
    }
}
