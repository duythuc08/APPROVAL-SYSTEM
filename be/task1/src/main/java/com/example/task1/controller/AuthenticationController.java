package com.example.task1.controller;

import com.example.task1.dto.ApiResponse;
import com.example.task1.dto.authentication.req.AuthenticationRequest;
import com.example.task1.dto.authentication.res.AuthenticationResponse;
import com.example.task1.dto.authentication.res.LogoutRequest;
import com.example.task1.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.apache.el.parser.ParseException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController  // ✅ Sửa từ @Controller
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;  // ✅ Thêm final

    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> login(@RequestBody AuthenticationRequest authenticationRequest){
        var result = authenticationService.authenticate(authenticationRequest);
        return ApiResponse.<AuthenticationResponse>builder()
                .result(result)
                .build();
    }
    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestBody LogoutRequest logoutRequest) throws Exception, ParseException {
        authenticationService.logout(logoutRequest);
        return ApiResponse.<Void>builder()
                .build();
    }
}
