/**
 * ExportModal - Export changes as AI-ready prompt
 * 
 * Generates a copy-paste ready prompt that instructs AI to apply the changes
 */

import { useMemo, useState } from 'react'
import { useEditor } from './EditorProvider'

interface ExportModalProps {
    onClose: () => void
}

export function ExportModal({ onClose }: ExportModalProps) {
    const { changes } = useEditor()
    const [copied, setCopied] = useState(false)

    // Generate AI-ready prompt
    const promptText = useMemo(() => {
        // Group changes by component
        const byComponent: Record<string, typeof changes> = {}
        changes.forEach(change => {
            if (!byComponent[change.id]) byComponent[change.id] = []
            byComponent[change.id].push(change)
        })

        const page = window.location.pathname
        const componentCount = Object.keys(byComponent).length

        // Build readable change descriptions
        const changeDescriptions = Object.entries(byComponent).map(([id, componentChanges]) => {
            const changesList = componentChanges.map(c => {
                if (c.type === 'layout' && c.property === 'size') {
                    const v = c.value as { width: number; height: number }
                    return `  - Set size to ${Math.round(v.width)}px × ${Math.round(v.height)}px`
                }
                if (c.type === 'style') {
                    return `  - Set ${c.property} to ${JSON.stringify(c.value)}`
                }
                if (c.type === 'spacing') {
                    return `  - Set ${c.property} to ${JSON.stringify(c.value)}`
                }
                return `  - Change ${c.property} to ${JSON.stringify(c.value)}`
            }).join('\n')

            return `### ${id}\n${changesList}`
        }).join('\n\n')

        // Generate the prompt
        return `## UI Layout Changes Request

Apply the following visual layout changes to the **${page}** page in this project.

**Summary:** ${changes.length} change(s) across ${componentCount} component(s)

---

${changeDescriptions}

---

**Instructions:**
1. Find each component by its \`data-component-id\` or \`data-editable-id\` attribute
2. Apply the specified size/style changes to the component's CSS or inline styles
3. Use \`width\` and \`height\` properties for size changes
4. Preserve the component's existing functionality

**Component Mapping (JSON):**
\`\`\`json
${JSON.stringify(
            Object.entries(byComponent).map(([id, componentChanges]) => ({
                id,
                changes: componentChanges.map(c => ({
                    type: c.type,
                    property: c.property,
                    value: c.value
                }))
            })),
            null,
            2
        )}
\`\`\``
    }, [changes])

    const handleCopy = () => {
        navigator.clipboard.writeText(promptText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDownload = () => {
        const blob = new Blob([promptText], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ui-changes-${Date.now()}.md`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div
            className="export-modal-overlay"
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100001
            }}
            data-editor-ui
        >
            <div
                className="export-modal"
                onClick={e => e.stopPropagation()}
                style={{
                    width: '700px',
                    maxHeight: '85vh',
                    background: '#1a1a1f',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    overflow: 'hidden',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.5)'
                }}
            >
                {/* Header - COMPACT */}
                <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <h3 style={{ margin: 0, color: 'white', fontSize: '15px' }}>
                            📋 Copy AI Prompt
                        </h3>
                        <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                            Paste directly into AI chat
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: 'rgba(255,255,255,0.7)',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px'
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <pre style={{
                    margin: 0,
                    padding: '12px 16px',
                    overflow: 'auto',
                    maxHeight: '35vh',
                    background: '#0d0d0f',
                    color: '#E5E5E5',
                    fontSize: '11px',
                    fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
                    lineHeight: 1.4,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                }}>
                    {promptText}
                </pre>

                {/* Footer - COMPACT */}
                <div style={{
                    padding: '10px 16px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                        {changes.length} change(s)
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={handleDownload}
                            style={{
                                padding: '6px 12px',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '6px',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            Download
                        </button>
                        <button
                            onClick={handleCopy}
                            style={{
                                padding: '6px 16px',
                                background: copied ? '#10B981' : '#3B82F6',
                                border: 'none',
                                borderRadius: '6px',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 600,
                                transition: 'background 0.2s'
                            }}
                        >
                            {copied ? '✓ Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ExportModal
