package com.gym.management.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark methods and classes for automatic audit logging
 * Provides fine-grained control over what gets logged
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface Loggable {
    
    /**
     * Custom action name (defaults to method name)
     */
    String action() default "";
    
    /**
     * Entity type being operated on
     */
    String entity() default "";
    
    /**
     * Whether to log method parameters
     */
    boolean logParameters() default true;
    
    /**
     * Whether to log return value
     */
    boolean logReturnValue() default true;
    
    /**
     * Whether to track field-level changes for update operations
     */
    boolean trackChanges() default true;
    
    /**
     * Severity level for this operation
     */
    String severity() default "info";
    
    /**
     * Whether to include sensitive data (use with caution)
     */
    boolean includeSensitiveData() default false;
    
    /**
     * Custom details template (supports SpEL)
     */
    String detailsTemplate() default "";
    
    /**
     * Fields to exclude from logging (for sensitive data)
     */
    String[] excludeFields() default {};
    
    /**
     * Maximum length for parameter values (prevents oversized logs)
     */
    int maxParameterLength() default 1000;
}