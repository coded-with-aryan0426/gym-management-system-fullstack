/**
 * EditableRegistry - Central registry for auto-discovered editable elements
 * 
 * This module provides a singleton registry that tracks all editable UI elements
 * discovered by the AutoDiscoveryProvider. It maps DOM elements to their
 * editable capabilities and source hints for AI code generation.
 */

export type ElementType =
    | 'button'      // <button>, <a>, clickable elements
    | 'input'       // <input>, <textarea>, <select>
    | 'text'        // Headings, paragraphs, labels, spans with text
    | 'icon'        // <svg>, Lucide icons, icon buttons
    | 'container'   // Divs with flex/grid, cards, sections
    | 'image'       // <img>, background images
    | 'list'        // <ul>, <ol>, list containers
    | 'table'       // <table>, data grids

export type EditCapability =
    | 'text'        // Can edit text content
    | 'color'       // Can change text/background colors
    | 'size'        // Can resize (width/height)
    | 'position'    // Can reposition (transform/position)
    | 'visibility'  // Can show/hide
    | 'spacing'     // Can adjust padding/margin/gap
    | 'border'      // Can modify border properties
    | 'shadow'      // Can add/edit box shadows
    | 'opacity'     // Can change transparency
    | 'font'        // Can modify font properties
    | 'layout'      // Can change display/flex/grid

export interface EditableEntry {
    /** Unique identifier for this element */
    id: string

    /** CSS selector path to locate element */
    selector: string

    /** XPath for more precise location */
    xpath: string

    /** HTML tag name (lowercase) */
    tagName: string

    /** Classified element type */
    type: ElementType

    /** List of allowed edit operations */
    capabilities: EditCapability[]

    /** Snapshot of original computed styles */
    originalStyles: Partial<CSSStyleDeclaration>

    /** Original text content (if applicable) */
    originalText?: string

    /** Hint for AI about source component */
    sourceHint?: {
        componentName?: string
        fileName?: string
        approximateLine?: number
    }

    /** Parent container ID (for hierarchy) */
    parentId?: string

    /** Child element IDs */
    childIds: string[]

    /** Whether element is currently visible */
    isVisible: boolean

    /** Timestamp when discovered */
    discoveredAt: number
}

/** Callback for registry changes */
type RegistryListener = (entries: Map<string, EditableEntry>) => void

/**
 * Singleton registry for all editable elements
 */
class EditableRegistryClass {
    private entries: Map<string, EditableEntry> = new Map()
    private elementToId: WeakMap<Element, string> = new WeakMap()
    private listeners: Set<RegistryListener> = new Set()
    private idCounter = 0

    /**
     * Generate a unique ID for an element
     */
    private generateId(element: Element, type: ElementType): string {
        const tag = element.tagName.toLowerCase()
        const existing = element.getAttribute('data-edit-id') || element.getAttribute('data-component-id') || element.getAttribute('data-editable-id')
        if (existing) return existing

        // Try to create a meaningful ID from attributes
        const id = element.id
        const className = element.className?.toString().split(' ')[0]
        const ariaLabel = element.getAttribute('aria-label')
        const testId = element.getAttribute('data-testid')

        const base = testId || id || ariaLabel || className || tag
        const sanitized = base
            .replace(/[^a-zA-Z0-9-_]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .toLowerCase()
            .slice(0, 30)

        this.idCounter++
        return `${type}-${sanitized || tag}-${this.idCounter}`
    }

    /**
     * Determine element type from DOM element
     */
    private classifyElement(element: Element): ElementType {
        const tag = element.tagName.toLowerCase()

        // Check tag name first
        if (['button', 'a'].includes(tag) || element.getAttribute('role') === 'button') {
            return 'button'
        }
        if (['input', 'textarea', 'select'].includes(tag)) {
            return 'input'
        }
        if (['svg', 'i'].includes(tag) || element.classList.contains('lucide')) {
            return 'icon'
        }
        if (tag === 'img' || (element as HTMLElement).style?.backgroundImage) {
            return 'image'
        }
        if (['ul', 'ol'].includes(tag)) {
            return 'list'
        }
        if (tag === 'table' || element.getAttribute('role') === 'grid') {
            return 'table'
        }
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'label'].includes(tag)) {
            const text = element.textContent?.trim()
            if (text && text.length > 0 && text.length < 500) {
                return 'text'
            }
        }

