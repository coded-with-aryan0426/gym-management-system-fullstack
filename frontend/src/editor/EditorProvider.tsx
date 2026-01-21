/**
 * EditorProvider - Central state management for the visual editor
 * 
 * Manages edit mode state, selection, overrides, and change history.
 */

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'

type Density = 'compact' | 'normal' | 'relaxed'

export interface UIOverride {
    visible?: boolean
    density?: Density
    style?: React.CSSProperties
    textContent?: string
}

export interface ChangeRecord {
    id: string
    type: 'visibility' | 'density' | 'spacing' | 'style' | 'layout' | 'text' | 'batch'
    property: string
    value: unknown
    previousValue: unknown
    timestamp: number
}

interface EditorContextValue {
    // Edit mode state
    isEditing: boolean
    toggleEditing: () => void

    // Selection
    selectedId: string | null
    setSelectedId: (id: string | null) => void

    // Overrides
    getOverride: (id: string) => UIOverride

    // Style setters
    setVisibility: (id: string, visible: boolean) => void
    setDensity: (id: string, density: Density) => void
    setPadding: (id: string, padding: Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>) => void
    setMargin: (id: string, margin: Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>) => void
    setGap: (id: string, gap: number) => void
    setBackground: (id: string, background: string) => void
    setRadius: (id: string, radiusPx: number) => void
    setSize: (id: string, width: string | number, height: string | number) => void
    setTextColor: (id: string, color: string) => void
    setFontSize: (id: string, sizePx: number) => void
    setBorder: (id: string, width: number, color: string, style?: string) => void
    setShadow: (id: string, shadow: string) => void
    setOpacity: (id: string, opacity: number) => void
    setTextContent: (id: string, text: string) => void

    // History
    undo: () => void
    redo: () => void
    reset: () => void
    canUndo: boolean
    canRedo: boolean
    changes: ChangeRecord[]
}

const EditorContext = createContext<EditorContextValue | undefined>(undefined)

