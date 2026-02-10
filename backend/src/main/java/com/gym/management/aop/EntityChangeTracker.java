package com.gym.management.aop;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.persistence.Transient;
import jakarta.persistence.Id;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.util.*;

/**
 * Utility class for tracking entity changes at field level
 * Provides detailed change detection for audit logging
 */
@Component
public class EntityChangeTracker {

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Track changes between old and new entity states
     * Returns JSON string with detailed field changes
     */
    public String trackChanges(Object oldEntity, Object newEntity) {
        if (oldEntity == null || newEntity == null) {
            return null;
        }

        try {
            ObjectNode changes = objectMapper.createObjectNode();
            
            // Get all fields from the class hierarchy
            List<Field> fields = getAllFields(newEntity.getClass());
            
            for (Field field : fields) {
                field.setAccessible(true);
                
                // Skip transient and static fields
                if (java.lang.reflect.Modifier.isStatic(field.getModifiers()) ||
                    java.lang.reflect.Modifier.isTransient(field.getModifiers()) ||
                    field.isAnnotationPresent(Transient.class) ||
                    field.isAnnotationPresent(org.springframework.data.annotation.Transient.class)) {
                    continue;
                }
                
                Object oldValue = field.get(oldEntity);
                Object newValue = field.get(newEntity);
                
                // Check if value changed
                if (!Objects.equals(oldValue, newValue)) {
                    ObjectNode fieldChange = objectMapper.createObjectNode();
                    fieldChange.put("field", field.getName());
                    fieldChange.put("type", field.getType().getSimpleName());
                    fieldChange.put("oldValue", formatValue(oldValue));
                    fieldChange.put("newValue", formatValue(newValue));
                    fieldChange.put("changed", true);
                    
                    // Add field-specific metadata
                    if (isSensitiveField(field.getName())) {
                        fieldChange.put("sensitive", true);
                        fieldChange.put("oldValue", "***MASKED***");
                        fieldChange.put("newValue", "***MASKED***");
                    }
                    
                    changes.set(field.getName(), fieldChange);
                }
            }
            
            return changes.size() > 0 ? objectMapper.writeValueAsString(changes) : null;
            
        } catch (Exception e) {
            return "{\"error\": \"Failed to track changes: " + e.getMessage() + "\"}";
        }
    }

    /**
     * Track changes for a collection of entities (bulk operations)
     */
    public String trackCollectionChanges(Collection<?> oldCollection, Collection<?> newCollection) {
        try {
            ObjectNode changes = objectMapper.createObjectNode();
            
            // Convert to maps for easier comparison
            Map<Object, Object> oldMap = collectionToMap(oldCollection);
            Map<Object, Object> newMap = collectionToMap(newCollection);
            
            // Find added entities
            Set<Object> added = new HashSet<>(newMap.keySet());
            added.removeAll(oldMap.keySet());
            
            // Find removed entities
            Set<Object> removed = new HashSet<>(oldMap.keySet());
            removed.removeAll(newMap.keySet());
            
            // Find modified entities
            Set<Object> modified = new HashSet<>(oldMap.keySet());
            modified.retainAll(newMap.keySet());
            
            // Track additions
            if (!added.isEmpty()) {
                ObjectNode addedNode = objectMapper.createObjectNode();
                addedNode.put("count", added.size());
                addedNode.put("ids", objectMapper.valueToTree(added));
                changes.set("added", addedNode);
            }
            
            // Track removals
            if (!removed.isEmpty()) {
                ObjectNode removedNode = objectMapper.createObjectNode();
                removedNode.put("count", removed.size());
                removedNode.put("ids", objectMapper.valueToTree(removed));
                changes.set("removed", removedNode);
            }
            
            // Track modifications
            if (!modified.isEmpty()) {
                ObjectNode modifiedNode = objectMapper.createObjectNode();
                modifiedNode.put("count", modified.size());
                
                ObjectNode detailedChanges = objectMapper.createObjectNode();
                for (Object id : modified) {
                    Object oldEntity = oldMap.get(id);
                    Object newEntity = newMap.get(id);
                    String entityChanges = trackChanges(oldEntity, newEntity);
                    if (entityChanges != null) {
                        detailedChanges.put(id.toString(), entityChanges);
                    }
                }
                
                if (detailedChanges.size() > 0) {
                    modifiedNode.set("details", detailedChanges);
                }
                changes.set("modified", modifiedNode);
            }
            
            return changes.size() > 0 ? objectMapper.writeValueAsString(changes) : null;
            
        } catch (Exception e) {
            return "{\"error\": \"Failed to track collection changes: " + e.getMessage() + "\"}";
        }
    }

