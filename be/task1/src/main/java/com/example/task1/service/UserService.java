package com.example.task1.service;

import com.example.task1.dto.user.req.UserCreationRequest;
import com.example.task1.dto.user.req.UserUpdateRequest;
import com.example.task1.dto.user.res.UserResponse;
import com.example.task1.entity.ApprovalRequests;
import com.example.task1.entity.Roles;
import com.example.task1.entity.Users;
import com.example.task1.mapper.UserMapper;
import com.example.task1.repository.RoleRepository;
import com.example.task1.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RoleRepository roleRepository;
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public UserResponse createUser(UserCreationRequest userCreationRequest) {

        if(userRepository.existsByUserName(userCreationRequest.getUserName())){
            throw new RuntimeException("Username already exists");
        } else if (userRepository.existsByEmail(userCreationRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Users user = userMapper.toUser(userCreationRequest);
        List<Roles> roles = roleRepository.findAllByRoleNameIn(userCreationRequest.getRoles());
        user.setRoles(new HashSet<>(roles));
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public Page<UserResponse> getUsers(Specification<Users> spec, Pageable pageable) {
        Page<Users> userPage = userRepository.findAll(spec, pageable);
        return userPage.map(userMapper::toUserResponse);
    }

    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_ADMIN')")
    public List<UserResponse> getUserByRole(String role) {
        return userRepository.findByRoleName(role)
                .stream()
                .map(userMapper::toUserResponse).toList();
    }

    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        Users user = userRepository.findByUserName(name)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userMapper.toUserResponse(user);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Transactional
    public void DeleteUserById(String id) {
        userRepository.deleteByUserId((id));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public UserResponse updateUser(String id, UserUpdateRequest userUpdateRequest) {
        Users user = userRepository.findByUserId(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setUserName(userUpdateRequest.getUserName());
        user.setEmail(userUpdateRequest.getEmail());
        user.setName(userUpdateRequest.getName());

        List<Roles> roles = roleRepository.findAllByRoleNameIn(userUpdateRequest.getRoles());
        user.setRoles(new HashSet<>(roles));

        return userMapper.toUserResponse(userRepository.save(user));
    }
}
