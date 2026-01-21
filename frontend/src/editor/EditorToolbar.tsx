/**
 * EditorToolbar - Floating toolbar with undo/redo and export
 */

import { useEditor } from './EditorProvider'
import { useState } from 'react'
import { ExportModal } from './ExportModal'

export function EditorToolbar() {
    const { isEditing, toggleEditing, undo, redo, canUndo, canRedo, reset } = useEditor()
    const [showExport, setShowExport] = useState(false)

    if (!isEditing) {
        return (
            <button
                className="edit-mode-toggle"
                onClick={toggleEditing}
                title="Enter Edit Mode (Ctrl+Shift+E)"
                data-editor-ui
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
            </button>
        )
    }

    return (
        <>
            <div className="editor-toolbar" data-editor-ui>
                {/* Undo */}
                <button onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 7v6h6" />
                        <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
                    </svg>
                </button>

                {/* Redo */}
                <button onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 7v6h-6" />
                        <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
                    </svg>
                </button>

                <div className="editor-toolbar__divider" />

                {/* Export */}
                <button onClick={() => setShowExport(true)} title="Export Changes">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                </button>

                {/* Reset */}
                <button onClick={reset} title="Reset All Changes">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                </button>

                <div className="editor-toolbar__divider" />

                {/* Exit Edit Mode */}
                <button
                    onClick={toggleEditing}
                    title="Exit Edit Mode (Ctrl+Shift+E)"
                    style={{ color: '#EF4444' }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {showExport && <ExportModal onClose={() => setShowExport(false)} />}
        </>
    )
}

export default EditorToolbar
