import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useEditor } from '../../contexts/EditorContext'
import { Copy, Download, Clipboard, Check, X } from 'lucide-react'

export default function ExportModal({
  open,
  onClose
}: {
  open: boolean
  onClose: () => void
}) {
  const { changes, getOverride } = useEditor()
  const [copied, setCopied] = useState(false)
  const data = useMemo(() => {
    const ids = Array.from(new Set(changes.map((c) => c.id))).sort((a, b) => a.localeCompare(b))
    const buildSorted = (obj: Record<string, unknown>) => {
      const entries = Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
      entries.sort(([a], [b]) => a.localeCompare(b))
      return Object.fromEntries(entries)
    }
    const out = ids.map((id) => {
      const ov = getOverride(id)
      const layout: Record<string, unknown> = {}
      if (ov.style?.gridColumn) layout.gridColumn = ov.style.gridColumn
      if (ov.style?.order !== undefined) layout.order = ov.style.order
      if (ov.style?.transform) layout.transform = ov.style.transform
      if (ov.style?.width) layout.width = ov.style.width
      if (ov.style?.height) layout.height = ov.style.height
      const spacing: Record<string, unknown> = {}
      const pad: Record<string, number> = {}
      if (ov.style?.paddingTop) pad.top = parseInt(String(ov.style.paddingTop))
      if (ov.style?.paddingRight) pad.right = parseInt(String(ov.style.paddingRight))
      if (ov.style?.paddingBottom) pad.bottom = parseInt(String(ov.style.paddingBottom))
      if (ov.style?.paddingLeft) pad.left = parseInt(String(ov.style.paddingLeft))
      if (Object.keys(pad).length) spacing.padding = pad
      if (ov.style?.gap !== undefined) spacing.gap = typeof ov.style.gap === 'string' ? parseInt(ov.style.gap as string) : ov.style.gap
      const style: Record<string, unknown> = {}
      if (ov.style?.background) style.background = ov.style.background
      if (ov.style?.borderRadius) style.borderRadius = ov.style.borderRadius
      if (ov.style?.color) style.color = ov.style.color
      if (ov.style?.fontSize) style.fontSize = ov.style.fontSize
      const visibility: Record<string, unknown> = {}
      if (ov.visible !== undefined) visibility.visible = ov.visible
      const payload: Record<string, unknown> = {
        componentId: id
      }
      if (Object.keys(layout).length) payload.layout = buildSorted(layout)
      if (Object.keys(spacing).length) payload.spacing = spacing
      if (Object.keys(style).length) payload.style = buildSorted(style)
      if (Object.keys(visibility).length) payload.visibility = visibility
      return payload
    })
    return {
      page: typeof window !== 'undefined' ? window.location.pathname : '/',
      timestamp: new Date().toISOString(),
      changes: out
    }
  }, [changes, getOverride])

  const json = useMemo(() => JSON.stringify(data, null, 2), [data])

  if (!open) return null

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const download = () => {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ui-changes-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return createPortal(
    <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} aria-hidden="true" />
      <div className="relative w-[800px] max-w-[90vw] h-[600px] max-h-[90vh] rounded-xl border border-white/10 bg-[#0F1115] shadow-2xl flex flex-col overflow-hidden">
        <div className="relative px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="text-lg font-semibold text-white">Export UI Changes</div>
          <button 
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors" 
            onClick={onClose} 
            aria-label="Close export"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6 flex-1 overflow-hidden flex flex-col">
          <div className="text-sm text-gray-400 shrink-0">
            Copy or download this JSON and apply with your AI agent to persist your changes.
          </div>
          <div className="flex-1 relative group bg-black/20 rounded-lg border border-white/10 overflow-hidden">
            <pre className="absolute inset-0 overflow-auto text-xs p-4 text-gray-300 font-mono leading-relaxed selection:bg-violet-500/30 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {json}
            </pre>
          </div>
          <div className="flex items-center justify-end gap-4 shrink-0">
            <button 
              className="group relative flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={download} 
              aria-label="Download JSON file"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 group-hover:bg-white/30 transition-colors">
                <Download size={18} />
              </div>
              <span className="font-semibold text-sm">Download JSON</span>
            </button>
            <button 
              className="group relative flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={copy} 
              aria-label="Copy JSON to clipboard"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 group-hover:bg-white/30 transition-colors">
                {copied ? <Check size={18} /> : <Clipboard size={18} />}
              </div>
              <span className="font-semibold text-sm">{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
