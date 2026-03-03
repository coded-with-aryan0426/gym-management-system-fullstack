/**
 * Editor Module - Single Entry Point
 * 
 * Import everything from this file:
 * import { EditorProvider, InspectorOverlay, EditorToolbar } from '@/editor'
 */

// Core provider
export { EditorProvider, useEditor } from './EditorProvider'
export type { UIOverride, ChangeRecord } from './EditorProvider'

// Visual components
export { InspectorOverlay } from './InspectorOverlay'
export { SelectionPanel } from './SelectionPanel'
export { EditorToolbar } from './EditorToolbar'
export { ExportModal } from './ExportModal'

// Registry
export { EditableRegistry } from './EditableRegistry'
export type { EditableEntry, ElementType, EditCapability } from './EditableRegistry'

// Style Injection
export { StyleInjector } from './StyleInjector'

// Styles
import './editor.css'

/**
 * EditorRoot - Complete editor setup component
 * 
 * Wraps your app with all editor functionality:
 * 
 * <EditorRoot>
 *   <App />
 * </EditorRoot>
 */
import { useState, useEffect } from 'react'
import { EditorProvider } from './EditorProvider'
import { InspectorOverlay } from './InspectorOverlay'
import { SelectionPanel } from './SelectionPanel'
import { useEditor } from './EditorProvider'
import { EditableRegistry } from './EditableRegistry'
import { StyleInjector } from './StyleInjector'
import { EditorToolbar } from './EditorToolbar'

function EditorUI() {
  const { selectedId, isEditing, editTool } = useEditor()
  const [selectedRect, setSelectedRect] = useState<DOMRect | null>(null)

  // Update rect when selection changes
  useEffect(() => {
    if (!selectedId || !isEditing) {
      setSelectedRect(null)
      return
    }

    const el = EditableRegistry.findElement(selectedId) ||
      document.querySelector(`[data-editable-id="${selectedId}"]`) ||
      document.querySelector(`[data-component-id="${selectedId}"]`)

    if (el) {
      setSelectedRect(el.getBoundingClientRect())

      // Update on scroll/resize
      const updateRect = () => setSelectedRect(el.getBoundingClientRect())
      window.addEventListener('scroll', updateRect, { passive: true })
      window.addEventListener('resize', updateRect, { passive: true })

      return () => {
        window.removeEventListener('scroll', updateRect)
        window.removeEventListener('resize', updateRect)
      }
    }
  }, [selectedId, isEditing])

  return (
    <>
      <InspectorOverlay />
      {/* Only show SelectionPanel in resize mode, hide in move mode */}
      {selectedId && editTool === 'resize' && (
        <SelectionPanel elementId={selectedId} elementRect={selectedRect} />
      )}
      <EditorToolbar />
    </>
  )
}

export function EditorRoot({ children }: { children: React.ReactNode }) {
  const isEnabled = import.meta.env.VITE_ENABLE_UI_EDITOR === 'true'

  if (!isEnabled) {
    return <StyleInjector>{children}</StyleInjector>
  }

  return (
    <EditorProvider>
      <EditorUI />
      {children}
    </EditorProvider>
  )
}
