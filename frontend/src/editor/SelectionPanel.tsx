/**
 * SelectionPanel - Properties editor for selected element
 * 
 * Shows editable properties (size, padding, colors, etc.) for the currently selected element.
 */

import { useState, useEffect, useCallback } from 'react'
import { useEditor } from './EditorProvider'
import { EditableRegistry } from './EditableRegistry'

interface SelectionPanelProps {
    elementId: string | null
}

export function SelectionPanel({ elementId }: SelectionPanelProps) {
    const { setSelectedId, setSize, setPadding, setMargin, setBackground, setRadius, setOpacity } = useEditor()
    const [element, setElement] = useState<Element | null>(null)
    const [computedStyles, setComputedStyles] = useState<CSSStyleDeclaration | null>(null)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const [padding, setPaddingState] = useState({ top: 0, right: 0, bottom: 0, left: 0 })
    const [margin, setMarginState] = useState({ top: 0, right: 0, bottom: 0, left: 0 })

    // Find element by ID
    useEffect(() => {
        if (!elementId) {
            setElement(null)
            return
        }

        const el = EditableRegistry.findElement(elementId) ||
            document.querySelector(`[data-editable-id="${elementId}"]`) ||
            document.querySelector(`[data-component-id="${elementId}"]`)

        if (el) {
            setElement(el)
            const styles = window.getComputedStyle(el)
            setComputedStyles(styles)

            const rect = el.getBoundingClientRect()
            setDimensions({ width: Math.round(rect.width), height: Math.round(rect.height) })

            setPaddingState({
                top: parseInt(styles.paddingTop) || 0,
                right: parseInt(styles.paddingRight) || 0,
                bottom: parseInt(styles.paddingBottom) || 0,
                left: parseInt(styles.paddingLeft) || 0
            })

            setMarginState({
                top: parseInt(styles.marginTop) || 0,
                right: parseInt(styles.marginRight) || 0,
                bottom: parseInt(styles.marginBottom) || 0,
                left: parseInt(styles.marginLeft) || 0
            })
        }
    }, [elementId])

    const handleClose = useCallback(() => {
        setSelectedId(null)
    }, [setSelectedId])

    const handleWidthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0
        setDimensions(prev => ({ ...prev, width: value }))
        if (elementId) {
            setSize(elementId, value, dimensions.height)
        }
    }, [elementId, dimensions.height, setSize])

    const handleHeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0
        setDimensions(prev => ({ ...prev, height: value }))
        if (elementId) {
            setSize(elementId, dimensions.width, value)
        }
    }, [elementId, dimensions.width, setSize])

    const handlePaddingChange = useCallback((side: 'top' | 'right' | 'bottom' | 'left', value: number) => {
        setPaddingState(prev => ({ ...prev, [side]: value }))
        if (elementId) {
            setPadding(elementId, { [side]: value })
        }
    }, [elementId, setPadding])

    const handleMarginChange = useCallback((side: 'top' | 'right' | 'bottom' | 'left', value: number) => {
        setMarginState(prev => ({ ...prev, [side]: value }))
        if (elementId) {
            setMargin(elementId, { [side]: value })
        }
    }, [elementId, setMargin])

    if (!elementId || !element) return null

    const entry = EditableRegistry.get(elementId)
    const tagName = element.tagName.toLowerCase()

    return (
        <div className="selection-panel" data-editor-ui>
            <div className="selection-panel__header">
                <span className="selection-panel__title">
                    {tagName}
                    {element.id && <span style={{ opacity: 0.6 }}>#{element.id}</span>}
                </span>
                <button className="selection-panel__close" onClick={handleClose}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Size Section */}
            <div className="selection-panel__section">
                <div className="selection-panel__section-title">Size</div>
                <div className="selection-panel__row">
                    <label className="selection-panel__label">Width</label>
                    <input
                        type="number"
                        className="selection-panel__input"
                        value={dimensions.width}
                        onChange={handleWidthChange}
                    />
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>px</span>
                </div>
                <div className="selection-panel__row">
                    <label className="selection-panel__label">Height</label>
                    <input
                        type="number"
                        className="selection-panel__input"
                        value={dimensions.height}
                        onChange={handleHeightChange}
                    />
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>px</span>
                </div>
            </div>

            {/* Padding Section */}
            <div className="selection-panel__section">
                <div className="selection-panel__section-title">Padding</div>
                <div className="selection-panel__row">
                    {(['top', 'right', 'bottom', 'left'] as const).map(side => (
                        <input
                            key={side}
                            type="number"
                            className="selection-panel__input"
                            style={{ width: '50px', textAlign: 'center' }}
                            value={padding[side]}
                            onChange={(e) => handlePaddingChange(side, parseInt(e.target.value) || 0)}
                            title={side}
                            placeholder={side[0].toUpperCase()}
                        />
                    ))}
                </div>
            </div>

            {/* Margin Section */}
            <div className="selection-panel__section">
                <div className="selection-panel__section-title">Margin</div>
                <div className="selection-panel__row">
                    {(['top', 'right', 'bottom', 'left'] as const).map(side => (
                        <input
                            key={side}
                            type="number"
                            className="selection-panel__input"
                            style={{ width: '50px', textAlign: 'center' }}
                            value={margin[side]}
                            onChange={(e) => handleMarginChange(side, parseInt(e.target.value) || 0)}
                            title={side}
                            placeholder={side[0].toUpperCase()}
                        />
                    ))}
                </div>
            </div>

            {/* Computed Info */}
            {computedStyles && (
                <div className="selection-panel__section">
                    <div className="selection-panel__section-title">Computed</div>
                    <div style={{ fontSize: '11px', opacity: 0.6, fontFamily: 'monospace' }}>
                        <div>display: {computedStyles.display}</div>
                        <div>position: {computedStyles.position}</div>
                        {computedStyles.backgroundColor !== 'rgba(0, 0, 0, 0)' && (
                            <div>background: {computedStyles.backgroundColor}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default SelectionPanel
