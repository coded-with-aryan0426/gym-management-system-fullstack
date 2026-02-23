import React, { useState, useEffect, useRef } from 'react'
import { FiX, FiMessageSquare, FiTrash2, FiAlertTriangle, FiSend, FiUser } from 'react-icons/fi'
import api from '../../services/api'
import { showToast } from '../../utils/showToast'
import './UserActionModals.css'

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */
export interface UserActionTarget {
  userId: number
  fullName: string
  email?: string
  userType: 'member' | 'trainer' | 'staff'
}

/* ─────────────────────────────────────────────────────────────
   SendMessageModal
───────────────────────────────────────────────────────────── */
interface SendMessageModalProps {
  isOpen: boolean
  onClose: () => void
  target: UserActionTarget | null
  /** For batch messaging — pass multiple targets */
  targets?: UserActionTarget[]
}

export const SendMessageModal: React.FC<SendMessageModalProps> = ({ isOpen, onClose, target, targets }) => {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const subjectRef = useRef<HTMLInputElement>(null)

  const recipients = targets && targets.length > 0 ? targets : target ? [target] : []
  const isBatch = recipients.length > 1

  useEffect(() => {
    if (isOpen) {
      setSubject('')
      setBody('')
      setTimeout(() => subjectRef.current?.focus(), 120)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const handleSend = async () => {
    if (!subject.trim()) { showToast('Subject is required', 'error'); return }
    if (!body.trim()) { showToast('Message body is required', 'error'); return }
    setSending(true)
    try {
      await Promise.all(
        recipients.map(r =>
          api.sendMemberMessage(r.userId, { subject: subject.trim(), body: body.trim() })
        )
      )
      showToast(
        isBatch
          ? `Message sent to ${recipients.length} ${recipients[0]?.userType}s`
          : `Message sent to ${recipients[0]?.fullName}`,
        'success'
      )
      onClose()
    } catch (err: any) {
      console.error('[SendMessage] Failed:', err)
      showToast('Failed to send message', 'error', err?.message || 'Please try again')
    } finally {
      setSending(false)
    }
  }

  if (!isOpen || recipients.length === 0) return null

  return (
    <div className="uam-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="uam uam--message" role="dialog" aria-modal="true" aria-label="Send message">

        {/* Header */}
        <div className="uam__header">
          <div className="uam__header-icon uam__header-icon--message">
            <FiMessageSquare size={18} />
          </div>
          <div className="uam__header-text">
            <h2 className="uam__title">Send Message</h2>
            <p className="uam__subtitle">
              {isBatch
                ? `Sending to ${recipients.length} ${recipients[0]?.userType}s`
                : `To: ${recipients[0]?.fullName}`}
            </p>
          </div>
          <button className="uam__close" onClick={onClose} aria-label="Close"><FiX size={16} /></button>
        </div>

        {/* Recipients preview */}
        {isBatch && (
          <div className="uam__recipients">
            {recipients.slice(0, 5).map(r => (
              <span key={r.userId} className="uam__recipient-chip">
                <FiUser size={10} />{r.fullName}
              </span>
            ))}
            {recipients.length > 5 && (
              <span className="uam__recipient-chip uam__recipient-chip--more">
                +{recipients.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Body */}
        <div className="uam__body">
          <div className="uam__field">
            <label className="uam__label">Subject <span className="uam__required">*</span></label>
            <input
              ref={subjectRef}
              type="text"
              className="uam__input"
              placeholder="e.g. Membership renewal reminder"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              maxLength={120}
              disabled={sending}
            />
            <span className="uam__char-count">{subject.length}/120</span>
          </div>
          <div className="uam__field">
            <label className="uam__label">Message <span className="uam__required">*</span></label>
            <textarea
              className="uam__textarea"
              placeholder="Write your message here..."
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={5}
              maxLength={1000}
              disabled={sending}
            />
            <span className="uam__char-count">{body.length}/1000</span>
          </div>
        </div>

        {/* Footer */}
        <div className="uam__footer">
          <button className="uam__btn uam__btn--cancel" onClick={onClose} disabled={sending}>Cancel</button>
          <button
            className="uam__btn uam__btn--send"
            onClick={handleSend}
            disabled={sending || !subject.trim() || !body.trim()}
          >
            {sending ? <span className="uam__spinner" /> : <FiSend size={14} />}
            {sending ? 'Sending…' : isBatch ? `Send to ${recipients.length}` : 'Send Message'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ConfirmDeleteModal
───────────────────────────────────────────────────────────── */
interface ConfirmDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  target: UserActionTarget | null
  targets?: UserActionTarget[]
  onDeleted?: () => void
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen, onClose, target, targets, onDeleted
}) => {
  const [deleting, setDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const recipients = targets && targets.length > 0 ? targets : target ? [target] : []
  const isBatch = recipients.length > 1
  const CONFIRM_WORD = 'DELETE'

  useEffect(() => {
    if (isOpen) {
      setConfirmText('')
      setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const handleDelete = async () => {
    if (confirmText !== CONFIRM_WORD) return
    setDeleting(true)
    try {
      await Promise.all(recipients.map(r => api.deleteUser(r.userId)))
      showToast(
        isBatch
          ? `${recipients.length} ${recipients[0]?.userType}s deleted`
          : `${recipients[0]?.fullName} deleted`,
        'success'
      )
      onDeleted?.()
      onClose()
    } catch (err: any) {
      console.error('[DeleteUser] Failed:', err)
      showToast('Failed to delete', 'error', err?.message || 'Please try again')
    } finally {
      setDeleting(false)
    }
  }

  if (!isOpen || recipients.length === 0) return null

  const canDelete = confirmText === CONFIRM_WORD && !deleting

  return (
    <div className="uam-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="uam uam--delete" role="dialog" aria-modal="true" aria-label="Confirm delete">

        {/* Header */}
        <div className="uam__header">
          <div className="uam__header-icon uam__header-icon--delete">
            <FiAlertTriangle size={18} />
          </div>
          <div className="uam__header-text">
            <h2 className="uam__title">Delete {isBatch ? `${recipients.length} Users` : recipients[0]?.fullName}</h2>
            <p className="uam__subtitle">This action cannot be undone</p>
          </div>
          <button className="uam__close" onClick={onClose} aria-label="Close"><FiX size={16} /></button>
        </div>

        {/* Body */}
        <div className="uam__body">
          {isBatch ? (
            <>
              <div className="uam__warning-box">
                <FiTrash2 size={16} />
                <p>
                  You are about to permanently delete <strong>{recipients.length} {recipients[0]?.userType}s</strong>.
                  Their data, plans, and history will be removed from the system.
                </p>
              </div>
              <div className="uam__recipients">
                {recipients.slice(0, 6).map(r => (
                  <span key={r.userId} className="uam__recipient-chip uam__recipient-chip--danger">
                    <FiUser size={10} />{r.fullName}
                  </span>
                ))}
                {recipients.length > 6 && (
                  <span className="uam__recipient-chip uam__recipient-chip--more">
                    +{recipients.length - 6} more
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="uam__warning-box">
              <FiTrash2 size={16} />
              <p>
                You are about to permanently delete <strong>{recipients[0]?.fullName}</strong>
                {recipients[0]?.email && <> ({recipients[0].email})</>}.
                All associated data will be removed.
              </p>
            </div>
          )}

          <div className="uam__field uam__field--confirm">
            <label className="uam__label">
              Type <strong className="uam__confirm-word">{CONFIRM_WORD}</strong> to confirm
            </label>
            <input
              ref={inputRef}
              type="text"
              className={`uam__input uam__input--confirm ${confirmText === CONFIRM_WORD ? 'uam__input--valid' : confirmText ? 'uam__input--invalid' : ''}`}
              placeholder={CONFIRM_WORD}
              value={confirmText}
              onChange={e => setConfirmText(e.target.value.toUpperCase())}
              disabled={deleting}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="uam__footer">
          <button className="uam__btn uam__btn--cancel" onClick={onClose} disabled={deleting}>Cancel</button>
          <button
            className="uam__btn uam__btn--delete"
            onClick={handleDelete}
            disabled={!canDelete}
          >
            {deleting ? <span className="uam__spinner" /> : <FiTrash2 size={14} />}
            {deleting ? 'Deleting…' : isBatch ? `Delete ${recipients.length} Users` : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  )
}
