package com.leavemanagement.service;

import com.leavemanagement.dto.EmployeeDto;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.exception.ResourceNotFoundException;
import com.leavemanagement.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Transactional
    public EmployeeDto createEmployee(EmployeeDto dto) {
        Employee employee = Employee.builder()
                .employeeCode(dto.getEmployeeCode())
                .name(dto.getName())
                .email(dto.getEmail())
                .department(dto.getDepartment())
                .designation(dto.getDesignation())
                .joiningDate(dto.getJoiningDate())
                .leaveBalance(dto.getLeaveBalance() != null ? dto.getLeaveBalance() : 21)
                .build();
        Employee saved = employeeRepository.save(employee);
        return mapToDto(saved);
    }

    @Transactional
    public EmployeeDto updateEmployee(Long id, EmployeeDto dto) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        
        employee.setName(dto.getName());
        employee.setEmail(dto.getEmail());
        employee.setDepartment(dto.getDepartment());
        employee.setDesignation(dto.getDesignation());
        employee.setJoiningDate(dto.getJoiningDate());
        if (dto.getLeaveBalance() != null) {
            employee.setLeaveBalance(dto.getLeaveBalance());
        }
        Employee saved = employeeRepository.save(employee);
        return mapToDto(saved);
    }

    public EmployeeDto getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return mapToDto(employee);
    }

    public Page<EmployeeDto> getAllEmployees(Pageable pageable) {
        return employeeRepository.findAll(pageable).map(this::mapToDto);
    }

    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        employeeRepository.delete(employee);
    }

    // Search employees dynamically using JPA Specification
    public Page<EmployeeDto> searchEmployees(String name, String department, String email, Pageable pageable) {
        Specification<Employee> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (name != null && !name.isBlank()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
            }
            if (department != null && !department.isBlank()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("department")), "%" + department.toLowerCase() + "%"));
            }
            if (email != null && !email.isBlank()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), "%" + email.toLowerCase() + "%"));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        
        return employeeRepository.findAll(spec, pageable).map(this::mapToDto);
    }

    private EmployeeDto mapToDto(Employee employee) {
        return EmployeeDto.builder()
                .id(employee.getId())
                .employeeCode(employee.getEmployeeCode())
                .name(employee.getName())
                .email(employee.getEmail())
                .department(employee.getDepartment())
                .designation(employee.getDesignation())
                .joiningDate(employee.getJoiningDate())
                .leaveBalance(employee.getLeaveBalance())
                .build();
    }
}
