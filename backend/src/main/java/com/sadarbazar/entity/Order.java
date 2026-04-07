package com.sadarbazar.entity;

import com.sadarbazar.entity.enums.FulfillmentStatus;
import com.sadarbazar.entity.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "guest_email")
    private String guestEmail;

    @Column(name = "guest_session_id")
    private UUID guestSessionId;

    // --- Shipping Details ---
    @Column(name = "shipping_name", nullable = false)
    private String shippingName;

    @Column(name = "shipping_address", nullable = false)
    private String shippingAddress;

    @Column(name = "shipping_city", nullable = false)
    private String shippingCity;

    @Column(name = "shipping_pin_code")
    private String shippingPinCode;

    @Column(name = "shipping_phone", nullable = false)
    private String shippingPhone;

    @Column(name = "shipping_email")
    private String shippingEmail;

    @Column(name = "shipping_province")
    private String shippingProvince;

    @Column(name = "shipping_district")
    private String shippingDistrict;

    @Column(name = "shipping_landmark")
    private String shippingLandmark;

    @Column(name = "shipping_address_category")
    private String shippingAddressCategory; // "home", "office", etc.

    // --- Order Note (User customization notes) ---
    @Column(name = "order_note", columnDefinition = "TEXT")
    private String orderNote;

    // --- Pricing ---
    @Column(name = "subtotal_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotalAmount;

    @Column(name = "shipping_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal shippingAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    // --- Promo ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promo_code_id")
    private Promotion promoCode;

    // --- Status ---
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "fulfillment_status", nullable = false)
    @Builder.Default
    private FulfillmentStatus fulfillmentStatus = FulfillmentStatus.PENDING;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "payment_transaction_id")
    private String paymentTransactionId;

    // --- Tracking ---
    @Column(name = "tracking_number")
    private String trackingNumber;

    @Column(name = "courier_name")
    private String courierName;

    // --- Items ---
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    // --- Helper ---
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}
