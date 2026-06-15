package com.leavemanagement.dto;

import com.leavemanagement.entity.LeaveStatus;
import com.leavemanagement.entity.LeaveType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveResponseDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private long totalDays;
    private String reason;
    private LeaveStatus status;
    private LocalDateTime appliedDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
