package com.sadarbazar.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartDTO {
    private UUID id;
    private List<CartItemDTO> items;
    private BigDecimal subtotal;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemDTO {
        private UUID id;
        private ProductDTO.ListItem product;
        private Integer quantity;
        private BigDecimal itemTotal;
    }
}
