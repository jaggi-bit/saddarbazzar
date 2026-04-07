package com.sadarbazar.controller;

import com.sadarbazar.dto.CartDTO;
import com.sadarbazar.dto.CartItemRequest;
import com.sadarbazar.dto.CartItemUpdateQuantityRequest;
import com.sadarbazar.security.UserDetailsImpl;
import com.sadarbazar.service.CartService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartDTO> getCart(HttpServletRequest request) {
        UUID userId = getUserId();
        UUID guestSessionId = getGuestSessionId(request);
        
        if (userId == null && guestSessionId == null) {
            return ResponseEntity.ok(CartDTO.builder()
                    .items(java.util.List.of())
                    .subtotal(java.math.BigDecimal.ZERO)
                    .build());
        }
        
        return ResponseEntity.ok(cartService.getCart(userId, guestSessionId));
    }

    @PostMapping("/items")
    public ResponseEntity<CartDTO> addItem(
            @Valid @RequestBody CartItemRequest requestDto,
            HttpServletRequest request,
            jakarta.servlet.http.HttpServletResponse response) {
            
        UUID userId = getUserId();
        UUID guestSessionId = getGuestSessionId(request);
        
        // Auto-initialize a guest session if none exists
        if (userId == null && guestSessionId == null) {
            String newSession = UUID.randomUUID().toString();
            guestSessionId = UUID.fromString(newSession);
            
            Cookie cookie = new Cookie("guest_session_token", newSession);
            cookie.setHttpOnly(true);
            cookie.setSecure(false); // Enable in production
            cookie.setPath("/");
            cookie.setMaxAge(30 * 24 * 60 * 60);
            response.addCookie(cookie);
        }
            
        return ResponseEntity.ok(cartService.addItem(userId, guestSessionId, requestDto.getProductId(), requestDto.getQuantity()));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartDTO> updateItemQuantity(
            @PathVariable UUID itemId,
            @Valid @RequestBody CartItemUpdateQuantityRequest requestDto,
            HttpServletRequest request) {
        return ResponseEntity.ok(cartService.updateItemQuantity(getUserId(), getGuestSessionId(request), itemId, requestDto.getQuantity()));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDTO> removeItem(
            @PathVariable UUID itemId,
            HttpServletRequest request) {
        return ResponseEntity.ok(cartService.removeItem(getUserId(), getGuestSessionId(request), itemId));
    }

    private UUID getUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) auth.getPrincipal()).getId();
        }
        return null;
    }

    private UUID getGuestSessionId(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("guest_session_token".equals(cookie.getName())) {
                    try {
                        return UUID.fromString(cookie.getValue());
                    } catch (IllegalArgumentException e) {
                        return null;
                    }
                }
            }
        }
        return null;
    }
}
