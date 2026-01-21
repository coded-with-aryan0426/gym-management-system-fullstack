import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type EditorContextValue = {
  isEditing: boolean
  toggleEditing: () => void
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  getOverride: (id: string) => UIOverride
  setVisibility: (id: string, visible: boolean) => void
  setDensity: (id: string, density: Density) => void
  setPadding: (id: string, padding: Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>) => void
  setMargin: (id: string, margin: Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>) => void
  setGap: (id: string, gap: number) => void
  setBackground: (id: string, background: string) => void
  setRadius: (id: string, radiusPx: number) => void
  setGridSpan: (id: string, span: number) => void
  setFlexOrder: (id: string, order: number) => void
  setTransform: (id: string, x: number, y: number, record?: boolean) => void
  setSize: (id: string, width: string | number, height: string | number, record?: boolean) => void
  setTextColor: (id: string, color: string) => void
  setFontSize: (id: string, sizePx: number) => void
  // New setters for full UI control
  setTextContent: (id: string, text: string) => void
  setBorder: (id: string, width: number, color: string, style?: string) => void
  setShadow: (id: string, shadow: string) => void
  setOpacity: (id: string, opacity: number) => void
  setFontWeight: (id: string, weight: number | string) => void
  setFontFamily: (id: string, family: string) => void
  setLineHeight: (id: string, lineHeight: number | string) => void
  setLetterSpacing: (id: string, spacing: number) => void
  setTextAlign: (id: string, align: 'left' | 'center' | 'right' | 'justify') => void
  setDisplay: (id: string, display: string) => void
  setFlexDirection: (id: string, direction: 'row' | 'column' | 'row-reverse' | 'column-reverse') => void
  setAlignItems: (id: string, align: string) => void
  setJustifyContent: (id: string, justify: string) => void
  setCursor: (id: string, cursor: string) => void
  setOverflow: (id: string, overflow: string) => void
  batchUpdate: (updates: Array<{ id: string; changes: Partial<UIOverride> }>) => void
  undo: () => void
  redo: () => void
  reset: () => void
  changes: ChangeRecord[]
  toolbarPos: { x: number; y: number }
  setToolbarPos: (pos: { x: number; y: number }) => void
  dock: 'none' | 'top' | 'bottom' | 'left' | 'right'
  setDock: (d: 'none' | 'top' | 'bottom' | 'left' | 'right') => void
}

const EditorContext = createContext<EditorContextValue | undefined>(undefined)

type Density = 'compact' | 'normal' | 'relaxed'

type UIOverride = {
  visible?: boolean
  density?: Density
  style?: React.CSSProperties
  textContent?: string  // For editable text
}

type ChangeRecord = {
  id: string
  type: 'visibility' | 'density' | 'spacing' | 'style' | 'layout' | 'text' | 'batch'
  property: string
  value: unknown
  previousValue: unknown
  timestamp: number
}

