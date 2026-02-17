/**
 * InspectorOverlay - DevTools-style element inspector with resize/move functionality
 * 
 * Modes:
 * - RESIZE: Drag corner/edge handles to change size
 * - MOVE: Drag element body to reposition
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { useEditor } from './EditorProvider'
import { EditableRegistry } from './EditableRegistry'
import './editor.css'

interface ElementInfo {
    element: Element
    rect: DOMRect
    tagName: string
    className: string
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null

export function InspectorOverlay() {
    const { isEditing, editTool, setSelectedId, setSize } = useEditor()
    const [hoveredElement, setHoveredElement] = useState<ElementInfo | null>(null)
    const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null)
    const [isResizing, setIsResizing] = useState(false)
    const [isMoving, setIsMoving] = useState(false)
    const [activeHandle, setActiveHandle] = useState<ResizeHandle>(null)
    const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null)
    const moveStartRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null)

    // Get display label for element
    const getLabel = (el: Element): string => {
        const tag = el.tagName.toLowerCase()
        const id = el.id
        const cls = el.className?.toString().split(' ')[0] || ''

        if (id) return `${tag}#${id.slice(0, 15)}`
        if (cls && cls.length < 20) return `${tag}.${cls}`
        return tag
    }

    // Check if element should be excluded
    const shouldExclude = (el: Element): boolean => {
        return !!(
            el.closest('[data-editor-ui]') ||
            el.closest('.editor-toolbar') ||
            el.tagName === 'HTML' ||
            el.tagName === 'BODY'
        )
    }

    // Hover detection
    useEffect(() => {
        if (!isEditing || isResizing) {
            setHoveredElement(null)
            return
        }

        const onMouseMove = (e: MouseEvent) => {
            if (e.buttons !== 0) return // Skip during drag

            const el = document.elementFromPoint(e.clientX, e.clientY)
            if (!el || shouldExclude(el)) {
                setHoveredElement(null)
                return
            }

            // Don't hover on selected element
            if (selectedElement && el === selectedElement.element) {
                setHoveredElement(null)
                return
            }

            const rect = el.getBoundingClientRect()
            if (rect.width < 10 || rect.height < 10) {
                setHoveredElement(null)
                return
            }

            setHoveredElement({
                element: el,
                rect,
                tagName: el.tagName.toLowerCase(),
                className: el.className?.toString() || ''
            })
        }

        document.addEventListener('mousemove', onMouseMove, { passive: true })
        return () => document.removeEventListener('mousemove', onMouseMove)
    }, [isEditing, isResizing, selectedElement])

    // Click to select - FREEZES UI
    useEffect(() => {
        if (!isEditing || isResizing) return

        const onClick = (e: MouseEvent) => {
            const target = e.target as Element

            // Only allow editor UI clicks to pass through
            if (target.closest('[data-editor-ui]') ||
                target.closest('.editor-toolbar') ||
                target.closest('.resize-handle')) {
                return
            }

            // FREEZE ALL OTHER CLICKS
            e.preventDefault()
            e.stopPropagation()

            const el = document.elementFromPoint(e.clientX, e.clientY)

            // Skip html/body
            if (!el || el.tagName === 'HTML' || el.tagName === 'BODY') {
                setSelectedElement(null)
                setSelectedId(null)
                return
            }

            const rect = el.getBoundingClientRect()
            if (rect.width < 10 || rect.height < 10) return

            setSelectedElement({
                element: el,
                rect,
                tagName: el.tagName.toLowerCase(),
                className: el.className?.toString() || ''
            })
            setHoveredElement(null)

            // Register in registry
            const entry = EditableRegistry.register(el)
            if (entry) setSelectedId(entry.id)
        }

        document.addEventListener('click', onClick, { capture: true })
        return () => document.removeEventListener('click', onClick, { capture: true })
    }, [isEditing, isResizing, setSelectedId])

    // Resize handle drag
    useEffect(() => {
        if (!selectedElement || !activeHandle) return

        const onMouseMove = (e: MouseEvent) => {
            if (!resizeStartRef.current || !selectedElement) return

            const { x: startX, y: startY, width: startW, height: startH } = resizeStartRef.current
            const dx = e.clientX - startX
            const dy = e.clientY - startY

            let newWidth = startW
            let newHeight = startH
            const el = selectedElement.element as HTMLElement

            // Calculate new dimensions based on handle
            switch (activeHandle) {
                case 'e': newWidth = Math.max(20, startW + dx); break
                case 'w': newWidth = Math.max(20, startW - dx); break
                case 's': newHeight = Math.max(20, startH + dy); break
                case 'n': newHeight = Math.max(20, startH - dy); break
                case 'se': newWidth = Math.max(20, startW + dx); newHeight = Math.max(20, startH + dy); break
                case 'sw': newWidth = Math.max(20, startW - dx); newHeight = Math.max(20, startH + dy); break
                case 'ne': newWidth = Math.max(20, startW + dx); newHeight = Math.max(20, startH - dy); break
                case 'nw': newWidth = Math.max(20, startW - dx); newHeight = Math.max(20, startH - dy); break
            }

            // Apply styles directly to element
            el.style.width = `${newWidth}px`
            el.style.height = `${newHeight}px`

            // Update selection rect
            setSelectedElement(prev => prev ? {
                ...prev,
                rect: el.getBoundingClientRect()
            } : null)
        }

        const onMouseUp = () => {
            if (selectedElement && resizeStartRef.current) {
                const el = selectedElement.element as HTMLElement
                const rect = el.getBoundingClientRect()

                // Record the change
                const entry = EditableRegistry.get(selectedElement.element.getAttribute('data-editable-id') || '')
                if (entry) {
                    setSize(entry.id, rect.width, rect.height)
                }
            }

            setIsResizing(false)
            setActiveHandle(null)
            resizeStartRef.current = null
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)

        return () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }
    }, [activeHandle, selectedElement, setSize])

    // Handle resize start
    const startResize = (handle: ResizeHandle, e: React.MouseEvent) => {
        if (!selectedElement || editTool !== 'resize') return

        e.preventDefault()
        e.stopPropagation()

        const rect = selectedElement.element.getBoundingClientRect()
        resizeStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            width: rect.width,
            height: rect.height
        }

        setActiveHandle(handle)
        setIsResizing(true)
    }

    // Handle move start
    const startMove = (e: React.MouseEvent) => {
        if (!selectedElement || editTool !== 'move') return

        e.preventDefault()
        e.stopPropagation()

        const el = selectedElement.element as HTMLElement

        // Get current transform values
        const style = window.getComputedStyle(el)
        const matrix = new DOMMatrix(style.transform)
        const currentX = matrix.m41 || 0
        const currentY = matrix.m42 || 0

        moveStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            left: currentX,
            top: currentY
        }

        setIsMoving(true)
        document.body.style.cursor = 'grabbing'
    }

    // Move drag effect
    useEffect(() => {
        if (!selectedElement || !isMoving) return

        const onMouseMove = (e: MouseEvent) => {
            if (!moveStartRef.current || !selectedElement) return

            const dx = e.clientX - moveStartRef.current.x
            const dy = e.clientY - moveStartRef.current.y
            const el = selectedElement.element as HTMLElement

            // Apply position using transform for smooth movement
            const newX = moveStartRef.current.left + dx
            const newY = moveStartRef.current.top + dy
            el.style.transform = `translate(${newX}px, ${newY}px)`

            // Update rect
            setSelectedElement(prev => prev ? {
                ...prev,
                rect: el.getBoundingClientRect()
            } : null)
        }

        const onMouseUp = () => {
            setIsMoving(false)
            moveStartRef.current = null
            document.body.style.cursor = ''
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)

        return () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }
    }, [isMoving, selectedElement])

    // Update selection rect on scroll
    useEffect(() => {
        if (!selectedElement) return

        const update = () => {
            const rect = selectedElement.element.getBoundingClientRect()
            setSelectedElement(prev => prev ? { ...prev, rect } : null)
        }

        window.addEventListener('scroll', update, { passive: true })
        window.addEventListener('resize', update, { passive: true })
        return () => {
            window.removeEventListener('scroll', update)
            window.removeEventListener('resize', update)
        }
    }, [selectedElement?.element])

    // ESC to deselect
    useEffect(() => {
        if (!isEditing) return

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedElement(null)
                setSelectedId(null)
            }
        }

        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [isEditing, setSelectedId])

    // Clear on exit
    useEffect(() => {
        if (!isEditing) {
            setSelectedElement(null)
            setHoveredElement(null)
        }
    }, [isEditing])

    if (!isEditing) return null

    return (
        <div className="inspector-overlay" data-editor-ui>
            {/* Hover highlight */}
            {hoveredElement && (
                <div
                    className="inspector-highlight inspector-highlight--hover"
                    style={{
                        top: hoveredElement.rect.top + window.scrollY,
                        left: hoveredElement.rect.left + window.scrollX,
                        width: hoveredElement.rect.width,
                        height: hoveredElement.rect.height,
                    }}
                >
                    <span className="inspector-label inspector-label--hover">
                        {getLabel(hoveredElement.element)}
                    </span>
                </div>
            )}

            {/* Selection highlight */}
            {selectedElement && (
                <div
                    className={`inspector-highlight inspector-highlight--selected ${editTool === 'move' ? 'inspector-highlight--move' : ''}`}
                    style={{
                        top: selectedElement.rect.top + window.scrollY,
                        left: selectedElement.rect.left + window.scrollX,
                        width: selectedElement.rect.width,
                        height: selectedElement.rect.height,
                        cursor: editTool === 'move' ? (isMoving ? 'grabbing' : 'grab') : 'default'
                    }}
                    onMouseDown={editTool === 'move' ? startMove : undefined}
                >
                    <span className="inspector-label inspector-label--selected">
                        {getLabel(selectedElement.element)}
                        <span style={{ marginLeft: 8, opacity: 0.7 }}>
                            {editTool === 'resize' ? (
                                `${Math.round(selectedElement.rect.width)}×${Math.round(selectedElement.rect.height)}`
                            ) : (
                                '✋ Drag to move'
                            )}
                        </span>
                    </span>

                    {/* Resize handles - Only in resize mode */}
                    {editTool === 'resize' && (
                        <>
                            <div className="resize-handle resize-handle--nw" onMouseDown={(e) => startResize('nw', e)} />
                            <div className="resize-handle resize-handle--ne" onMouseDown={(e) => startResize('ne', e)} />
                            <div className="resize-handle resize-handle--sw" onMouseDown={(e) => startResize('sw', e)} />
                            <div className="resize-handle resize-handle--se" onMouseDown={(e) => startResize('se', e)} />
                            <div className="resize-handle resize-handle--n" onMouseDown={(e) => startResize('n', e)} />
                            <div className="resize-handle resize-handle--s" onMouseDown={(e) => startResize('s', e)} />
                            <div className="resize-handle resize-handle--e" onMouseDown={(e) => startResize('e', e)} />
                            <div className="resize-handle resize-handle--w" onMouseDown={(e) => startResize('w', e)} />
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default InspectorOverlay

