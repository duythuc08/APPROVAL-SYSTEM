package com.example.task1.service;

import com.example.task1.dto.product.req.ProductRequest;
import com.example.task1.dto.product.res.ProductResponse;
import com.example.task1.entity.Products;
import com.example.task1.entity.Users;
import com.example.task1.enums.Department;
import com.example.task1.mapper.ProductMapper;
import com.example.task1.repository.ProductRepository;
import com.example.task1.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductMapper productMapper;
    public List<ProductResponse> getAllProduct() {
        return productRepository.findAll()
                .stream()
                .map(productMapper::toProductResponse)
                .toList();
    }

    public List<ProductResponse> getAllProductByOwner(String ownerUserName) {
        return productRepository.findByOwner_UserName(ownerUserName)
                .stream()
                .map(productMapper::toProductResponse)
                .toList();
    }


    @PreAuthorize("hasRole('ROLE_APPROVER')")
    public ProductResponse createProduct(ProductRequest productRequest) {
        Products product = productMapper.toProduct(productRequest);

        String ownerName = SecurityContextHolder.getContext().getAuthentication().getName();
        Users owner = userRepository.findByUserName(ownerName)
                .orElseThrow(() ->  new RuntimeException("User not found with username: " + ownerName));

        product.setOwner(owner);
        return productMapper.toProductResponse(productRepository.save(product));
    }

    @PreAuthorize("hasRole('ROLE_APPROVER')")
    public void deleteProduct(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new RuntimeException("Product not found with id: " + productId);
        }
        Products product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        String ownerName = SecurityContextHolder.getContext().getAuthentication().getName();
        Users owner = userRepository.findByUserName(ownerName)
                .orElseThrow(() ->  new RuntimeException("User not found with username: " + ownerName));

        if(owner.getUserId().equals(product.getOwner().getUserId())) {
            productRepository.deleteById(productId);
        } else {
            throw new RuntimeException("You are not the owner of this product");
        }
    }
}
