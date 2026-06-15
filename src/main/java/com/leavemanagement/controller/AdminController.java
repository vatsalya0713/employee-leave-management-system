package com.leavemanagement.controller;

import com.leavemanagement.dto.LeaveResponseDto;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.service.EmployeeService;
import com.leavemanagement.service.LeaveRequestService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final EmployeeService employeeService;
    private final LeaveRequestService leaveRequestService;

    public AdminController(EmployeeService employeeService, LeaveRequestService leaveRequestService) {
        this.employeeService = employeeService;
        this.leaveRequestService = leaveRequestService;
    }

    @GetMapping("/employees")
    public ResponseEntity<Page<Employee>> getAllEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? 
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(employeeService.getAllEmployees(pageable));
    }

    @GetMapping("/leaves")
    public ResponseEntity<Page<LeaveResponseDto>> getAllLeaves(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? 
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(leaveRequestService.getAllLeaves(pageable));
    }

    @PutMapping("/update-balance/{employeeId}")
    public ResponseEntity<String> updateLeaveBalance(
            @PathVariable Long employeeId,
            @RequestParam Integer balance) {
        
        leaveRequestService.updateLeaveBalance(employeeId, balance);
        return ResponseEntity.ok("Employee leave balance updated successfully to " + balance);
    }

    @DeleteMapping("/delete/{employeeId}")
    public ResponseEntity<String> deleteEmployee(@PathVariable Long employeeId) {
        employeeService.deleteEmployee(employeeId);
        return ResponseEntity.ok("Employee deleted successfully by admin.");
    }
}
