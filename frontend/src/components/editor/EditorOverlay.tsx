import { useEditor } from '../../contexts/EditorContext'
import FloatingEditorToolbar from './FloatingEditorToolbar'
import { Pencil, X } from 'lucide-react'

export default function EditorOverlay() {
  const { isEditing, toggleEditing, selectedId } = useEditor()

  return (
    <>
      <FloatingEditorToolbar />
      <div className="fixed bottom-4 right-4 z-[10000] flex items-center gap-2">
        <button
          onClick={toggleEditing}
          className={`h-12 w-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
            isEditing ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
          }`}
          aria-label={isEditing ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        >
          {isEditing ? <X size={24} /> : <Pencil size={24} />}
        </button>
      </div>
    </>
  )
}
