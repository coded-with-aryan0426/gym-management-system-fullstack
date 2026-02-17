import { useMemo } from 'react'
import { useEditor } from '../../contexts/EditorContext'

const densities: Array<{ key: 'compact' | 'normal' | 'relaxed'; label: string }> = [
  { key: 'compact', label: 'Compact' },
  { key: 'normal', label: 'Normal' },
  { key: 'relaxed', label: 'Relaxed' }
]

export default function InspectorPanel() {
  const {
    isEditing,
    selectedId,
    getOverride,
    setVisibility,
    setDensity,
    setPadding,
    setGap,
    undo,
    reset
  } = useEditor()

  const ov = useMemo(() => (selectedId ? getOverride(selectedId) : undefined), [selectedId, getOverride])
  const padTop = ov?.style?.paddingTop ? parseInt(String(ov.style.paddingTop)) : 0
  const padRight = ov?.style?.paddingRight ? parseInt(String(ov.style.paddingRight)) : 0
  const padBottom = ov?.style?.paddingBottom ? parseInt(String(ov.style.paddingBottom)) : 0
  const padLeft = ov?.style?.paddingLeft ? parseInt(String(ov.style.paddingLeft)) : 0
  const gap = ov?.style?.gap ? parseInt(String(ov.style.gap)) : 0

  const hidden = !isEditing

  return (
    <div
      className={`fixed top-0 right-0 z-[10000] h-screen w-80 transform transition-transform duration-300 ${
        hidden ? 'translate-x-full' : 'translate-x-0'
      } bg-[#0F1115] border-l border-white/10 text-gray-200`}
    >
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="text-sm font-semibold">Inspector</div>
        <div className="text-[10px] text-gray-400">{selectedId ?? 'No selection'}</div>
      </div>
      <div className="p-4 space-y-5 text-sm">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-gray-400">Component</div>
          <div className="px-2 py-2 rounded bg-white/5 border border-white/10 text-xs">
            {selectedId ?? 'Click a component to select'}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-gray-400">Visibility</div>
          <div className="flex items-center gap-2">
            <label className={`flex items-center gap-2 ${!selectedId ? 'opacity-50 pointer-events-none' : ''}`}>
              <input
                type="checkbox"
                checked={ov?.visible !== false}
                onChange={(e) => selectedId && setVisibility(selectedId, e.target.checked)}
              />
              <span>Visible</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-gray-400">Density</div>
          <div className="flex items-center gap-2">
            {densities.map((d) => (
              <button
                key={d.key}
                className={`px-3 py-1 rounded border text-xs ${
                  ov?.density === d.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/5 text-gray-200 border-white/10'
                } ${!selectedId ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={() => selectedId && setDensity(selectedId, d.key)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-gray-400">Spacing</div>
          <div className={`grid grid-cols-2 gap-2 ${!selectedId ? 'opacity-50 pointer-events-none' : ''}`}>
            <label className="flex flex-col">
              <span className="text-[11px] text-gray-400">Padding Top</span>
              <input
                type="number"
                className="border border-white/10 bg-white/5 rounded px-2 py-1 text-gray-200"
                step={4}
                min={0}
                max={64}
                value={padTop}
                onChange={(e) => selectedId && setPadding(selectedId, { top: Number(e.target.value) })}
              />
            </label>
            <label className="flex flex-col">
              <span className="text-[11px] text-gray-400">Padding Right</span>
              <input
                type="number"
                className="border border-white/10 bg-white/5 rounded px-2 py-1 text-gray-200"
                step={4}
                min={0}
                max={64}
                value={padRight}
                onChange={(e) => selectedId && setPadding(selectedId, { right: Number(e.target.value) })}
              />
            </label>
            <label className="flex flex-col">
              <span className="text-[11px] text-gray-400">Padding Bottom</span>
              <input
                type="number"
                className="border border-white/10 bg-white/5 rounded px-2 py-1 text-gray-200"
                step={4}
                min={0}
                max={64}
                value={padBottom}
                onChange={(e) => selectedId && setPadding(selectedId, { bottom: Number(e.target.value) })}
              />
            </label>
            <label className="flex flex-col">
              <span className="text-[11px] text-gray-400">Padding Left</span>
              <input
                type="number"
                className="border border-white/10 bg-white/5 rounded px-2 py-1 text-gray-200"
                step={4}
                min={0}
                max={64}
                value={padLeft}
                onChange={(e) => selectedId && setPadding(selectedId, { left: Number(e.target.value) })}
              />
            </label>
            <label className="flex flex-col col-span-2">
              <span className="text-[11px] text-gray-400">Gap (flex/grid only)</span>
              <input
                type="number"
                className="border border-white/10 bg-white/5 rounded px-2 py-1 text-gray-200"
                step={2}
                min={0}
                max={64}
                value={gap}
                onChange={(e) => selectedId && setGap(selectedId, Number(e.target.value))}
              />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          <button className="px-3 py-1 rounded border text-xs bg-white/5 border-white/10 text-gray-200" onClick={undo}>Undo</button>
          <button className="px-3 py-1 rounded border text-xs bg-white/5 border-white/10 text-gray-200" onClick={reset}>Reset</button>
        </div>
      </div>
    </div>
  )
}
