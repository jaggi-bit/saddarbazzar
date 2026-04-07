package com.sadarbazar.service;

import java.util.UUID;

public interface InventoryLockService {
    boolean lockInventory(UUID cartId);
    void releaseLocks(UUID cartId);
}
