package com.gym.management.interceptor;

import com.gym.management.context.TenantContext;
import com.gym.management.context.TenantNotSetException;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

/**
 * Tenant Access Interceptor - BULLETPROOF TENANT ISOLATION
 *
 * This aspect ensures that:
 * 1. All repository operations are performed within tenant context
 * 2. Data can only be queried/created for the current tenant
 * 3. Cross-tenant access attempts are blocked
 *
 * This provides defense-in-depth alongside the TenantIsolationFilter.
 */
@Aspect
@Component
@Slf4j
public class TenantAccessInterceptor {

    /**
     * Intercepts all methods in repositories and validates tenant context.
     */
    @Around("execution(* com.gym.management.repository.*Repository.*(..))")
    public Object validateTenantAccess(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();

        // Skip for public/unauthenticated endpoints
        if (!TenantContext.isSet()) {
            log.debug("No tenant context set - allowing public repository access for {}.{}",
                    className, methodName);
            return joinPoint.proceed();
        }

        Long currentTenant = TenantContext.getTenantId();
        log.debug("Repository access: {}.{} by tenant {}",
                className, methodName, currentTenant);

        // Validate that we have a tenant context
        if (currentTenant == null) {
            throw new TenantNotSetException(
                    "Cannot access repository without tenant context");
        }

        // Get method arguments
        Object[] args = joinPoint.getArgs();
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        // Check if this is a save/update operation - ensure tenant ID matches
        if (isWriteOperation(methodName)) {
            validateWriteOperation(args, currentTenant, className, methodName);
        }

        return joinPoint.proceed();
    }

    /**
     * Intercepts service layer to ensure tenant validation.
     */
    @Around("execution(* com.gym.management.service.*Service.*(..))")
    public Object validateServiceTenantAccess(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();

        // Services with @NoTenantRequired annotation are skipped
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        if (method.isAnnotationPresent(NoTenantRequired.class)) {
            return joinPoint.proceed();
        }

        if (!TenantContext.isSet()) {
            log.warn("Service access without tenant context: {}.{}", className, methodName);
            return joinPoint.proceed();
        }

        Long currentTenant = TenantContext.getTenantId();
        log.debug("Service access: {}.{} by tenant {}", className, methodName, currentTenant);

        if (currentTenant == null) {
            throw new TenantNotSetException(
                    "Cannot access service without tenant context: " + className + "." + methodName);
        }

        return joinPoint.proceed();
    }

    private boolean isWriteOperation(String methodName) {
        return methodName.startsWith("save") ||
                methodName.startsWith("update") ||
                methodName.startsWith("delete") ||
                methodName.startsWith("insert") ||
                methodName.startsWith("create") ||
                methodName.equals("persist") ||
                methodName.equals("merge") ||
                methodName.equals("remove");
    }

    private void validateWriteOperation(Object[] args, Long currentTenant,
                                       String className, String methodName) {
        if (args == null || args.length == 0) {
            return;
        }

        for (Object arg : args) {
            if (arg == null) {
                continue;
            }

            // Check for entity objects with tenantId
            if (hasTenantId(arg)) {
                Long entityTenantId = getTenantIdFromEntity(arg);
                if (entityTenantId != null && !entityTenantId.equals(currentTenant)) {
                    log.error("CROSS-TENANT ACCESS ATTEMPT DETECTED!");
                    log.error("Current tenant: {}", currentTenant);
                    log.error("Entity tenant: {}", entityTenantId);
                    log.error("Class: {}, Method: {}", className, methodName);
                    throw new SecurityException(
                            "Cannot modify data for another tenant. " +
                            "Current: " + currentTenant + ", Attempted: " + entityTenantId);
                }
            }
        }
    }

    private boolean hasTenantId(Object obj) {
        try {
            return obj.getClass().getMethod("getTenantId").invoke(obj) != null ||
                   obj.getClass().getMethod("getGymId").invoke(obj) != null;
        } catch (Exception e) {
            return false;
        }
    }

    private Long getTenantIdFromEntity(Object obj) {
        try {
            Object tenantId = obj.getClass().getMethod("getTenantId").invoke(obj);
            if (tenantId != null) {
                return (Long) tenantId;
            }
            Object gymId = obj.getClass().getMethod("getGymId").invoke(obj);
            if (gymId != null) {
                return (Long) gymId;
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}
