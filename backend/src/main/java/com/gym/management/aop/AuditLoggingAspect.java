package com.gym.management.aop;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gym.management.annotation.Loggable;
import com.gym.management.model.AuditLog;
import com.gym.management.model.User;
import com.gym.management.service.AuditLogService;
import com.gym.management.service.UserService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Aspect for automatic audit logging using @Loggable annotation
 * Provides comprehensive tracking of all application operations
 */
@Aspect
@Component
public class AuditLoggingAspect {

    private static final Logger logger = LoggerFactory.getLogger(AuditLoggingAspect.class);
    
    @Autowired
    private AuditLogService auditLogService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private static final int MAX_DETAILS_LENGTH = 4000;
    private static final Set<String> SENSITIVE_FIELDS = Set.of(
        "password", "ssn", "socialSecurityNumber", "creditCard", "cvv", 
        "pin", "secret", "token", "apiKey", "privateKey"
    );

    /**
     * Pointcut for all @Loggable annotated methods
     */
    @Pointcut("@annotation(com.gym.management.annotation.Loggable)")
    public void loggableMethod() {}

    /**
     * Pointcut for all methods in @Loggable annotated classes
     */
    @Pointcut("@within(com.gym.management.annotation.Loggable)")
    public void loggableClass() {}

    /**
     * Before advice - Log method execution start
     */
    @Before("loggableMethod() || loggableClass()")
    public void logBefore(JoinPoint joinPoint) {
        try {
            Loggable annotation = getLoggableAnnotation(joinPoint);
            if (annotation != null && shouldLogBefore(annotation)) {
                logOperation(joinPoint, annotation, "STARTED", null, null);
            }
        } catch (Exception e) {
            logger.error("Error in before audit logging", e);
        }
    }

    /**
     * After returning advice - Log successful method execution
     */
    @AfterReturning(pointcut = "loggableMethod() || loggableClass()", returning = "result")
    public void logAfterReturning(JoinPoint joinPoint, Object result) {
        try {
            Loggable annotation = getLoggableAnnotation(joinPoint);
            if (annotation != null) {
                logOperation(joinPoint, annotation, "COMPLETED", result, null);
            }
        } catch (Exception e) {
            logger.error("Error in after returning audit logging", e);
        }
    }

    /**
     * After throwing advice - Log failed method execution
     */
    @AfterThrowing(pointcut = "loggableMethod() || loggableClass()", throwing = "exception")
    public void logAfterThrowing(JoinPoint joinPoint, Throwable exception) {
        try {
            Loggable annotation = getLoggableAnnotation(joinPoint);
            if (annotation != null) {
                logOperation(joinPoint, annotation, "FAILED", null, exception);
            }
        } catch (Exception e) {
            logger.error("Error in after throwing audit logging", e);
        }
    }

