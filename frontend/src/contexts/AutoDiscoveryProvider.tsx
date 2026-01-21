import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { EditableRegistry } from './EditableRegistry'
import type { EditableEntry, ElementType } from './EditableRegistry'

/**
 * Configuration for auto-discovery behavior
 */
interface AutoDiscoveryConfig {
    /** Enable/disable auto-discovery */
    enabled: boolean

    /** Debounce time for DOM mutations (ms) */
    debounceMs: number

    /** Element types to discover */
    elementTypes: ElementType[]

    /** Minimum text length for text elements */
    minTextLength: number

    /** Maximum text length for text elements */
    maxTextLength: number

    /** Selectors to exclude from discovery */
    excludeSelectors: string[]

    /** Only discover elements below this selector */
    rootSelector?: string
}

const defaultConfig: AutoDiscoveryConfig = {
    enabled: true,
    debounceMs: 100,
    elementTypes: ['button', 'input', 'text', 'icon', 'container', 'image', 'list', 'table'],
    minTextLength: 1,
    maxTextLength: 500,
    excludeSelectors: [
        '[data-editor-ignore]',
        '.editor-overlay',
        '.editor-toolbar',
        '.inspector-panel',
        '.export-modal',
        'script',
        'style',
        'noscript'
    ],
    rootSelector: undefined
}

interface AutoDiscoveryContextValue {
    /** Current configuration */
    config: AutoDiscoveryConfig

    /** Update configuration */
    setConfig: (config: Partial<AutoDiscoveryConfig>) => void

    /** Whether discovery is currently running */
    isScanning: boolean

    /** Trigger a manual full scan */
    triggerScan: () => void

    /** Get all discovered entries */
    entries: EditableEntry[]

    /** Stats about discovered elements */
    stats: { total: number; byType: Record<ElementType, number> }
}

const AutoDiscoveryContext = createContext<AutoDiscoveryContextValue | undefined>(undefined)

/**
 * Selectors for different element types
 */
const ELEMENT_SELECTORS: Record<ElementType, string> = {
    button: 'button, a[href], [role="button"], [onclick]',
    input: 'input, textarea, select',
    text: 'h1, h2, h3, h4, h5, h6, p, span, label, td, th, li',
    icon: 'svg, [class*="icon"], .lucide, i[class*="fa-"]',
    container: 'div, section, article, main, aside, header, footer, nav, form',
    image: 'img, [style*="background-image"]',
    list: 'ul, ol',
    table: 'table, [role="grid"]'
}

/**
 * Check if element should be excluded
 */
function shouldExclude(element: Element, excludeSelectors: string[]): boolean {
    // Check against exclude selectors
    for (const selector of excludeSelectors) {
        try {
            if (element.matches(selector) || element.closest(selector)) {
                return true
            }
        } catch {
            // Invalid selector, skip
        }
    }

    // Skip editor-related elements
    if (element.closest('[data-editor-element]')) {
        return true
    }

    // Skip portal/modal containers that are part of editor
    const id = element.id
    if (id && (id.includes('editor') || id.includes('inspector'))) {
        return true
    }

    return false
}

/**
 * Check if element is meaningfully visible
 */
function isVisible(element: Element): boolean {
    const rect = element.getBoundingClientRect()
    if (rect.width < 5 || rect.height < 5) return false

    const style = window.getComputedStyle(element)
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false
    }

    return true
}

/**
 * AutoDiscoveryProvider - Automatically discovers and registers editable elements
 */
