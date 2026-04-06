package com.gym.management.context;

public class TenantNotSetException extends RuntimeException {
    public TenantNotSetException(String message) {
        super(message);
    }
}
