package com.sadarbazar.controller;

import com.sadarbazar.entity.Order;
import com.sadarbazar.entity.enums.FulfillmentStatus;
import com.sadarbazar.exception.ResourceNotFoundException;
import com.sadarbazar.logistics.LogisticsFacade;
import com.sadarbazar.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin/shipping")
@RequiredArgsConstructor
@Slf4j
public class ShippingController {

    private final LogisticsFacade logisticsFacade;
    private final OrderRepository orderRepository;

    /**
     * Generate AWB via the configured logistics provider (PostEx).
     * Updates the order with tracking number and sets fulfillment to SHIPPED.
     */
    @PostMapping("/generate-awb/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','MANAGER')")
    public ResponseEntity<?> generateAwb(@PathVariable UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        try {
            String trackingNumber = logisticsFacade.generateAwb(order);

            order.setTrackingNumber(trackingNumber);
            order.setCourierName(logisticsFacade.getProviderName());
            order.setFulfillmentStatus(FulfillmentStatus.SHIPPED);
            orderRepository.save(order);

            return ResponseEntity.ok(Map.of(
                    "trackingNumber", trackingNumber,
                    "courierName", logisticsFacade.getProviderName(),
                    "trackingUrl", logisticsFacade.getTrackingUrl(trackingNumber),
                    "message", "AWB generated successfully"
            ));
        } catch (UnsupportedOperationException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("AWB generation failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "PostEx API Error: " + e.getMessage()));
        }
    }

    /**
     * Retrieve and stream the shipping label PDF from the courier.
     */
    @GetMapping("/print-label/{trackingNumber}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','MANAGER')")
    public ResponseEntity<byte[]> printLabel(@PathVariable String trackingNumber) {
        try {
            byte[] pdfBytes = logisticsFacade.getShippingLabel(trackingNumber);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.inline()
                    .filename("label-" + trackingNumber + ".pdf")
                    .build());

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (UnsupportedOperationException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        } catch (Exception e) {
            log.error("Label retrieval failed for {}", trackingNumber, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
