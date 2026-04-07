package com.sadarbazar.repository;

import com.sadarbazar.entity.Order;
import com.sadarbazar.entity.enums.FulfillmentStatus;
import com.sadarbazar.entity.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    // --- Admin: Filtered listing ---
    Page<Order> findByFulfillmentStatus(FulfillmentStatus status, Pageable pageable);
    Page<Order> findByPaymentStatus(PaymentStatus status, Pageable pageable);

    // --- Admin: Search by shipping name or phone ---
    @Query("SELECT o FROM Order o WHERE " +
           "LOWER(o.shippingName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "o.shippingPhone LIKE CONCAT('%', :query, '%')")
    Page<Order> searchOrders(@Param("query") String query, Pageable pageable);

    // --- Admin: Dashboard stats ---
    long countByFulfillmentStatus(FulfillmentStatus status);
    long countByPaymentStatus(PaymentStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.paymentStatus = 'PAID'")
    BigDecimal sumPaidRevenue();

    // --- Admin: Recent orders ---
    List<Order> findTop10ByOrderByCreatedAtDesc();

    // --- Customer: order history ---
    Page<Order> findByUserId(UUID userId, Pageable pageable);
    List<Order> findByGuestSessionId(UUID guestSessionId);
}
