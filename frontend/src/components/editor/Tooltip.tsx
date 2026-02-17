import { useEffect, useRef, useState } from 'react'

export default function Tooltip({
  label,
  description,
  children,
  delay = 300
}: {
  label: string
  description?: string
  children: React.ReactNode
  delay?: number
}) {
  const [open, setOpen] = useState(false)
  const timer = useRef<number | null>(null)
  const id = useRef(`tt-${Math.random().toString(36).slice(2)}`).current

  const show = () => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOpen(true), delay)
  }
  const hide = () => {
    if (timer.current) window.clearTimeout(timer.current)
    setOpen(false)
  }

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  return (
    <div
      className="relative inline-flex"
      onClick={() => show()}
      onBlur={() => setOpen(false)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') show()
      }}
    >
      <div aria-describedby={id}>{children}</div>
      {open && (
        <div
          id={id}
          role="tooltip"
          className="absolute top-12 left-1/2 -translate-x-1/2 w-64 bg-[#0F1115] text-gray-200 border border-white/10 rounded-md shadow-lg p-3 z-[10001]"
        >
          <div className="text-xs font-semibold">{label}</div>
          {description && <div className="text-[11px] text-gray-400 mt-1">{description}</div>}
        </div>
      )}
    </div>
  )
}