        // Check if container
        const computed = window.getComputedStyle(element)
        if (['flex', 'grid'].includes(computed.display) ||
            element.children.length > 0) {
            return 'container'
        }

        return 'container'
    }

    /**
     * Determine capabilities based on element type
     */
    private getCapabilities(element: Element, type: ElementType): EditCapability[] {
        const caps: EditCapability[] = ['visibility']

        switch (type) {
            case 'text':
                caps.push('text', 'color', 'font', 'spacing')
                break
            case 'button':
                caps.push('text', 'color', 'size', 'spacing', 'border', 'shadow')
                break
            case 'input':
                caps.push('color', 'size', 'spacing', 'border', 'font')
                break
            case 'icon':
                caps.push('color', 'size')
                break
            case 'image':
                caps.push('size', 'border', 'shadow', 'opacity')
                break
            case 'container':
                caps.push('color', 'size', 'position', 'spacing', 'border', 'shadow', 'layout')
                break
            case 'list':
            case 'table':
                caps.push('color', 'spacing', 'border')
                break
        }

        return caps
    }

    /**
     * Generate CSS selector for element
     */
    private getSelector(element: Element): string {
        if (element.id) {
            return `#${element.id}`
        }

        const path: string[] = []
        let current: Element | null = element

        while (current && current !== document.body) {
            let selector = current.tagName.toLowerCase()

            if (current.id) {
                path.unshift(`#${current.id}`)
                break
            }

            if (current.className && typeof current.className === 'string') {
                const classes = current.className.trim().split(/\s+/).slice(0, 2)
                if (classes.length > 0 && classes[0]) {
                    selector += `.${classes.join('.')}`
                }
            }

            // Add nth-child if needed
            const parent = current.parentElement
            if (parent) {
                const siblings = Array.from(parent.children).filter(
                    s => s.tagName === current!.tagName
                )
                if (siblings.length > 1) {
                    const index = siblings.indexOf(current) + 1
                    selector += `:nth-child(${index})`
                }
            }

            path.unshift(selector)
            current = current.parentElement
        }

        return path.join(' > ')
    }

    /**
     * Generate XPath for element
     */
    private getXPath(element: Element): string {
        const parts: string[] = []
        let current: Element | null = element

        while (current && current.nodeType === Node.ELEMENT_NODE) {
            let index = 1
            let sibling: Element | null = current.previousElementSibling

            while (sibling) {
                if (sibling.tagName === current.tagName) index++
                sibling = sibling.previousElementSibling
            }

            const tag = current.tagName.toLowerCase()
            parts.unshift(`${tag}[${index}]`)
            current = current.parentElement
        }

        return '/' + parts.join('/')
    }

    /**
     * Capture relevant original styles
     */
    private captureStyles(element: Element): Partial<CSSStyleDeclaration> {
        const computed = window.getComputedStyle(element)
        return {
            display: computed.display,
            position: computed.position,
            width: computed.width,
            height: computed.height,
            padding: computed.padding,
            margin: computed.margin,
            backgroundColor: computed.backgroundColor,
            color: computed.color,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight,
            borderRadius: computed.borderRadius,
            boxShadow: computed.boxShadow,
            opacity: computed.opacity,
            gap: computed.gap,
            flexDirection: computed.flexDirection,
            justifyContent: computed.justifyContent,
            alignItems: computed.alignItems
        }
    }

    /**
     * Register an element as editable
     */
    register(element: Element): EditableEntry | null {
        // Skip if already registered
        if (this.elementToId.has(element)) {
            return this.entries.get(this.elementToId.get(element)!) || null
        }

        // Skip non-visible elements
        const rect = element.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) {
            return null
        }

        // Skip script, style, meta elements
        const tag = element.tagName.toLowerCase()
        if (['script', 'style', 'meta', 'link', 'noscript', 'head'].includes(tag)) {
            return null
        }

        const type = this.classifyElement(element)
        const id = this.generateId(element, type)

        const entry: EditableEntry = {
            id,
            selector: this.getSelector(element),
            xpath: this.getXPath(element),
            tagName: tag,
            type,
            capabilities: this.getCapabilities(element, type),
            originalStyles: this.captureStyles(element),
            originalText: type === 'text' || type === 'button'
                ? element.textContent?.trim()
                : undefined,
            childIds: [],
            isVisible: true,
            discoveredAt: Date.now()
        }

        // Set data attribute for easy lookup
        if (!element.hasAttribute('data-edit-id') && !element.hasAttribute('data-component-id')) {
            element.setAttribute('data-editable-id', id)
        }

        this.entries.set(id, entry)
        this.elementToId.set(element, id)

        this.notifyListeners()

        return entry
    }

    /**
     * Unregister an element
     */
    unregister(elementOrId: Element | string): void {
        let id: string | undefined

        if (typeof elementOrId === 'string') {
            id = elementOrId
        } else {
            id = this.elementToId.get(elementOrId)
            if (id) {
                this.elementToId.delete(elementOrId)
            }
        }

        if (id) {
            this.entries.delete(id)
            this.notifyListeners()
        }
    }

    /**
     * Get entry by ID
     */
    get(id: string): EditableEntry | undefined {
        return this.entries.get(id)
    }

    /**
     * Get entry by element
     */
    getByElement(element: Element): EditableEntry | undefined {
        const id = this.elementToId.get(element)
        return id ? this.entries.get(id) : undefined
    }

    /**
     * Get all entries
     */
    getAll(): EditableEntry[] {
        return Array.from(this.entries.values())
    }

    /**
     * Get entries by type
     */
    getByType(type: ElementType): EditableEntry[] {
        return this.getAll().filter(e => e.type === type)
    }

    /**
     * Get entries by capability
     */
    getByCapability(capability: EditCapability): EditableEntry[] {
        return this.getAll().filter(e => e.capabilities.includes(capability))
    }

    /**
     * Find element in DOM by ID
     */
    findElement(id: string): Element | null {
        return document.querySelector(`[data-edit-id="${id}"], [data-editable-id="${id}"], [data-component-id="${id}"]`)
    }

    /**
     * Subscribe to registry changes
     */
    subscribe(listener: RegistryListener): () => void {
        this.listeners.add(listener)
        return () => this.listeners.delete(listener)
    }

    /**
     * Notify all listeners of changes
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.entries))
    }

    /**
     * Clear all entries
     */
    clear(): void {
        // Remove data attributes from DOM
        this.entries.forEach((_, id) => {
            const el = this.findElement(id)
            if (el) {
                el.removeAttribute('data-editable-id')
            }
        })

        this.entries.clear()
        this.idCounter = 0
        this.notifyListeners()
    }

    /**
     * Get statistics about registered elements
     */
    getStats(): { total: number; byType: Record<ElementType, number> } {
        const byType: Record<ElementType, number> = {
            button: 0,
            input: 0,
            text: 0,
            icon: 0,
            container: 0,
            image: 0,
            list: 0,
            table: 0
        }

        this.entries.forEach(entry => {
            byType[entry.type]++
        })

        return { total: this.entries.size, byType }
    }
}

// Export singleton instance
export const EditableRegistry = new EditableRegistryClass()

// Export type for React context
export type { EditableRegistryClass }
