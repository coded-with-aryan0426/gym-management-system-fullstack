/**
 * StyleHistory - Tracks original element styles for undo/redo
 * 
 * Stores the original style values before any change so they can be restored.
 */

export interface StyleChange {
    elementId: string
    property: string
    originalValue: string
    newValue: string
    timestamp: number
}

// Stack of changes for undo/redo
const undoStack: StyleChange[] = []
const redoStack: StyleChange[] = []

// Cache of elements by ID for faster access
const elementCache = new Map<string, HTMLElement>()

/**
 * Find element by its editable ID
 */
function findElement(id: string): HTMLElement | null {
    // Check cache first
    if (elementCache.has(id)) {
        const cached = elementCache.get(id)!
        if (document.contains(cached)) return cached
        elementCache.delete(id)
    }

    // Find by various ID attributes
    const el = document.querySelector(`[data-editable-id="${id}"]`) ||
        document.querySelector(`[data-component-id="${id}"]`) ||
        document.getElementById(id)

    if (el instanceof HTMLElement) {
        elementCache.set(id, el)
        return el
    }
    return null
}

/**
 * Record a style change (call BEFORE applying the change)
 */
export function recordChange(elementId: string, property: string, newValue: string): boolean {
    const el = findElement(elementId)
    if (!el) return false

    // Get current (original) value
    const originalValue = el.style.getPropertyValue(property) ||
        window.getComputedStyle(el).getPropertyValue(property) || ''

    // Don't record if no change
    if (originalValue === newValue) return false

    undoStack.push({
        elementId,
        property,
        originalValue,
        newValue,
        timestamp: Date.now()
    })

    // Clear redo stack on new change
    redoStack.length = 0

    return true
}

/**
 * Apply a specific CSS property to an element
 */
function applyStyle(elementId: string, property: string, value: string): boolean {
    const el = findElement(elementId)
    if (!el) return false

    // Convert property name from camelCase to kebab-case if needed
    const kebabProp = property.replace(/([A-Z])/g, '-$1').toLowerCase()
    el.style.setProperty(kebabProp, value)
    return true
}

/**
 * Undo the last change
 */
export function undo(): boolean {
    const change = undoStack.pop()
    if (!change) return false

    // Apply original value
    if (applyStyle(change.elementId, change.property, change.originalValue)) {
        redoStack.push(change)
        return true
    }
    return false
}

/**
 * Redo the last undone change
 */
export function redo(): boolean {
    const change = redoStack.pop()
    if (!change) return false

    // Apply new value
    if (applyStyle(change.elementId, change.property, change.newValue)) {
        undoStack.push(change)
        return true
    }
    return false
}

/**
 * Reset all changes - restore all original values
 */
export function resetAll(): void {
    // Undo all changes in reverse order
    while (undoStack.length > 0) {
        const change = undoStack.pop()!
        applyStyle(change.elementId, change.property, change.originalValue)
    }
    redoStack.length = 0
}

/**
 * Get status
 */
export function canUndo(): boolean {
    return undoStack.length > 0
}

export function canRedo(): boolean {
    return redoStack.length > 0
}

export function getChangeCount(): number {
    return undoStack.length
}

/**
 * Get all changes for export
 */
export function getAllChanges(): StyleChange[] {
    return [...undoStack]
}

/**
 * Clear cache (call when elements are removed from DOM)
 */
export function clearCache(): void {
    elementCache.clear()
}
