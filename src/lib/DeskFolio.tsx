import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { animate, motion, motionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import './deskfolio.css'

// draggable flip-book, cover is sheet[0]
//
// sheets hinge on spine, rotateY 0 to -180; two faces per sheet
//
// parent owns rotation values so drag drives the active page

export type DeskFolioProps = {
  /* front cover */
  cover: React.ReactNode
  /* inner pages, reading order */
  pages: React.ReactNode[]
  /* optional back cover */
  backCover?: React.ReactNode
  /* close instead of showing blank end leaf */
  closeOnEnd?: boolean
  /* page width px */
  pageWidth?: number
  /* page height px */
  pageHeight?: number
  /* initial spread, 0 = closed */
  initialSpread?: number
  /* fires after a turn settles */
  onTurn?: (turned: number) => void
  className?: string
  /* root inline style */
  style?: React.CSSProperties
  /* closed-book offset (translateX) */
  closedShift?: string
}

// springs
const FLIP_SPRING = { type: 'spring', bounce: 0.18, duration: 0.52 } as const
const BLOOM_SPRING = { type: 'spring', bounce: 0.24, duration: 0.52 } as const
const PEEK_SPRING = { type: 'spring', bounce: 0.42, duration: 0.32 } as const
const PEEK_ANGLE = -13 // corner lift on hover

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

type Sheet = {
  front: React.ReactNode
  back: React.ReactNode
  frontHard: boolean
  backHard: boolean
}

// build double-sided sheets
function buildSheets(cover: React.ReactNode, pages: React.ReactNode[], backCover?: React.ReactNode): Sheet[] {
  const faces: Array<{ node: React.ReactNode; hard: boolean }> = [{ node: cover, hard: true }]
  for (const p of pages) faces.push({ node: p, hard: false })
  if (backCover !== undefined) {
    if (faces.length % 2 === 1) faces.push({ node: null, hard: false }) // pad backCover to a back face
    faces.push({ node: backCover, hard: true })
  }
  if (faces.length % 2 === 1) faces.push({ node: null, hard: false }) // pad to whole sheets
  const sheets: Sheet[] = []
  for (let i = 0; i < faces.length; i += 2) {
    sheets.push({
      front: faces[i].node,
      back: faces[i + 1].node,
      frontHard: faces[i].hard,
      backHard: faces[i + 1].hard,
    })
  }
  return sheets
}

export function DeskFolio({
  cover,
  pages,
  backCover,
  closeOnEnd = false,
  pageWidth = 380,
  pageHeight = 510,
  initialSpread = 0,
  onTurn,
  className,
  style,
  closedShift = '-25%',
}: DeskFolioProps) {
  const reduce = useReducedMotion()
  const sheets = useMemo(() => buildSheets(cover, pages, backCover), [cover, pages, backCover])
  const max = sheets.length
  // last navigable spread (closeOnEnd)
  let lastSpread = max
  if (closeOnEnd) {
    lastSpread = Math.max(0, max - 1)
    while (lastSpread > 0 && sheets[lastSpread]?.front == null) lastSpread--
  }

  const [turned, setTurned] = useState(() => Math.max(0, Math.min(initialSpread, max)))
  const [turning, setTurning] = useState<number | null>(null) // sheet mid-spring
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null) // sheet being dragged
  const [peekIndex, setPeekIndex] = useState<number | null>(null)

  const open = turned > 0
  const locked = turning !== null || draggingIndex !== null

  // one rotation value per sheet
  const rotsRef = useRef<MotionValue<number>[]>([])
  if (rotsRef.current.length !== max) {
    rotsRef.current = sheets.map((_, i) => motionValue(i < turned ? -180 : 0))
  }
  const rots = rotsRef.current

  const rootRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ active: number; dir: 'fwd' | 'back'; startX: number; pageW: number; follow: boolean; moved: boolean; turnZone: boolean; close: boolean } | null>(null)
  const lastTurnAt = useRef(0) // double-tap cooldown

  const coolingDown = () => {
    const now = performance.now()
    if (now - lastTurnAt.current < 280) return true
    lastTurnAt.current = now
    return false
  }

  const commitNext = useCallback(() => {
    if (locked) return
    if (closeOnEnd && turned >= lastSpread) {
      if (turned > 0 && !coolingDown()) {
        setTurning(0) // close on last spread
        setTurned(0)
      }
      return
    }
    if (turned >= max || coolingDown()) return
    setTurning(turned)
    setTurned(turned + 1)
  }, [locked, turned, max, closeOnEnd, lastSpread])

  const commitPrev = useCallback(() => {
    if (locked || turned <= 0 || coolingDown()) return
    setTurning(turned - 1)
    setTurned(turned - 1)
  }, [locked, turned])

  const handleRest = useCallback((index: number) => {
    setTurning((t) => (t === index ? null : t))
  }, [])

  const handlePeek = useCallback((index: number, on: boolean) => {
    setPeekIndex((cur) => (on ? index : cur === index ? null : cur))
  }, [])

  useEffect(() => {
    if (!locked) onTurn?.(turned)
  }, [locked, turned, onTurn])

  useEffect(() => {
    if (!open || locked) return
    const closeOnEscape = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.isContentEditable || target?.closest('input, textarea, select')) return
      if (e.key !== 'Escape') return
      e.preventDefault()
      setTurning(0)
      setTurned(0)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open, locked])

  // direct manipulation
  // cover opens on release; inner sheets follow live
  const onPointerDown = (e: React.PointerEvent) => {
    if (locked) return
    const el = e.target as HTMLElement
    if (el.closest('[contenteditable="true"], button, a, input, textarea, select')) return // let edit/select happen
    const rect = rootRef.current?.getBoundingClientRect()
    if (!rect) return
    const spine = rect.left + rect.width / 2
    const fx = (e.clientX - rect.left) / rect.width
    let active: number
    let dir: 'fwd' | 'back'
    if (!open || e.clientX >= spine) {
      if (turned >= max) return
      active = turned
      dir = 'fwd'
    } else {
      if (turned <= 0) return
      active = turned - 1
      dir = 'back'
    }
    // forward on last spread closes the book
    const close = closeOnEnd && dir === 'fwd' && turned >= lastSpread
    // tap only turns from corner or outer margin
    const onCorner = !!el.closest('.deskfolio-corner')
    const turnZone = close || onCorner || (dir === 'fwd' ? fx > 0.86 : fx < 0.14)
    drag.current = { active, dir, startX: e.clientX, pageW: rect.width / 2, follow: !close && active >= 1, moved: false, turnZone, close }
    setDraggingIndex(active)
    try {
      rootRef.current?.setPointerCapture(e.pointerId)
    } catch {
      /* not all targets support capture */
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    if (Math.abs(e.clientX - d.startX) > 4) d.moved = true
    if (!d.follow) return // cover opens on release
    const p =
      d.dir === 'fwd' ? clamp((d.startX - e.clientX) / d.pageW, 0, 1) : clamp((e.clientX - d.startX) / d.pageW, 0, 1)
    rots[d.active].set(d.dir === 'fwd' ? -180 * p : -180 + 180 * p)
  }

  const finishDrag = (e: React.PointerEvent, cancelled: boolean) => {
    const d = drag.current
    if (!d) return
    drag.current = null
    try {
      rootRef.current?.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    setDraggingIndex(null)
    const turn = (dir: 'fwd' | 'back') => {
      if (coolingDown()) return
      if (dir === 'fwd' && d.close) {
        if (turned > 0) {
          setTurning(0) // close on last spread
          setTurned(0)
        }
        return
      }
      setTurning(d.active)
      if (dir === 'fwd') setTurned((t) => Math.min(max, t + 1))
      else setTurned((t) => Math.max(0, t - 1))
    }

    // moved inner page: commit past halfway, else spring back
    if (d.follow && d.moved) {
      if (cancelled) return
      const cur = rots[d.active].get()
      if (d.dir === 'fwd' ? cur <= -90 : cur >= -90) turn(d.dir)
      else setTurning(d.active) // lock while springing home
      return
    }
    if (cancelled) return
    // closed book: tap or swipe opens
    if (!open) return turn('fwd')
    // swipe turns either way; tap only goes forward
    if (d.moved) turn(d.dir)
    else if (d.turnZone && d.dir === 'fwd') turn('fwd')
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).isContentEditable) return // typing, not paging
    if (e.key === 'Escape') {
      if (!open || locked) return
      e.preventDefault()
      setTurning(0)
      setTurned(0)
    } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      commitNext()
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault()
      commitPrev()
    }
  }

  const spreadWidth = pageWidth * 2

  return (
    <div
      className={className ? `deskfolio ${className}` : 'deskfolio'}
      style={
        {
          '--df-page-w': `${pageWidth}px`,
          '--df-page-h': `${pageHeight}px`,
          '--df-spread-w': `${spreadWidth}px`,
          ...style,
        } as React.CSSProperties
      }
      data-open={open}
    >
      <div className="deskfolio-stage" style={{ width: spreadWidth, height: pageHeight }}>
        <motion.div
          ref={rootRef}
          className="deskfolio-book"
          role="group"
          aria-roledescription="book"
          aria-label="Küçük bir kitap — bir köşesini sürükle, bir kenarına dokun ya da sayfaları çevirmek için ok tuşlarını kullan"
          tabIndex={0}
          initial={false}
          animate={{ x: open ? '0%' : closedShift, scale: open ? 1 : 0.96 }}
          transition={reduce ? { duration: 0 } : BLOOM_SPRING}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => finishDrag(e, false)}
          onPointerCancel={(e) => finishDrag(e, true)}
          onKeyDown={onKeyDown}
        >
          <div className="deskfolio-block" aria-hidden="true" />

          {sheets.map((sheet, i) => {
            const moving = i === turning || i === draggingIndex
            const peeking = peekIndex === i && !locked && i === turned && turned < max
            return (
              <BookSheet
                key={i}
                index={i}
                flipped={i < turned}
                peek={peeking}
                dragging={draggingIndex === i}
                showCorner={i === turned && turned < max}
                z={moving ? max + 2 : i < turned ? i + 1 : max - i}
                // gpu layer only while moving
                active={moving || peeking}
                reduce={!!reduce}
                sheet={sheet}
                rot={rots[i]}
                onRest={handleRest}
                onPeek={handlePeek}
              />
            )
          })}
        </motion.div>
      </div>

      <span className="deskfolio-sr" aria-live="polite">
        {turned === 0 ? 'Closed' : turned >= max ? 'The end' : `Spread ${turned} of ${max - 1}`}
      </span>
    </div>
  )
}