    /**
     * Main logging method
     */
    private void logOperation(JoinPoint joinPoint, Loggable annotation, String status, 
                            Object result, Throwable exception) {
        
        try {
            // Get current user
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                logger.debug("No authenticated user found for audit logging");
                return;
            }

            // Get request context
            HttpServletRequest request = getCurrentRequest();
            String ipAddress = getClientIpAddress(request);

            // Build log details
            String action = buildActionName(joinPoint, annotation);
            String entity = buildEntityName(joinPoint, annotation);
            String details = buildDetails(joinPoint, annotation, status, result, exception);
            String changes = buildChanges(joinPoint, annotation, result);
            String severity = determineSeverity(annotation, exception);

            // Get primary role and gym from user
            String primaryRole = currentUser.getRoles().isEmpty() ? "USER" : 
                currentUser.getRoles().iterator().next().getRoleName();
            
            // Create audit log using the existing service method
            auditLogService.logAction(
                action + "_" + status,
                entity,
                extractEntityId(joinPoint),
                extractEntityName(joinPoint),
                currentUser.getUserId(),
                null, // gymId - will be set by service if available
                details,
                severity,
                ipAddress,
                detectDeviceType(request),
                detectBrowser(request),
                detectOS(request),
                request != null ? request.getSession().getId() : null,
                changes
            );
            
            logger.debug("Audit log created for action: {} by user: {}", action, currentUser.getUsername());
            
        } catch (Exception e) {
            logger.error("Error creating audit log for method: {}", joinPoint.getSignature().getName(), e);
        }
    }

    /**
     * Get @Loggable annotation from join point
     */
    private Loggable getLoggableAnnotation(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        
        // Check method annotation first
        Loggable annotation = method.getAnnotation(Loggable.class);
        if (annotation != null) {
            return annotation;
        }
        
        // Check class annotation
        return method.getDeclaringClass().getAnnotation(Loggable.class);
    }

    /**
     * Build action name
     */
    private String buildActionName(JoinPoint joinPoint, Loggable annotation) {
        if (!annotation.action().isEmpty()) {
            return annotation.action();
        }
        
        String methodName = joinPoint.getSignature().getName();
        // Convert method name to action name (e.g., "updateUser" -> "UPDATE_USER")
        return methodName.replaceAll("([a-z])([A-Z])", "$1_$2").toUpperCase();
    }

    /**
     * Build entity name
     */
    private String buildEntityName(JoinPoint joinPoint, Loggable annotation) {
        if (!annotation.entity().isEmpty()) {
            return annotation.entity();
        }
        
        // Extract entity name from method or class name
        String className = joinPoint.getTarget().getClass().getSimpleName();
        if (className.endsWith("Service")) {
            className = className.substring(0, className.length() - 7);
        }
        return className.toUpperCase();
    }

    /**
     * Build detailed description
     */
    private String buildDetails(JoinPoint joinPoint, Loggable annotation, String status, 
                               Object result, Throwable exception) {
        StringBuilder details = new StringBuilder();
        
        details.append("Method: ").append(joinPoint.getSignature().getName());
        details.append(" | Status: ").append(status);
        
        // Add parameters if enabled
        if (annotation.logParameters()) {
            Object[] args = joinPoint.getArgs();
            if (args.length > 0) {
                details.append(" | Parameters: ");
                for (int i = 0; i < args.length; i++) {
                    if (i > 0) details.append(", ");
                    String paramValue = formatParameter(args[i], annotation);
                    details.append(paramValue);
                }
            }
        }
        
        // Add result if enabled
        if (annotation.logReturnValue() && result != null && status.equals("COMPLETED")) {
            details.append(" | Result: ").append(formatResult(result, annotation));
        }
        
        // Add exception details if failed
        if (exception != null) {
            details.append(" | Error: ").append(exception.getMessage());
        }
        
        // Truncate if too long
        String resultStr = details.toString();
        if (resultStr.length() > MAX_DETAILS_LENGTH) {
            resultStr = resultStr.substring(0, MAX_DETAILS_LENGTH) + "... (truncated)";
        }
        
        return resultStr;
    }

    /**
     * Build changes JSON for update operations
     */
    private String buildChanges(JoinPoint joinPoint, Loggable annotation, Object result) {
        if (!annotation.trackChanges() || result == null) {
            return null;
        }
        
        try {
            // This is a simplified implementation
            // In a real implementation, you might compare old and new states
            Map<String, Object> changes = new HashMap<>();
            changes.put("result", formatResult(result, annotation));
            return objectMapper.writeValueAsString(changes);
        } catch (Exception e) {
            logger.error("Error building changes JSON", e);
            return null;
        }
    }

    /**
     * Format parameter for logging
     */
    private String formatParameter(Object param, Loggable annotation) {
        if (param == null) {
            return "null";
        }
        
        try {
            // Check for sensitive fields
            String paramStr = objectMapper.writeValueAsString(param);
            
            // Mask sensitive data
            if (!annotation.includeSensitiveData()) {
                for (String sensitiveField : SENSITIVE_FIELDS) {
                    paramStr = paramStr.replaceAll("\"" + sensitiveField + "\"\\s*:\\s*\"[^\"]*\"", 
                                                   "\"" + sensitiveField + "\"\"***MASKED***\"");
                }
            }
            
            // Truncate if too long
            if (paramStr.length() > annotation.maxParameterLength()) {
                paramStr = paramStr.substring(0, annotation.maxParameterLength()) + "...";
            }
            
            return paramStr;
        } catch (Exception e) {
            return param.getClass().getSimpleName() + "[serialization error]";
        }
    }

    /**
     * Format result for logging
     */
    private String formatResult(Object result, Loggable annotation) {
        if (result == null) {
            return "null";
        }
        
        try {
            String resultStr = objectMapper.writeValueAsString(result);
            
            // Truncate large results
            if (resultStr.length() > annotation.maxParameterLength()) {
                resultStr = resultStr.substring(0, annotation.maxParameterLength()) + "...";
            }
            
            return resultStr;
        } catch (Exception e) {
            return result.getClass().getSimpleName() + "[serialization error]";
        }
    }

    /**
     * Determine severity level
     */
    private String determineSeverity(Loggable annotation, Throwable exception) {
        if (exception != null) {
            return "high";
        }
        return annotation.severity();
    }

    /**
     * Extract entity ID from method parameters
     */
    private String extractEntityId(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] paramNames = signature.getParameterNames();
        
        for (int i = 0; i < args.length; i++) {
            if (paramNames[i].toLowerCase().contains("id") && args[i] != null) {
                return args[i].toString();
            }
        }
        return null;
    }

    /**
     * Extract entity name from method parameters
     */
    private String extractEntityName(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] paramNames = signature.getParameterNames();
        
        for (int i = 0; i < args.length; i++) {
            if (paramNames[i].toLowerCase().contains("name") && args[i] != null) {
                return args[i].toString();
            }
        }
        return null;
    }

    /**
     * Get current authenticated user
     */
    private User getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof com.gym.management.security.CustomUserDetails) {
                com.gym.management.security.CustomUserDetails userDetails = 
                    (com.gym.management.security.CustomUserDetails) authentication.getPrincipal();
                return userDetails.getUser();
            }
        } catch (Exception e) {
            logger.error("Error getting current user", e);
        }
        return null;
    }

    /**
     * Get current HTTP request
     */
    private HttpServletRequest getCurrentRequest() {
        try {
            ServletRequestAttributes attributes = 
                (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            return attributes.getRequest();
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Get client IP address
     */
    private String getClientIpAddress(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }
        
        String[] headerNames = {
            "X-Forwarded-For",
            "X-Real-IP",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED",
            "HTTP_VIA",
            "REMOTE_ADDR"
        };
        
        for (String header : headerNames) {
            String value = request.getHeader(header);
            if (value != null && !value.isEmpty() && !"unknown".equalsIgnoreCase(value)) {
                // Handle multiple IPs in X-Forwarded-For
                if (value.contains(",")) {
                    value = value.split(",")[0].trim();
                }
                return value;
            }
        }
        
        return request.getRemoteAddr();
    }

    /**
     * Detect device type from request
     */
    private String detectDeviceType(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null) {
            return "unknown";
        }
        
        userAgent = userAgent.toLowerCase();
        
        if (userAgent.contains("mobile")) {
            return "mobile";
        } else if (userAgent.contains("tablet") || userAgent.contains("ipad")) {
            return "tablet";
        } else {
            return "desktop";
        }
    }

    /**
     * Detect browser from request
     */
    private String detectBrowser(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null) {
            return "unknown";
        }
        
        userAgent = userAgent.toLowerCase();
        
        if (userAgent.contains("chrome")) {
            return "Chrome";
        } else if (userAgent.contains("firefox")) {
            return "Firefox";
        } else if (userAgent.contains("safari") && !userAgent.contains("chrome")) {
            return "Safari";
        } else if (userAgent.contains("edge")) {
            return "Edge";
        } else if (userAgent.contains("opera")) {
            return "Opera";
        } else {
            return "Other";
        }
    }

    /**
     * Detect OS from request
     */
    private String detectOS(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null) {
            return "unknown";
        }
        
        userAgent = userAgent.toLowerCase();
        
        if (userAgent.contains("windows")) {
            return "Windows";
        } else if (userAgent.contains("mac")) {
            return "macOS";
        } else if (userAgent.contains("linux")) {
            return "Linux";
        } else if (userAgent.contains("android")) {
            return "Android";
        } else if (userAgent.contains("iphone") || userAgent.contains("ipad")) {
            return "iOS";
        } else {
            return "Other";
        }
    }

    /**
     * Check if should log before method execution
     */
    private boolean shouldLogBefore(Loggable annotation) {
        // You can add custom logic here based on the annotation
        return true;
    }
}