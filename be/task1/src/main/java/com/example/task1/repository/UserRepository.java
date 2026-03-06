package com.example.task1.repository;

import com.example.task1.dto.user.res.UserResponse;
import com.example.task1.entity.ApprovalRequests;
import com.example.task1.entity.Roles;
import com.example.task1.entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Users,String>, JpaSpecificationExecutor<Users> {
    boolean existsByUserName(String username);

    boolean existsByEmail(String email);

    Optional<Users> findByUserId(String userId);

    Optional<Users> findByUserName(String userName);

    @Query("SELECT u FROM Users u JOIN u.roles r WHERE r.roleName = :roleName")

    List<Users> findByRoleName(@Param("roleName") String roleName);

    void deleteByUserId(String userId);

}
