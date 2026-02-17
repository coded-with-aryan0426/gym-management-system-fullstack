/**
 * SelectionPanel - Compact floating properties editor
 * 
 * Applies changes DIRECTLY to DOM elements + records in StyleHistory for undo/redo
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useEditor } from './EditorProvider'
import { EditableRegistry } from './EditableRegistry'
import * as StyleHistory from './StyleHistory'
import './editor.css'

interface SelectionPanelProps {
    elementId: string | null
    elementRect?: DOMRect | null
}

const COLORS = [
    '#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4', '#3B82F6',
    '#8B5CF6', '#EC4899', '#000000', '#374151', '#9CA3AF', '#FFFFFF'
]

export function SelectionPanel({ elementId, elementRect }: SelectionPanelProps) {
    const { setSelectedId } = useEditor()

    const [element, setElement] = useState<HTMLElement | null>(null)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const [padding, setPadding] = useState({ top: 0, right: 0, bottom: 0, left: 0 })
    const [bgColor, setBgColor] = useState('')
    const [borderRadius, setBorderRadius] = useState(0)
    const [opacityValue, setOpacityValue] = useState(100)
    const [showColors, setShowColors] = useState(false)

    // Find element
    useEffect(() => {
        if (!elementId) { setElement(null); return }

        const el = EditableRegistry.findElement(elementId) ||
            document.querySelector(`[data-editable-id="${elementId}"]`) ||
            document.querySelector(`[data-component-id="${elementId}"]`)

        if (el) {
            const htmlEl = el as HTMLElement
            setElement(htmlEl)

            const rect = el.getBoundingClientRect()
            const style = window.getComputedStyle(el)

            setDimensions({ width: Math.round(rect.width), height: Math.round(rect.height) })
            setPadding({
                top: parseInt(style.paddingTop) || 0,
                right: parseInt(style.paddingRight) || 0,
                bottom: parseInt(style.paddingBottom) || 0,
                left: parseInt(style.paddingLeft) || 0
            })
            setBgColor(style.backgroundColor || '')
            setBorderRadius(parseInt(style.borderRadius) || 0)
            setOpacityValue(Math.round((parseFloat(style.opacity) || 1) * 100))
        }
    }, [elementId])

    // Position panel - prefer left side, avoid blocking element
    const pos = useMemo(() => {
        const panelWidth = 240
        const panelHeight = 280
        const gap = 12

        if (!elementRect) {
            return { top: window.innerHeight - panelHeight - 80, left: 16 }
        }

        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        let left = elementRect.left - panelWidth - gap
        if (left < 16) left = elementRect.right + gap
        if (left + panelWidth > viewportWidth - 16) left = 16

        let top = Math.max(16, elementRect.top)
        if (top + panelHeight > viewportHeight - 16) {
            top = viewportHeight - panelHeight - 16
        }

        return { top, left }
    }, [elementRect])

    // Apply size directly to element WITH history tracking
    const applySize = useCallback((w: number, h: number) => {
        if (!element || !elementId) return
        StyleHistory.recordChange(elementId, 'width', `${w}px`)
        StyleHistory.recordChange(elementId, 'height', `${h}px`)
        element.style.width = `${w}px`
        element.style.height = `${h}px`
        setDimensions({ width: w, height: h })
    }, [element, elementId])

    // Apply padding directly WITH history tracking
    const applyPadding = useCallback((side: string, value: number) => {
        if (!element || !elementId) return
        const prop = `padding-${side}`
        StyleHistory.recordChange(elementId, prop, `${value}px`)
            ; (element.style as any)[`padding${side.charAt(0).toUpperCase() + side.slice(1)}`] = `${value}px`
        setPadding(p => ({ ...p, [side]: value }))
    }, [element, elementId])

    // Apply background directly WITH history tracking
    const applyBg = useCallback((color: string) => {
        if (!element || !elementId) return
        StyleHistory.recordChange(elementId, 'background-color', color)
        element.style.backgroundColor = color
        setBgColor(color)
        setShowColors(false)
    }, [element, elementId])

    // Apply border radius directly WITH history tracking
    const applyRadius = useCallback((value: number) => {
        if (!element || !elementId) return
        StyleHistory.recordChange(elementId, 'border-radius', `${value}px`)
        element.style.borderRadius = `${value}px`
        setBorderRadius(value)
    }, [element, elementId])

    // Apply opacity directly WITH history tracking
    const applyOpacity = useCallback((value: number) => {
        if (!element || !elementId) return
        StyleHistory.recordChange(elementId, 'opacity', String(value / 100))
        element.style.opacity = String(value / 100)
        setOpacityValue(value)
    }, [element, elementId])

    // Copy selector
    const copySelector = useCallback(() => {
        if (!element) return
        const id = element.id ? `#${element.id}` : ''
        const cls = element.className ? `.${element.className.toString().split(' ')[0]}` : ''
        const tag = element.tagName.toLowerCase()
        const selector = id || cls || tag
        navigator.clipboard.writeText(selector)
    }, [element])

    if (!elementId || !element) return null

    const tag = element.tagName.toLowerCase()

    return (
        <div
            className="sp-panel"
            data-editor-ui
            style={{ position: 'fixed', top: pos.top, left: pos.left }}
        >
            {/* Header */}
            <div className="sp-header">
                <span className="sp-tag">{tag}</span>
                <div className="sp-header-actions">
                    <button onClick={copySelector} title="Copy selector" className="sp-btn-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                    </button>
                    <button onClick={() => setSelectedId(null)} className="sp-btn-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Size */}
            <div className="sp-section">
                <label>Size</label>
                <div className="sp-row">
                    <input type="number" value={dimensions.width} onChange={e => applySize(+e.target.value || 0, dimensions.height)} />
                    <span>×</span>
                    <input type="number" value={dimensions.height} onChange={e => applySize(dimensions.width, +e.target.value || 0)} />
                </div>
            </div>

            {/* Padding */}
            <div className="sp-section">
                <label>Padding</label>
                <div className="sp-spacing">
                    <input type="number" value={padding.top} onChange={e => applyPadding('top', +e.target.value || 0)} placeholder="T" />
                    <input type="number" value={padding.right} onChange={e => applyPadding('right', +e.target.value || 0)} placeholder="R" />
                    <input type="number" value={padding.bottom} onChange={e => applyPadding('bottom', +e.target.value || 0)} placeholder="B" />
                    <input type="number" value={padding.left} onChange={e => applyPadding('left', +e.target.value || 0)} placeholder="L" />
                </div>
            </div>

            {/* Background */}
            <div className="sp-section">
                <label>Background</label>
                <div className="sp-row">
                    <div className="sp-color-box" style={{ background: bgColor || '#0000' }} onClick={() => setShowColors(!showColors)} />
                    <input type="text" value={bgColor} onChange={e => applyBg(e.target.value)} placeholder="transparent" />
                </div>
                {showColors && (
                    <div className="sp-colors">
                        {COLORS.map(c => (
                            <button key={c} style={{ background: c }} onClick={() => applyBg(c)} />
                        ))}
                    </div>
                )}
            </div>

            {/* Border Radius */}
            <div className="sp-section">
                <label>Radius</label>
                <input type="number" value={borderRadius} onChange={e => applyRadius(+e.target.value || 0)} style={{ width: 60 }} />
            </div>

            {/* Opacity */}
            <div className="sp-section">
                <label>Opacity {opacityValue}%</label>
                <input type="range" min={0} max={100} value={opacityValue} onChange={e => applyOpacity(+e.target.value)} className="sp-slider" />
            </div>
        </div>
    )
}

export default SelectionPanel
