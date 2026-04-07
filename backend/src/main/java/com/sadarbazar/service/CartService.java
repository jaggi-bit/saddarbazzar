package com.sadarbazar.service;

import com.sadarbazar.dto.CartDTO;
import com.sadarbazar.dto.ProductDTO;
import com.sadarbazar.entity.Cart;
import com.sadarbazar.entity.CartItem;
import com.sadarbazar.entity.Product;
import com.sadarbazar.entity.User;
import com.sadarbazar.exception.BusinessException;
import com.sadarbazar.repository.CartRepository;
import com.sadarbazar.repository.ProductRepository;
import com.sadarbazar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public CartDTO getCart(UUID userId, UUID guestSessionId) {
        Cart cart = getOrCreateCart(userId, guestSessionId);
        return mapToDTO(cart);
    }

    @Transactional
    public CartDTO addItem(UUID userId, UUID guestSessionId, UUID productId, int quantity) {
        Cart cart = getOrCreateCart(userId, guestSessionId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException("Product not found"));

        if (!product.getIsActive()) {
            throw new BusinessException("Product is no longer available");
        }

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            CartItem newItem = CartItem.builder()
                    .product(product)
                    .quantity(quantity)
                    .build();
            cart.addItem(newItem);
        }

        cart = cartRepository.save(cart);
        return mapToDTO(cart);
    }

    @Transactional
    public CartDTO updateItemQuantity(UUID userId, UUID guestSessionId, UUID itemId, int quantity) {
        Cart cart = getOrCreateCart(userId, guestSessionId);
        
        CartItem itemToUpdate = cart.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new BusinessException("Cart item not found"));

        itemToUpdate.setQuantity(quantity);
        cart = cartRepository.save(cart);
        return mapToDTO(cart);
    }

    @Transactional
    public CartDTO removeItem(UUID userId, UUID guestSessionId, UUID itemId) {
        Cart cart = getOrCreateCart(userId, guestSessionId);
        
        CartItem itemToRemove = cart.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new BusinessException("Cart item not found"));

        cart.removeItem(itemToRemove);
        cart = cartRepository.save(cart);
        return mapToDTO(cart);
    }

    @Transactional
    public void mergeGuestCart(UUID userId, UUID guestSessionId) {
        if (guestSessionId == null) return;
        
        Optional<Cart> guestCartOpt = cartRepository.findByGuestSessionId(guestSessionId);
        if (guestCartOpt.isEmpty() || guestCartOpt.get().getItems().isEmpty()) {
            return;
        }
        
        Cart guestCart = guestCartOpt.get();
        Cart userCart = getOrCreateCart(userId, null);
        
        for (CartItem guestItem : guestCart.getItems()) {
            Optional<CartItem> existingUserItem = userCart.getItems().stream()
                    .filter(i -> i.getProduct().getId().equals(guestItem.getProduct().getId()))
                    .findFirst();
                    
            if (existingUserItem.isPresent()) {
                existingUserItem.get().setQuantity(existingUserItem.get().getQuantity() + guestItem.getQuantity());
            } else {
                CartItem newItem = CartItem.builder()
                        .product(guestItem.getProduct())
                        .quantity(guestItem.getQuantity())
                        .build();
                userCart.addItem(newItem);
            }
        }
        
        cartRepository.save(userCart);
        cartRepository.delete(guestCart);
    }

    private Cart getOrCreateCart(UUID userId, UUID guestSessionId) {
        if (userId != null) {
            return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new BusinessException("User not found"));
                    return cartRepository.save(Cart.builder().user(user).build());
                });
        } else if (guestSessionId != null) {
            return cartRepository.findByGuestSessionId(guestSessionId)
                .orElseGet(() -> cartRepository.save(Cart.builder().guestSessionId(guestSessionId).build()));
        }
        throw new BusinessException("Cannot process cart without User ID or Guest Session ID");
    }

    private CartDTO mapToDTO(Cart cart) {
        BigDecimal subtotal = BigDecimal.ZERO;
        var itemDTOs = cart.getItems().stream().map(item -> {
            BigDecimal itemTotal = item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            
            ProductDTO.ListItem productDTO = ProductDTO.ListItem.builder()
                    .id(item.getProduct().getId())
                    .name(item.getProduct().getName())
                    .price(item.getProduct().getPrice())
                    .compareAtPrice(item.getProduct().getCompareAtPrice())
                    .imageUrl(item.getProduct().getImageUrl())
                    .categoryName(item.getProduct().getCategory() != null ? item.getProduct().getCategory().getName() : null)
                    .isFeatured(item.getProduct().getIsFeatured())
                    .stockQuantity(item.getProduct().getStockQuantity())
                    .build();

            return CartDTO.CartItemDTO.builder()
                    .id(item.getId())
                    .product(productDTO)
                    .quantity(item.getQuantity())
                    .itemTotal(itemTotal)
                    .build();
        }).collect(Collectors.toList());

        for (var itemDTO : itemDTOs) {
            subtotal = subtotal.add(itemDTO.getItemTotal());
        }

        return CartDTO.builder()
                .id(cart.getId())
                .items(itemDTOs)
                .subtotal(subtotal)
                .build();
    }
}
