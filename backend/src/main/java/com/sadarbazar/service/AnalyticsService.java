package com.sadarbazar.service;

import com.sadarbazar.entity.enums.FulfillmentStatus;
import com.sadarbazar.entity.enums.PaymentStatus;
import com.sadarbazar.repository.OrderRepository;
import com.sadarbazar.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    /**
     * Comprehensive analytics for the admin analytics page.
     */
    public Map<String, Object> getAnalytics() {
        Map<String, Object> analytics = new LinkedHashMap<>();

        // Revenue
        analytics.put("totalRevenue", orderRepository.sumPaidRevenue());
        analytics.put("totalOrders", orderRepository.count());

        // Orders by fulfillment status
        Map<String, Long> ordersByFulfillment = new LinkedHashMap<>();
        for (FulfillmentStatus status : FulfillmentStatus.values()) {
            ordersByFulfillment.put(status.name(), orderRepository.countByFulfillmentStatus(status));
        }
        analytics.put("ordersByFulfillment", ordersByFulfillment);

        // Orders by payment status
        Map<String, Long> ordersByPayment = new LinkedHashMap<>();
        for (PaymentStatus status : PaymentStatus.values()) {
            ordersByPayment.put(status.name(), orderRepository.countByPaymentStatus(status));
        }
        analytics.put("ordersByPayment", ordersByPayment);

        // Top products by order frequency
        List<Map<String, Object>> topProducts = orderRepository.findAll().stream()
                .flatMap(order -> order.getItems().stream())
                .collect(Collectors.groupingBy(
                        item -> item.getProductName(),
                        Collectors.summingInt(item -> item.getQuantity())
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(10)
                .map(entry -> {
                    Map<String, Object> product = new LinkedHashMap<>();
                    product.put("productName", entry.getKey());
                    product.put("totalQuantitySold", entry.getValue());
                    return product;
                })
                .collect(Collectors.toList());
        analytics.put("topProducts", topProducts);

        // Top revenue products
        List<Map<String, Object>> topRevenueProducts = orderRepository.findAll().stream()
                .flatMap(order -> order.getItems().stream())
                .collect(Collectors.groupingBy(
                        item -> item.getProductName(),
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())),
                                BigDecimal::add
                        )
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                .limit(10)
                .map(entry -> {
                    Map<String, Object> product = new LinkedHashMap<>();
                    product.put("productName", entry.getKey());
                    product.put("totalRevenue", entry.getValue());
                    return product;
                })
                .collect(Collectors.toList());
        analytics.put("topRevenueProducts", topRevenueProducts);

        // Top cities by order count
        List<Map<String, Object>> topCities = orderRepository.findAll().stream()
                .filter(o -> o.getShippingCity() != null)
                .collect(Collectors.groupingBy(
                        order -> order.getShippingCity(),
                        Collectors.counting()
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(entry -> {
                    Map<String, Object> city = new LinkedHashMap<>();
                    city.put("city", entry.getKey());
                    city.put("orderCount", entry.getValue());
                    return city;
                })
                .collect(Collectors.toList());
        analytics.put("topCities", topCities);

        // Payment methods breakdown
        Map<String, Long> paymentMethods = orderRepository.findAll().stream()
                .filter(o -> o.getPaymentMethod() != null)
                .collect(Collectors.groupingBy(
                        order -> order.getPaymentMethod(),
                        Collectors.counting()
                ));
        analytics.put("paymentMethods", paymentMethods);

        // Inventory alerts (low stock products)
        List<Map<String, Object>> lowStock = productRepository.findAll().stream()
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() <= 10)
                .sorted(Comparator.comparingInt(p -> p.getStockQuantity()))
                .limit(15)
                .map(p -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("name", p.getName());
                    item.put("sku", p.getSku());
                    item.put("stock", p.getStockQuantity());
                    return item;
                })
                .collect(Collectors.toList());
        analytics.put("lowStockProducts", lowStock);

        return analytics;
    }
}
