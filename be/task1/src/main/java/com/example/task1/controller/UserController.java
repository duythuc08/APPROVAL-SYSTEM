package com.example.task1.controller;

import com.example.task1.dto.ApiResponse;
import com.example.task1.dto.user.req.UserCreationRequest;
import com.example.task1.dto.user.req.UserUpdateRequest;
import com.example.task1.dto.user.res.UserResponse;
import com.example.task1.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/create")
    public ApiResponse<UserResponse> createUser(@RequestBody UserCreationRequest userCreationRequest) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.createUser(userCreationRequest))
                .build();
    }

    @GetMapping("/getUsers")
    public ApiResponse<List<UserResponse>> getUsers() {
        return ApiResponse.<List<UserResponse>>builder()
                .result(userService.getUsers())
                .build();
    }

    @GetMapping("/getUserByRole")
    public ApiResponse<List<UserResponse>> getUserByRole(@RequestParam String role) {
        return ApiResponse.<List<UserResponse>>builder()
                .result(userService.getUserByRole(role))
                .build();
    }

    @GetMapping("/getMyInfo")
    public ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }

    @DeleteMapping("/deleteUser/{userId}")
    public ApiResponse<Void> deleteUserById(@PathVariable String userId) {
        userService.DeleteUserById(userId);
        return ApiResponse.<Void>builder()
                .build();
    }

    @PutMapping("/updateUser/{userId}")
    public ApiResponse<UserResponse> updateUser(@PathVariable String userId,@RequestBody UserUpdateRequest userUpdateRequest) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateUser(userId, userUpdateRequest))
                .build();
    }
}
