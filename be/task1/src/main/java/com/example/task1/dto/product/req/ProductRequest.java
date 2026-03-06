package com.example.task1.dto.product.req;

import com.example.task1.enums.ProductType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    private String productName;
    private String productDescription;
    private Integer productQuantity;
    private ProductType productType;
}
