package com.gym.management.exception;

import com.gym.management.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;

import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.OptimisticLockException;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Global exception handler for consistent API error responses.
 * All exceptions are caught here and formatted into ErrorResponse.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handle entity not found exceptions (404)
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException ex, WebRequest request) {
        String traceId = generateTraceId();
        logger.warn("[{}] Entity not found: {}", traceId, ex.getMessage());

        ErrorResponse error = new ErrorResponse(false, "NOT_FOUND", ex.getMessage(), traceId);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Handle validation errors (400)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, WebRequest request) {
        String traceId = generateTraceId();
        
        // Collect all validation errors
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining("; "));
        
        String message = errors.isEmpty() ? "Validation failed" : errors;

        logger.warn("[{}] Validation error: {}", traceId, message);

        ErrorResponse error = new ErrorResponse(false, "VALIDATION_ERROR", message, traceId);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle optimistic locking conflicts (409)
     */
    @ExceptionHandler(OptimisticLockException.class)
    public ResponseEntity<ErrorResponse> handleOptimisticLock(OptimisticLockException ex, WebRequest request) {
        String traceId = generateTraceId();
        logger.warn("[{}] Optimistic lock exception: {}", traceId, ex.getMessage());

        ErrorResponse error = new ErrorResponse(
                false, 
                "CONFLICT", 
                "The resource was modified by another user. Please refresh and try again.", 
                traceId
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    /**
     * Handle bad request / illegal arguments (400)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException ex, WebRequest request) {
        String traceId = generateTraceId();
        logger.warn("[{}] Bad request: {}", traceId, ex.getMessage());

        ErrorResponse error = new ErrorResponse(false, "BAD_REQUEST", ex.getMessage(), traceId);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle authentication errors (401)
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex, WebRequest request) {
        String traceId = generateTraceId();
        logger.warn("[{}] Authentication failed", traceId);

        ErrorResponse error = new ErrorResponse(false, "UNAUTHORIZED", "Invalid credentials", traceId);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    /**
     * Handle access denied exceptions (403)
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, WebRequest request) {
        String traceId = generateTraceId();
        logger.warn("[{}] Access denied: {}", traceId, ex.getMessage());

        ErrorResponse error = new ErrorResponse(false, "FORBIDDEN", "Access denied", traceId);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    /**
     * Catch-all handler for unexpected exceptions (500)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAll(Exception ex, WebRequest request) {
        String traceId = generateTraceId();
        logger.error("[{}] Unexpected error: {}", traceId, ex.getMessage(), ex);

        // Don't expose internal error details to client
        ErrorResponse error = new ErrorResponse(
                false,
                "INTERNAL_ERROR",
                "An unexpected error occurred. Please try again later.",
                traceId);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    /**
     * Generate short trace ID for error tracking
     */
    private String generateTraceId() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
