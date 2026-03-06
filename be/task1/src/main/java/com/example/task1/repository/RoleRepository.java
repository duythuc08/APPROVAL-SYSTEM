package com.example.task1.repository;

import com.example.task1.entity.ApprovalRequests;
import com.example.task1.entity.Roles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface RoleRepository extends JpaRepository<Roles,String>, JpaSpecificationExecutor<Roles> {
    Object findAllByRoleId(int roleId);

    List<Roles> findAllByRoleNameIn(List<String> roleNames);
}
