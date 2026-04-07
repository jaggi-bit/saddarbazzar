package com.sadarbazar.service;

import com.sadarbazar.entity.Cart;
import com.sadarbazar.entity.CartItem;
import com.sadarbazar.entity.Product;
import com.sadarbazar.exception.BusinessException;
import com.sadarbazar.repository.CartRepository;
import com.sadarbazar.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@Profile("!prod") // Active in dev/test where Redis is excluded
@RequiredArgsConstructor
public class InMemoryInventoryLockService implements InventoryLockService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    
    // Store: Cart ID -> Expiration Time
    private final Map<UUID, Instant> locks = new ConcurrentHashMap<>();

    @Override
    @Transactional
    public boolean lockInventory(UUID cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new BusinessException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new BusinessException("Cart is empty");
        }

        // Check stock
        for (CartItem item : cart.getItems()) {
            if (item.getProduct().getStockQuantity() < item.getQuantity()) {
                throw new BusinessException("Not enough stock for " + item.getProduct().getName());
            }
        }

        // Deduct stock
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);
        }

        locks.put(cartId, Instant.now().plus(15, ChronoUnit.MINUTES));
        log.info("Locked inventory in memory for cart {}", cartId);
        return true;
    }

    @Override
    @Transactional
    public void releaseLocks(UUID cartId) {
        if (locks.containsKey(cartId)) {
            restoreStockForCart(cartId);
            locks.remove(cartId);
            log.info("Released locked inventory in memory for cart {}", cartId);
        }
    }

    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void cleanupExpiredLocks() {
        if (locks.isEmpty()) return;
        
        Instant now = Instant.now();
        for (Map.Entry<UUID, Instant> entry : locks.entrySet()) {
            if (now.isAfter(entry.getValue())) {
                UUID cartId = entry.getKey();
                log.info("Lock expired for cart {}, restoring stock", cartId);
                restoreStockForCart(cartId);
                locks.remove(cartId);
            }
        }
    }
    
    private void restoreStockForCart(UUID cartId) {
        Cart cart = cartRepository.findById(cartId).orElse(null);
        if (cart != null) {
            for (CartItem item : cart.getItems()) {
                Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);
            }
        }
    }
}
