package com.gym.management.aop;

import com.gym.management.annotation.Loggable;
import com.gym.management.dto.AuditLogDTO;
import com.gym.management.model.AuditLog;
import com.gym.management.model.User;
import com.gym.management.service.AuditLogService;
import com.gym.management.service.UserService;
import com.gym.management.security.CustomUserDetails;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Enhanced AOP aspect for comprehensive audit logging
 * Provides micro-level change tracking and detailed logging capabilities
 */
@Aspect
@Component
public class EnhancedAuditLoggingAspect {

    private static final Logger logger = LoggerFactory.getLogger(EnhancedAuditLoggingAspect.class);

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private EntityChangeTracker changeTracker;

    @Autowired
    private ObjectMapper objectMapper;

    // Thread-local storage for entity snapshots (actual entity objects, not JSON)
    private final ThreadLocal<Map<String, Object>> entitySnapshots = ThreadLocal.withInitial(ConcurrentHashMap::new);

    // Thread-local storage for execution timing
    private final ThreadLocal<Map<String, Long>> executionTimers = ThreadLocal.withInitial(ConcurrentHashMap::new);

    // Thread-local flag to prevent recursive logging
    private final ThreadLocal<Boolean> isLogging = ThreadLocal.withInitial(() -> false);

    /**
     * Pointcut for all @Loggable annotated methods
     */
    @Pointcut("@annotation(loggable)")
    public void loggableMethod(Loggable loggable) {}

    /**
     * Pointcut for all methods in @Loggable annotated classes
     */
    @Pointcut("@within(loggable)")
    public void loggableClass(Loggable loggable) {}

    /**
     * Pointcut for service layer methods
     */
    @Pointcut("execution(* com.gym.management.service.*.*(..)) && !execution(* com.gym.management.service.AuditLogService.*(..))")
    public void serviceLayer() {}

    /**
     * Pointcut for repository layer methods
     */
    @Pointcut("execution(* com.gym.management.repository.*.*(..))")
    public void repositoryLayer() {}

    /**
     * Pointcut for controller layer methods
     */
    @Pointcut("execution(* com.gym.management.controller.*.*(..))")
    public void controllerLayer() {}

    /**
     * Around advice for comprehensive logging
     */
    @Around("loggableMethod(loggable) || loggableClass(loggable)")
    public Object logAround(ProceedingJoinPoint joinPoint, Loggable loggable) throws Throwable {
        String methodSignature = joinPoint.getSignature().toShortString();
        String requestId = generateRequestId();
        
        logger.debug("Starting audit logging for: {}", methodSignature);
        
        // Start timing
        long startTime = System.currentTimeMillis();
        executionTimers.get().put(requestId, startTime);
        
        // Take entity snapshots if change tracking is enabled
        if (loggable.trackChanges()) {
            takeEntitySnapshots(joinPoint, loggable);
        }
        
        Object result = null;
        Exception thrownException = null;
        
        try {
            result = joinPoint.proceed();
            return result;
        } catch (Exception ex) {
            thrownException = ex;
            throw ex;
        } finally {
            try {
                // Calculate execution time
                long executionTime = System.currentTimeMillis() - startTime;
                
                // Log the operation
                logOperation(joinPoint, loggable, result, thrownException, requestId, executionTime);
                
                // Clean up thread-local storage
                cleanupThreadLocal(requestId);
                
            } catch (Exception loggingEx) {
                logger.error("Error during audit logging", loggingEx);
            }
        }
    }

    /**
     * After advice for service layer methods
     */
    @AfterReturning(pointcut = "serviceLayer()", returning = "result")
    public void logServiceOperation(JoinPoint joinPoint, Object result) {
        // Auto-detect service operations that should be logged
        if (shouldAutoLog(joinPoint)) {
            logAutoDetectedOperation(joinPoint, result, null, "SERVICE");
        }
    }

    /**
     * After throwing advice for service layer methods
     */
    @AfterThrowing(pointcut = "serviceLayer()", throwing = "exception")
    public void logServiceException(JoinPoint joinPoint, Exception exception) {
        if (shouldAutoLog(joinPoint)) {
            logAutoDetectedOperation(joinPoint, null, exception, "SERVICE");
        }
    }

    /**
     * After advice for repository layer methods
     */
    @AfterReturning(pointcut = "repositoryLayer()", returning = "result")
    public void logRepositoryOperation(JoinPoint joinPoint, Object result) {
        if (shouldAutoLog(joinPoint)) {
            logAutoDetectedOperation(joinPoint, result, null, "REPOSITORY");
        }
    }

    /**
     * After advice for controller layer methods
     */
    @AfterReturning(pointcut = "controllerLayer()", returning = "result")
    public void logControllerOperation(JoinPoint joinPoint, Object result) {
        if (shouldAutoLog(joinPoint)) {
            logAutoDetectedOperation(joinPoint, result, null, "CONTROLLER");
        }
    }

