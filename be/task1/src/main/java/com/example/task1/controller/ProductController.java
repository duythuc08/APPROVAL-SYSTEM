package com.example.task1.controller;

import com.example.task1.dto.ApiResponse;
import com.example.task1.dto.product.req.ProductRequest;
import com.example.task1.dto.product.res.ProductResponse;
import com.example.task1.enums.Department;
import com.example.task1.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @GetMapping
    public ApiResponse<List<ProductResponse>> getAllProducts() {
        return ApiResponse.<List<ProductResponse>>builder()
                .result(productService.getAllProduct())
                .build();
    }

    @GetMapping("/department/{ownerName}")
    public ApiResponse<List<ProductResponse>> getProductsByOwner(@PathVariable String ownerName) {
        return ApiResponse.<List<ProductResponse>>builder()
                .result(productService.getAllProductByOwner(ownerName))
                .build();
    }

    @PostMapping("/create")
    public ApiResponse<ProductResponse> createProduct(@Valid @RequestBody ProductRequest productRequest) {
        return ApiResponse.<ProductResponse>builder()
                .result(productService.createProduct(productRequest))
                .build();
    }

    @DeleteMapping("/delete/{productId}")
    public ApiResponse<Void> deleteProduct(@PathVariable Long productId) {
        productService.deleteProduct(productId);
        return ApiResponse.<Void>builder()
                .build();
    }
}
