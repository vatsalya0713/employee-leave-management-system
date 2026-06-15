package com.leavemanagement.controller;

import com.leavemanagement.dto.LeaveResponseDto;
import com.leavemanagement.service.LeaveRequestService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/manager")
@PreAuthorize("hasRole('MANAGER')")
public class ManagerController {

    private final LeaveRequestService leaveRequestService;

    public ManagerController(LeaveRequestService leaveRequestService) {
        this.leaveRequestService = leaveRequestService;
    }

    @GetMapping("/pending-leaves")
    public ResponseEntity<Page<LeaveResponseDto>> getPendingLeaves(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? 
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<LeaveResponseDto> pendingLeaves = leaveRequestService.getPendingLeaves(pageable);
        return ResponseEntity.ok(pendingLeaves);
    }

    @PutMapping("/approve/{leaveId}")
    public ResponseEntity<LeaveResponseDto> approveLeave(@PathVariable Long leaveId) {
        LeaveResponseDto approved = leaveRequestService.approveLeave(leaveId);
        return ResponseEntity.ok(approved);
    }

    @PutMapping("/reject/{leaveId}")
    public ResponseEntity<LeaveResponseDto> rejectLeave(@PathVariable Long leaveId) {
        LeaveResponseDto rejected = leaveRequestService.rejectLeave(leaveId);
        return ResponseEntity.ok(rejected);
    }
}