export function AutoDiscoveryProvider({
    children,
    initialConfig
}: {
    children: React.ReactNode
    initialConfig?: Partial<AutoDiscoveryConfig>
}) {
    const [config, setConfigState] = useState<AutoDiscoveryConfig>({
        ...defaultConfig,
        ...initialConfig
    })
    const [isScanning, setIsScanning] = useState(false)
    const [entries, setEntries] = useState<EditableEntry[]>([])
    const [stats, setStats] = useState<{ total: number; byType: Record<ElementType, number> }>({
        total: 0,
        byType: { button: 0, input: 0, text: 0, icon: 0, container: 0, image: 0, list: 0, table: 0 }
    })

    const observerRef = useRef<MutationObserver | null>(null)
    const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const lastScanRef = useRef<number>(0)

    const setConfig = useCallback((newConfig: Partial<AutoDiscoveryConfig>) => {
        setConfigState(prev => ({ ...prev, ...newConfig }))
    }, [])

    /**
     * Scan DOM for editable elements
     */
    const scanDOM = useCallback(() => {
        if (!config.enabled) return

        const startTime = performance.now()
        setIsScanning(true)

        const root = config.rootSelector
            ? document.querySelector(config.rootSelector)
            : document.body

        if (!root) {
            setIsScanning(false)
            return
        }

        // Build combined selector based on enabled types
        const selectors = config.elementTypes
            .map(type => ELEMENT_SELECTORS[type])
            .join(', ')

        try {
            const elements = root.querySelectorAll(selectors)
            let registered = 0

            elements.forEach(element => {
                if (shouldExclude(element, config.excludeSelectors)) return
                if (!isVisible(element)) return

                // For text elements, check content length
                const tag = element.tagName.toLowerCase()
                if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'label'].includes(tag)) {
                    const text = element.textContent?.trim() || ''
                    if (text.length < config.minTextLength || text.length > config.maxTextLength) {
                        return
                    }
                    // Skip if element only contains other elements (not direct text)
                    const directText = Array.from(element.childNodes)
                        .filter(n => n.nodeType === Node.TEXT_NODE)
                        .map(n => n.textContent?.trim())
                        .join('')
                    if (!directText && element.children.length > 0) {
                        return
                    }
                }

                const entry = EditableRegistry.register(element)
                if (entry) registered++
            })

            const elapsed = performance.now() - startTime
            lastScanRef.current = Date.now()

            // Update state with results
            setEntries(EditableRegistry.getAll())
            setStats(EditableRegistry.getStats())

            if (import.meta.env.DEV) {
                console.log(`[AutoDiscovery] Scanned ${elements.length} elements, registered ${registered} in ${elapsed.toFixed(1)}ms`)
            }
        } catch (error) {
            console.error('[AutoDiscovery] Scan error:', error)
        } finally {
            setIsScanning(false)
        }
    }, [config])

    /**
     * Debounced scan trigger
     */
    const debouncedScan = useCallback(() => {
        if (scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current)
        }

        scanTimeoutRef.current = setTimeout(() => {
            scanDOM()
            scanTimeoutRef.current = null
        }, config.debounceMs)
    }, [scanDOM, config.debounceMs])

    /**
     * Handle DOM mutations
     */
    const handleMutations = useCallback((mutations: MutationRecord[]) => {
        // Check if mutations are meaningful (not just attribute changes from our system)
        const hasRelevantChanges = mutations.some(mutation => {
            if (mutation.type === 'childList') {
                return mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0
            }
            if (mutation.type === 'attributes') {
                // Ignore our own data attributes
                const attr = mutation.attributeName
                if (attr?.startsWith('data-editable') || attr?.startsWith('data-component')) {
                    return false
                }
                return true
            }
            return false
        })

        if (hasRelevantChanges) {
            debouncedScan()
        }
    }, [debouncedScan])

    /**
     * Manual scan trigger
     */
    const triggerScan = useCallback(() => {
        EditableRegistry.clear()
        scanDOM()
    }, [scanDOM])

    // Subscribe to registry changes
    useEffect(() => {
        return EditableRegistry.subscribe((entriesMap) => {
            setEntries(Array.from(entriesMap.values()))
            setStats(EditableRegistry.getStats())
        })
    }, [])

    // Set up MutationObserver
    useEffect(() => {
        if (!config.enabled) {
            if (observerRef.current) {
                observerRef.current.disconnect()
                observerRef.current = null
            }
            return
        }

        // Initial scan
        scanDOM()

        // Set up observer
        observerRef.current = new MutationObserver(handleMutations)

        const root = config.rootSelector
            ? document.querySelector(config.rootSelector)
            : document.body

        if (root) {
            observerRef.current.observe(root, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'style', 'hidden', 'disabled']
            })
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect()
                observerRef.current = null
            }
            if (scanTimeoutRef.current) {
                clearTimeout(scanTimeoutRef.current)
            }
        }
    }, [config.enabled, config.rootSelector, scanDOM, handleMutations])

    // Re-scan on route changes (for SPA)
    useEffect(() => {
        const handlePopState = () => {
            setTimeout(debouncedScan, 100) // Wait for React to render
        }

        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [debouncedScan])

    const value: AutoDiscoveryContextValue = {
        config,
        setConfig,
        isScanning,
        triggerScan,
        entries,
        stats
    }

    return (
        <AutoDiscoveryContext.Provider value={value}>
            {children}
        </AutoDiscoveryContext.Provider>
    )
}

/**
 * Hook to access auto-discovery context
 */
export function useAutoDiscovery() {
    const ctx = useContext(AutoDiscoveryContext)
    if (!ctx) {
        throw new Error('useAutoDiscovery must be used within AutoDiscoveryProvider')
    }
    return ctx
}

/**
 * Hook to get discovered elements of a specific type
 */
export function useDiscoveredElements(type?: ElementType): EditableEntry[] {
    const { entries } = useAutoDiscovery()

    if (!type) return entries
    return entries.filter(e => e.type === type)
}
