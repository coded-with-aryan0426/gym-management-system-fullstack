package com.gym.management.dto;

import java.time.LocalDateTime;

/**
 * Standard error response envelope for all API errors.
 * Provides consistent error format with tracing support.
 */
public class ErrorResponse {
    private boolean success;
    private String code;
    private String message;
    private String traceId;
    private LocalDateTime timestamp;

    public ErrorResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponse(boolean success, String code, String message, String traceId) {
        this.success = success;
        this.code = code;
        this.message = message;
        this.traceId = traceId;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getTraceId() {
        return traceId;
    }

    public void setTraceId(String traceId) {
        this.traceId = traceId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