// one double-sided leaf; yields to parent while dragging
const BookSheet = memo(function BookSheet({
  index,
  flipped,
  peek,
  dragging,
  showCorner,
  z,
  active,
  reduce,
  sheet,
  rot,
  onRest,
  onPeek,
}: {
  index: number
  flipped: boolean
  peek: boolean
  dragging: boolean
  showCorner: boolean
  z: number
  active: boolean
  reduce: boolean
  sheet: Sheet
  rot: MotionValue<number>
  onRest: (index: number) => void
  onPeek: (index: number, on: boolean) => void
}) {
  const prevFlipped = useRef(flipped)

  useEffect(() => {
    if (dragging) {
      // parent drives rot; don't fight it
      prevFlipped.current = flipped
      return
    }
    prevFlipped.current = flipped
    const target = flipped ? -180 : peek && !reduce ? PEEK_ANGLE : 0
    if (reduce) {
      rot.set(target)
      onRest(index)
      return
    }
    // big travel: paper spring; peek: snappy
    const current = rot.get()
    const dist = Math.abs(target - current)
    const v0 = rot.getVelocity()
    // initial shove so the page leaves immediately
    const opts =
      dist > 24
        ? { ...FLIP_SPRING, velocity: Math.abs(v0) < 60 ? Math.sign(target - current) * 540 : v0 }
        : PEEK_SPRING
    const controls = animate(rot, target, opts)
    controls.then(() => onRest(index)).catch(() => {})
    return () => controls.stop()
    // peek + dragging are deps: re-run to settle on release
  }, [flipped, peek, dragging, reduce, rot, index, onRest])

  // shadows peak edge-on at 90 deg
  const frontShade = useTransform(rot, [0, -90], [0, 0.42], { clamp: true })
  const backShade = useTransform(rot, [-90, -180], [0.42, 0], { clamp: true })
  // hide each face by live angle, not CSS backface
  const frontVisible = useTransform(rot, (r) => (r > -90 ? 1 : 0))
  const backVisible = useTransform(rot, (r) => (r <= -90 ? 1 : 0))

  return (
    <motion.div className="deskfolio-sheet" style={{ rotateY: rot, zIndex: z, willChange: active ? 'transform' : 'auto' }}>
      <motion.div className={faceClass('front', sheet.frontHard)} style={{ opacity: frontVisible }}>
        <div className="deskfolio-page-content">{sheet.front}</div>
        <motion.div className="deskfolio-fold" style={{ opacity: frontShade }} aria-hidden="true" />
        <div className="deskfolio-spine-shade" aria-hidden="true" />
        {showCorner && (
          <div
            className="deskfolio-corner"
            aria-hidden="true"
            onPointerEnter={() => onPeek(index, true)}
            onPointerLeave={() => onPeek(index, false)}
          />
        )}
      </motion.div>
      <motion.div className={faceClass('back', sheet.backHard)} style={{ opacity: backVisible }}>
        <div className="deskfolio-page-content">{sheet.back}</div>
        <motion.div className="deskfolio-fold" style={{ opacity: backShade }} aria-hidden="true" />
        <div className="deskfolio-spine-shade deskfolio-spine-shade--right" aria-hidden="true" />
      </motion.div>
    </motion.div>
  )
})

function faceClass(side: 'front' | 'back', hard: boolean) {
  return [
    'deskfolio-face',
    side === 'front' ? 'deskfolio-face--front' : 'deskfolio-face--back',
    hard ? 'deskfolio-face--hard' : 'deskfolio-face--paper',
  ].join(' ')
}
