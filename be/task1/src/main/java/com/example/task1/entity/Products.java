package com.example.task1.entity;


import com.example.task1.enums.ProductType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "products")
public class Products {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;
    private String productName;
    private String productDescription;
    private Integer productQuantity;
    private ProductType productType;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users owner;
}
