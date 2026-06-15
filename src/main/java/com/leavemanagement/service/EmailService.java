package com.leavemanagement.service;

import com.leavemanagement.entity.LeaveRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@leavemanagement.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            logger.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            logger.error("Failed to send email to {}", to, e);
        }
    }

    // Email notification when a leave request is applied
    public void sendLeaveAppliedEmail(LeaveRequest leaveRequest) {
        String employeeEmail = leaveRequest.getEmployee().getEmail();
        String subject = "Leave Application Submitted - Pending Approval";
        String body = String.format(
                "Dear %s,\n\n" +
                "Your leave application has been submitted successfully.\n\n" +
                "Details:\n" +
                "- Leave Type: %s\n" +
                "- Start Date: %s\n" +
                "- End Date: %s\n" +
                "- Status: %s\n\n" +
                "You will be notified once a decision has been made.\n\n" +
                "Best regards,\n" +
                "Leave Management System",
                leaveRequest.getEmployee().getName(),
                leaveRequest.getLeaveType(),
                leaveRequest.getStartDate(),
                leaveRequest.getEndDate(),
                leaveRequest.getStatus()
        );
        sendEmail(employeeEmail, subject, body);
    }

    // Email notification when a leave request is approved
    public void sendLeaveApprovedEmail(LeaveRequest leaveRequest) {
        String employeeEmail = leaveRequest.getEmployee().getEmail();
        String subject = "Leave Application APPROVED";
        String body = String.format(
                "Dear %s,\n\n" +
                "We are pleased to inform you that your leave application has been APPROVED.\n\n" +
                "Details:\n" +
                "- Leave Type: %s\n" +
                "- Start Date: %s\n" +
                "- End Date: %s\n" +
                "- Status: APPROVED\n\n" +
                "Best regards,\n" +
                "Leave Management System",
                leaveRequest.getEmployee().getName(),
                leaveRequest.getLeaveType(),
                leaveRequest.getStartDate(),
                leaveRequest.getEndDate()
        );
        sendEmail(employeeEmail, subject, body);
    }

    // Email notification when a leave request is rejected
    public void sendLeaveRejectedEmail(LeaveRequest leaveRequest) {
        String employeeEmail = leaveRequest.getEmployee().getEmail();
        String subject = "Leave Application REJECTED";
        String body = String.format(
                "Dear %s,\n\n" +
                "We regret to inform you that your leave application has been REJECTED.\n\n" +
                "Details:\n" +
                "- Leave Type: %s\n" +
                "- Start Date: %s\n" +
                "- End Date: %s\n" +
                "- Status: REJECTED\n\n" +
                "Please connect with your manager if you have any questions.\n\n" +
                "Best regards,\n" +
                "Leave Management System",
                leaveRequest.getEmployee().getName(),
                leaveRequest.getLeaveType(),
                leaveRequest.getStartDate(),
                leaveRequest.getEndDate()
        );
        sendEmail(employeeEmail, subject, body);
    }
}
