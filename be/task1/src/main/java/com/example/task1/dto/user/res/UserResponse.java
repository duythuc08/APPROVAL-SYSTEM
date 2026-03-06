package com.example.task1.dto.user.res;

import com.example.task1.entity.Roles;
import com.example.task1.enums.Department;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String userId;
    private String userName;
    private String email;
    private String name;
    private Department department;
    private Set<Roles> roles;
}
