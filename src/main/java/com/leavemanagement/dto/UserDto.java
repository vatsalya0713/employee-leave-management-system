package com.leavemanagement.dto;

import com.leavemanagement.entity.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private Integer leaveBalance;
}