export function EditorProvider({ children }: { children: React.ReactNode }) {
    const [isEditing, setIsEditing] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [overrides, setOverrides] = useState<Record<string, UIOverride>>({})
    const [changes, setChanges] = useState<ChangeRecord[]>([])
    const [redoStack, setRedoStack] = useState<ChangeRecord[]>([])

    // Toggle body class for cursor style
    useEffect(() => {
        document.body.classList.toggle('edit-mode-active', isEditing)
        return () => document.body.classList.remove('edit-mode-active')
    }, [isEditing])

    // Keyboard shortcut: Ctrl+Shift+E
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
                e.preventDefault()
                setIsEditing(v => !v)
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [])

    const getOverride = useCallback((id: string): UIOverride => {
        return overrides[id] ?? { visible: true, style: {} }
    }, [overrides])

    const recordChange = useCallback((rec: ChangeRecord) => {
        setChanges(prev => [...prev, rec])
        setRedoStack([])
    }, [])

    // Style setters
    const setVisibility = useCallback((id: string, visible: boolean) => {
        const prev = getOverride(id)
        const previousValue = prev.visible ?? true
        setOverrides(o => ({ ...o, [id]: { ...prev, visible } }))
        recordChange({ id, type: 'visibility', property: 'visible', value: visible, previousValue, timestamp: Date.now() })
    }, [getOverride, recordChange])

    const setDensity = useCallback((id: string, density: Density) => {
        const prev = getOverride(id)
        const previousValue = prev.density ?? 'normal'
        setOverrides(o => ({ ...o, [id]: { ...prev, density } }))
        recordChange({ id, type: 'density', property: 'density', value: density, previousValue, timestamp: Date.now() })
    }, [getOverride, recordChange])

    const setPadding = useCallback((id: string, padding: Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>) => {
        const prev = getOverride(id)
        const style = { ...(prev.style ?? {}) }
        const previousValue = {
            top: style.paddingTop ? parseInt(String(style.paddingTop)) : 0,
            right: style.paddingRight ? parseInt(String(style.paddingRight)) : 0,
            bottom: style.paddingBottom ? parseInt(String(style.paddingBottom)) : 0,
            left: style.paddingLeft ? parseInt(String(style.paddingLeft)) : 0
        }
        if (padding.top !== undefined) style.paddingTop = `${padding.top}px`
        if (padding.right !== undefined) style.paddingRight = `${padding.right}px`
        if (padding.bottom !== undefined) style.paddingBottom = `${padding.bottom}px`
        if (padding.left !== undefined) style.paddingLeft = `${padding.left}px`
        setOverrides(o => ({ ...o, [id]: { ...prev, style } }))
        recordChange({ id, type: 'spacing', property: 'padding', value: padding, previousValue, timestamp: Date.now() })
    }, [getOverride, recordChange])

    const setMargin = useCallback((id: string, margin: Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>) => {
        const prev = getOverride(id)
        const style = { ...(prev.style ?? {}) }
        const previousValue = {
            top: style.marginTop ? parseInt(String(style.marginTop)) : 0,
            right: style.marginRight ? parseInt(String(style.marginRight)) : 0,
            bottom: style.marginBottom ? parseInt(String(style.marginBottom)) : 0,
            left: style.marginLeft ? parseInt(String(style.marginLeft)) : 0
        }
        if (margin.top !== undefined) style.marginTop = `${margin.top}px`
        if (margin.right !== undefined) style.marginRight = `${margin.right}px`
        if (margin.bottom !== undefined) style.marginBottom = `${margin.bottom}px`
        if (margin.left !== undefined) style.marginLeft = `${margin.left}px`
        setOverrides(o => ({ ...o, [id]: { ...prev, style } }))
        recordChange({ id, type: 'spacing', property: 'margin', value: margin, previousValue, timestamp: Date.now() })
    }, [getOverride, recordChange])

    const setGap = useCallback((id: string, gap: number) => {
        const prev = getOverride(id)
        const style = { ...(prev.style ?? {}) }
        const previousValue = style.gap ?? '0px'
        style.gap = `${gap}px`
        setOverrides(o => ({ ...o, [id]: { ...prev, style } }))
        recordChange({ id, type: 'spacing', property: 'gap', value: gap, previousValue, timestamp: Date.now() })
    }, [getOverride, recordChange])

    const setBackground = useCallback((id: string, background: string) => {
        const prev = getOverride(id)
        const style = { ...(prev.style ?? {}) }
        const previousValue = style.background ?? ''
        style.background = background
        setOverrides(o => ({ ...o, [id]: { ...prev, style } }))
        recordChange({ id, type: 'style', property: 'background', value: background, previousValue, timestamp: Date.now() })
    }, [getOverride, recordChange])

    const setRadius = useCallback((id: string, radiusPx: number) => {
        const prev = getOverride(id)
        const style = { ...(prev.style ?? {}) }
        const previousValue = style.borderRadius ?? ''
        style.borderRadius = `${radiusPx}px`
        setOverrides(o => ({ ...o, [id]: { ...prev, style } }))
        recordChange({ id, type: 'style', property: 'borderRadius', value: radiusPx, previousValue, timestamp: Date.now() })
    }, [getOverride, recordChange])

    const setSize = useCallback((id: string, width: string | number, height: string | number) => {
        const prev = getOverride(id)
        const style = { ...(prev.style ?? {}) }
        const previousValue = { width: style.width ?? 'auto', height: style.height ?? 'auto' }
        if (width !== 'auto') style.width = typeof width === 'number' ? `${width}px` : width
        if (height !== 'auto') style.height = typeof height === 'number' ? `${height}px` : height
        setOverrides(o => ({ ...o, [id]: { ...prev, style } }))
        recordChange({ id, type: 'layout', property: 'size', value: { width, height }, previousValue, timestamp: Date.now() })
    }, [getOverride, recordChange])

    const setTextColor = useCallback((id: string, color: string) => {
        const prev = getOverride(id)
        const style = { ...(prev.style ?? {}) }
        const previousValue = style.color ?? ''
        style.color = color
        setOverrides(o => ({ ...o, [id]: { ...prev, style } }))
        recordChange({ id, type: 'style', property: 'color', value: color, previousValue, timestamp: Date.now() })
    }, [getOverride, recordChange])

    const setFontSize = useCallback((id: string, sizePx: number) => {
        const prev = getOverride(id)
        const style = { ...(prev.style ?? {}) }
        const previousValue = style.fontSize ?? ''
        style.fontSize = `${sizePx}px`
        setOverrides(o => ({ ...o, [id]: { ...prev, style } }))
        recordChange({ id, type: 'style', property: 'fontSize', value: sizePx, previousValue, timestamp: Date.now() })
    }, [getOverride, recordChange])

    const setBorder = useCallback((id: string, width: number, color: string, borderStyle: string = 'solid') => {
        const prev = getOverride(id)
        const style = { ...(prev.style ?? {}) }
        const previousValue = { borderWidth: style.borderWidth, borderColor: style.borderColor, borderStyle: style.borderStyle }
        style.borderWidth = `${width}px`
        style.borderColor = color
        style.borderStyle = borderStyle
        setOverrides(o => ({ ...o, [id]: { ...prev, style } }))
        recordChange({ id, type: 'style', property: 'border', value: { width, color, borderStyle }, previousValue, timestamp: Date.now() })
    }, [getOverride, recordChange])

    const setShadow = useCallback((id: string, shadow: string) => {
        const prev = getOverride(id)
        const style = { ...(prev.style ?? {}) }
        const previousValue = style.boxShadow ?? 'none'
        style.boxShadow = shadow
        setOverrides(o => ({ ...o, [id]: { ...prev, style } }))
        recordChange({ id, type: 'style', property: 'boxShadow', value: shadow, previousValue, timestamp: Date.now() })
    }, [getOverride, recordChange])

    const setOpacity = useCallback((id: string, opacity: number) => {
        const prev = getOverride(id)
        const style = { ...(prev.style ?? {}) }
        const previousValue = style.opacity ?? 1
        style.opacity = Math.max(0, Math.min(1, opacity))
        setOverrides(o => ({ ...o, [id]: { ...prev, style } }))
        recordChange({ id, type: 'style', property: 'opacity', value: opacity, previousValue, timestamp: Date.now() })
    }, [getOverride, recordChange])

    const setTextContent = useCallback((id: string, text: string) => {
        const prev = getOverride(id)
        const previousValue = prev.textContent ?? ''
        setOverrides(o => ({ ...o, [id]: { ...prev, textContent: text } }))
        recordChange({ id, type: 'text', property: 'textContent', value: text, previousValue, timestamp: Date.now() })
    }, [getOverride, recordChange])

    // Undo/Redo
    const undo = useCallback(() => {
        if (changes.length === 0) return
        const last = changes[changes.length - 1]
        // Restore previous value
        const cur = getOverride(last.id)
        if (last.type === 'visibility') {
            setOverrides(o => ({ ...o, [last.id]: { ...cur, visible: Boolean(last.previousValue) } }))
        } else if (last.type === 'style' || last.type === 'layout' || last.type === 'spacing') {
            const style = { ...(cur.style ?? {}) }
                ; (style as Record<string, unknown>)[last.property] = last.previousValue
            setOverrides(o => ({ ...o, [last.id]: { ...cur, style } }))
        }
        setRedoStack(prev => [...prev, last])
        setChanges(prev => prev.slice(0, -1))
    }, [changes, getOverride])

    const redo = useCallback(() => {
        if (redoStack.length === 0) return
        const last = redoStack[redoStack.length - 1]
        const cur = getOverride(last.id)
        if (last.type === 'visibility') {
            setOverrides(o => ({ ...o, [last.id]: { ...cur, visible: Boolean(last.value) } }))
        } else if (last.type === 'style' || last.type === 'layout' || last.type === 'spacing') {
            const style = { ...(cur.style ?? {}) }
                ; (style as Record<string, unknown>)[last.property] = last.value
            setOverrides(o => ({ ...o, [last.id]: { ...cur, style } }))
        }
        setChanges(prev => [...prev, last])
        setRedoStack(prev => prev.slice(0, -1))
    }, [redoStack, getOverride])

    const reset = useCallback(() => {
        setOverrides({})
        setChanges([])
        setRedoStack([])
        setSelectedId(null)
    }, [])

    const value = useMemo<EditorContextValue>(() => ({
        isEditing,
        toggleEditing: () => {
            setIsEditing(v => !v)
            setSelectedId(null)
        },
        selectedId,
        setSelectedId,
        getOverride,
        setVisibility,
        setDensity,
        setPadding,
        setMargin,
        setGap,
        setBackground,
        setRadius,
        setSize,
        setTextColor,
        setFontSize,
        setBorder,
        setShadow,
        setOpacity,
        setTextContent,
        undo,
        redo,
        reset,
        canUndo: changes.length > 0,
        canRedo: redoStack.length > 0,
        changes
    }), [
        isEditing, selectedId, getOverride, changes, redoStack,
        setVisibility, setDensity, setPadding, setMargin, setGap,
        setBackground, setRadius, setSize, setTextColor, setFontSize,
        setBorder, setShadow, setOpacity, setTextContent, undo, redo, reset
    ])

    return (
        <EditorContext.Provider value={value}>
            {children}
        </EditorContext.Provider>
    )
}

export function useEditor() {
    const ctx = useContext(EditorContext)
    if (!ctx) throw new Error('useEditor must be used within EditorProvider')
    return ctx
}
