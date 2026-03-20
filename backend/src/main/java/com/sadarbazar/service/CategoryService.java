package com.sadarbazar.service;

import com.sadarbazar.dto.CategoryDTO;
import com.sadarbazar.entity.Category;
import com.sadarbazar.exception.BusinessException;
import com.sadarbazar.exception.ResourceNotFoundException;
import com.sadarbazar.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryDTO.Response> getAllCategories() {
        return categoryRepository.findByIsActiveTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryDTO.Response> getRootCategories() {
        return categoryRepository.findByParentIsNullAndIsActiveTrue()
                .stream()
                .map(this::toResponseWithChildren)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDTO.Response getCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return toResponseWithChildren(category);
    }

    @Transactional(readOnly = true)
    public CategoryDTO.Response getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + slug));
        return toResponseWithChildren(category);
    }

    @Transactional
    public CategoryDTO.Response createCategory(CategoryDTO.CreateRequest request) {
        String slug = request.getSlug() != null ? request.getSlug()
                : request.getName().toLowerCase().replaceAll("\\s+", "-").replaceAll("[^a-z0-9\\-]", "");

        if (categoryRepository.existsBySlug(slug)) {
            throw new BusinessException("Category with slug '" + slug + "' already exists");
        }

        Category category = Category.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
            category.setParent(parent);
        }

        category = categoryRepository.save(category);
        return toResponse(category);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }

    // --- Mapping ---

    private CategoryDTO.Response toResponse(Category c) {
        return CategoryDTO.Response.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .imageUrl(c.getImageUrl())
                .isActive(c.getIsActive())
                .sortOrder(c.getSortOrder())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .build();
    }

    private CategoryDTO.Response toResponseWithChildren(Category c) {
        CategoryDTO.Response response = toResponse(c);
        if (c.getChildren() != null && !c.getChildren().isEmpty()) {
            response.setChildren(c.getChildren().stream()
                    .filter(Category::getIsActive)
                    .map(this::toResponseWithChildren)
                    .collect(Collectors.toList()));
        }
        return response;
    }
}
