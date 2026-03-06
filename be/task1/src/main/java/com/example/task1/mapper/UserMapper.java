package com.example.task1.mapper;

import com.example.task1.dto.user.req.UserCreationRequest;
import com.example.task1.dto.user.res.UserResponse;
import com.example.task1.entity.Users;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toUserResponse(Users users);

    @Mapping(target = "roles", ignore = true)
    Users toUser(UserCreationRequest userCreationRequest);
}