    /**
     * Create a snapshot of current entity state
     */
    public String createSnapshot(Object entity) {
        if (entity == null) {
            return null;
        }

        try {
            ObjectNode snapshot = objectMapper.createObjectNode();
            snapshot.put("entityType", entity.getClass().getSimpleName());
            snapshot.put("timestamp", System.currentTimeMillis());
            
            ObjectNode fields = objectMapper.createObjectNode();
            List<Field> allFields = getAllFields(entity.getClass());
            
            for (Field field : allFields) {
                field.setAccessible(true);
                
                // Skip transient and static fields
                if (java.lang.reflect.Modifier.isStatic(field.getModifiers()) ||
                    java.lang.reflect.Modifier.isTransient(field.getModifiers()) ||
                    field.isAnnotationPresent(Transient.class) ||
                    field.isAnnotationPresent(org.springframework.data.annotation.Transient.class)) {
                    continue;
                }
                
                Object value = field.get(entity);
                
                // Handle sensitive fields
                if (isSensitiveField(field.getName())) {
                    fields.put(field.getName(), "***MASKED***");
                } else {
                    fields.put(field.getName(), formatValue(value));
                }
            }
            
            snapshot.set("fields", fields);
            return objectMapper.writeValueAsString(snapshot);
            
        } catch (Exception e) {
            return "{\"error\": \"Failed to create snapshot: " + e.getMessage() + "\"}";
        }
    }

    /**
     * Format value for JSON serialization
     */
    private String formatValue(Object value) {
        if (value == null) {
            return null;
        }
        
        try {
            // Handle collections
            if (value instanceof Collection) {
                return "[" + ((Collection<?>) value).size() + " items]";
            }
            
            // Handle large strings
            if (value instanceof String) {
                String str = (String) value;
                if (str.length() > 500) {
                    return str.substring(0, 500) + "... [truncated]";
                }
            }
            
            // Handle dates
            if (value instanceof java.time.LocalDate) {
                return value.toString();
            }
            
            if (value instanceof java.time.LocalDateTime) {
                return value.toString();
            }
            
            // Handle other objects
            return objectMapper.writeValueAsString(value);
            
        } catch (Exception e) {
            return "[Serialization Error]";
        }
    }

    /**
     * Convert collection to map for easier comparison
     */
    private Map<Object, Object> collectionToMap(Collection<?> collection) {
        Map<Object, Object> map = new HashMap<>();
        if (collection != null) {
            for (Object item : collection) {
                Object key = extractEntityId(item);
                if (key != null) {
                    map.put(key, item);
                }
            }
        }
        return map;
    }

    /**
     * Extract entity ID for comparison
     */
    private Object extractEntityId(Object entity) {
        if (entity == null) {
            return null;
        }

        try {
            // Try to find ID field
            Field[] fields = entity.getClass().getDeclaredFields();
            for (Field field : fields) {
                if (field.getName().toLowerCase().contains("id") || 
                    field.isAnnotationPresent(Id.class)) {
                    field.setAccessible(true);
                    return field.get(entity);
                }
            }
        } catch (Exception e) {
            // Ignore
        }
        
        return entity.hashCode(); // Fallback
    }

    /**
     * Get all fields from class hierarchy
     */
    private List<Field> getAllFields(Class<?> clazz) {
        List<Field> fields = new ArrayList<>();
        Class<?> currentClass = clazz;
        
        while (currentClass != null && currentClass != Object.class) {
            fields.addAll(Arrays.asList(currentClass.getDeclaredFields()));
            currentClass = currentClass.getSuperclass();
        }
        
        return fields;
    }

    /**
     * Check if field is sensitive
     */
    private boolean isSensitiveField(String fieldName) {
        String lowerName = fieldName.toLowerCase();
        return lowerName.contains("password") || 
               lowerName.contains("ssn") || 
               lowerName.contains("social") ||
               lowerName.contains("credit") ||
               lowerName.contains("cvv") ||
               lowerName.contains("pin") ||
               lowerName.contains("secret") ||
               lowerName.contains("token") ||
               lowerName.contains("apikey") ||
               lowerName.contains("privatekey");
    }
}