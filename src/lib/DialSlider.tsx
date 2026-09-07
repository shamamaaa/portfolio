import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

// Tuning lifted from Josh Puckett's DialKit slider — the rubber-band feel.
const CLICK_THRESHOLD = 3
const DEAD_ZONE = 28
const MAX_CURSOR_RANGE = 200
const MAX_STRETCH = 9
const TICKS = [10, 20, 30, 40, 50, 60, 70, 80, 90]

interface DialSliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  ariaLabel?: string
  /** Shown inside the track, left. */
  label?: string
  /** Shown inside the track, right (already formatted). */
  valueText?: string
}

/**
 * Map-style ruler scrubber with DialKit's elastic drag: drag past either end and
 * the track stretches, then springs back on release; a click springs the handle
 * to the nearest step. Pointer-driven (a native <input> can't rubber-band).
 */
export function DialSlider({ value, onChange, min = 0, max = 1, step = 0.01, ariaLabel, label, valueText }: DialSliderProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const rectRef = useRef<DOMRect | null>(null)
  const downPos = useRef<{ x: number; y: number } | null>(null)
  const isClickRef = useRef(true)
  const [active, setActive] = useState(false)
  const reduce = useReducedMotion()

  const pctOf = useCallback((v: number) => ((v - min) / (max - min)) * 100, [min, max])
  const fill = useMotionValue(pctOf(value))
  const fillWidth = useTransform(fill, (p) => `${clamp(p, 0, 100)}%`)
  const handleLeft = useTransform(fill, (p) => `${clamp(p, 0, 100)}%`)
  const stretch = useMotionValue(0)
  const trackWidth = useTransform(stretch, (s) => `calc(100% + ${Math.abs(s)}px)`)
  const trackX = useTransform(stretch, (s) => (s < 0 ? s : 0))

  // Sync from the controlled value when the user isn't dragging.
  useEffect(() => {
    if (!active) fill.set(pctOf(value))
  }, [value, active, fill, pctOf])

  const snap = useCallback((v: number) => clamp(min + Math.round((v - min) / step) * step, min, max), [min, max, step])
  const posToValue = useCallback(
    (clientX: number) => {
      const r = rectRef.current
      if (!r || r.width === 0) return value
      return min + clamp((clientX - r.left) / r.width, 0, 1) * (max - min)
    },
    [min, max, value],
  )
  const computeStretch = useCallback((clientX: number, sign: number) => {
    const r = rectRef.current
    if (!r) return 0
    const past = sign < 0 ? r.left - clientX : clientX - r.right
    const over = Math.max(0, past - DEAD_ZONE)
    return sign * MAX_STRETCH * Math.sqrt(Math.min(over / MAX_CURSOR_RANGE, 1))
  }, [])

  const onPointerDown = (e: ReactPointerEvent) => {
    e.preventDefault()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    downPos.current = { x: e.clientX, y: e.clientY }
    isClickRef.current = true
    setActive(true)
    rectRef.current = wrapRef.current?.getBoundingClientRect() ?? null
  }
  const onPointerMove = (e: ReactPointerEvent) => {
    if (!downPos.current) return
    if (isClickRef.current && Math.hypot(e.clientX - downPos.current.x, e.clientY - downPos.current.y) > CLICK_THRESHOLD) {
      isClickRef.current = false
    }
    if (isClickRef.current) return
    const r = rectRef.current
    if (r && !reduce) {
      if (e.clientX < r.left) stretch.set(computeStretch(e.clientX, -1))
      else if (e.clientX > r.right) stretch.set(computeStretch(e.clientX, 1))
      else stretch.set(0)
    }
    const next = snap(posToValue(e.clientX))
    fill.set(pctOf(next))
    onChange(next)
  }
  const onPointerUp = (e: ReactPointerEvent) => {
    if (downPos.current && isClickRef.current) {
      const next = snap(posToValue(e.clientX))
      if (reduce) fill.set(pctOf(next))
      else animate(fill, pctOf(next), { type: 'spring', stiffness: 300, damping: 26, mass: 0.7 })
      onChange(next)
    }
    if (stretch.get() !== 0) {
      if (reduce) stretch.set(0)
      else animate(stretch, 0, { type: 'spring', visualDuration: 0.35, bounce: 0.3 })
    }
    setActive(false)
    downPos.current = null
  }
  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      onChange(snap(clamp(value + step, min, max)))
      e.preventDefault()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      onChange(snap(clamp(value - step, min, max)))
      e.preventDefault()
    }
  }

  return (
    <div
      ref={wrapRef}
      className={`dial-slider${active ? ' is-active' : ''}`}
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}
    >
      <motion.div className="dial-track" style={{ width: trackWidth, x: trackX }}>
        <motion.div className="dial-fill" style={{ width: fillWidth }} />
        <div className="dial-ticks" aria-hidden="true">
          {TICKS.map((t) => (
            <span key={t} style={{ left: `${t}%` }} />
          ))}
        </div>
        <motion.div className="dial-handle" style={{ left: handleLeft }} aria-hidden="true" />
      </motion.div>
      {label != null && <span className="dial-label">{label}</span>}
      {valueText != null && <span className="dial-value">{valueText}</span>}
    </div>
  )
}
