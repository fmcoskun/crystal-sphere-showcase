import { useEffect, useRef, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import './glass.css'

export function GlassPanel({
  label,
  closeLabel,
  onClose,
  focusKey,
  children,
}: {
  label: string
  closeLabel: string
  onClose: () => void
  /** Changes whenever the panel's content view changes; focus moves back into the panel. */
  focusKey: string
  children: ReactNode
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  // The control that opened or changed the view has just unmounted; keep focus in the dialog.
  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [focusKey])

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      className="crystal-surface pointer-events-auto w-[min(94vw,520px)] max-h-[calc(100svh-20vh)] touch-pan-y overflow-y-auto rounded-[44px] p-5 outline-none sm:p-7"
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5, y: -60 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: -40 }}
      transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 240, damping: 22 }}
    >
      <div className="crystal-window-glint" aria-hidden="true" />
      <div className="absolute right-4 top-4 z-10">
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="crystal-row grid h-11 w-11 place-items-center rounded-full text-sm font-bold"
        >
          ✕
        </button>
      </div>
      {children}
    </motion.div>
  )
}
