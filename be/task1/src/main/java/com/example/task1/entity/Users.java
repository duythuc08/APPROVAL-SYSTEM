package com.example.task1.entity;

import com.example.task1.enums.Department;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String userId;

    private String userName;
    private String passWord;
    private String email;
    private String name;

    @Column(nullable = true)
    private Department department;

    @ManyToMany
    private Set<Roles> roles;
}
