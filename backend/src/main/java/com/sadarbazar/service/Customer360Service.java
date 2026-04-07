package com.sadarbazar.service;

import com.sadarbazar.dto.Customer360DTO;
import com.sadarbazar.entity.Order;
import com.sadarbazar.entity.User;
import com.sadarbazar.entity.enums.FulfillmentStatus;
import com.sadarbazar.entity.enums.PaymentStatus;
import com.sadarbazar.exception.ResourceNotFoundException;
import com.sadarbazar.repository.OrderRepository;
import com.sadarbazar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class Customer360Service {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public Customer360DTO.Response getCustomer360(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + userId));

        // All orders for this user
        List<Order> allOrders = orderRepository.findByUserId(userId,
                PageRequest.of(0, 1000, Sort.by("createdAt").descending())).getContent();

        // Valid orders for LTV: PAID payment or DELIVERED fulfillment
        List<Order> validOrders = allOrders.stream()
                .filter(o -> o.getPaymentStatus() == PaymentStatus.PAID ||
                             o.getFulfillmentStatus() == FulfillmentStatus.DELIVERED)
                .toList();

        BigDecimal ltv = validOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal aov = validOrders.isEmpty() ? BigDecimal.ZERO :
                ltv.divide(BigDecimal.valueOf(validOrders.size()), 2, RoundingMode.HALF_UP);

        // Preferred payment method
        String preferredPayment = allOrders.stream()
                .map(Order::getPaymentMethod)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(m -> m, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");

        // Last 5 orders
        List<Customer360DTO.RecentOrder> recentOrders = allOrders.stream()
                .limit(5)
                .map(o -> Customer360DTO.RecentOrder.builder()
                        .id(o.getId())
                        .totalAmount(o.getTotalAmount())
                        .paymentStatus(o.getPaymentStatus().name())
                        .fulfillmentStatus(o.getFulfillmentStatus().name())
                        .paymentMethod(o.getPaymentMethod())
                        .createdAt(o.getCreatedAt())
                        .build())
                .toList();

        return Customer360DTO.Response.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .memberSince(user.getCreatedAt())
                .ltv(ltv)
                .aov(aov)
                .totalOrders(allOrders.size())
                .preferredPayment(preferredPayment)
                .recentOrders(recentOrders)
                .build();
    }

    /** List all customers (non-admin users) */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllCustomers() {
        return userRepository.findAll().stream()
                .map(u -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", u.getId());
                    m.put("fullName", u.getFullName());
                    m.put("email", u.getEmail());
                    m.put("phoneNumber", u.getPhoneNumber());
                    m.put("role", u.getRole().name());
                    m.put("createdAt", u.getCreatedAt());
                    return m;
                })
                .collect(Collectors.toList());
    }
}
