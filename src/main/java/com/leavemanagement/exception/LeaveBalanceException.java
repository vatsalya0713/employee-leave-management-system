package com.leavemanagement.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class LeaveBalanceException extends RuntimeException {

    public LeaveBalanceException(String message) {
        super(message);
    }
}
