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
import { EditorProvider } from './EditorProvider'
import { InspectorOverlay } from './InspectorOverlay'
import { SelectionPanel } from './SelectionPanel'
import { EditorToolbar } from './EditorToolbar'
import { useEditor } from './EditorProvider'

function EditorUI() {
  // SelectionPanel removed - user wants to see UI directly without blocking panel
  return (
    <>
      <InspectorOverlay />
      <EditorToolbar />
    </>
  )
}

export function EditorRoot({ children }: { children: React.ReactNode }) {
  return (
    <EditorProvider>
      <EditorUI />
      {children}
    </EditorProvider>
  )
}
