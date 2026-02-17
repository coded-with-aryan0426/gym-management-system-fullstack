import { useMemo, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { useEditor } from '../../contexts/EditorContext'
import { ChevronLeft, ChevronRight, Download, GripHorizontal } from 'lucide-react'
import Tooltip from './Tooltip'
import ExportModal from './ExportModal'

function ToolbarButton({
  active,
  onClick,
  children,
  ...props
}: {
  active?: boolean
  onClick?: () => void
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`h-10 w-10 flex items-center justify-center rounded-md ${active ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-200'} border border-white/10 hover:bg-white/10 transition-colors`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

function Dropdown({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  // ... existing Dropdown implementation ...
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [dir, setDir] = useState<'down' | 'up'>('down')

  // ... (keep existing useEffects) ...
  // Re-implementing simplified useEffects for context
  React.useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  React.useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => {
      if (menuRef.current && menuRef.current.parentElement) {
        const host = menuRef.current.parentElement.getBoundingClientRect()
        const mh = menuRef.current.offsetHeight
        const availBelow = window.innerHeight - host.bottom
        setDir(availBelow >= mh + 16 ? 'down' : 'up')
      }
    }, 0)
    return () => window.clearTimeout(id)
  }, [open])

  if (!open) return null
  
  // Use Portal for dropdown to ensure it's not clipped and handles stacking correctly
  // Calculating position based on active element would be better, but for now fixed relative to parent is okay 
  // IF parent is not transforming.
  // Since toolbar uses motion (transform), we MUST use Portal for dropdowns or they will move with toolbar but might be clipped?
  // Actually, if toolbar moves, dropdown should move with it. 
  // But if toolbar has transform, fixed children behave relatively.
  
  const cls = dir === 'down'
    ? 'absolute top-12 left-1/2 -translate-x-1/2'
    : 'absolute bottom-12 left-1/2 -translate-x-1/2'

  return (
    <div
      ref={menuRef}
      className={`${cls} w-[380px] bg-[#0F1115] border border-white/10 rounded-lg shadow-lg p-3 text-sm text-gray-200 z-[10001]`}
    >
      {children}
    </div>
  )
}

// Helper for React import if needed, though we imported specific hooks
import React from 'react'

export default function FloatingEditorToolbar() {
  const {
    isEditing,
    selectedId,
    getOverride,
    undo,
    redo
  } = useEditor()

  const [exportOpen, setExportOpen] = useState(false)

  if (!isEditing || !selectedId) return null

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ x: '-50%', y: 0 }}
      className="fixed z-[10000] left-1/2 bottom-6 cursor-move"
      whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
    >
      <div
        className="px-4 py-3 rounded-2xl bg-[#0F1115] border border-white/10 shadow-xl backdrop-blur flex items-center gap-3 relative"
        role="toolbar"
        aria-label="Floating editor toolbar"
        onPointerDown={(e) => e.stopPropagation()} // Prevent drag from propagating to underlying elements if any
      >
        <div className="text-white/20 mr-1">
          <GripHorizontal size={20} />
        </div>

        <div className="h-10 w-[1px] bg-white/10 mx-1" aria-hidden="true" />

        <Tooltip label="Back" description="Go to the previous UI-only change.">
          <ToolbarButton aria-label="Go to previous change" onClick={() => undo()} onPointerDown={(e) => e.stopPropagation()}>
            <ChevronLeft size={18} />
          </ToolbarButton>
        </Tooltip>

        <Tooltip label="Forward" description="Go to the next UI-only change.">
          <ToolbarButton aria-label="Go to next change" onClick={() => redo()} onPointerDown={(e) => e.stopPropagation()}>
            <ChevronRight size={18} />
          </ToolbarButton>
        </Tooltip>

        <div className="h-10 w-[1px] bg-white/10 mx-1" aria-hidden="true" />

        <Tooltip label="Export" description="Export UI changes to JSON.">
          <ToolbarButton aria-label="Export changes" onClick={() => setExportOpen(true)} onPointerDown={(e) => e.stopPropagation()}>
            <Download size={18} />
          </ToolbarButton>
        </Tooltip>

        <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
      </div>
    </motion.div>
  )
}
