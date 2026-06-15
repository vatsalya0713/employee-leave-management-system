package com.leavemanagement.service;

import com.leavemanagement.dto.LeaveRequestDto;
import com.leavemanagement.dto.LeaveResponseDto;
import com.leavemanagement.entity.Employee;
import com.leavemanagement.entity.LeaveRequest;
import com.leavemanagement.entity.LeaveStatus;
import com.leavemanagement.entity.LeaveType;
import com.leavemanagement.exception.BadRequestException;
import com.leavemanagement.exception.LeaveBalanceException;
import com.leavemanagement.exception.ResourceNotFoundException;
import com.leavemanagement.exception.UnauthorizedException;
import com.leavemanagement.repository.EmployeeRepository;
import com.leavemanagement.repository.LeaveRequestRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final EmailService emailService;

    public LeaveRequestService(LeaveRequestRepository leaveRequestRepository,
                               EmployeeRepository employeeRepository,
                               EmailService emailService) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.employeeRepository = employeeRepository;
        this.emailService = emailService;
    }

    private Employee getEmployeeForUser(String email) {
        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "email", email));
    }

    @Transactional
    public LeaveResponseDto applyLeave(LeaveRequestDto dto, String email) {
        Employee employee = getEmployeeForUser(email);

        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date.");
        }

        long totalDays = ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate()) + 1;

        if (totalDays > employee.getLeaveBalance()) {
            throw new LeaveBalanceException(String.format("Insufficient leave balance. Requested: %d days, Available: %d days", totalDays, employee.getLeaveBalance()));
        }

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employee(employee)
                .leaveType(dto.getLeaveType())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .reason(dto.getReason())
                .status(LeaveStatus.PENDING)
                .build();

        LeaveRequest savedRequest = leaveRequestRepository.save(leaveRequest);

        // Send email notification
        emailService.sendLeaveAppliedEmail(savedRequest);

        return mapToResponseDto(savedRequest);
    }

    public List<LeaveResponseDto> getMyLeaves(String email) {
        Employee employee = getEmployeeForUser(email);
        List<LeaveRequest> requests = leaveRequestRepository.findByEmployeeId(employee.getId());
        return requests.stream().map(this::mapToResponseDto).toList();
    }

    @Transactional
    public void cancelLeave(Long leaveId, String email) {
        Employee employee = getEmployeeForUser(email);
        LeaveRequest request = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", leaveId));

        if (!request.getEmployee().getId().equals(employee.getId())) {
            throw new UnauthorizedException("You are not authorized to cancel this leave request.");
        }

        if (request.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Only pending leave requests can be cancelled.");
        }

        leaveRequestRepository.delete(request);
    }

    // Manager Workflow
    public Page<LeaveResponseDto> getPendingLeaves(Pageable pageable) {
        Specification<LeaveRequest> spec = (root, query, cb) -> cb.equal(root.get("status"), LeaveStatus.PENDING);
        return leaveRequestRepository.findAll(spec, pageable).map(this::mapToResponseDto);
    }

    @Transactional
    public LeaveResponseDto approveLeave(Long leaveId) {
        LeaveRequest request = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", leaveId));

        if (request.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Leave request is already " + request.getStatus());
        }

        Employee employee = request.getEmployee();
        long totalDays = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;

        if (totalDays > employee.getLeaveBalance()) {
            throw new LeaveBalanceException(String.format("Cannot approve. Insufficient balance: Employee only has %d days, request requires %d days.", employee.getLeaveBalance(), totalDays));
        }

        // Deduct balance on approval
        employee.setLeaveBalance(employee.getLeaveBalance() - (int) totalDays);
        employeeRepository.save(employee);

        // Change Status
        request.setStatus(LeaveStatus.APPROVED);
        LeaveRequest savedRequest = leaveRequestRepository.save(request);

        // Send Email
        emailService.sendLeaveApprovedEmail(savedRequest);

        return mapToResponseDto(savedRequest);
    }

    @Transactional
    public LeaveResponseDto rejectLeave(Long leaveId) {
        LeaveRequest request = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", leaveId));

        if (request.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Leave request is already " + request.getStatus());
        }

        // Change Status
        request.setStatus(LeaveStatus.REJECTED);
        LeaveRequest savedRequest = leaveRequestRepository.save(request);

        // Send Email
        emailService.sendLeaveRejectedEmail(savedRequest);

        return mapToResponseDto(savedRequest);
    }

    // Admin APIs
    public Page<LeaveResponseDto> getAllLeaves(Pageable pageable) {
        return leaveRequestRepository.findAll(pageable).map(this::mapToResponseDto);
    }

    @Transactional
    public void updateLeaveBalance(Long employeeId, Integer newBalance) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        employee.setLeaveBalance(newBalance);
        employeeRepository.save(employee);
    }

    // Paginated dynamic search for leaves by status or leaveType
    public Page<LeaveResponseDto> searchLeaves(LeaveStatus status, LeaveType leaveType, Pageable pageable) {
        Specification<LeaveRequest> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (leaveType != null) {
                predicates.add(cb.equal(root.get("leaveType"), leaveType));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return leaveRequestRepository.findAll(spec, pageable).map(this::mapToResponseDto);
    }

    private LeaveResponseDto mapToResponseDto(LeaveRequest request) {
        long totalDays = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        return LeaveResponseDto.builder()
                .id(request.getId())
                .employeeId(request.getEmployee().getId())
                .employeeName(request.getEmployee().getName())
                .leaveType(request.getLeaveType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalDays(totalDays)
                .reason(request.getReason())
                .status(request.getStatus())
                .appliedDate(request.getAppliedDate())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }
}
