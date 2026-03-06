package com.example.task1.dto.user.req;

import com.example.task1.enums.Department;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {
    private String userName;
    private String email;
    private String name;
    private Department department;
    private List<String> roles; //ADMIN, USER, APPROVEDR
}
