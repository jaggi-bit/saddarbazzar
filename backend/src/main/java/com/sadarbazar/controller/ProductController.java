package com.sadarbazar.controller;

import com.sadarbazar.dto.PagedResponse;
import com.sadarbazar.dto.ProductDTO;
import com.sadarbazar.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // --- Public Endpoints ---

    @GetMapping("/products")
    public ResponseEntity<PagedResponse<ProductDTO.ListItem>> getProducts(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        return ResponseEntity.ok(productService.getProducts(categoryId, minPrice, maxPrice, page, size, sortBy, sortDir));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ProductDTO.Response> getProduct(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getProduct(id));
    }

    @GetMapping("/products/search")
    public ResponseEntity<PagedResponse<ProductDTO.ListItem>> searchProducts(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        return ResponseEntity.ok(productService.searchProducts(q, page, size));
    }

    @GetMapping("/products/featured")
    public ResponseEntity<List<ProductDTO.ListItem>> getFeaturedProducts() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    // --- Admin Endpoints ---

    @PostMapping("/admin/products")
    public ResponseEntity<ProductDTO.Response> createProduct(@Valid @RequestBody ProductDTO.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(request));
    }

    @PutMapping("/admin/products/{id}")
    public ResponseEntity<ProductDTO.Response> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody ProductDTO.UpdateRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @DeleteMapping("/admin/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
