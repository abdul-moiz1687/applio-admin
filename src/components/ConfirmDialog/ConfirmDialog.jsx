import { useRef } from 'react'
import Modal from '../Modal/Modal'
import Button from '../Button/Button'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, busy = false }) {
  const cancelRef = useRef(null)
  return (
    <Modal open={open} onClose={onCancel} busy={busy} role="alertdialog" labelledBy="confirm-title" size="sm" initialFocusRef={cancelRef}>
      <h2 id="confirm-title" className="modal-title">{title}</h2>
      <p className="modal-body">{message}</p>
      <div className="modal-actions">
        <Button variant="secondary" ref={cancelRef} onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={busy}>
          {busy ? 'Deleting…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
