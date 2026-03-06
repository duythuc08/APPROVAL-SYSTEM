package com.example.task1.dto.product.req;

import com.example.task1.enums.ProductType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    @NotBlank(message = "Product name is required")
    private String productName;

    private String productDescription;

    @NotNull(message = "Product quantity is required")
    @Min(value = 0, message = "Product quantity must be >= 0")
    private Integer productQuantity;

    @NotNull(message = "Product type is required")
    private ProductType productType;
}
