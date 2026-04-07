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
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@Profile("prod")
@RequiredArgsConstructor
public class RedisInventoryLockService implements InventoryLockService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final StringRedisTemplate redisTemplate;

    private static final String LOCK_PREFIX = "cart:lock:";
    private static final long LOCK_TIMEOUT_MINUTES = 15;

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

        String lockKey = LOCK_PREFIX + cartId;
        // Set flag in Redis
        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", LOCK_TIMEOUT_MINUTES, TimeUnit.MINUTES);
        
        if (Boolean.TRUE.equals(acquired)) {
            // Deduct stock from DB
            for (CartItem item : cart.getItems()) {
                Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
                productRepository.save(product);
            }
            log.info("Acquired Redis inventory lock for cart {}", cartId);
            return true;
        } else {
            throw new BusinessException("Inventory already locked for this cart");
        }
    }

    @Override
    @Transactional
    public void releaseLocks(UUID cartId) {
        String lockKey = LOCK_PREFIX + cartId;
        Boolean deleted = redisTemplate.delete(lockKey);
        if (Boolean.TRUE.equals(deleted)) {
            Cart cart = cartRepository.findById(cartId).orElse(null);
            if (cart != null) {
                // Restore stock to DB
                for (CartItem item : cart.getItems()) {
                    Product product = item.getProduct();
                    product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                    productRepository.save(product);
                }
            }
            log.info("Released Redis inventory lock for cart {}", cartId);
        }
    }
}
