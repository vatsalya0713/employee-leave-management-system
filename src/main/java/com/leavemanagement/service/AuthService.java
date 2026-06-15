package com.leavemanagement.service;

import com.leavemanagement.dto.JwtAuthenticationResponse;
import com.leavemanagement.dto.LoginRequest;
import com.leavemanagement.dto.RegisterRequest;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.entity.Role;
import com.leavemanagement.entity.User;
import com.leavemanagement.exception.BadRequestException;
import com.leavemanagement.repository.EmployeeRepository;
import com.leavemanagement.repository.UserRepository;
import com.leavemanagement.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, EmployeeRepository employeeRepository,
                       PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public User registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address already in use.");
        }

        // Create User
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        User savedUser = userRepository.save(user);

        // Auto-create Employee profile if registered role is EMPLOYEE or MANAGER
        if (request.getRole() == Role.EMPLOYEE || request.getRole() == Role.MANAGER) {
            String code = "EMP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            String dept = request.getDepartment() != null && !request.getDepartment().isBlank() ? request.getDepartment() : "General";
            String desg = request.getDesignation() != null && !request.getDesignation().isBlank() ? request.getDesignation() : "Staff";

            Employee employee = Employee.builder()
                    .employeeCode(code)
                    .name(request.getName())
                    .email(request.getEmail())
                    .department(dept)
                    .designation(desg)
                    .joiningDate(LocalDate.now())
                    .leaveBalance(21)
                    .user(savedUser)
                    .build();

            employeeRepository.save(employee);
        }

        return savedUser;
    }

    public JwtAuthenticationResponse loginUser(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User profile not found."));

        return JwtAuthenticationResponse.builder()
                .accessToken(jwt)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