    /**
     * Main logging method for @Loggable annotated methods
     */
    private void logOperation(ProceedingJoinPoint joinPoint, Loggable loggable, 
                             Object result, Exception exception, String requestId, long executionTime) {
        
        try {
            // Get current user
            CustomUserDetails currentUser = getCurrentUser();
            if (currentUser == null) {
                logger.warn("No authenticated user found for audit logging");
                return;
            }

            // Extract method information
            String methodName = joinPoint.getSignature().getName();
            String className = joinPoint.getTarget().getClass().getSimpleName();
            String fullClassName = joinPoint.getTarget().getClass().getName();
            
            // Prevent circular dependency - skip logging AuditLogService operations
            if (fullClassName.equals("com.gym.management.service.AuditLogService")) {
                return;
            }
            String action = determineAction(loggable, methodName, exception);
            String entity = determineEntity(loggable, className, joinPoint);
            String severity = determineSeverity(loggable, exception, executionTime);

            // Get HTTP request details
            HttpServletRequest request = getCurrentHttpRequest();
            String ipAddress = getClientIpAddress(request);
            String sessionId = request != null ? request.getSession().getId() : null;

            // Build details
            String details = buildDetails(loggable, joinPoint, result, exception, executionTime);

            // Track changes if enabled
            String changes = null;
            if (loggable.trackChanges() && exception == null) {
                changes = trackEntityChanges(joinPoint, result, loggable);
            }

            // Build metadata
            String metadata = buildMetadata(loggable, joinPoint, requestId, executionTime);

            // Determine business impact
            String businessImpact = determineBusinessImpact(loggable, action, severity, exception);

            // Create audit log
            auditLogService.logAction(
                action,
                entity,
                extractEntityId(joinPoint, result),
                extractEntityName(joinPoint, result),
                currentUser.getId(),
                null, // gymId - will be set by service if available
                details,
                severity,
                ipAddress,
                detectDeviceType(request),
                detectBrowser(request),
                detectOS(request),
                sessionId,
                changes
            );

            logger.info("Audit log created for {}.{} - Action: {}, Entity: {}, Severity: {}",
                       className, methodName, action, entity, severity);

        } catch (Exception e) {
            logger.error("Failed to create audit log for {}.{}", 
                        joinPoint.getTarget().getClass().getSimpleName(),
                        joinPoint.getSignature().getName(), e);
        }
    }

    /**
     * Auto-detect and log operations without @Loggable annotation
     */
    private void logAutoDetectedOperation(JoinPoint joinPoint, Object result, 
                                         Exception exception, String layer) {
        // Prevent recursive logging
        if (isLogging.get()) {
            return;
        }
        
        try {
            // Set flag to prevent recursion
            isLogging.set(true);
            
            CustomUserDetails currentUser = getCurrentUser();
            if (currentUser == null) {
                return;
            }

            String methodName = joinPoint.getSignature().getName();
            String className = joinPoint.getTarget().getClass().getSimpleName();
            String fullClassName = joinPoint.getTarget().getClass().getName();
            
            // Skip logging system operations - explicitly exclude AuditLogService
            if (className.contains("AuditLog") || className.contains("Logging") || 
                fullClassName.equals("com.gym.management.service.AuditLogService")) {
                return;
            }

            // Determine if this is a significant operation
            if (isSignificantOperation(methodName)) {
                String action = methodName.toUpperCase();
                String entity = className.replace("Service", "").replace("Repository", "").replace("Controller", "");
                String severity = exception != null ? "error" : "info";
                
                HttpServletRequest request = getCurrentHttpRequest();
                String ipAddress = getClientIpAddress(request);
                
                String details = String.format("Auto-detected %s operation: %s.%s%s",
                                             layer.toLowerCase(), className, methodName,
                                             exception != null ? " - Failed: " + exception.getMessage() : " - Success");

                auditLogService.logAction(
                    action,
                    entity,
                    extractEntityId(joinPoint, result),
                    extractEntityName(joinPoint, result),
                    currentUser.getId(),
                    null,
                    details,
                    severity,
                    ipAddress,
                    detectDeviceType(request),
                    detectBrowser(request),
                    detectOS(request),
                    request != null ? request.getSession().getId() : null,
                    null
                );
            }
            
        } catch (Exception e) {
            logger.debug("Failed to auto-log operation: {}", e.getMessage());
        } finally {
            // Always reset the flag
            isLogging.set(false);
        }
    }

