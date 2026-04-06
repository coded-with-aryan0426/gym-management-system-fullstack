package com.gym.management.context;

import org.springframework.stereotype.Component;

@Component
public class TenantContext {

    private static final ThreadLocal<Long> currentTenant = new ThreadLocal<>();
    private static final ThreadLocal<String> currentTenantCode = new ThreadLocal<>();

    public static void setTenantId(Long tenantId) {
        currentTenant.set(tenantId);
    }

    public static Long getTenantId() {
        return currentTenant.get();
    }

    public static void setTenantCode(String tenantCode) {
        currentTenantCode.set(tenantCode);
    }

    public static String getTenantCode() {
        return currentTenantCode.get();
    }

    public static void clear() {
        currentTenant.remove();
        currentTenantCode.remove();
    }

    public static boolean isSet() {
        return currentTenant.get() != null;
    }

    public static Long requireTenantId() {
        Long tenantId = getTenantId();
        if (tenantId == null) {
            throw new TenantNotSetException("No tenant context is set for this request");
        }
        return tenantId;
    }
}
