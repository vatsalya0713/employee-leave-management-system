package com.leavemanagement.repository;

import com.leavemanagement.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {
    
    Optional<Employee> findByEmail(String email);
    
    Optional<Employee> findByEmployeeCode(String employeeCode);
    
    Boolean existsByEmployeeCode(String employeeCode);
    
    Boolean existsByEmail(String email);
}
