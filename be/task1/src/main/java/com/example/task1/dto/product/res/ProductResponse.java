package com.example.task1.dto.product.res;

import com.example.task1.enums.ProductType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long productId;
    private String productName;
    private String productDescription;
    private Integer productQuantity;
    private ProductType productType;

    private String ownerName;
    private String department;
}
