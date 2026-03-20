package com.sadarbazar.service;

import com.sadarbazar.dto.ProductDTO;
import com.sadarbazar.dto.PagedResponse;
import com.sadarbazar.entity.Category;
import com.sadarbazar.entity.Product;
import com.sadarbazar.exception.BusinessException;
import com.sadarbazar.exception.ResourceNotFoundException;
import com.sadarbazar.repository.CategoryRepository;
import com.sadarbazar.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
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

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    // --- Public ---

    @Transactional(readOnly = true)
    public PagedResponse<ProductDTO.ListItem> getProducts(
            UUID categoryId, BigDecimal minPrice, BigDecimal maxPrice,
            int page, int size, String sortBy, String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Product> products = productRepository.findByFilters(categoryId, minPrice, maxPrice, pageable);
        return toPagedListResponse(products);
    }

    @Transactional(readOnly = true)
    public ProductDTO.Response getProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return toResponse(product);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductDTO.ListItem> searchProducts(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Product> products = productRepository.search(query, pageable);
        return toPagedListResponse(products);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO.ListItem> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrueAndIsActiveTrue()
                .stream()
                .map(this::toListItem)
                .collect(Collectors.toList());
    }

    // --- Admin ---

    @Transactional
    public ProductDTO.Response createProduct(ProductDTO.CreateRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new BusinessException("Product with SKU '" + request.getSku() + "' already exists");
        }

        Product product = Product.builder()
                .sku(request.getSku())
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .compareAtPrice(request.getCompareAtPrice())
                .stockQuantity(request.getStockQuantity())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .imageUrl(request.getImageUrl())
                .additionalImages(request.getAdditionalImages() != null ? request.getAdditionalImages() : List.of())
                .weightGrams(request.getWeightGrams())
                .build();

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
            product.setCategory(category);
        }

        product = productRepository.save(product);
        return toResponse(product);
    }

    @Transactional
    public ProductDTO.Response updateProduct(UUID id, ProductDTO.UpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getCompareAtPrice() != null) product.setCompareAtPrice(request.getCompareAtPrice());
        if (request.getStockQuantity() != null) product.setStockQuantity(request.getStockQuantity());
        if (request.getIsActive() != null) product.setIsActive(request.getIsActive());
        if (request.getIsFeatured() != null) product.setIsFeatured(request.getIsFeatured());
        if (request.getImageUrl() != null) product.setImageUrl(request.getImageUrl());
        if (request.getAdditionalImages() != null) product.setAdditionalImages(request.getAdditionalImages());
        if (request.getWeightGrams() != null) product.setWeightGrams(request.getWeightGrams());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            product.setCategory(category);
        }

        product = productRepository.save(product);
        return toResponse(product);
    }

    @Transactional
    public void deleteProduct(UUID id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    // --- Mapping ---

    private ProductDTO.Response toResponse(Product p) {
        ProductDTO.Response.CategorySummary catSummary = null;
        if (p.getCategory() != null) {
            catSummary = ProductDTO.Response.CategorySummary.builder()
                    .id(p.getCategory().getId())
                    .name(p.getCategory().getName())
                    .slug(p.getCategory().getSlug())
                    .build();
        }

        return ProductDTO.Response.builder()
                .id(p.getId())
                .sku(p.getSku())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .compareAtPrice(p.getCompareAtPrice())
                .stockQuantity(p.getStockQuantity())
                .isActive(p.getIsActive())
                .isFeatured(p.getIsFeatured())
                .imageUrl(p.getImageUrl())
                .additionalImages(p.getAdditionalImages())
                .weightGrams(p.getWeightGrams())
                .category(catSummary)
                .build();
    }

    private ProductDTO.ListItem toListItem(Product p) {
        return ProductDTO.ListItem.builder()
                .id(p.getId())
                .name(p.getName())
                .price(p.getPrice())
                .compareAtPrice(p.getCompareAtPrice())
                .imageUrl(p.getImageUrl())
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .isFeatured(p.getIsFeatured())
                .stockQuantity(p.getStockQuantity())
                .build();
    }

    private PagedResponse<ProductDTO.ListItem> toPagedListResponse(Page<Product> page) {
        List<ProductDTO.ListItem> items = page.getContent()
                .stream()
                .map(this::toListItem)
                .collect(Collectors.toList());

        return PagedResponse.<ProductDTO.ListItem>builder()
                .content(items)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
