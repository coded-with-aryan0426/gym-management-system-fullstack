/**
 * ExportModal - Export changes as structured JSON + AI-ready prompt
 *
 * Phase 3: Export Engine
 * - Tab 1: AI Prompt  – copy-paste directly into any AI chat
 * - Tab 2: JSON       – machine-readable, deterministic change file
 */

import { useMemo, useState } from 'react'
import { useEditor } from './EditorProvider'

interface ExportModalProps {
    onClose: () => void
}

type ExportTab = 'prompt' | 'json'

export function ExportModal({ onClose }: ExportModalProps) {
    const { changes } = useEditor()
    const [copied, setCopied] = useState(false)
    const [tab, setTab] = useState<ExportTab>('prompt')

    // ── JSON export (deterministic, AI-safe) ──────────────────────────
    const jsonExport = useMemo(() => {
        // Collapse multiple changes for the same id+property to the last value
        const collapsed: Record<string, Record<string, { type: string; value: unknown; previousValue: unknown }>> = {}

        changes.forEach(c => {
            if (!collapsed[c.id]) collapsed[c.id] = {}
            collapsed[c.id][c.property] = { type: c.type, value: c.value, previousValue: c.previousValue }
        })

        const changeList = Object.entries(collapsed).map(([componentId, props]) => ({
            componentId,
            changes: Object.entries(props).map(([property, { type, value }]) => ({
                type,
                property,
                value,
            }))
        }))

        return {
            page: window.location.pathname,
            timestamp: new Date().toISOString(),
            totalChanges: changes.length,
            components: changeList,
        }
    }, [changes])

    // ── AI Prompt export ──────────────────────────────────────────────
    const promptText = useMemo(() => {
        const byComponent: Record<string, typeof changes> = {}
        changes.forEach(c => {
            if (!byComponent[c.id]) byComponent[c.id] = []
            byComponent[c.id].push(c)
        })

        const page = window.location.pathname
        const componentCount = Object.keys(byComponent).length

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

        return `## UI Layout Changes — Apply Exactly

Page: \`${page}\`
Changes: ${changes.length} across ${componentCount} component(s)

---

${changeDescriptions}

---

**Instructions to AI:**
Apply ONLY the declared UI changes listed above to this codebase.
- Find each component by its \`data-component-id\`, \`data-editable-id\`, or \`data-edit-id\` attribute.
- Apply size, style, and spacing changes via the component's CSS / inline styles.
- Do NOT refactor, optimize, or modify any business logic, API calls, or data models.
- Do NOT rename or move any files.
- Preserve all existing functionality exactly as-is.

**Machine-readable JSON:**
\`\`\`json
${JSON.stringify(jsonExport, null, 2)}
\`\`\``
    }, [changes, jsonExport])

    const activeText = tab === 'prompt' ? promptText : JSON.stringify(jsonExport, null, 2)

    const handleCopy = () => {
        navigator.clipboard.writeText(activeText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDownload = () => {
        const isJson = tab === 'json'
        const blob = new Blob([activeText], { type: isJson ? 'application/json' : 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = isJson
            ? `ui-changes-${Date.now()}.json`
            : `ui-changes-${Date.now()}.md`
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
                    width: '720px',
                    maxHeight: '88vh',
                    background: '#1a1a1f',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    overflow: 'hidden',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0
                }}>
                    <div>
                        <h3 style={{ margin: 0, color: 'white', fontSize: '15px', fontWeight: 600 }}>
                            Export UI Changes
                        </h3>
                        <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                            {changes.length} change(s) recorded — copy &amp; paste into AI
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

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: 0,
                    padding: '8px 16px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    flexShrink: 0
                }}>
                    {(['prompt', 'json'] as ExportTab[]).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            style={{
                                padding: '6px 16px',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: tab === t ? '2px solid #3B82F6' : '2px solid transparent',
                                color: tab === t ? '#3B82F6' : 'rgba(255,255,255,0.4)',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: tab === t ? 600 : 400,
                                marginBottom: '-1px'
                            }}
                        >
                            {t === 'prompt' ? 'AI Prompt' : 'JSON Export'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <pre style={{
                    margin: 0,
                    padding: '12px 16px',
                    overflow: 'auto',
                    flex: 1,
                    maxHeight: '55vh',
                    background: '#0d0d0f',
                    color: '#E5E5E5',
                    fontSize: '11px',
                    fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                }}>
                    {activeText}
                </pre>

                {/* Footer */}
                <div style={{
                    padding: '10px 16px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0
                }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>
                        {tab === 'prompt'
                            ? 'Paste into Claude, ChatGPT, Gemini, or Orchids'
                            : 'Deterministic JSON — safe for automated tooling'}
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
                                padding: '6px 20px',
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