export type { UIOverride, ChangeRecord, Density }

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [overrides, setOverrides] = useState<Record<string, UIOverride>>({})
  const [changes, setChanges] = useState<ChangeRecord[]>([])
  const [redoStack, setRedoStack] = useState<ChangeRecord[]>([])
  const [toolbarPos, setToolbarPosState] = useState<{ x: number; y: number }>(() => {
    try {
      const raw = localStorage.getItem('editor_toolbar_pos')
      if (raw) return JSON.parse(raw)
    } catch { }
    return { x: 240, y: 80 }
  })
  const [dock, setDockState] = useState<'none' | 'top' | 'bottom' | 'left' | 'right'>(() => {
    try {
      const raw = localStorage.getItem('editor_toolbar_dock')
      if (raw === 'top' || raw === 'bottom' || raw === 'left' || raw === 'right') return raw
    } catch { }
    return 'bottom'
  })

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
        e.preventDefault()
        setIsEditing((v) => !v)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (isEditing && !selectedId) {
      const first = document.querySelector('[data-component-id]') as HTMLElement | null
      const idAttr = first?.getAttribute('data-component-id')
      if (idAttr) setSelectedId(idAttr)
    }
  }, [isEditing])

  const setToolbarPos = (pos: { x: number; y: number }) => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1280
    const h = typeof window !== 'undefined' ? window.innerHeight : 720
    const bw = 380
    const bh = 60
    const nx = Math.max(8, Math.min(w - bw - 8, pos.x))
    const ny = Math.max(8, Math.min(h - bh - 8, pos.y))
    setToolbarPosState({ x: nx, y: ny })
    if (dock !== 'none') {
      setDockState('none')
      try { localStorage.setItem('editor_toolbar_dock', 'none') } catch { }
    }
    try {
      localStorage.setItem('editor_toolbar_pos', JSON.stringify({ x: nx, y: ny }))
    } catch { }
  }

  const setDock = (d: 'none' | 'top' | 'bottom' | 'left' | 'right') => {
    setDockState(d)
    try { localStorage.setItem('editor_toolbar_dock', d) } catch { }
    const w = typeof window !== 'undefined' ? window.innerWidth : 1280
    const h = typeof window !== 'undefined' ? window.innerHeight : 720
    const bw = 380
    const bh = 60
    if (d === 'top') setToolbarPosState({ x: Math.max(8, Math.min(w - bw - 8, Math.floor((w - bw) / 2))), y: 8 })
    else if (d === 'bottom') setToolbarPosState({ x: Math.max(8, Math.min(w - bw - 8, Math.floor((w - bw) / 2))), y: h - bh - 8 })
    else if (d === 'left') setToolbarPosState({ x: 8, y: Math.max(8, Math.min(h - bh - 8, Math.floor((h - bh) / 3))) })
    else if (d === 'right') setToolbarPosState({ x: w - bw - 8, y: Math.max(8, Math.min(h - bh - 8, Math.floor((h - bh) / 3))) })
  }

  const getOverride = (id: string): UIOverride => {
    return overrides[id] ?? { visible: true, style: {} }
  }

  const recordChange = (rec: ChangeRecord) => {
    setChanges((prev) => [...prev, rec])
    setRedoStack([])
  }

  const setVisibility = (id: string, visible: boolean) => {
    const prev = getOverride(id)
    const previousValue = prev.visible ?? true
    setOverrides((o) => ({
      ...o,
      [id]: { ...prev, visible }
    }))
    recordChange({ id, type: 'visibility', property: 'visible', value: visible, previousValue, timestamp: Date.now() })
  }

  const setDensity = (id: string, density: Density) => {
    const prev = getOverride(id)
    const previousValue = prev.density ?? 'normal'
    setOverrides((o) => ({
      ...o,
      [id]: { ...prev, density }
    }))
    recordChange({ id, type: 'density', property: 'density', value: density, previousValue, timestamp: Date.now() })
  }

  const setPadding = (id: string, padding: Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>) => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = {
      top: style.paddingTop ? parseInt(String(style.paddingTop)) : 0,
      right: style.paddingRight ? parseInt(String(style.paddingRight)) : 0,
      bottom: style.paddingBottom ? parseInt(String(style.paddingBottom)) : 0,
      left: style.paddingLeft ? parseInt(String(style.paddingLeft)) : 0
    }
    if (padding.top !== undefined) style.paddingTop = `${padding.top}px`
    if (padding.right !== undefined) style.paddingRight = `${padding.right}px`
    if (padding.bottom !== undefined) style.paddingBottom = `${padding.bottom}px`
    if (padding.left !== undefined) style.paddingLeft = `${padding.left}px`
    setOverrides((o) => ({
      ...o,
      [id]: { ...prev, style }
    }))
    recordChange({ id, type: 'spacing', property: 'padding', value: padding, previousValue, timestamp: Date.now() })
  }

  const setGap = (id: string, gap: number) => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = style.gap ? String(style.gap) : '0px'
    style.gap = `${gap}px`
    setOverrides((o) => ({
      ...o,
      [id]: { ...prev, style }
    }))
    recordChange({ id, type: 'spacing', property: 'gap', value: gap, previousValue, timestamp: Date.now() })
  }

  const setBackground = (id: string, background: string) => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = style.background ?? ''
    style.background = background
    setOverrides((o) => ({
      ...o,
      [id]: { ...prev, style }
    }))
    recordChange({ id, type: 'style', property: 'background', value: background, previousValue, timestamp: Date.now() })
  }

  const setRadius = (id: string, radiusPx: number) => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = style.borderRadius ?? ''
    style.borderRadius = `${radiusPx}px`
    setOverrides((o) => ({
      ...o,
      [id]: { ...prev, style }
    }))
    recordChange({ id, type: 'style', property: 'borderRadius', value: radiusPx, previousValue, timestamp: Date.now() })
  }

  const setTextColor = (id: string, color: string) => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = style.color ?? ''
    style.color = color
    setOverrides((o) => ({
      ...o,
      [id]: { ...prev, style }
    }))
    recordChange({ id, type: 'style', property: 'color', value: color, previousValue, timestamp: Date.now() })
  }

  const setFontSize = (id: string, sizePx: number) => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = style.fontSize ?? ''
    style.fontSize = `${sizePx}px`
    setOverrides((o) => ({
      ...o,
      [id]: { ...prev, style }
    }))
    recordChange({ id, type: 'style', property: 'fontSize', value: sizePx, previousValue, timestamp: Date.now() })
  }

  const setGridSpan = (id: string, span: number) => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = style.gridColumn ?? ''
    style.gridColumn = `span ${Math.max(1, Math.min(12, span))}`
    setOverrides((o) => ({
      ...o,
      [id]: { ...prev, style }
    }))
    recordChange({ id, type: 'layout', property: 'gridColumn', value: span, previousValue, timestamp: Date.now() })
  }

  const setFlexOrder = (id: string, order: number) => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = style.order ?? 0
    style.order = order
    setOverrides((o) => ({
      ...o,
      [id]: { ...prev, style }
    }))
    recordChange({ id, type: 'layout', property: 'order', value: order, previousValue, timestamp: Date.now() })
  }

  const setTransform = (id: string, x: number, y: number) => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = style.transform ?? 'none'
    style.transform = `translate(${x}px, ${y}px)`
    setOverrides((o) => ({
      ...o,
      [id]: { ...prev, style }
    }))
    recordChange({ id, type: 'layout', property: 'transform', value: { x, y }, previousValue, timestamp: Date.now() })
  }

  const setSize = (id: string, width: string | number, height: string | number) => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = { width: style.width ?? 'auto', height: style.height ?? 'auto' }
    if (width !== 'auto') style.width = typeof width === 'number' ? `${width}px` : width
    if (height !== 'auto') style.height = typeof height === 'number' ? `${height}px` : height
    setOverrides((o) => ({
      ...o,
      [id]: { ...prev, style }
    }))
    recordChange({ id, type: 'layout', property: 'size', value: { width, height }, previousValue, timestamp: Date.now() })
  }

  // ============== NEW SETTER FUNCTIONS ==============

  const setMargin = (id: string, margin: Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>) => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = {
      top: style.marginTop ? parseInt(String(style.marginTop)) : 0,
      right: style.marginRight ? parseInt(String(style.marginRight)) : 0,
      bottom: style.marginBottom ? parseInt(String(style.marginBottom)) : 0,
      left: style.marginLeft ? parseInt(String(style.marginLeft)) : 0
    }
    if (margin.top !== undefined) style.marginTop = `${margin.top}px`
    if (margin.right !== undefined) style.marginRight = `${margin.right}px`
    if (margin.bottom !== undefined) style.marginBottom = `${margin.bottom}px`
    if (margin.left !== undefined) style.marginLeft = `${margin.left}px`
    setOverrides((o) => ({ ...o, [id]: { ...prev, style } }))
    recordChange({ id, type: 'spacing', property: 'margin', value: margin, previousValue, timestamp: Date.now() })
  }

  const setTextContent = (id: string, text: string) => {
    const prev = getOverride(id)
    const previousValue = prev.textContent ?? ''
    setOverrides((o) => ({ ...o, [id]: { ...prev, textContent: text } }))
    recordChange({ id, type: 'text', property: 'textContent', value: text, previousValue, timestamp: Date.now() })
  }

  const setBorder = (id: string, width: number, color: string, style: string = 'solid') => {
    const prev = getOverride(id)
    const styleObj = { ...(prev.style ?? {}) }
    const previousValue = {
      borderWidth: styleObj.borderWidth ?? '0px',
      borderColor: styleObj.borderColor ?? 'transparent',
      borderStyle: styleObj.borderStyle ?? 'none'
    }
    styleObj.borderWidth = `${width}px`
    styleObj.borderColor = color
    styleObj.borderStyle = style
    setOverrides((o) => ({ ...o, [id]: { ...prev, style: styleObj } }))
    recordChange({ id, type: 'style', property: 'border', value: { width, color, style }, previousValue, timestamp: Date.now() })
  }

  const setShadow = (id: string, shadow: string) => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = style.boxShadow ?? 'none'
    style.boxShadow = shadow
    setOverrides((o) => ({ ...o, [id]: { ...prev, style } }))
    recordChange({ id, type: 'style', property: 'boxShadow', value: shadow, previousValue, timestamp: Date.now() })
  }

  const setOpacity = (id: string, opacity: number) => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = style.opacity ?? 1
    style.opacity = Math.max(0, Math.min(1, opacity))
    setOverrides((o) => ({ ...o, [id]: { ...prev, style } }))
    recordChange({ id, type: 'style', property: 'opacity', value: opacity, previousValue, timestamp: Date.now() })
  }

  const setFontWeight = (id: string, weight: number | string) => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = style.fontWeight ?? 'normal'
    style.fontWeight = weight
    setOverrides((o) => ({ ...o, [id]: { ...prev, style } }))
    recordChange({ id, type: 'style', property: 'fontWeight', value: weight, previousValue, timestamp: Date.now() })
  }

  const setFontFamily = (id: string, family: string) => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = style.fontFamily ?? ''
    style.fontFamily = family
    setOverrides((o) => ({ ...o, [id]: { ...prev, style } }))
    recordChange({ id, type: 'style', property: 'fontFamily', value: family, previousValue, timestamp: Date.now() })
  }

  const setLineHeight = (id: string, lineHeight: number | string) => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = style.lineHeight ?? 'normal'
    style.lineHeight = typeof lineHeight === 'number' ? lineHeight : lineHeight
    setOverrides((o) => ({ ...o, [id]: { ...prev, style } }))
    recordChange({ id, type: 'style', property: 'lineHeight', value: lineHeight, previousValue, timestamp: Date.now() })
  }

  const setLetterSpacing = (id: string, spacing: number) => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = style.letterSpacing ?? '0px'
    style.letterSpacing = `${spacing}px`
    setOverrides((o) => ({ ...o, [id]: { ...prev, style } }))
    recordChange({ id, type: 'style', property: 'letterSpacing', value: spacing, previousValue, timestamp: Date.now() })
  }

  const setTextAlign = (id: string, align: 'left' | 'center' | 'right' | 'justify') => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = style.textAlign ?? 'left'
    style.textAlign = align
    setOverrides((o) => ({ ...o, [id]: { ...prev, style } }))
    recordChange({ id, type: 'style', property: 'textAlign', value: align, previousValue, timestamp: Date.now() })
  }

  const setDisplay = (id: string, display: string) => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = style.display ?? 'block'
    style.display = display
    setOverrides((o) => ({ ...o, [id]: { ...prev, style } }))
    recordChange({ id, type: 'layout', property: 'display', value: display, previousValue, timestamp: Date.now() })
  }

  const setFlexDirection = (id: string, direction: 'row' | 'column' | 'row-reverse' | 'column-reverse') => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = style.flexDirection ?? 'row'
    style.flexDirection = direction
    setOverrides((o) => ({ ...o, [id]: { ...prev, style } }))
    recordChange({ id, type: 'layout', property: 'flexDirection', value: direction, previousValue, timestamp: Date.now() })
  }

  const setAlignItems = (id: string, align: string) => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = style.alignItems ?? 'stretch'
    style.alignItems = align
    setOverrides((o) => ({ ...o, [id]: { ...prev, style } }))
    recordChange({ id, type: 'layout', property: 'alignItems', value: align, previousValue, timestamp: Date.now() })
  }

  const setJustifyContent = (id: string, justify: string) => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = style.justifyContent ?? 'flex-start'
    style.justifyContent = justify
    setOverrides((o) => ({ ...o, [id]: { ...prev, style } }))
    recordChange({ id, type: 'layout', property: 'justifyContent', value: justify, previousValue, timestamp: Date.now() })
  }

  const setCursor = (id: string, cursor: string) => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = style.cursor ?? 'auto'
    style.cursor = cursor
    setOverrides((o) => ({ ...o, [id]: { ...prev, style } }))
    recordChange({ id, type: 'style', property: 'cursor', value: cursor, previousValue, timestamp: Date.now() })
  }

  const setOverflow = (id: string, overflow: string) => {
    const prev = getOverride(id)
    const style = { ...(prev.style ?? {}) }
    const previousValue = style.overflow ?? 'visible'
    style.overflow = overflow
    setOverrides((o) => ({ ...o, [id]: { ...prev, style } }))
    recordChange({ id, type: 'style', property: 'overflow', value: overflow, previousValue, timestamp: Date.now() })
  }

  const batchUpdate = (updates: Array<{ id: string; changes: Partial<UIOverride> }>) => {
    const previousStates: Record<string, UIOverride> = {}
    updates.forEach(({ id }) => {
      previousStates[id] = getOverride(id)
    })

    setOverrides((o) => {
      const newOverrides = { ...o }
      updates.forEach(({ id, changes }) => {
        const prev = newOverrides[id] ?? { visible: true, style: {} }
        newOverrides[id] = {
          ...prev,
          ...changes,
          style: { ...(prev.style ?? {}), ...(changes.style ?? {}) }
        }
      })
      return newOverrides
    })

    recordChange({
      id: 'batch',
      type: 'batch',
      property: 'multiple',
      value: updates,
      previousValue: previousStates,
      timestamp: Date.now()
    })
  }

  // ============== END NEW SETTERS ==============

  const undo = () => {
    setChanges((prev) => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      const cur = getOverride(last.id)
      if (last.type === 'visibility' && last.property === 'visible') {
        setOverrides((o) => ({ ...o, [last.id]: { ...cur, visible: Boolean(last.previousValue) } }))
      } else if (last.type === 'density' && last.property === 'density') {
        setOverrides((o) => ({ ...o, [last.id]: { ...cur, density: last.previousValue as Density } }))
      } else if (last.type === 'spacing') {
        if (last.property === 'gap') {
          const style = { ...(cur.style ?? {}) }
          style.gap = typeof last.previousValue === 'string' ? last.previousValue : `${last.previousValue as number}px`
          setOverrides((o) => ({ ...o, [last.id]: { ...cur, style } }))
        } else if (last.property === 'padding') {
          const style = { ...(cur.style ?? {}) }
          const pv = last.previousValue as { top: number; right: number; bottom: number; left: number }
          style.paddingTop = `${pv.top}px`
          style.paddingRight = `${pv.right}px`
          style.paddingBottom = `${pv.bottom}px`
          style.paddingLeft = `${pv.left}px`
          setOverrides((o) => ({ ...o, [last.id]: { ...cur, style } }))
        }
      } else if (last.type === 'style') {
        const style = { ...(cur.style ?? {}) }
        style[last.property as keyof React.CSSProperties] = last.previousValue as any
        setOverrides((o) => ({ ...o, [last.id]: { ...cur, style } }))
      } else if (last.type === 'layout') {
        const style = { ...(cur.style ?? {}) }
        if (last.property === 'size') {
          const pv = last.previousValue as { width: string | number; height: string | number }
          style.width = typeof pv.width === 'number' ? `${pv.width}px` : pv.width
          style.height = typeof pv.height === 'number' ? `${pv.height}px` : pv.height
        } else {
          style[last.property as keyof React.CSSProperties] = last.previousValue as any
        }
        setOverrides((o) => ({ ...o, [last.id]: { ...cur, style } }))
      }
      setRedoStack((stack) => [...stack, last])
      return prev.slice(0, -1)
    })
  }

  const redo = () => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      const cur = getOverride(last.id)
      if (last.type === 'visibility' && last.property === 'visible') {
        setOverrides((o) => ({ ...o, [last.id]: { ...cur, visible: Boolean(last.value) } }))
      } else if (last.type === 'density' && last.property === 'density') {
        setOverrides((o) => ({ ...o, [last.id]: { ...cur, density: last.value as Density } }))
      } else if (last.type === 'spacing') {
        if (last.property === 'gap') {
          const style = { ...(cur.style ?? {}) }
          const v = typeof last.value === 'number' ? last.value : parseInt(String(last.value))
          style.gap = `${v}px`
          setOverrides((o) => ({ ...o, [last.id]: { ...cur, style } }))
        } else if (last.property === 'padding') {
          const style = { ...(cur.style ?? {}) }
          const pv = last.value as Partial<{ top: number; right: number; bottom: number; left: number }>
          if (pv.top !== undefined) style.paddingTop = `${pv.top}px`
          if (pv.right !== undefined) style.paddingRight = `${pv.right}px`
          if (pv.bottom !== undefined) style.paddingBottom = `${pv.bottom}px`
          if (pv.left !== undefined) style.paddingLeft = `${pv.left}px`
          setOverrides((o) => ({ ...o, [last.id]: { ...cur, style } }))
        }
      } else if (last.type === 'style') {
        const style = { ...(cur.style ?? {}) }
        if (last.property === 'fontSize') {
          const v = typeof last.value === 'number' ? last.value : parseInt(String(last.value as string))
          style.fontSize = `${v}px`
        } else {
          style[last.property as keyof React.CSSProperties] = last.value as any
        }
        setOverrides((o) => ({ ...o, [last.id]: { ...cur, style } }))
      } else if (last.type === 'layout') {
        const style = { ...(cur.style ?? {}) }
        if (last.property === 'gridColumn') {
          const span = typeof last.value === 'number' ? last.value : parseInt(String(last.value as string))
          const clamped = Math.max(1, Math.min(12, span))
          style.gridColumn = `span ${clamped}`
        } else if (last.property === 'transform') {
          const v = last.value as { x: number; y: number }
          style.transform = `translate(${v.x}px, ${v.y}px)`
        } else if (last.property === 'size') {
          const v = last.value as { width: string | number; height: string | number }
          style.width = typeof v.width === 'number' ? `${v.width}px` : v.width
          style.height = typeof v.height === 'number' ? `${v.height}px` : v.height
        } else {
          style[last.property as keyof React.CSSProperties] = last.value as any
        }
        setOverrides((o) => ({ ...o, [last.id]: { ...cur, style } }))
      }
      setChanges((history) => [...history, last])
      return prev.slice(0, -1)
    })
  }

  const reset = () => {
    setOverrides({})
    setChanges([])
    setRedoStack([])
    setSelectedId(null)
  }

  const value = useMemo<EditorContextValue>(() => ({
    isEditing,
    toggleEditing: () => {
      setIsEditing((v) => !v)
      setSelectedId(null)
    },
    selectedId,
    setSelectedId,
    getOverride,
    setVisibility,
    setDensity,
    setPadding,
    setMargin,
    setGap,
    setBackground,
    setRadius,
    setGridSpan,
    setFlexOrder,
    setTransform,
    setSize,
    setTextColor,
    setFontSize,
    // New setters
    setTextContent,
    setBorder,
    setShadow,
    setOpacity,
    setFontWeight,
    setFontFamily,
    setLineHeight,
    setLetterSpacing,
    setTextAlign,
    setDisplay,
    setFlexDirection,
    setAlignItems,
    setJustifyContent,
    setCursor,
    setOverflow,
    batchUpdate,
    undo,
    redo,
    reset,
    changes,
    toolbarPos,
    setToolbarPos,
    dock,
    setDock
  }), [isEditing, selectedId, overrides, changes, toolbarPos, dock])

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditor must be used within EditorProvider')
  return ctx
}
