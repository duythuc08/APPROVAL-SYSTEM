package com.example.task1.mapper;

import com.example.task1.dto.product.req.ProductRequest;
import com.example.task1.dto.product.res.ProductResponse;
import com.example.task1.entity.Products;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    @Mapping(source = "owner.name", target = "ownerName")
    @Mapping(source = "owner.department", target = "department")
    ProductResponse toProductResponse(Products products);

    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "owner", ignore = true)
    Products toProduct(ProductRequest productResponse);
}
