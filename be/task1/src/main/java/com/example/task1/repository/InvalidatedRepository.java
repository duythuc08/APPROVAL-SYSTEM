package com.example.task1.repository;

import com.example.task1.entity.ApprovalRequests;
import com.example.task1.entity.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface InvalidatedRepository extends JpaRepository<InvalidatedToken,String>, JpaSpecificationExecutor<InvalidatedToken> {
}
