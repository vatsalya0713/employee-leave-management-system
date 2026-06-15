package com.leavemanagement.controller;

import com.leavemanagement.dto.LeaveRequestDto;
import com.leavemanagement.dto.LeaveResponseDto;
import com.leavemanagement.entity.LeaveStatus;
import com.leavemanagement.entity.LeaveType;
import com.leavemanagement.service.LeaveRequestService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    public LeaveRequestController(LeaveRequestService leaveRequestService) {
        this.leaveRequestService = leaveRequestService;
    }

    @PostMapping
    public ResponseEntity<LeaveResponseDto> applyLeave(@Valid @RequestBody LeaveRequestDto dto, Principal principal) {
        LeaveResponseDto response = leaveRequestService.applyLeave(dto, principal.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my-leaves")
    public ResponseEntity<List<LeaveResponseDto>> getMyLeaves(Principal principal) {
        List<LeaveResponseDto> response = leaveRequestService.getMyLeaves(principal.getName());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/cancel/{leaveId}")
    public ResponseEntity<String> cancelLeave(@PathVariable Long leaveId, Principal principal) {
        leaveRequestService.cancelLeave(leaveId, principal.getName());
        return ResponseEntity.ok("Leave request cancelled successfully.");
    }

    @GetMapping("/search")
    public ResponseEntity<Page<LeaveResponseDto>> searchLeaves(
            @RequestParam(required = false) LeaveStatus status,
            @RequestParam(required = false) LeaveType leaveType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? 
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<LeaveResponseDto> results = leaveRequestService.searchLeaves(status, leaveType, pageable);
        return ResponseEntity.ok(results);
    }
}
