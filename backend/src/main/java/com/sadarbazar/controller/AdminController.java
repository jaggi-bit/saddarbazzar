package com.sadarbazar.controller;

import com.sadarbazar.dto.*;
import com.sadarbazar.entity.AuditLog;
import com.sadarbazar.repository.AuditLogRepository;
import com.sadarbazar.repository.UserRepository;
import com.sadarbazar.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminOrderService adminOrderService;
    private final PromotionService promotionService;
    private final HomepageSettingsService homepageSettingsService;
    private final AnalyticsService analyticsService;
    private final Customer360Service customer360Service;
    private final GatewayHealthService gatewayHealthService;
    private final AuditLogRepository auditLogRepository;

    // ==================== Dashboard ====================

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDTO.Stats> getDashboard() {
        return ResponseEntity.ok(adminOrderService.getDashboardStats());
    }

    // ==================== Orders ====================

    @GetMapping("/orders")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','MANAGER')")
    public ResponseEntity<PagedResponse<AdminOrderDTO.ListItem>> getOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return ResponseEntity.ok(adminOrderService.getOrders(status, search, page, size, sortBy, sortDir));
    }

    @GetMapping("/orders/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','MANAGER')")
    public ResponseEntity<AdminOrderDTO.Detail> getOrderDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(adminOrderService.getOrderDetail(id));
    }

    @PutMapping("/orders/{id}/fulfillment")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','MANAGER')")
    public ResponseEntity<AdminOrderDTO.Detail> updateFulfillmentStatus(
            @PathVariable UUID id,
            @RequestBody AdminOrderDTO.UpdateFulfillmentRequest request) {
        return ResponseEntity.ok(adminOrderService.updateFulfillmentStatus(id, request));
    }

    @PutMapping("/orders/{id}/payment")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','MANAGER')")
    public ResponseEntity<AdminOrderDTO.Detail> updatePaymentStatus(
            @PathVariable UUID id,
            @RequestBody AdminOrderDTO.UpdatePaymentRequest request) {
        return ResponseEntity.ok(adminOrderService.updatePaymentStatus(id, request));
    }

    // ==================== Campaigns / Promotions ====================

    @GetMapping("/campaigns")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','MANAGER','CONTENT_EDITOR')")
    public ResponseEntity<List<PromotionDTO.Response>> getCampaigns() {
        return ResponseEntity.ok(promotionService.getAllPromotions());
    }

    @GetMapping("/campaigns/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','MANAGER','CONTENT_EDITOR')")
    public ResponseEntity<PromotionDTO.Response> getCampaign(@PathVariable UUID id) {
        return ResponseEntity.ok(promotionService.getPromotion(id));
    }

    @PostMapping("/campaigns")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','MANAGER')")
    public ResponseEntity<PromotionDTO.Response> createCampaign(@RequestBody PromotionDTO.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(promotionService.createPromotion(request));
    }

    @PutMapping("/campaigns/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','MANAGER')")
    public ResponseEntity<PromotionDTO.Response> updateCampaign(@PathVariable UUID id, @RequestBody PromotionDTO.UpdateRequest request) {
        return ResponseEntity.ok(promotionService.updatePromotion(id, request));
    }

    @DeleteMapping("/campaigns/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> deleteCampaign(@PathVariable UUID id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Homepage Settings ====================

    @GetMapping("/homepage")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','CONTENT_EDITOR')")
    public ResponseEntity<HomepageSettingsDTO.Response> getHomepageSettings() {
        return ResponseEntity.ok(homepageSettingsService.getSettings());
    }

    @PutMapping("/homepage")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','CONTENT_EDITOR')")
    public ResponseEntity<HomepageSettingsDTO.Response> updateHomepageSettings(@RequestBody HomepageSettingsDTO.UpdateRequest request) {
        return ResponseEntity.ok(homepageSettingsService.updateSettings(request));
    }

    // ==================== Analytics ====================

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','MANAGER')")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(analyticsService.getAnalytics());
    }

    // ==================== Customers ====================

    @GetMapping("/customers")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','MANAGER')")
    public ResponseEntity<List<Map<String, Object>>> getCustomers() {
        return ResponseEntity.ok(customer360Service.getAllCustomers());
    }

    @GetMapping("/customers/{userId}/360")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','MANAGER')")
    public ResponseEntity<Customer360DTO.Response> getCustomer360(@PathVariable UUID userId) {
        return ResponseEntity.ok(customer360Service.getCustomer360(userId));
    }

    // ==================== Audit Logs ====================

    @GetMapping("/audit-logs")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Page<AuditLog>> getAuditLogs(
            @RequestParam(required = false) String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AuditLog> logs = (email != null && !email.isBlank())
                ? auditLogRepository.findByAdminEmailContainingIgnoreCase(email, pageable)
                : auditLogRepository.findAll(pageable);
        return ResponseEntity.ok(logs);
    }

    // ==================== Gateway Health ====================

    @GetMapping("/health/gateways")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> getGatewayHealth() {
        return ResponseEntity.ok(gatewayHealthService.checkAll());
    }
}
