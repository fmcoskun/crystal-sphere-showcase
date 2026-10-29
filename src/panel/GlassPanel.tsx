import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import './glass.css'

export function GlassPanel({
  label,
  closeLabel,
  onClose,
  children,
}: {
  label: string
  closeLabel: string
  onClose: () => void
  children: ReactNode
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      role="dialog"
      aria-label={label}
      className="crystal-surface pointer-events-auto w-[min(94vw,520px)] max-h-[calc(100svh-20vh)] overflow-y-auto rounded-[44px] p-5 sm:p-7"
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
