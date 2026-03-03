/**
 * EditorToolbar - Floating toolbar with mode toggle, undo/redo, and export
 *
 * Phase 4: AI Apply Workflow
 * - Keyboard shortcut: Ctrl+Shift+E to toggle
 * - Export → copy-paste into AI with instructions
 */

import { useEditor } from './EditorProvider'
import { useState } from 'react'
import { ExportModal } from './ExportModal'

export function EditorToolbar() {
    const { isEditing, toggleEditing, editTool, setEditTool, undo, redo, canUndo, canRedo, reset, changes } = useEditor()
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
                {/* Mode label */}
                <span style={{
                    fontSize: 10,
                    color: '#3B82F6',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    userSelect: 'none',
                    paddingRight: 4
                }}>
                    EDIT
                </span>

                <div className="editor-toolbar__divider" />

                {/* Mode Toggle: Resize vs Move */}
                <div className="editor-toolbar__mode-group">
                    <button
                        onClick={() => setEditTool('resize')}
                        className={editTool === 'resize' ? 'active' : ''}
                        title="Resize Mode — drag handles to resize elements"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 21H3V3" />
                            <path d="M21 15v6h-6" />
                            <path d="M15 21l6-6" />
                            <rect x="3" y="3" width="8" height="8" rx="1" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setEditTool('move')}
                        className={editTool === 'move' ? 'active' : ''}
                        title="Move Mode — drag elements to reposition"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="5 9 2 12 5 15" />
                            <polyline points="9 5 12 2 15 5" />
                            <polyline points="15 19 12 22 9 19" />
                            <polyline points="19 9 22 12 19 15" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <line x1="12" y1="2" x2="12" y2="22" />
                        </svg>
                    </button>
                </div>

                <div className="editor-toolbar__divider" />

                {/* Undo */}
                <button onClick={undo} disabled={!canUndo} title="Undo last change (Ctrl+Z)">
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

                {/* Export — shows change count badge */}
                <button
                    onClick={() => setShowExport(true)}
                    title="Export changes as AI prompt or JSON"
                    style={{ position: 'relative' }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {changes.length > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            minWidth: 14,
                            height: 14,
                            background: '#EF4444',
                            borderRadius: 7,
                            fontSize: 9,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            lineHeight: 1
                        }}>
                            {changes.length > 99 ? '99+' : changes.length}
                        </span>
                    )}
                </button>

                {/* Reset all */}
                <button onClick={reset} title="Reset all changes and reload page">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                </button>

                <div className="editor-toolbar__divider" />

                {/* Exit */}
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
