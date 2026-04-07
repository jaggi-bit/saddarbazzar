package com.sadarbazar.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class AdminDashboardDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Stats {
        private long totalOrders;
        private BigDecimal totalRevenue;
        private long pendingOrders;
        private long processingOrders;
        private long shippedOrders;
        private long deliveredOrders;
        private long canceledOrders;
        private long totalProducts;
        private long totalCustomers;
        private List<AdminOrderDTO.ListItem> recentOrders;
    }
}
