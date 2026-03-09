package com.example.task1.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),

    // Authentication errors (1xxx)
    USER_NOT_FOUND(1001, "User not found", HttpStatus.NOT_FOUND),
    INVALID_CREDENTIALS(1002, "Invalid credentials", HttpStatus.UNAUTHORIZED),
    TOKEN_GENERATION_FAILED(1003, "Token generation failed", HttpStatus.INTERNAL_SERVER_ERROR),
    TOKEN_INVALID(1004, "Token is invalid or expired", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED(1005, "Token has expired", HttpStatus.UNAUTHORIZED),

    // User errors (2xxx)
    USERNAME_ALREADY_EXISTS(2001, "Username already exists", HttpStatus.CONFLICT),
    EMAIL_ALREADY_EXISTS(2002, "Email already exists", HttpStatus.CONFLICT),

    // Product errors (3xxx)
    PRODUCT_NOT_FOUND(3001, "Product not found", HttpStatus.NOT_FOUND),
    NOT_PRODUCT_OWNER(3002, "You are not the owner of this product", HttpStatus.FORBIDDEN),

    // Approval errors (4xxx)
    APPROVAL_NOT_FOUND(4001, "Approval request not found", HttpStatus.NOT_FOUND),
    APPROVER_NOT_FOUND(4002, "Approver not found", HttpStatus.NOT_FOUND),
    PRODUCTS_NOT_FOUND(4003, "No products found with given ids", HttpStatus.NOT_FOUND),
    NOT_APPROVER_OF_REQUEST(4004, "You are not the approver of this request", HttpStatus.FORBIDDEN),
    APPROVAL_ALREADY_PROCESSED(4005, "This request has already been processed", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_STOCK(4006, "Insufficient stock for product", HttpStatus.BAD_REQUEST),
    STEP_NOT_WAITING(4007, "This step is not waiting for approval", HttpStatus.BAD_REQUEST),

    // Workflow errors (8xxx)
    WORKFLOW_NOT_FOUND(8001, "Workflow template not found", HttpStatus.NOT_FOUND),
    WORKFLOW_NAME_EXISTS(8002, "Workflow template name already exists", HttpStatus.CONFLICT),
    WORKFLOW_NO_STEPS(8003, "Workflow template must have at least one step", HttpStatus.BAD_REQUEST),
    WORKFLOW_IN_USE(8004, "Cannot delete workflow template that is in use", HttpStatus.BAD_REQUEST),

    // Notification errors (6xxx)
    NOTIFICATION_NOT_FOUND(6001, "Notification not found", HttpStatus.NOT_FOUND),

    // Authorization errors (7xxx)
    UNAUTHORIZED(7001, "You are not authorized to perform this action", HttpStatus.FORBIDDEN),

    // Validation errors (5xxx)
    INVALID_KEY(5001, "Invalid message key", HttpStatus.BAD_REQUEST),
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}
