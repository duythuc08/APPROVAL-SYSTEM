package com.example.task1.repository;

import com.example.task1.entity.ApprovalRequests;
import com.example.task1.entity.Products;
import com.example.task1.enums.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;

@Repository
public interface ProductRepository  extends JpaRepository<Products,Long>, JpaSpecificationExecutor<Products> {
    List<Products> findByOwner_UserName(String ownerUserName);

}