    /**
     * Take snapshots of entities before modification
     */
    private void takeEntitySnapshots(ProceedingJoinPoint joinPoint, Loggable loggable) {
        try {
            Object[] args = joinPoint.getArgs();
            String requestId = generateRequestId();
            
            for (int i = 0; i < args.length; i++) {
                Object arg = args[i];
                if (arg != null && isEntity(arg)) {
                    String snapshotKey = requestId + "_" + i;
                    // Store the actual entity object, not a JSON snapshot
                    entitySnapshots.get().put(snapshotKey, arg);
                }
            }
        } catch (Exception e) {
            logger.debug("Failed to take entity snapshots: {}", e.getMessage());
        }
    }

    /**
     * Track changes in entities
     */
    private String trackEntityChanges(ProceedingJoinPoint joinPoint, Object result, Loggable loggable) {
        try {
            String requestId = generateRequestId();
            Object[] args = joinPoint.getArgs();
            
            for (int i = 0; i < args.length; i++) {
                Object arg = args[i];
                if (arg != null && isEntity(arg)) {
                    String snapshotKey = requestId + "_" + i;
                    Object oldEntity = entitySnapshots.get().get(snapshotKey);
                    
                    if (oldEntity != null) {
                        // Compare old entity with new entity
                        String changes = changeTracker.trackChanges(oldEntity, arg);
                        return changes;
                    }
                }
            }
            
            // If no old snapshot, track changes in result
            if (result != null && isEntity(result)) {
                return changeTracker.createSnapshot(result);
            }
            
        } catch (Exception e) {
            logger.debug("Failed to track entity changes: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Build detailed information string
     */
    private String buildDetails(Loggable loggable, JoinPoint joinPoint, 
                               Object result, Exception exception, long executionTime) {
        StringBuilder details = new StringBuilder();
        
        if (!loggable.detailsTemplate().isEmpty()) {
            details.append(loggable.detailsTemplate()).append(" | ");
        }
        
        // Add method information
        details.append("Method: ").append(joinPoint.getSignature().getName());
        details.append(" | Class: ").append(joinPoint.getTarget().getClass().getSimpleName());
        details.append(" | Execution Time: ").append(executionTime).append("ms");
        
        // Add parameter information if enabled
        if (loggable.logParameters()) {
            Object[] args = joinPoint.getArgs();
            if (args.length > 0) {
                details.append(" | Parameters: ");
                for (int i = 0; i < args.length && i < 3; i++) { // Limit to first 3 parameters
                    if (args[i] != null) {
                        String paramStr = formatParameter(args[i], loggable.maxParameterLength());
                        details.append("[").append(paramStr).append("] ");
                    }
                }
            }
        }
        
        // Add result information if enabled
        if (loggable.logReturnValue() && result != null) {
            String resultStr = formatParameter(result, loggable.maxParameterLength());
            details.append(" | Result: ").append(resultStr);
        }
        
        // Add exception information if present
        if (exception != null) {
            details.append(" | Exception: ").append(exception.getClass().getSimpleName());
            details.append(" - ").append(exception.getMessage());
        }
        
        return details.toString();
    }

    /**
     * Build metadata JSON
     */
    private String buildMetadata(Loggable loggable, JoinPoint joinPoint, String requestId, long executionTime) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("requestId", requestId);
            metadata.put("executionTime", executionTime);
            metadata.put("method", joinPoint.getSignature().getName());
            metadata.put("class", joinPoint.getTarget().getClass().getName());
            metadata.put("parametersCount", joinPoint.getArgs().length);
            metadata.put("severity", loggable.severity());
            metadata.put("logParameters", loggable.logParameters());
            metadata.put("logReturnValue", loggable.logReturnValue());
            metadata.put("trackChanges", loggable.trackChanges());
            
            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            return "{\"error\": \"Failed to build metadata\"}";
        }
    }

    /**
     * Helper methods
     */
    private boolean shouldAutoLog(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        return isSignificantOperation(methodName);
    }

    private boolean isSignificantOperation(String methodName) {
        return methodName.matches(".*(create|update|delete|save|remove|add|modify|change).*") ||
               methodName.matches(".*(login|logout|authenticate|authorize).*") ||
               methodName.matches(".*(approve|reject|cancel|complete).*");
    }

    private boolean isEntity(Object obj) {
        return obj != null && 
               !obj.getClass().getName().startsWith("java.") &&
               !obj.getClass().getName().startsWith("javax.") &&
               !obj.getClass().getName().startsWith("org.springframework");
    }

    private String determineAction(Loggable loggable, String methodName, Exception exception) {
        if (!loggable.action().isEmpty()) {
            return loggable.action();
        }
        
        if (exception != null) {
            return methodName.toUpperCase() + "_FAILED";
        }
        
        return methodName.toUpperCase();
    }

    private String determineEntity(Loggable loggable, String className, JoinPoint joinPoint) {
        if (!loggable.entity().isEmpty()) {
            return loggable.entity();
        }
        
        // Try to extract from method parameters
        Object[] args = joinPoint.getArgs();
        for (Object arg : args) {
            if (arg != null && isEntity(arg)) {
                return arg.getClass().getSimpleName();
            }
        }
        
        return className.replace("Service", "").replace("Controller", "");
    }

    private String determineSeverity(Loggable loggable, Exception exception, long executionTime) {
        if (exception != null) {
            return "error";
        }
        
        if (executionTime > 5000) { // 5 seconds
            return "warning";
        }
        
        return loggable.severity();
    }

    private String determineBusinessImpact(Loggable loggable, String action, String severity, Exception exception) {
        if (exception != null && severity.equals("error")) {
            return "high";
        }
        
        if (action.contains("DELETE") || action.contains("REMOVE")) {
            return "medium";
        }
        
        if (action.contains("CREATE") || action.contains("UPDATE")) {
            return "medium";
        }
        
        return "low";
    }

    private String formatParameter(Object param, int maxLength) {
        try {
            String paramStr = objectMapper.writeValueAsString(param);
            if (paramStr.length() > maxLength) {
                paramStr = paramStr.substring(0, maxLength) + "...";
            }
            return paramStr;
        } catch (Exception e) {
            return param != null ? param.toString() : "null";
        }
    }

    private String extractEntityId(JoinPoint joinPoint, Object result) {
        // Try to extract from result first
        if (result != null) {
            String id = extractIdFromObject(result);
            if (id != null) return id;
        }
        
        // Try to extract from arguments
        Object[] args = joinPoint.getArgs();
        for (Object arg : args) {
            if (arg != null) {
                String id = extractIdFromObject(arg);
                if (id != null) return id;
            }
        }
        
        return null;
    }

    private String extractEntityName(JoinPoint joinPoint, Object result) {
        if (result != null) {
            return result.getClass().getSimpleName();
        }
        
        Object[] args = joinPoint.getArgs();
        for (Object arg : args) {
            if (arg != null && isEntity(arg)) {
                return arg.getClass().getSimpleName();
            }
        }
        
        return null;
    }

    private String extractIdFromObject(Object obj) {
        try {
            // Try common ID field names
            String[] idFields = {"id", "userId", "gymId", "memberId", "subscriptionId"};
            for (String fieldName : idFields) {
                try {
                    java.lang.reflect.Field field = obj.getClass().getDeclaredField(fieldName);
                    field.setAccessible(true);
                    Object value = field.get(obj);
                    if (value != null) {
                        return value.toString();
                    }
                } catch (NoSuchFieldException e) {
                    continue;
                }
            }
        } catch (Exception e) {
            // Ignore
        }
        return null;
    }

    private CustomUserDetails getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
                return (CustomUserDetails) authentication.getPrincipal();
            }
        } catch (Exception e) {
            logger.debug("Failed to get current user: {}", e.getMessage());
        }
        return null;
    }

    private HttpServletRequest getCurrentHttpRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            return attributes.getRequest();
        } catch (Exception e) {
            return null;
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        if (request == null) return null;
        
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    private String detectDeviceType(HttpServletRequest request) {
        if (request == null) return "unknown";
        
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null) return "unknown";
        
        userAgent = userAgent.toLowerCase();
        if (userAgent.contains("mobile")) return "mobile";
        if (userAgent.contains("tablet")) return "tablet";
        return "desktop";
    }

    private String detectBrowser(HttpServletRequest request) {
        if (request == null) return "unknown";
        
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null) return "unknown";
        
        userAgent = userAgent.toLowerCase();
        if (userAgent.contains("chrome")) return "chrome";
        if (userAgent.contains("firefox")) return "firefox";
        if (userAgent.contains("safari")) return "safari";
        if (userAgent.contains("edge")) return "edge";
        if (userAgent.contains("opera")) return "opera";
        return "unknown";
    }

    private String detectOS(HttpServletRequest request) {
        if (request == null) return "unknown";
        
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null) return "unknown";
        
        userAgent = userAgent.toLowerCase();
        if (userAgent.contains("windows")) return "windows";
        if (userAgent.contains("mac")) return "macos";
        if (userAgent.contains("linux")) return "linux";
        if (userAgent.contains("android")) return "android";
        if (userAgent.contains("ios")) return "ios";
        return "unknown";
    }

    private String generateRequestId() {
        return UUID.randomUUID().toString();
    }

    private void cleanupThreadLocal(String requestId) {
        try {
            executionTimers.get().remove(requestId);
            // Clear the logging flag to prevent memory leaks
            isLogging.remove();
            // Don't clear all entitySnapshots as they might be used by other requests
        } catch (Exception e) {
            // Ignore cleanup errors
        }
    }
}