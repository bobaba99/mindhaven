import { useEffect, type RefObject } from 'react'

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Modal keyboard behavior shared by all overlays:
 * - Escape closes the modal.
 * - Tab / Shift+Tab are trapped inside the modal (focus cycles, never escaping
 *   to the town canvas behind it).
 * - On mount, focus moves to the first focusable element in the modal.
 *
 * Pass the modal's container ref so the trap knows its bounds.
 */
export function useModalKeys(
  containerRef: RefObject<HTMLElement>,
  onClose: () => void,
): void {
  useEffect(() => {
    const container = containerRef.current
    // Move focus into the modal on open.
    const focusables = container
      ? Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
      : []
    focusables[0]?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const node = containerRef.current
      if (!node) return
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [containerRef, onClose])
}
