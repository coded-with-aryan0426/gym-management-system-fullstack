import { useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { useEditor } from '../../contexts/EditorContext'

type EditableConfig = {
  allowLayout?: boolean
  allowStyle?: boolean
  allowContent?: boolean
  allowVisibility?: boolean
}

export default function Editable({
  id,
  children,
  config
}: {
  id: string
  children: React.ReactNode
  config?: EditableConfig
}) {
  const { isEditing, selectedId, setSelectedId, getOverride, setTransform, setSize } = useEditor()
  const ref = useRef<HTMLDivElement | null>(null)
  const startDims = useRef<{ w: number; h: number; x: number; y: number }>({ w: 0, h: 0, x: 0, y: 0 })
  const isSelected = selectedId === id
  const canEdit = useMemo(() => ({
    layout: !!config?.allowLayout,
    style: !!config?.allowStyle,
    content: !!config?.allowContent,
    visibility: !!config?.allowVisibility
  }), [config])

  const ov = getOverride(id)
  const densityPadding = ov.density === 'compact' ? 8 : ov.density === 'relaxed' ? 24 : 16
  const hasExplicitPadding = !!(ov.style?.padding || ov.style?.paddingTop || ov.style?.paddingRight || ov.style?.paddingBottom || ov.style?.paddingLeft)
  
  // Extract transform (x, y) if present to pass to motion.div separately
  const transformMatch = ov.style?.transform?.match(/translate\(([-\d]+)px,\s*([-\d]+)px\)/)
  const x = transformMatch ? parseInt(transformMatch[1]) : 0
  const y = transformMatch ? parseInt(transformMatch[2]) : 0

  const wrapperStyle: React.CSSProperties = {
    ...(ov.style ?? {}),
    ...(ov.visible === false ? { visibility: 'hidden' } : {}),
    ...(hasExplicitPadding ? {} : { padding: `${densityPadding}px` })
  }
  // Remove transform from style as we handle it via x/y props
  if (wrapperStyle.transform) delete wrapperStyle.transform

  useEffect(() => {
    const el = ref.current?.firstElementChild as HTMLElement | null
    if (!el) return
    const gap = ov.style?.gap
    if (gap !== undefined) {
      const disp = window.getComputedStyle(el).display
      if (disp.includes('flex') || disp.includes('grid')) {
        el.style.gap = String(gap)
      }
    }
    return () => {
      if (el && ov.style?.gap !== undefined) {
        el.style.gap = ''
      }
    }
  }, [ov.style?.gap])

  const renderResizeHandles = () => {
    if (!isSelected || !canEdit.layout) return null
    
    const handles = [
      { dir: 'nw', cursor: 'nw-resize', cls: '-top-1.5 -left-1.5' },
      { dir: 'n',  cursor: 'n-resize',  cls: '-top-1.5 left-1/2 -translate-x-1/2' },
      { dir: 'ne', cursor: 'ne-resize', cls: '-top-1.5 -right-1.5' },
      { dir: 'e',  cursor: 'e-resize',  cls: 'top-1/2 -right-1.5 -translate-y-1/2' },
      { dir: 'se', cursor: 'se-resize', cls: '-bottom-1.5 -right-1.5' },
      { dir: 's',  cursor: 's-resize',  cls: '-bottom-1.5 left-1/2 -translate-x-1/2' },
      { dir: 'sw', cursor: 'sw-resize', cls: '-bottom-1.5 -left-1.5' },
      { dir: 'w',  cursor: 'w-resize',  cls: 'top-1/2 -left-1.5 -translate-y-1/2' }
    ]

    return handles.map(({ dir, cursor, cls }) => (
      <motion.div
        key={dir}
        className={`absolute w-3 h-3 bg-white border border-blue-600 rounded-full z-[9010] ${cls}`}
        style={{ cursor }}
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
        onDragStart={() => {
          if (ref.current) {
            startDims.current = {
              w: ref.current.offsetWidth,
              h: ref.current.offsetHeight,
              x,
              y
            }
          }
        }}
        onDrag={(_, info) => {
          const s = startDims.current
          let newW = s.w
          let newH = s.h
          let newX = s.x
          let newY = s.y

          if (dir.includes('e')) newW = Math.max(20, s.w + info.offset.x)
          if (dir.includes('s')) newH = Math.max(20, s.h + info.offset.y)
          if (dir.includes('w')) {
            const delta = Math.min(s.w - 20, info.offset.x)
            newW = s.w - delta
            newX = s.x + delta
          }
          if (dir.includes('n')) {
            const delta = Math.min(s.h - 20, info.offset.y)
            newH = s.h - delta
            newY = s.y + delta
          }

          setSize(id, newW, newH, false)
          if (newX !== s.x || newY !== s.y) {
            setTransform(id, newX, newY, false)
          }
        }}
        onDragEnd={(_, info) => {
          // Re-calculate one last time to record change
          const s = startDims.current
          let newW = s.w
          let newH = s.h
          let newX = s.x
          let newY = s.y

          if (dir.includes('e')) newW = Math.max(20, s.w + info.offset.x)
          if (dir.includes('s')) newH = Math.max(20, s.h + info.offset.y)
          if (dir.includes('w')) {
            const delta = Math.min(s.w - 20, info.offset.x)
            newW = s.w - delta
            newX = s.x + delta
          }
          if (dir.includes('n')) {
            const delta = Math.min(s.h - 20, info.offset.y)
            newH = s.h - delta
            newY = s.y + delta
          }
          
          setSize(id, newW, newH, true)
          if (newX !== s.x || newY !== s.y) {
            setTransform(id, newX, newY, true)
          }
        }}
        onPointerDown={(e) => e.stopPropagation()}
      />
    ))
  }

  if (!isEditing) return <div style={wrapperStyle} data-component-id={id}>{children}</div>

  return (
    <motion.div
      ref={ref}
      data-component-id={id}
      className={`relative z-[9000] ${isSelected ? 'ring-2 ring-blue-500' : ''} border border-dashed border-blue-400 hover:border-blue-600 hover:ring-1 hover:ring-blue-400 transition cursor-move`}
      style={wrapperStyle}
      initial={{ x, y }}
      animate={{ x, y }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      drag={canEdit.layout}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        const newX = x + info.offset.x
        const newY = y + info.offset.y
        if (newX !== x || newY !== y) {
          setTransform(id, newX, newY, true)
        }
      }}
      onClick={(e) => {
        e.stopPropagation()
        setSelectedId(id)
      }}
    >
      <div className="absolute -top-3 left-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded shadow flex gap-2 select-none pointer-events-none z-10">
        <span>{id}</span>
        <span className="opacity-80">
          {[
            canEdit.layout ? 'L' : null,
            canEdit.style ? 'S' : null,
            canEdit.content ? 'C' : null,
            canEdit.visibility ? 'V' : null
          ].filter(Boolean).join('/')}
        </span>
      </div>
      <div className="absolute -left-1 -top-1 w-2 h-2 bg-blue-600 rounded-sm" />
      <div className="absolute -right-1 -top-1 w-2 h-2 bg-blue-600 rounded-sm" />
      <div className="absolute -left-1 -bottom-1 w-2 h-2 bg-blue-600 rounded-sm" />
      <div className="absolute -right-1 -bottom-1 w-2 h-2 bg-blue-600 rounded-sm" />
      
      {renderResizeHandles()}

      {children}
    </motion.div>
  )
}
