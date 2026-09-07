// @ts-nocheck
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react'
import { DeskFolio } from './lib/DeskFolio.tsx'
import { DialSlider } from './lib/DialSlider.tsx'
import { haptic } from './lib/haptics.ts'
import { DF_SCRIBBLES } from './lib/dfScribble.ts'
import './lib/deskfolio.css'

function Editable({ className = '', placeholder, initial }: { className?: string; placeholder?: string; initial?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (el && initial && !el.textContent) el.textContent = initial
  }, [initial])
  return (
    <div
      ref={ref}
      className={`df-edit ${className}`.trim()}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      aria-label={placeholder}
      data-ph={placeholder}
      spellCheck={false}
    />
  )
}

// project name that links to its page, with a real hand-drawn marker scribble underline.
// On hover a fat "pen" traces the scribble's centerline (stroke-dashoffset) inside a mask,
// uncovering the exact marker shape as it bobs along the route — genuine self-drawing.
// `variant` selects which scribble pattern from the doodle sheet to use.
function DfProjName({ href, variant = 0, children }: { href?: string; variant?: number; children: React.ReactNode }) {
  const sc = DF_SCRIBBLES[variant % DF_SCRIBBLES.length]
  const maskId = useId()
  const Tag = href ? 'a' : 'span'
  return (
    <Tag className="df-proj-name" {...(href ? { href, target: '_blank', rel: 'noreferrer' } : {})}>
      {children}
      <svg className="df-proj-scribble" viewBox={sc.viewBox} preserveAspectRatio="none" aria-hidden="true">
        <mask id={maskId}>
          <path
            className="df-scribble-pen"
            d={sc.center}
            fill="none"
            stroke="#fff"
            strokeWidth={sc.strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
          />
        </mask>
        <path d={sc.fill} fill="currentColor" mask={`url(#${maskId})`} />
      </svg>
    </Tag>
  )
}

// hand-drawn-ish doodles
function EditableNameTag({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (el && !el.textContent) el.textContent = 'Shamama'
  }, [])

  return (
    <div className={`df-name-tag ${className}`.trim()}>
      <img className="df-name-tag-img" src="/stickers/items/hello-name-tag.svg" alt="" draggable={false} decoding="async" />
      <div
        ref={ref}
        className="df-name-tag-text"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Name"
        data-ph="Shamama"
        spellCheck={false}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      />
    </div>
  )
}

const LbHeart = (p: React.SVGProps<SVGSVGElement>) => (
  // hand-drawn outline heart
  <svg viewBox="138 40 105 105" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M156.278,88.438c0-0.319,0-0.853,0-1.426c-0.415-0.437-0.849-0.894-1.022-1.077 c-0.311-0.686-0.474-1.046-0.932-2.055c-0.121-0.649,0.161-2.027-0.024-3.339c-0.22-0.262-0.418-0.498-0.7-0.834 c0.198-0.335,0.398-0.676,0.71-1.206c0-1.254,0-2.737,0-4.222c0.219-0.256,0.42-0.492,0.66-0.772c0-0.363,0-0.783,0-1.112 c0.217-0.594,0.713-0.425,1.058-0.558c0.607-0.351-0.286-1.515,1.015-1.363c-0.37-0.416-0.578-0.649-0.837-0.94 c0.118-0.261,0.181-0.587,0.374-0.787c0.502-0.523,0.955-1.016,1.16-1.774c0.151-0.562,1.004-0.734,1.108-1.46 c0.135-0.938,1.11-1.22,1.572-1.91c0.913,0.126,1.247-0.669,1.766-1.141c0.71-0.646,1.364-1.354,2.052-2.025 c0.06-0.059,0.206-0.018,0.291-0.064c1.133-0.612,2.286-1.275,3.465-1.679c1.316-0.451,2.6-0.947,3.769-1.645 c0.349,0.299,0.584,0.5,0.864,0.74c0.791,0,1.639,0,2.487,0c0.244,0.223,0.475,0.435,0.721,0.66c0.405,0,0.83,0,1.385,0 c0.348,0.529,0.732,1.113,1.212,1.843c0.081,0.018,0.371,0.085,0.663,0.151c0.605,0.604,1.209,1.208,1.813,1.813 c0.302,0.302,0.858,0.602,0.861,0.907c0.008,1.108,1.281,1.364,1.419,2.313c0.12,0.822,1.177,1.041,1.238,1.715 c0.084,0.916,0.837,1.167,1.286,1.814c0,0.559,0,1.186,0,1.769c0.432,0.517,0.745,1.024,0.86,1.633 c0.778,0.17,0.114,1.302,0.992,1.436c0.758,0.078,1.277-0.604,1.331-1.063c0.09-0.772,0.995-1.117,0.811-1.928 c0.742-0.59,0.681-1.722,1.578-2.241c0.932-0.539,0.915-1.808,1.803-2.463c0.765-0.564,1.422-1.297,2.047-2.024 c1.097-1.275,2.99-1.548,3.606-3.106c0.561,0,0.882,0,1.202,0c0.877-0.111,1.008-1.246,2.026-1.346 c0.725-0.071,1.391-0.736,2.213-1.211c0.256,0,0.682,0,1.099,0c0.24-0.221,0.471-0.435,0.689-0.636c1.72,0,3.426,0,5.119,0 c0.389,0.389,0.767,0.767,1.217,1.217c0.2-0.156,0.41-0.32,0.649-0.508c0.16-0.023,0.361-0.063,0.563-0.077 c0.213-0.014,0.447-0.059,0.637,0.008c0.465,0.163,0.756,0.577,1.326,0.697c0.53,0.112,0.942,0.787,1.404,1.213 c0.212,0.01,0.421,0.02,0.629,0.029c1.588,1.588,3.174,3.174,4.769,4.769c0,0.201,0,0.412,0,0.922 c0.574,0.474,1.306,1.079,2.114,1.747c-0.264,0.451-0.463,0.793-0.773,1.322c0.238,0.119,0.6,0.301,0.962,0.482 c-0.067,0.079-0.134,0.158-0.201,0.237c0.505,0.06,1.009,0.12,1.527,0.182c0.469,0.674,0.126,1.436,0.227,2.148 c0.213,0.232,0.427,0.463,0.653,0.707c0,0.412,0,0.836,0,1.226c0.23,0.258,0.438,0.491,0.597,0.668c0,1.131,0,2.191,0,3.218 c-0.183,0.183-0.334,0.334-0.547,0.547c0,1.2,0,2.465,0,3.65c-0.489,0.652-1.073,1.167-1.3,1.809 c-0.23,0.648-0.706,1.151-0.773,1.954c-0.067,0.796-0.554,1.702-1.258,2.336c-0.397,0.356-0.892,0.691-1.099,1.146 c-0.209,0.459-0.294,0.942-0.698,1.323c-0.184,0.174-0.076,0.702-0.261,0.824c-0.928,0.606-1.023,1.769-1.783,2.492 c-0.813,0.774-1.639,1.511-2.106,2.644c-0.372,0.903-1.653,1.287-1.768,2.474c-0.008,0.082-0.142,0.152-0.218,0.227 c-0.755,0.755-1.437,1.609-2.287,2.237c-0.814,0.601-0.448,1.932-1.565,2.259c-0.213,0-0.425,0-0.723,0 c-0.119,0.349-0.245,0.72-0.371,1.09c-1.284,1.284-2.568,2.568-3.856,3.855c-0.699,0.2-1.36,0.467-1.779,1.144 c0,0.196,0,0.408,0,0.69c-0.807,0.789-1.617,1.639-2.491,2.42c-0.995,0.889-1.684,2.17-3.126,2.5 c-0.676,0.797-1.727,1.322-2.054,2.351c-0.349,1.099-1.603,1.422-1.923,2.408c-0.46,1.419-1.825,1.988-2.625,3.241 c0.057,0.16,0.078,0.545,0.277,0.697c0.348,0.266,1.115-0.025,1.043,0.768c-0.019,0.147,0.007,0.286-0.05,0.344 c-1.125,1.14-2.26,2.271-3.472,3.484c-0.644-0.635-1.291-1.271-1.926-1.897c-0.257,0.228-0.491,0.435-0.706,0.627 c-0.931,0.02-1.302-0.548-1.547-1.301c-0.238-0.734-0.618-1.337-1.645-1.261c-0.349-0.762-0.714-1.561-1.13-2.469 c-0.19-0.039-0.482-0.1-0.814-0.169c-0.268-0.268-0.57-0.57-0.882-0.882c0-0.2,0-0.411,0-0.711 c-0.649-0.627-1.341-1.291-2.028-1.959c-0.738-0.718-0.882-1.876-1.813-2.453c0.242-1.154-1.207-1.319-1.353-2.339 c-0.075-0.522-0.764-0.942-1.134-1.439c-0.861-1.157-2.444-1.729-2.723-3.356c-1.133-1.133-2.266-2.266-3.399-3.398 c-1.057-1.057-2.194-2.049-3.142-3.197c-0.572-0.693-0.89-1.586-1.606-2.213c-0.722-0.632-1.412-1.312-2.034-2.041 c-0.451-0.528-0.737-1.194-1.156-1.755c-0.434-0.581-1.163-1.041-1.356-1.678c-0.246-0.81-1.157-1.042-1.301-1.703 C158.495,91.586,157.013,90.509,156.278,88.438z M160.764,69.348c-0.931,0.225-1.237,0.961-1.453,1.773 c-0.372,0.129-0.744,0.259-1.144,0.398c0.258,0.284,0.466,0.514,0.671,0.74c0.256,0.639-0.407,0.868-0.572,1.292 c0.207,0.246,0.406,0.482,0.526,0.625c0,0.959,0,1.799,0,2.591c-0.199,0.199-0.35,0.35-0.553,0.553 c-0.029,0.662-0.06,1.381-0.088,2.011c-0.237,0.237-0.388,0.388-0.566,0.566c0.417,0.446,0.836,0.894,1.267,1.354 c0,1.052,0,2.117,0,3.181c0.81,1.667,1.726,3.251,3.175,4.46c0.054,0.045-0.017,0.216,0.023,0.306 c0.492,1.124,0.97,2.279,2.031,2.991c0.59,0.396,0.398,1.142,0.887,1.572c0.557,0.489,1.045,1.055,1.563,1.588 c0.035,1.251,1.489,1.534,1.784,2.458c0.388,1.221,1.396,1.784,2.099,2.659c0.703,0.876,1.843,1.399,2.063,2.676 c0.044,0.258,0.405,0.622,0.657,0.655c1.06,0.138,1.556,0.988,2.216,1.621c0.663,0.636,1.38,1.209,1.629,2.21 c0.139,0.561,1.001,0.73,1.102,1.462c0.11,0.805,0.875,1.144,1.363,1.669c0.797,0.859,1.659,1.658,2.476,2.465 c0,0.252,0,0.465,0,0.691c1.148,0.781,1.363,2.314,2.496,3.118c-0.257,0.828,0.962,1.123,0.695,1.977 c0.517,0.517,1.148,0.975,1.541,1.587c0.428,0.668,0.642,1.474,1.277,1.845c0.423-0.2,0.784-0.365,1.14-0.541 c0.178-0.088,0.505-0.225,0.494-0.294c-0.197-1.156,1.158-1.354,1.386-2.333c0.202-0.866,1.046-1.419,1.903-1.886 c1.349-0.735,2.783-2.416,3.816-4.004c0.281-0.433,0.709-0.768,1.027-1.181c0.364-0.474,0.309-1.167,0.9-1.559 c0.503-0.334,1.191-0.273,1.575-0.877c0.337-0.53,0.818-0.969,0.864-1.021c0.802-0.342,1.082-0.442,1.342-0.58 c0.178-0.094,0.313-0.278,0.495-0.353c0.27-0.111,0.565-0.162,0.832-0.233c0-0.514,0-0.94,0-1.374 c1.658-1.658,3.309-3.328,4.984-4.972c0.453-0.445,0.638-1.021,0.949-1.522c0.528-0.852,0.914-1.809,1.742-2.507 c1.138-0.961,2.134-2.09,2.996-2.951c0.439-0.951,0.692-1.718,1.12-2.37c0.556-0.847,1.693-1.275,1.792-2.465 c0.845-0.807,1.69-1.613,2.466-2.354c-0.263-1.891,1.587-2.977,1.314-4.631c0.446-0.447,0.824-0.824,1.214-1.215 c0-1.264,0-2.542,0-3.772c0.188-0.41,0.746-0.531,0.616-1.29c-0.118-0.155-0.361-0.471-0.628-0.819c0-0.604,0-1.237,0-1.816 c-0.239-0.279-0.441-0.514-0.625-0.729c0.111-0.911,1.12-1.598,0.524-2.608c-0.227-0.227-0.425-0.604-0.684-0.653 c-1.018-0.189-1.845-0.859-2.161-1.636c-0.678-1.667-2.178-2.464-3.137-3.724c-1.176,0.383-1.811-0.559-2.684-0.784 c-0.739-0.19-0.669-1.201-1.141-1.731c-0.536,0-1.07,0-1.604,0c-0.379-0.656-0.379-0.656-1.227-0.374 c0.238,0.684,0.816,0.257,1.227,0.374c-0.075,0.182-0.15,0.365-0.272,0.66c-1.097,0-2.245,0-3.273,0 c-0.264,0.264-0.439,0.563-0.562,0.543c-1.118-0.184-1.977,0.504-2.798,0.987c-0.62,0.365-1.179,0.289-1.769,0.394 c-1.435,1.435-2.912,2.83-4.282,4.324c-0.521,0.569-1.277,0.615-1.791,1.118c0,0.211,0,0.423,0,0.676 c-1.271,1.257-2.56,2.533-3.844,3.803c0.185,1.075-1.009,1.269-1.325,2.169c0,0.291,0,0.706,0,1.064 c-0.437,0.537-1.042,0.84-1.236,1.485c0,0.107-0.043,0.245,0.008,0.315c0.182,0.253,0.396,0.483,0.633,0.763 c0,1.332,0.008,2.717-0.009,4.102c-0.002,0.186-0.127,0.371-0.196,0.556c-0.512,0.211-1.024,0.423-1.523,0.629 c-0.175-0.175-0.326-0.326-0.496-0.496c-0.403,0-0.825,0-1.319,0c-0.309,0.327-0.627,0.807-1.289,0.597 c-0.277-0.277-0.579-0.579-0.908-0.908c0-2.527,0-5.083,0-7.484c-0.419-0.741-0.734-1.364-1.11-1.947 c-0.442-0.684,0.138-1.706-0.814-2.261c-0.182-0.106-0.026-0.793-0.026-1.174c-0.774-0.516-1.855-0.483-1.982-1.768 c-0.05-0.51-0.767-0.953-1.215-1.467c0-0.147,0-0.359,0-0.614c-1.571-1.561-3.159-3.142-4.755-4.715 c-0.06-0.06-0.191-0.048-0.289-0.069c-0.32,0-0.641,0-0.997,0c-0.213-0.19-0.446-0.398-0.704-0.628c-0.389,0-0.813,0-1.253,0 c-0.216,0.2-0.447,0.414-0.685,0.634c-0.419,0-0.844,0-0.908,0c-1.237,0.469-2.156,0.896-2.969,1.417 c-0.962,0.617-1.673,1.624-2.462,2.431c-0.495,0-0.92,0-1.048,0c-1.014,0.382-1.208,1.09-1.428,1.783 c-0.195,0.044-0.392,0.084-0.586,0.132C160.94,68.79,160.691,68.942,160.764,69.348z M157.88,81.523 c-0.46,0.429-0.46,0.856,0,1.285C158.34,82.38,158.34,81.952,157.88,81.523z M174.952,107.924 c0.006,0.135,0.012,0.271,0.017,0.406c0.285,0.038,0.57,0.091,0.856,0.102c0.07,0.003,0.219-0.156,0.205-0.204 c-0.044-0.151-0.14-0.4-0.229-0.405C175.522,107.807,175.236,107.883,174.952,107.924z M188.964,123.505 c-0.071-0.071-0.158-0.212-0.211-0.2c-0.151,0.034-0.288,0.129-0.43,0.2c0.071,0.071,0.158,0.212,0.211,0.2 C188.685,123.672,188.822,123.576,188.964,123.505z M160.215,88.988c0.086,0.086,0.157,0.157,0.228,0.228 c0.071-0.142,0.167-0.279,0.2-0.43c0.012-0.053-0.129-0.139-0.2-0.211C160.367,88.714,160.29,88.854,160.215,88.988z M211.304,99.243c-0.074-0.134-0.151-0.274-0.228-0.413c-0.071,0.071-0.212,0.158-0.2,0.211c0.034,0.151,0.129,0.288,0.2,0.43 C211.147,99.399,211.218,99.328,211.304,99.243z"/> <path d="M160.691,69.169c0.305,0.261,0.48,0.41,0.655,0.558 C160.786,70.162,160.833,69.666,160.691,69.169z"/> <path d="M160.215,71.042c0.074-0.134,0.151-0.274,0.228-0.413 c0.071,0.071,0.212,0.158,0.2,0.211c-0.034,0.151-0.129,0.288-0.2,0.43C160.372,71.199,160.301,71.128,160.215,71.042z"/>
  </svg>
)
const LbSparkle = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12 2c.9 5.6 3.5 8.2 9 9-5.5.8-8.1 3.4-9 9-.9-5.6-3.5-8.2-9-9 5.5-.8 8.1-3.4 9-9Z" />
  </svg>
)
const LbCloud = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M7 18a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17.2 8.6 4 4 0 0 1 17 18H7Z" />
  </svg>
)
const LbCal = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" {...p}>
    <rect x="4" y="5" width="16" height="15" rx="3.5" />
    <path d="M4 10h16M9 3v3M15 3v3" />
  </svg>
)
const LbBell = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12 3a5 5 0 0 0-5 5c0 5-2 6-2 6h14s-2-1-2-6a5 5 0 0 0-5-5Zm0 18a2.5 2.5 0 0 0 2.4-2h-4.8A2.5 2.5 0 0 0 12 21Z" />
  </svg>
)

// mood faces, grin to sad
const MOOD_MOUTHS = [
  'M8 13 Q12 18.5 16 13', // grin
  'M8.5 14 Q12 16.6 15.5 14', // smile
  'M8.5 15 H15.5', // neutral
  'M8.5 15.6 Q12 14.2 15.5 15.6', // meh
  'M8.5 16 Q12 12.6 15.5 16', // sad
]
function MoodFaces() {
  const [mood, setMood] = useState(1)
  return (
    <div className="df-moods" role="group" aria-label="Today's mood">
      {MOOD_MOUTHS.map((mouth, i) => (
        <button
          key={i}
          type="button"
          className="df-mood"
          aria-pressed={mood === i}
          aria-label={`Mood ${i + 1} of 5`}
          onClick={() => setMood(i)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="9" cy="10.5" r="1.15" fill="currentColor" stroke="none" />
            <circle cx="15" cy="10.5" r="1.15" fill="currentColor" stroke="none" />
            <path d={mouth} />
          </svg>
        </button>
      ))}
    </div>
  )
}

/** checkable, editable list row */
function CheckItem({ initial, placeholder }: { initial?: string; placeholder?: string }) {
  const [done, setDone] = useState(false)
  return (
    <li className={done ? 'df-check is-done' : 'df-check'}>
      <button
        type="button"
        className="df-check-box"
        role="checkbox"
        aria-checked={done}
        aria-label={done ? 'Mark not done' : 'Mark done'}
        onClick={() => setDone((d) => !d)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4 10-11" />
        </svg>
      </button>
      <Editable placeholder={placeholder} initial={initial} />
    </li>
  )
}

// journal highlighter markers (non-destructive)
const HIGHLIGHTERS: Array<{ id: string; label: string; color: string; glow?: boolean }> = [
  { id: 'sun', label: 'Güneşli', color: '#ffe066' },
  { id: 'rose', label: 'Gül', color: '#ff9ec4' },
  { id: 'mint', label: 'Nane', color: '#9be8b4' },
  { id: 'sky', label: 'Gökyüzü', color: '#9ecbff' },
  { id: 'violet', label: 'Menekşe', color: '#b8a8ff' },
  { id: 'neon', label: 'Neon', color: '#ccff4d', glow: true },
]

/** wrap selection in a highlight span */
function highlightSelection(color: string, glow?: boolean, nib: 'chisel' | 'bullet' | 'fine' = 'chisel'): boolean {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return false
  const range = sel.getRangeAt(0)
  const host = range.commonAncestorContainer
  const el = host.nodeType === 1 ? (host as Element) : host.parentElement
  if (!el || !el.closest('.df-edit')) return false // journal text only
  const span = document.createElement('span')
  span.className = `df-hl df-hl--${nib}${glow ? ' df-hl--glow' : ''}`
  span.style.setProperty('--hl', color)
  try {
    range.surroundContents(span)
  } catch {
    // selection crosses boundaries: extract + wrap
    try {
      span.appendChild(range.extractContents())
      range.insertNode(span)
    } catch {
      return false
    }
  }
  sel.removeAllRanges()
  return true
}

/** eraser: unwrap touched marker spans */
function eraseSelection(): void {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return
  const range = sel.getRangeAt(0)
  const host = range.commonAncestorContainer
  const root = (host.nodeType === 1 ? (host as Element) : host.parentElement)?.closest('.df-edit')
  if (!root) return
  const marks = Array.from(root.querySelectorAll('.df-hl')).filter((m) => range.intersectsNode(m))
  marks.forEach((m) => {
    const parent = m.parentNode
    if (!parent) return
    while (m.firstChild) parent.insertBefore(m.firstChild, m)
    parent.removeChild(m)
    parent.normalize()
  })
  sel.removeAllRanges()
}

type Nib = 'chisel' | 'bullet' | 'fine'

// three nib shapes: slant / round / fine tip
const PEN_TIPS = {
  slant: {
    d: 'M0 8.90395V8.90755V14.6331H14.2627L14.2627 2.31478C14.2627 1.28051 14.2625 0.762792 14.0449 0.454428C13.9929 0.380825 13.944 0.325003 13.8662 0.255209C13.1837 -0.357086 12.1504 0.280438 11.4834 0.627279L2.04883 5.53353L2.04642 5.53478C1.30365 5.92102 0.931451 6.11457 0.660156 6.39779C0.420078 6.6485 0.2376 6.94898 0.125977 7.27767C0 7.64881 0 8.06767 0 8.90395Z',
    ty: 1.37,
  },
  round: {
    d: 'M0 7.34442V7.35451V15.6738H14.2627V7.35451C14.2627 6.30373 14.2619 5.77805 14.1963 5.33791C13.8575 3.06672 12.262 1.22144 10.1338 0.523454C8.00559 -0.17453 6.2573 -0.17444 4.12891 0.523454C2.00052 1.22135 0.404217 3.06658 0.0654296 5.33791C0 5.77663 0 6.30042 0 7.34442Z',
    ty: 0.33,
  },
  fine: {
    d: 'M0.327148 2.21365C0.000249654 2.85536 0 3.69574 0 5.37576V16.0261H14.2627V5.37576C14.2627 3.69588 14.2624 2.85534 13.9355 2.21365C13.6479 1.64916 13.1885 1.18974 12.624 0.902125C10.262 -0.300971 3.99787 -0.300446 1.6377 0.902125C1.0733 1.18975 0.614736 1.64922 0.327148 2.21365Z',
    ty: -0.03,
  },
} as const
const PEN_BAND = 'M8 57.0525H34.1475V67.7492H8V57.0525Z'

/** pen icon, sized by CSS height */
function MarkerIcon({ nib, color }: { nib: Nib; color: string }) {
  const id = useId()
  const tip = nib === 'chisel' ? PEN_TIPS.slant : nib === 'bullet' ? PEN_TIPS.round : PEN_TIPS.fine
  const tipTop = `color-mix(in srgb, ${color}, white 8%)`
  return (
    <svg viewBox="0 0 43 170" fill="none" className="df-mk" aria-hidden="true">
      <g filter={`url(#${id}-f)`}>
        <g clipPath={`url(#${id}-c)`}>
          <path
            d="M8 45.3892V57.0525H34.1475V45.3892C34.1475 42.9072 33.4998 40.4681 32.2684 38.3131L31.2726 36.5705C30.0412 34.4155 29.3934 31.9764 29.3934 29.4944V15.4541H12.7541V29.4944C12.7541 31.9764 12.1064 34.4155 10.8749 36.5705L9.87916 38.3131C8.64773 40.4681 8 42.9072 8 45.3892Z"
            fill={`url(#${id}-p0)`}
          />
          <path d="M8 57.0525H34.1475V158.652H8V57.0525Z" fill={`url(#${id}-p1)`} />
        </g>
      </g>
      <path d={PEN_BAND} style={{ fill: color }} />
      <path d={PEN_BAND} fill={`url(#${id}-p2)`} style={{ mixBlendMode: 'color-dodge' }} />
      <g transform={`translate(13.943 ${tip.ty})`}>
        <path d={tip.d} fill={`url(#${id}-tg)`} />
        <path d={tip.d} fill={`url(#${id}-sh)`} />
      </g>
      <defs>
        <filter id={`${id}-f`} x="-0.262451" y="10.1509" width="43" height="160" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="bg" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha" />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="2.5" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.45098 0 0 0 0 0.341176 0 0 0 0 0.290196 0 0 0 0.06 0" />
          <feBlend mode="normal" in2="bg" result="e1" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha2" />
          <feOffset dy="3" />
          <feGaussianBlur stdDeviation="4" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.45098 0 0 0 0 0.341176 0 0 0 0 0.290196 0 0 0 0.12 0" />
          <feBlend mode="normal" in2="e1" result="e2" />
          <feBlend mode="normal" in="SourceGraphic" in2="e2" result="shape" />
        </filter>
        <linearGradient id={`${id}-sh`} x1="21" y1="0" x2="21" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity="0.24" />
          <stop offset="0.18" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="0.42" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-p0`} x1="8" y1="37.1987" x2="34.1475" y2="37.1987" gradientUnits="userSpaceOnUse">
          <stop stopColor="#DBDBDB" />
          <stop offset="0.0637281" stopColor="#EBEBEB" />
          <stop offset="0.178482" stopColor="#DADADA" />
          <stop offset="0.48833" stopColor="#F6F6F6" />
          <stop offset="0.757139" stopColor="#EFEFEF" />
          <stop offset="1" stopColor="#DDDDDD" />
        </linearGradient>
        <linearGradient id={`${id}-p1`} x1="8" y1="110.162" x2="34.1475" y2="110.162" gradientUnits="userSpaceOnUse">
          <stop stopColor="#DBDBDB" />
          <stop offset="0.0637281" stopColor="#EBEBEB" />
          <stop offset="0.178482" stopColor="#DADADA" />
          <stop offset="0.48833" stopColor="#F6F6F6" />
          <stop offset="0.757139" stopColor="#EFEFEF" />
          <stop offset="1" stopColor="#DDDDDD" />
        </linearGradient>
        <linearGradient id={`${id}-p2`} x1="8" y1="62.9951" x2="34.1475" y2="62.9951" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1D1D1D" stopOpacity="0" />
          <stop offset="0.497299" stopColor="#4F4F4F" />
          <stop offset="1" stopColor="#313131" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-c`}>
          <rect width="144" height="27" fill="white" transform="translate(7.73755 159.151) rotate(-90)" />
        </clipPath>
        <linearGradient id={`${id}-tg`} x1="21" y1="0" x2="21" y2="16" gradientUnits="userSpaceOnUse">
          <stop style={{ stopColor: tipTop }} />
          <stop offset="1" style={{ stopColor: color }} />
        </linearGradient>
      </defs>
    </svg>
  )
}

const NIBS: Nib[] = ['chisel', 'bullet', 'fine']
const NIB_LABELS: Record<Nib, string> = { chisel: 'eğik uç', bullet: 'yuvarlak uç', fine: 'ince uç' }

/** highlighter palette that blooms open */
function HighlighterTray({ panelWidth = 360 }: { panelWidth?: number }) {
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [color, setColor] = useState('sun')
  const [nib, setNib] = useState<Nib>('chisel')
  const [erasing, setErasing] = useState(false)
  const current = HIGHLIGHTERS.find((h) => h.id === color) ?? HIGHLIGHTERS[0]

  // armed only while palette open
  useEffect(() => {
    if (!open) return
    // tint selection with the marker colour
    document.body.classList.add('df-armed')
    document.body.style.setProperty(
      '--df-sel',
      erasing ? 'rgba(120, 120, 120, 0.18)' : `color-mix(in srgb, ${current.color} 55%, transparent)`,
    )
    const apply = () =>
      window.setTimeout(() => {
        if (erasing) eraseSelection()
        else highlightSelection(current.color, current.glow, nib)
      }, 0)
    document.addEventListener('mouseup', apply)
    document.addEventListener('touchend', apply)
    return () => {
      document.removeEventListener('mouseup', apply)
      document.removeEventListener('touchend', apply)
      document.body.classList.remove('df-armed')
      document.body.style.removeProperty('--df-sel')
    }
  }, [open, erasing, nib, current.color, current.glow])

  return (
    // fixed placeholder; bloom surface absolute on top
    <div className="df-hltool">
      <motion.div
        className="df-hltool-bloom"
        data-open={open}
        animate={{ width: open ? panelWidth : 60, height: open ? 112 : 60, borderRadius: open ? 28 : 30 }}
        transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0.26, duration: 0.5 }}
      >
        <AnimatePresence initial={false} mode="wait">
          {open ? (
            <motion.div
              key="panel"
              className="df-hltool-inner"
              role="group"
              aria-label="Highlighters"
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3, scale: 0.98 }}
              transition={{ duration: 0.1 }}
            >
              <button className="df-hltool-handle" aria-label="Fosforlu kalemleri kapat" onClick={() => setOpen(false)} />
              <div className="df-hltool-row">
                <div className="df-nibs" role="group" aria-label="Uç">
                  {NIBS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={nib === n && !erasing ? 'df-nib is-active' : 'df-nib'}
                      aria-pressed={nib === n && !erasing}
                      aria-label={`${NIB_LABELS[n]}`}
                      title={NIB_LABELS[n]}
                      onClick={() => {
                        setNib(n)
                        setErasing(false)
                      }}
                    >
                      <MarkerIcon nib={n} color={current.color} />
                    </button>
                  ))}
                </div>
                <span className="df-hltool-div" />
                <div className="df-dots" role="group" aria-label="Renk">
                  {HIGHLIGHTERS.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      className={color === h.id && !erasing ? 'df-dot is-active' : 'df-dot'}
                      style={{ '--dot': h.color } as React.CSSProperties}
                      data-glow={h.glow ? 'true' : undefined}
                      aria-pressed={color === h.id && !erasing}
                      aria-label={h.label}
                      title={h.label}
                      onClick={() => {
                        setColor(h.id)
                        setErasing(false)
                      }}
                    />
                  ))}
                </div>
                <span className="df-hltool-div" />
                <button
                  type="button"
                  className={erasing ? 'df-eraserbtn is-active' : 'df-eraserbtn'}
                  aria-pressed={erasing}
                  aria-label="Silgi"
                  title="Silgi"
                  onClick={() => setErasing((e) => !e)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8.5 20H20" />
                    <path d="M5 16.5l7.5-7.5a2.2 2.2 0 0 1 3.1 0l2.9 2.9a2.2 2.2 0 0 1 0 3.1L14.5 20H8z" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="trigger"
              type="button"
              className="df-hltool-trigger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.24, duration: 0.12 }}
              aria-label="Fosforlu kalemleri aç"
              onClick={() => setOpen(true)}
            >
              <span className="df-hltool-pen">
                <MarkerIcon nib="chisel" color={current.color} />
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

type StickerItem = { src: string; width: string; rotate: number; pos: React.CSSProperties; lamp?: boolean; stuck?: boolean }
type StickerSet = { id: string; name: string; thumb: string; items: StickerItem[] }

// menu picks a set; items scatter into fixed slots
const SLOT = {
  TL: { top: '8%', left: '3%' },
  TR: { top: '7%', right: '4%' },
  LM: { top: '45%', left: '3%' },
  RM: { top: '42%', right: '3%' },
  BL: { bottom: '9%', left: '4%' },
  BR: { bottom: '10%', right: '3%' },
} as const
const ITM = '/stickers/items/'
const POLAROID_SRC = '__component:polaroid__'
const IPOD_SRC = '__component:ipod__'
const NAME_TAG_SRC = '__component:name-tag__'

const STICKER_SETS: StickerSet[] = [
  {
    // matcha break desk, two clusters
    id: 'journal',
    name: 'Günlük',
    thumb: '/stickers/sticker-journal.svg',
    items: [
      // matcha break anchor (top-left)
      { src: ITM + 'sticker-matcha-cup.png', width: 'clamp(70px, 15vw, 196px)', rotate: -6, pos: { top: '7%', left: '3.5%' } }, // matcha latte
      // journaling cluster (bottom-left)
      { src: ITM + 'sticker-journal-1.svg', width: 'clamp(50px, 12vw, 165px)', rotate: -5, pos: SLOT.BL }, // lined notepad
      { src: ITM + 'sticker-journal-0.svg', width: 'clamp(13px, 3vw, 46px)', rotate: 40, pos: { bottom: '15%', left: '17%' } }, // pen
      { src: ITM + 'sticker-journal-3.svg', width: 'clamp(48px, 11.5vw, 156px)', rotate: -8, pos: { bottom: '34%', left: '4%' } }, // reading glasses
      // right side: greenery + cuties
      { src: ITM + 'sticker-plant-succulent.svg', width: 'clamp(40px, 9.5vw, 132px)', rotate: 4, pos: { top: '8%', right: '4.5%' } }, // succulent
      { src: ITM + 'sticker-cutie-tulip-heart.svg', width: 'clamp(40px, 9.5vw, 118px)', rotate: -10, pos: { top: '32%', right: '11%' } }, // tulip-heart
      { src: ITM + 'sticker-cutie-sleepy-kitty.svg', width: 'clamp(48px, 11.5vw, 138px)', rotate: 8, pos: { top: '52%', right: '6%' } }, // sleepy kitty
    ],
  },
  {
    id: 'workspace',
    name: 'Çalışma alanı',
    thumb: '/stickers/sticker-desk.svg',
    items: [
      { src: ITM + 'sticker-desk-9.svg', width: 'clamp(72px, 17.2vw, 246px)', rotate: -8, pos: { top: '7%', right: '4.3%' }, lamp: true }, // lamp
      { src: ITM + 'sticker-keyboard.svg', width: 'clamp(139px, 33vw, 560px)', rotate: 27, pos: { top: '-4.5vw', left: '-7vw' } }, // keyboard, peeking from top-left
      { src: ITM + 'sticker-stationery-3.svg', width: 'clamp(48px, 10.4vw, 155px)', rotate: -6, pos: { top: '40.5%', left: '16%' } }, // coffee
      { src: ITM + 'sticker-desk-0.svg', width: 'clamp(47px, 11.2vw, 158px)', rotate: 36, pos: { top: '54%', left: '7%' } }, // pencil
      { src: IPOD_SRC, width: 'clamp(82px, 8.1vw, 154px)', rotate: -14, pos: { top: '43%', right: '6.7%' } }, // iPod
      { src: ITM + 'sticker-cutie-bear.svg', width: 'clamp(62px, 9.6vw, 166px)', rotate: -4, pos: { top: '62%', right: '18.3%' }, stuck: true }, // bear sticker
      { src: ITM + 'sticker-journal-3.svg', width: 'clamp(76px, 11.8vw, 215px)', rotate: -8, pos: { bottom: '16%', left: '21.5%' } }, // glasses
      { src: ITM + 'sticker-plant-succulent.svg', width: 'clamp(64px, 12vw, 185px)', rotate: 3, pos: { bottom: '5.2%', right: '6.8%' } }, // succulent
    ],
  },
  {
    id: 'stationery',
    name: 'Kırtasiye',
    thumb: '/stickers/sticker-stationery.svg',
    items: [
      { src: ITM + 'sticker-stationery-0.svg', width: 'clamp(50px, 12vw, 162px)', rotate: -6, pos: SLOT.TL }, // glasses
      { src: ITM + 'sticker-stationery-5.svg', width: 'clamp(59px, 14vw, 196px)', rotate: 8, pos: SLOT.TR }, // triangle ruler
      { src: ITM + 'sticker-stationery-9.svg', width: 'clamp(17px, 4vw, 58px)', rotate: -10, pos: SLOT.LM }, // pushpin
      { src: ITM + 'sticker-stationery-7.svg', width: 'clamp(40px, 9.5vw, 130px)', rotate: 20, pos: SLOT.RM }, // pencil
      { src: ITM + 'sticker-desk-6.svg', width: 'clamp(46px, 11vw, 150px)', rotate: -8, pos: SLOT.BL }, // lined note
      { src: ITM + 'sticker-stationery-3.svg', width: 'clamp(42px, 10vw, 135px)', rotate: -6, pos: SLOT.BR }, // coffee
      { src: ITM + 'sticker-plant-succulent.svg', width: 'clamp(36px, 8.5vw, 114px)', rotate: 8, pos: { top: '20%', right: '13%' } }, // potted succulent
    ],
  },
]

// pre-warm reveal images (workspace desk + monitor + avatar)
const DESKFOLIO_WARM_SRCS: string[] = [
  ...new Set(
    (STICKER_SETS.find((s) => s.id === 'workspace')?.items ?? [])
      .map((it) => it.src)
      .filter((src) => !src.startsWith('__component:')), // skip component placeholders
  ),
  '/stickers/devices/github-ipad.svg', // dev-activity iPad shell
  '/mort-profile.webp', // about-page avatar
]

const STICKER_MENU_SETS = ['workspace', 'journal', 'stationery']
  .map((id) => STICKER_SETS.find((set) => set.id === id))
  .filter((set): set is StickerSet => Boolean(set))

/** set picker menu */
function StickerMenu({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const reduce = useReducedMotion()
  return (
    <div className="df-sticker-picker" role="radiogroup" aria-label="Masa çıkartma seti">
      {STICKER_MENU_SETS.map((set) => {
        const active = value === set.id
        return (
          <button
            key={set.id}
            type="button"
            className={active ? 'df-sticker-choice is-active' : 'df-sticker-choice'}
            role="radio"
            aria-checked={active}
            aria-label={set.name}
            title={set.name}
            onClick={() => onChange(set.id)}
          >
            {active && (
              <motion.span
                className="df-sticker-choice-thumb"
                layoutId="df-sticker-choice-thumb"
                transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0.28, duration: 0.36 }}
              />
            )}
            <motion.img
              src={set.thumb}
              alt=""
              draggable={false}
              decoding="async"
              animate={active ? { y: -2, scale: 1.06 } : { y: 0, scale: 1 }}
              transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0.3, duration: 0.34 }}
            />
          </button>
        )
      })}
    </div>
  )
}

// drop-in entrance (transform/opacity only)
function dropIn(rotate: number, i: number, reduce: boolean) {
  const tilt = rotate >= 0 ? 1 : -1
  // capped per-item stagger
  const step = Math.min(i, 6) * 0.06
  return {
    initial: reduce ? false : { opacity: 0, scale: 0.84, rotate: rotate * 0.45 - tilt * 5, y: -28 },
    animate: reduce ? { opacity: 1 } : { opacity: 1, scale: 1, rotate, y: 0 },
    exit: reduce
      ? { opacity: 0 }
      : { opacity: 0, scale: 0.86, rotate, y: -16, transition: { duration: 0.18, ease: 'easeIn' as const } },
    transition: reduce
      ? { duration: 0 }
      : {
          default: { type: 'spring' as const, bounce: 0.42, duration: 0.62, delay: step },
          opacity: { duration: 0.32, delay: step, ease: 'easeOut' as const },
        },
  }
}

// pressed-on entrance for flat peel-stickers
function pressOn(rotate: number, i: number, reduce: boolean) {
  // matches dropIn's capped stagger
  const step = Math.min(i, 6) * 0.05
  return {
    initial: reduce ? false : { opacity: 0, scale: 1.12, rotate },
    animate: reduce ? { opacity: 1 } : { opacity: 1, scale: 1, rotate },
    exit: reduce
      ? { opacity: 0 }
      : { opacity: 0, scale: 0.96, rotate, transition: { duration: 0.16, ease: 'easeIn' as const } },
    transition: reduce
      ? { duration: 0 }
      : {
          default: { type: 'spring' as const, bounce: 0, duration: 0.4, delay: step },
          opacity: { duration: 0.24, delay: step, ease: 'easeOut' as const },
        },
  }
}

type StickerDragState = {
  pointerId: number
  startX: number
  startY: number
  armed: boolean
  held?: boolean // menu opened, drag not started yet
  stage?: HTMLElement
  offsetX?: number
  offsetY?: number
  width?: number
  height?: number
}

const LONG_PRESS_MS = 420
const LONG_PRESS_SLOP = 8

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function scaleCssClamp(value: string, scale: number) {
  const match = value.match(/^clamp\(([\d.]+)px,\s*([\d.]+)vw,\s*([\d.]+)px\)$/)
  if (!match) return value
  const [, min, mid, max] = match
  return `clamp(${Number(min) * scale}px, ${Number(mid) * scale}vw, ${Number(max) * scale}px)`
}

function stageScale(stage: HTMLElement) {
  const rect = stage.getBoundingClientRect()
  return stage.offsetWidth > 0 ? rect.width / stage.offsetWidth : 1
}

function warmImage(src: string) {
  const img = new Image()
  img.decoding = 'async'
  img.src = src
  void img.decode?.().catch(() => {})
  return img
}

// mat-object editing
// long-press to lift + open edit menu; overrides live in shared context
type MatOverride = { left?: number; top?: number; scale?: number; rotate?: number; src?: string; href?: string; deleted?: boolean }
type MatEditApi = {
  activeKey: string | null
  setActiveKey: (key: string | null) => void
  overrides: Record<string, MatOverride>
  patch: (key: string, partial: MatOverride) => void
  remove: (key: string) => void
  tableSrcs: Set<string> // srcs on the desk, excluded from Replace
}
const MatEditContext = createContext<MatEditApi | null>(null)
function useMatEdit(): MatEditApi {
  const ctx = useContext(MatEditContext)
  if (!ctx) throw new Error('useMatEdit must be used within a MatEditContext provider')
  return ctx
}

// Replace library, grouped into tabs (keep in sync with public/stickers/items/)
const STICKER_CATEGORIES: Array<{ id: string; name: string; files: string[] }> = [
  {
    id: 'cute',
    name: 'Sevimli',
    files: [
      'sticker-cutie-kirby.png',
      'sticker-cutie-chick.svg',
      'sticker-cutie-pig.svg',
      'sticker-cutie-snail.svg',
      'sticker-cutie-sneaker.svg',
      // hand-drawn cuties
      'sticker-cutie-bear.svg',
      'sticker-cutie-cat-rawr.svg',
      'sticker-cutie-cat-wiggle.svg',
      'sticker-cutie-cat-meow.svg',
      'sticker-cutie-sleepy-kitty.svg',
      'sticker-cutie-sleepy-bunny.svg',
      'sticker-cutie-unicorn-float.svg',
      'sticker-cutie-apple.svg',
      'sticker-cutie-cherry-mug.svg',
      'sticker-cutie-rocket.svg',
      'sticker-cutie-gift.svg',
      'sticker-cutie-flower-smile.svg',
      'sticker-cutie-tulip-heart.svg',
      'sticker-cutie-heart-thanks.svg',
      'sticker-cutie-heart-mend.svg',
      'sticker-cutie-rainbow-cloud.svg',
      'sticker-cutie-poppies.svg',
      'sticker-cutie-gameboy.svg',
      'sticker-cute-pop-cat-face.svg',
      'sticker-cute-pop-fox-face.svg',
      'sticker-cute-pop-koi-fish.svg',
      'sticker-cute-pop-reindeer.svg',
      'sticker-cute-pop-skull.svg',
      'sticker-cute-pop-unicorn.svg',
    ],
  },
  {
    id: 'stationery',
    name: 'Kırtasiye',
    files: ['sticker-desk-0.svg', 'sticker-desk-1.svg', 'sticker-desk-2.svg', 'sticker-desk-3.svg', 'sticker-desk-4.svg', 'sticker-desk-5.svg', 'sticker-desk-6.svg', 'sticker-journal-0.svg', 'sticker-journal-1.svg', 'sticker-journal-3.svg', 'sticker-stationery-0.svg', 'sticker-stationery-1.svg', 'sticker-stationery-2.svg', 'sticker-stationery-5.svg', 'sticker-stationery-6.svg', 'sticker-stationery-7.svg', 'sticker-stationery-9.svg', 'sticker-stationery-10.svg'],
  },
  {
    id: 'plants',
    name: 'Bitkiler',
    files: ['sticker-plant-1.svg', 'sticker-plant-2.svg', 'sticker-plant-succulent.svg', 'sticker-cute-pop-cactus.svg'],
  },
  {
    id: 'desk',
    name: 'Masa',
    files: ['sticker-keyboard.svg', 'sticker-desk-7.svg', 'sticker-desk-8.svg', 'sticker-desk-9.svg', 'sticker-journal-2.svg', 'sticker-stationery-3.svg', 'sticker-stationery-4.svg', 'sticker-matcha-cup.png'],
  },
  {
    id: 'dev',
    name: 'Yazılım',
    // each logo in two styles: badge + outlined die-cut
    files: [
      'sticker-dev-react.svg',
      'sticker-dev-typescript.svg', 'sticker-dev-typescript-outline.svg',
      'sticker-dev-javascript.svg', 'sticker-dev-javascript-outline.svg',
      'sticker-dev-html.svg', 'sticker-dev-html-outline.svg',
      'sticker-dev-python.svg', 'sticker-dev-python-outline.svg',
      'sticker-dev-github.svg', 'sticker-dev-github-outline.svg',
      'sticker-dev-figma.png',
      'sticker-dev-cpp.png', 'sticker-dev-tailwind.png', 'sticker-dev-w3css.png', 'sticker-dev-nextjs.png',
    ],
  },
]
// Polaroid + iPod are live CSS components, ride Replace as sentinel srcs

// src to category id + flat library
const CAT_OF = new Map<string, string>()
const STICKER_LIBRARY: string[] = []
STICKER_CATEGORIES.forEach((c) =>
  c.files.forEach((f) => {
    const src = ITM + f
    CAT_OF.set(src, c.id)
    STICKER_LIBRARY.push(src)
  }),
)
// Polaroid in Stationery tab
CAT_OF.set(POLAROID_SRC, 'stationery')
STICKER_LIBRARY.push(POLAROID_SRC)
// iPod in Replace catalogue
CAT_OF.set(IPOD_SRC, 'desk')
STICKER_LIBRARY.push(IPOD_SRC)
// name tag as live component sticker
CAT_OF.set(NAME_TAG_SRC, 'stationery')
STICKER_LIBRARY.push(NAME_TAG_SRC)
// tab row: one per category
const LIB_TABS = STICKER_CATEGORIES.map((c) => ({ id: c.id, name: c.name }))

// peel stickers adhere flush; everything else rests as a 3D object
const isPeelSticker = (src: string) => /sticker-(cutie|cute-pop|dev)-/.test(src)
// dev logos share one consistent size
const isDevSticker = (src: string) => /sticker-dev-/.test(src)
const DEV_STICKER_WIDTH = 'clamp(56px, 12.5vw, 132px)'

// keyboard colour themes (pre-recoloured SVG copies)
const KEYBOARD_BASE_SRC = ITM + 'sticker-keyboard.svg'
type StickerTheme = { id: string; name: string; src: string; swatch: string }
const KEYBOARD_THEMES: StickerTheme[] = [
  { id: 'mint', name: 'Nane', src: KEYBOARD_BASE_SRC, swatch: '#8bbba8' },
  { id: 'aqua', name: 'Turkuaz', src: ITM + 'sticker-keyboard-blue.svg', swatch: '#8cbfe0' },
  { id: 'orange', name: 'Turuncu', src: ITM + 'sticker-keyboard-orange.svg', swatch: '#e58e3e' },
  { id: 'ruby', name: 'Yakut', src: ITM + 'sticker-keyboard-ruby.svg', swatch: '#e8635e' },
]

// edit-menu icons (stroke 1.5)
const LbResize = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M16.4999 3.26621C17.3443 3.25421 20.1408 2.67328 20.7337 3.26621C21.3266 3.85913 20.7457 6.65559 20.7337 7.5M20.5059 3.49097L13.5021 10.4961" />
    <path d="M3.26636 16.5001C3.25436 17.3445 2.67343 20.141 3.26636 20.7339C3.85928 21.3268 6.65574 20.7459 7.50015 20.7339M10.502 13.4976L3.49824 20.5027" />
  </svg>
)
const LbReplace = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M16.9767 19.5C19.4017 17.8876 21 15.1305 21 12C21 7.02944 16.9706 3 12 3C11.3126 3 10.6432 3.07706 10 3.22302M16.9767 19.5V16M16.9767 19.5H20.5M7 4.51555C4.58803 6.13007 3 8.87958 3 12C3 16.9706 7.02944 21 12 21C12.6874 21 13.3568 20.9229 14 20.777M7 4.51555V8M7 4.51555H3.5" />
  </svg>
)
const LbTrash = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5" />
    <path d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5" />
    <path d="M9.5 16.5L9.5 10.5" />
    <path d="M14.5 16.5L14.5 10.5" />
  </svg>
)
const LbLink = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
    <path d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1" />
  </svg>
)

const DEFAULT_DEV_ACTIVITY_LINK = 'https://github.com/shamamaaa'
const DEV_ACTIVITY_LINK_STORAGE_KEY = 'df-dev-activity-link'

function normalizeExternalLink(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return DEFAULT_DEV_ACTIVITY_LINK
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}


// library tile artwork: static icon for sentinels, else the sticker image
function StickerTile({ src }: { src: string }) {
  if (src === POLAROID_SRC)
    return (
      <svg className="df-lib-polaroid" viewBox="0 0 40 36" aria-hidden="true">
        <rect x="4" y="6" width="32" height="26" rx="5" fill="#f6f4ef" stroke="#d8d2c8" />
        <rect x="4" y="6" width="32" height="6" rx="3" fill="#eceae4" />
        <rect x="27" y="9" width="6" height="2.6" rx="1.3" fill="#e15b5b" />
        <rect x="8" y="9.2" width="4" height="3" rx="1" fill="#cfd6db" />
        <circle cx="20" cy="21" r="7.5" fill="#2c2f33" />
        <circle cx="20" cy="21" r="4.4" fill="#5b6168" />
        <circle cx="18" cy="19" r="1.5" fill="#aeb6bd" />
      </svg>
    )
  if (src === IPOD_SRC)
    return (
      <svg className="df-lib-ipod" viewBox="0 0 40 56" aria-hidden="true">
        <rect x="9" y="3" width="22" height="50" rx="4.5" fill="#f7f7f5" stroke="#d8d8d3" />
        <rect x="12" y="8" width="16" height="16" rx="1.8" fill="#d7daf9" stroke="#4b4e66" strokeWidth="0.8" />
        <rect x="14" y="11" width="8" height="1.4" rx="0.7" fill="#4b4e66" opacity="0.75" />
        <rect x="14" y="14" width="11" height="1.2" rx="0.6" fill="#4b4e66" opacity="0.45" />
        <rect x="14" y="17" width="10" height="1.2" rx="0.6" fill="#4b4e66" opacity="0.45" />
        <circle cx="20" cy="38" r="10" fill="#dedede" stroke="#c8c8c8" />
        <circle cx="20" cy="38" r="4.2" fill="#fff" stroke="#d4d4d4" />
        <path d="M15 38h2.2M22.8 38H25M20 33v1.8M20 41.2v1.8" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    )
  if (src === NAME_TAG_SRC)
    return <img className="df-lib-name-tag" src="/stickers/items/hello-name-tag.svg" alt="" draggable={false} loading="lazy" decoding="async" />
  // lazy-load so thumbnails never fetch on the reveal path
  return <img src={src} alt="" draggable={false} loading="lazy" decoding="async" />
}

function stickerTitle(src: string) {
  return src === POLAROID_SRC
    ? 'polaroid'
    : src === IPOD_SRC
      ? 'iPod'
      : src === NAME_TAG_SRC
        ? 'isim etiketi'
        : src.split('/').pop()?.replace('sticker-', '').replace(/\.(svg|png)$/, '')
}

// bloom edit menu, morphs between views
type MatObjectKind = 'sticker' | 'polaroid' | 'device' | 'object'

function MatObjectMenu({ objectKey, kind, scale, rotate, flip, dx = 0, themes, baseSrc }: { objectKey: string; kind: MatObjectKind; scale: number; rotate: number; flip: boolean; dx?: number; themes?: StickerTheme[]; baseSrc?: string }) {
  const reduce = useReducedMotion()
  const { setActiveKey, overrides, patch, remove, tableSrcs } = useMatEdit()
  const [view, setView] = useState<'menu' | 'resize' | 'library' | 'link' | 'theme'>('menu')
  const currentSrc = overrides[objectKey]?.src ?? themes?.[0]?.src
  // open Replace on the current sticker's tab
  const [libCat, setLibCat] = useState(() => CAT_OF.get(overrides[objectKey]?.src ?? baseSrc ?? '') ?? LIB_TABS[0].id)
  const currentHref = overrides[objectKey]?.href ?? DEFAULT_DEV_ACTIVITY_LINK
  const [hrefDraft, setHrefDraft] = useState(currentHref)
  const close = () => setActiveKey(null)

  useEffect(() => {
    if (view === 'link') setHrefDraft(currentHref)
  }, [currentHref, view])

  // Replace library: every sticker except those on the desk
  const libItems = useMemo(() => STICKER_LIBRARY.filter((src) => !tableSrcs.has(src)), [tableSrcs])
  const catItems = useMemo(() => libItems.filter((src) => CAT_OF.get(src) === libCat), [libItems, libCat])
  const LIB_TILE = 46
  const libCols = Math.min(6, Math.max(1, catItems.length))
  const libRows = Math.max(1, Math.ceil(catItems.length / libCols))
  const libGridH = catItems.length ? libRows * LIB_TILE + (libRows - 1) * 6 : 44
  const libH = 34 + 8 + libGridH + 20 // tab row + gap + grid + padding

  // menu rows count
  const menuRows = 1 + (kind === 'sticker' ? 1 : 0) + (kind === 'device' ? 1 : 0) + (themes ? 1 : 0) + 1
  // centred on object, plus clamp nudge
  const xPos = dx ? `calc(-50% + ${dx}px)` : '-50%'
  const dims =
    view === 'library'
      ? { width: 326, height: libH, borderRadius: 22 }
      : view === 'link'
        ? { width: 270, height: 118, borderRadius: 22 }
      : view === 'theme'
        ? { width: 236, height: 112, borderRadius: 22 }
      : view === 'resize'
        ? { width: 244, height: 138, borderRadius: 22 }
        : { width: 170, height: 12 + menuRows * 46, borderRadius: 20 }

  const saveLink = (e: React.FormEvent) => {
    e.preventDefault()
    patch(objectKey, { href: normalizeExternalLink(hrefDraft) })
    setView('menu')
  }

  return (
    <motion.div
      className="df-matmenu"
      data-flip={flip ? 'below' : 'above'}
      role={view === 'link' ? 'dialog' : 'menu'}
      aria-label={kind === 'sticker' ? 'Edit sticker' : 'Edit object'}
      onPointerDown={(e) => e.stopPropagation()}
      initial={reduce ? false : { opacity: 0, scale: 0.66, x: xPos, ...dims }}
      animate={reduce ? { opacity: 1, x: xPos, ...dims } : { opacity: 1, scale: 1, x: xPos, ...dims }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.82, x: xPos, transition: { duration: 0.14, ease: 'easeIn' } }}
      transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0.26, duration: 0.44 }}
    >
      {/* one keyed surface per view, quick fade swap */}
      <motion.div
        key={view}
        className="df-matmenu-view"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.14 }}
      >
        {view === 'menu' && (
          <div className="df-matmenu-rows">
            <button type="button" className="df-matmenu-row" onClick={() => setView('resize')}>
              <LbResize className="df-matmenu-ico" /> Boyutlandır
            </button>
            {kind === 'sticker' && (
              <button type="button" className="df-matmenu-row" onClick={() => setView('library')}>
                <LbReplace className="df-matmenu-ico" /> Değiştir
              </button>
            )}
            {kind === 'device' && (
              <button type="button" className="df-matmenu-row" onClick={() => setView('link')}>
                <LbLink className="df-matmenu-ico" /> Linki değiştir
              </button>
            )}
            {themes && (
              <button type="button" className="df-matmenu-row" onClick={() => setView('theme')}>
                <span className="df-matmenu-ico df-matmenu-themedot" style={{ background: (themes.find((t) => t.src === currentSrc) ?? themes[0]).swatch }} aria-hidden="true" /> Tema
              </button>
            )}
            <button type="button" className="df-matmenu-row df-matmenu-row--danger" onClick={() => { remove(objectKey); close() }}>
              <LbTrash className="df-matmenu-ico" /> Sil
            </button>
          </div>
        )}
        {view === 'resize' && (
          <div className="df-matmenu-resize">
            <DialSlider value={scale} onChange={(s) => patch(objectKey, { scale: s })} min={0.5} max={1.8} step={0.05} label="Boyut" valueText={`${Math.round(scale * 100)}%`} ariaLabel="Nesne boyutu" />
            <DialSlider value={rotate} onChange={(r) => patch(objectKey, { rotate: r })} min={-180} max={180} step={1} label="Eğim" valueText={`${Math.round(rotate)}°`} ariaLabel="Çıkartma döndürme" />
            <button type="button" className="df-matmenu-done" onClick={() => setView('menu')}>Bitti</button>
          </div>
        )}
        {view === 'theme' && themes && (
          <div className="df-matmenu-theme">
            <div className="df-matmenu-theme-row" role="radiogroup" aria-label="Klavye rengi">
              {themes.map((t) => {
                const selected = (currentSrc ?? themes[0].src) === t.src
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={t.name}
                    title={t.name}
                    className={selected ? 'df-matmenu-swatch is-active' : 'df-matmenu-swatch'}
                    style={{ background: t.swatch }}
                    onClick={() => patch(objectKey, { src: t.src })}
                  />
                )
              })}
            </div>
            <button type="button" className="df-matmenu-done" onClick={() => setView('menu')}>Bitti</button>
          </div>
        )}
        {view === 'link' && (
          <form className="df-matmenu-link" onSubmit={saveLink}>
            <label className="df-matmenu-link-label" htmlFor={`${objectKey}-link`}>GitHub linki</label>
            <input
              id={`${objectKey}-link`}
              className="df-matmenu-link-input"
              value={hrefDraft}
              placeholder="https://github.com/sen"
              onChange={(e) => setHrefDraft(e.currentTarget.value)}
            />
            <div className="df-matmenu-link-actions">
              <button type="button" className="df-matmenu-link-btn" onClick={() => setView('menu')}>Vazgeç</button>
              <button type="submit" className="df-matmenu-link-btn df-matmenu-link-btn--primary">Kaydet</button>
            </div>
          </form>
        )}
        {view === 'library' && (
          <div className="df-matmenu-lib">
            {/* grid, tabs below */}
            {catItems.length === 0 ? (
              <p className="df-matmenu-lib-empty">Nothing here that isn't already on the desk ✨</p>
            ) : (
              <motion.div
                key={libCat}
                className="df-matmenu-lib-grid"
                style={{ gridTemplateColumns: `repeat(${libCols}, ${LIB_TILE}px)` }}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                {catItems.map((src) => (
                  <button
                    type="button"
                    key={src}
                    className="df-matmenu-lib-item"
                    title={stickerTitle(src)}
                    onClick={() => { patch(objectKey, { src }); close() }}
                  >
                    <StickerTile src={src} />
                  </button>
                ))}
              </motion.div>
            )}
            {/* tabs with sliding pill */}
            <div className="df-matmenu-tabs" role="tablist" aria-label="Çıkartma kategorileri">
              {LIB_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={t.id === libCat}
                  className={t.id === libCat ? 'df-matmenu-tab is-active' : 'df-matmenu-tab'}
                  onClick={() => setLibCat(t.id)}
                >
                  {t.id === libCat && (
                    <motion.span
                      className="df-matmenu-tab-bg"
                      layoutId="df-matmenu-tab-bg"
                      transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="df-matmenu-tab-label">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

function DraggableMatObject({
  objectKey,
  editable = false,
  kind = 'sticker',
  className = 'df-sticker-dragger',
  title = 'Hold to move',
  style,
  themes,
  baseSrc,
  onDraggingChange,
  children,
}: {
  objectKey: string
  editable?: boolean
  kind?: MatObjectKind
  className?: string
  title?: string
  style: React.CSSProperties
  themes?: StickerTheme[]
  baseSrc?: string
  onDraggingChange?: (dragging: boolean) => void
  children: React.ReactNode
}) {
  const { activeKey, setActiveKey, overrides, patch } = useMatEdit()
  const override = overrides[objectKey]
  const active = editable && activeKey === objectKey
  const [dragging, setDragging] = useState(false)
  const [flip, setFlip] = useState(false)
  const [menuDx, setMenuDx] = useState(0) // nudge to keep menu on-canvas
  const elRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number | null>(null)
  const dragRef = useRef<StickerDragState | null>(null)
  const dragFrameRef = useRef<number | null>(null)
  const pendingDragPatchRef = useRef<MatOverride | null>(null)
  const suppressClickRef = useRef(false)

  const clearHold = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const releaseCapture = () => {
    const state = dragRef.current
    const el = elRef.current
    if (state && el?.hasPointerCapture(state.pointerId)) {
      try {
        el.releasePointerCapture(state.pointerId)
      } catch {
        // capture already gone if OS cancelled the gesture
      }
    }
  }

  const flushDragPatch = useCallback(() => {
    if (dragFrameRef.current != null) {
      window.cancelAnimationFrame(dragFrameRef.current)
      dragFrameRef.current = null
    }
    const pending = pendingDragPatchRef.current
    if (!pending) return
    pendingDragPatchRef.current = null
    patch(objectKey, pending)
  }, [objectKey, patch])

  const scheduleDragPatch = useCallback((partial: MatOverride) => {
    pendingDragPatchRef.current = partial
    if (dragFrameRef.current != null) return
    dragFrameRef.current = window.requestAnimationFrame(() => {
      dragFrameRef.current = null
      const pending = pendingDragPatchRef.current
      if (!pending) return
      pendingDragPatchRef.current = null
      patch(objectKey, pending)
    })
  }, [objectKey, patch])

  useEffect(() => () => {
    if (dragFrameRef.current != null) window.cancelAnimationFrame(dragFrameRef.current)
  }, [])

  const placement = override?.left != null && override?.top != null ? { left: override.left, top: override.top } : undefined
  const placedStyle = placement
    ? (() => {
        const { left, right, top, bottom, ...rest } = style
        void left
        void right
        void top
        void bottom
        return { ...rest, left: placement.left, top: placement.top }
      })()
    : style

  const rootClassName = [className, dragging && 'is-dragging', active && 'df-matobject--active'].filter(Boolean).join(' ')

  // long-press in edit mode: lift + open menu
  const beginEdit = (el: HTMLDivElement) => {
    const stage = el.closest<HTMLElement>('.deskfolio-demo-stage')
    if (stage) {
      const sr = stage.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      setFlip((r.top - sr.top) < sr.height * 0.4) // near top, drop menu below
      // nudge horizontally to stay inside the stage
      const scale = stageScale(stage) || 1
      const centerX = r.left + r.width / 2 - sr.left // object centre from stage left
      const half = 168 * scale // menu half-width
      const pad = 14 * scale
      let dx = 0
      if (centerX - half < pad) dx = pad - (centerX - half)
      else if (centerX + half > sr.width - pad) dx = sr.width - pad - (centerX + half)
      setMenuDx(dx / scale) // back to unscaled units
    }
    if (dragRef.current) dragRef.current.held = true
    setActiveKey(objectKey)
  }

  const armDrag = (el: HTMLDivElement, pointerId: number, clientX: number, clientY: number) => {
    const stage = el.closest<HTMLElement>('.deskfolio-demo-stage')
    if (!stage || dragRef.current?.pointerId !== pointerId) return
    const scale = stageScale(stage) || 1
    const stageRect = stage.getBoundingClientRect()
    const rect = el.getBoundingClientRect()
    const left = (rect.left - stageRect.left) / scale
    const top = (rect.top - stageRect.top) / scale
    const width = rect.width / scale
    const height = rect.height / scale
    dragRef.current = {
      ...dragRef.current,
      armed: true,
      stage,
      offsetX: (clientX - rect.left) / scale,
      offsetY: (clientY - rect.top) / scale,
      width,
      height,
    }
    patch(objectKey, { left, top })
    setDragging(true)
    onDraggingChange?.(true)
    try {
      el.setPointerCapture(pointerId)
    } catch {
      // some browsers decline capture; drag still works
    }
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const el = e.currentTarget
    dragRef.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, armed: false, held: false }
    clearHold()
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      if (editable) beginEdit(el)
      else armDrag(el, e.pointerId, e.clientX, e.clientY)
    }, LONG_PRESS_MS)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragRef.current
    if (!state || state.pointerId !== e.pointerId) return
    if (state.armed) {
      if (!state.stage || state.offsetX == null || state.offsetY == null || state.width == null || state.height == null) return
      const scale = stageScale(state.stage) || 1
      const stageRect = state.stage.getBoundingClientRect()
      const maxLeft = Math.max(0, state.stage.offsetWidth - state.width)
      const maxTop = Math.max(0, state.stage.offsetHeight - state.height)
      scheduleDragPatch({
        left: clamp((e.clientX - stageRect.left) / scale - state.offsetX, 0, maxLeft),
        top: clamp((e.clientY - stageRect.top) / scale - state.offsetY, 0, maxTop),
      })
      e.preventDefault()
      return
    }
    const moved = Math.hypot(e.clientX - state.startX, e.clientY - state.startY) > LONG_PRESS_SLOP
    if (state.held) {
      // moving converts the lift into a drag
      if (moved) {
        setActiveKey(null)
        armDrag(e.currentTarget, state.pointerId, e.clientX, e.clientY)
      }
      return
    }
    // moved before long-press: scroll/swipe, cancel hold
    if (moved) {
      clearHold()
      dragRef.current = null
    }
  }

  const onPointerUp = () => {
    clearHold()
    flushDragPatch()
    const state = dragRef.current
    if (state?.armed || state?.held) {
      // swallow the trailing click after a drag/lift
      suppressClickRef.current = true
      window.setTimeout(() => {
        suppressClickRef.current = false
      }, 0)
    }
    releaseCapture()
    dragRef.current = null
    setDragging(false)
    onDraggingChange?.(false)
  }

  const onPointerCancel = () => {
    clearHold()
    flushDragPatch()
    releaseCapture()
    dragRef.current = null
    setDragging(false)
    onDraggingChange?.(false)
  }

  return (
    <div
      ref={elRef}
      className={rootClassName}
      data-sticker={objectKey}
      title={title}
      style={placedStyle}
      onClickCapture={(e) => {
        if (!suppressClickRef.current) return
        // never swallow the menu's own buttons
        if ((e.target as HTMLElement).closest('.df-matmenu')) return
        e.preventDefault()
        e.stopPropagation()
        suppressClickRef.current = false
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onLostPointerCapture={onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
      <AnimatePresence>
        {active && <MatObjectMenu objectKey={objectKey} kind={kind} scale={override?.scale ?? 1} rotate={override?.rotate ?? 0} flip={flip} dx={menuDx} themes={themes} baseSrc={baseSrc} />}
      </AnimatePresence>
    </div>
  )
}

function DraggableMatSticker({
  objectKey,
  item,
  index,
  reduce,
  onDraggingChange,
}: {
  objectKey: string
  item: StickerItem
  index: number
  reduce: boolean
  onDraggingChange: (dragging: boolean) => void
}) {
  const { overrides, activeKey } = useMatEdit()
  const ov = overrides[objectKey]
  const active = activeKey === objectKey
  const scale = ov?.scale ?? 1
  const rot = ov?.rotate ?? 0 // user tilt on top of resting rotate
  const src = ov?.src ?? item.src

  // Polaroid replacement becomes the live CSS camera
  if (src === POLAROID_SRC) {
    return (
      <DraggableMatObject
        objectKey={objectKey}
        editable
        kind="sticker"
        className="df-sticker-dragger df-polaroid-dragger"
        baseSrc={src}
        style={
          {
            ...item.pos,
            ...(scale !== 1 ? { '--df-pol-scale': 0.26 * scale } : {}),
            ...(rot !== 0 ? { '--df-pol-rotate': `${-7 + rot}deg` } : {}),
          } as React.CSSProperties
        }
        onDraggingChange={onDraggingChange}
      >
        <div className="df-polaroid-mat">
          <div className="df-polaroid-scale">
            <PolaroidCamera />
          </div>
        </div>
      </DraggableMatObject>
    )
  }

  if (src === IPOD_SRC) {
    return (
      <DraggableMatObject
        objectKey={objectKey}
        editable
        kind="sticker"
        className="df-sticker-dragger df-ipod-dragger"
        baseSrc={src}
        style={
          {
            ...item.pos,
            '--df-ipod-scale': 0.58 * scale,
            '--df-ipod-rotate': `${-14 + rot}deg`,
          } as React.CSSProperties
        }
        onDraggingChange={onDraggingChange}
      >
        <div className="df-ipod-mat">
          <div className="df-mipod df-ipod-placed" aria-hidden="true">
            <MiniPod />
          </div>
        </div>
      </DraggableMatObject>
    )
  }

  // peel vs 3D is driven by the art, not the slot
  if (src === NAME_TAG_SRC) {
    return (
      <DraggableMatObject
        objectKey={objectKey}
        editable
        kind="sticker"
        className="df-sticker-dragger df-name-tag-dragger"
        baseSrc={src}
        style={
          {
            ...item.pos,
            '--df-name-tag-scale': scale,
            '--df-name-tag-rotate': `${-8 + rot}deg`,
          } as React.CSSProperties
        }
        onDraggingChange={onDraggingChange}
      >
        <div className="df-name-tag-mat">
          <EditableNameTag className="df-name-tag-placed" />
        </div>
      </DraggableMatObject>
    )
  }

  const stuck = isPeelSticker(src)

  return (
    <DraggableMatObject
      objectKey={objectKey}
      editable
      kind="sticker"
      // peel stickers sit on the bottom layer
      className={stuck ? 'df-sticker-dragger df-sticker-dragger--stuck' : 'df-sticker-dragger'}
      // dev logos use one consistent base width
      style={{ width: isDevSticker(src) ? DEV_STICKER_WIDTH : item.width, ...item.pos }}
      baseSrc={src}
      // keyboard is recolourable
      themes={item.src === KEYBOARD_BASE_SRC ? KEYBOARD_THEMES : undefined}
      onDraggingChange={onDraggingChange}
    >
      {/* inner scale layer carries Resize + lift */}
      <div className="df-sticker-scale" style={{ transform: `scale(${active ? scale * 1.06 : scale}) rotate(${rot}deg)` }}>
        <motion.img
          key={src}
          className={stuck ? 'df-sticker-item df-sticker-stuck' : 'df-sticker-item'}
          src={src}
          alt=""
          draggable={false}
          decoding="async"
          {...(stuck ? pressOn : dropIn)(item.rotate, index, reduce)}
        />
      </div>
    </DraggableMatObject>
  )
}

/** interactive desk lamp: click to toggle the light */
function DeskLamp({
  item,
  index,
  on,
  onToggle,
  placed = false,
}: {
  item: StickerItem
  index: number
  on: boolean
  onToggle: () => void
  placed?: boolean
}) {
  const reduce = useReducedMotion()
  // warm-up flicker only on a deliberate click, not on mount
  const [warmup, setWarmup] = useState(false)
  return (
    <motion.button
      type="button"
      className={on ? (warmup ? 'df-lamp is-on df-lamp--warmup' : 'df-lamp is-on') : 'df-lamp'}
      style={placed ? { width: '100%' } : { width: item.width, ...item.pos }}
      role="switch"
      aria-checked={on}
      aria-label="Masa lambası ışığı"
      onClick={() => {
        if (!on) setWarmup(true) // play warm-up flicker on manual on
        onToggle()
      }}
      {...dropIn(item.rotate, index, !!reduce)}
    >
      {/* directional light beam, layered for realism */}
      <svg className="df-lamp-cast" viewBox="0 0 200 200" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="lamp-beam" x1="121" y1="80" x2="-480" y2="300" gradientUnits="userSpaceOnUse">
            {/* steep near-to-far falloff */}
            <stop offset="0" stopColor="#fff8e8" stopOpacity="0.92" />
            <stop offset="0.09" stopColor="#fff3cf" stopOpacity="0.62" />
            <stop offset="0.24" stopColor="#ffeab2" stopOpacity="0.34" />
            <stop offset="0.48" stopColor="#ffe7a6" stopOpacity="0.15" />
            <stop offset="0.76" stopColor="#ffe6a0" stopOpacity="0.05" />
            <stop offset="1" stopColor="#ffe6a0" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="lamp-pool">
            <stop offset="0" stopColor="#fff7e2" stopOpacity="0.5" />
            <stop offset="0.55" stopColor="#ffedbe" stopOpacity="0.16" />
            <stop offset="1" stopColor="#ffedbe" stopOpacity="0" />
          </radialGradient>
          {/* mask: soft hole over the lamp body */}
          <radialGradient id="lamp-hole">
            <stop offset="0.28" stopColor="#000" />
            <stop offset="1" stopColor="#fff" />
          </radialGradient>
          <filter id="lamp-mblur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" /></filter>
          <mask id="lamp-mask">
            <rect x="-900" y="-500" width="1400" height="1500" fill="#fff" />
            {/* big soft hole so the beam fades in */}
            <ellipse cx="150" cy="52" rx="82" ry="76" fill="url(#lamp-hole)" filter="url(#lamp-mblur)" />
          </mask>
          <filter id="lamp-pen" filterUnits="userSpaceOnUse" x="-820" y="-140" width="1180" height="940"><feGaussianBlur stdDeviation="14" /></filter>
          <filter id="lamp-umb" filterUnits="userSpaceOnUse" x="-820" y="-140" width="1180" height="940"><feGaussianBlur stdDeviation="7" /></filter>
          <filter id="lamp-b10" filterUnits="userSpaceOnUse" x="-820" y="-140" width="1180" height="940"><feGaussianBlur stdDeviation="10" /></filter>
        </defs>
        <g mask="url(#lamp-mask)">
          <path d="M96 54 L-700 90 L-360 660 L150 104 Z" fill="url(#lamp-beam)" opacity="0.42" filter="url(#lamp-pen)" />
          <path d="M106 60 L-650 125 L-370 560 L136 96 Z" fill="url(#lamp-beam)" filter="url(#lamp-umb)" />
          <ellipse cx="-150" cy="210" rx="150" ry="82" transform="rotate(-14 -150 210)" fill="url(#lamp-pool)" filter="url(#lamp-b10)" />
        </g>
      </svg>
      <img className="df-lamp-img" src={item.src} alt="" draggable={false} decoding="async" />
    </motion.button>
  )
}

/** the set's items, scattered across the mat */
function MatStickers({ setId, compact = false }: { setId: string; compact?: boolean }) {
  const reduce = useReducedMotion()
  const { overrides, activeKey } = useMatEdit()
  const [dragging, setDragging] = useState(false)
  const set = STICKER_SETS.find((s) => s.id === setId) ?? STICKER_SETS[0]
  // lift the layer when a sticker's menu is open; index the lamp-filtered list
  const hasActiveSticker = set.items.filter((it) => !it.lamp).some((it, i) => `${set.id}-${i}-${it.src}` === activeKey)
  return (
    <div className={['df-stickers', dragging && 'is-dragging', hasActiveSticker && 'has-active'].filter(Boolean).join(' ')}>
      <AnimatePresence>
        {set.items
          .filter((it) => !it.lamp)
          .map((it, i) => ({ it, i, key: `${set.id}-${i}-${it.src}` })) // stable index so overrides survive
          .filter(({ key }) => !overrides[key]?.deleted)
          // phones keep peel-stickers + the plant only
          .filter(({ it }) => !compact || isPeelSticker(it.src) || /plant/.test(it.src))
          .map(({ it, i, key }) => (
            <DraggableMatSticker
              key={key}
              objectKey={key}
              item={it}
              index={i}
              reduce={!!reduce}
              onDraggingChange={setDragging}
            />
          ))}
      </AnimatePresence>
    </div>
  )
}

// synthesise an item for an added sticker (default size/tilt, cascading slots)
function addedItem(src: string, i: number): StickerItem {
  const peel = isPeelSticker(src)
  const col = i % 6
  const row = Math.floor(i / 6)
  const tilt = [-7, 6, -4, 8, -5, 3][i % 6]
  return {
    src,
    width: peel ? 'clamp(46px, 11vw, 128px)' : 'clamp(48px, 11vw, 146px)',
    rotate: tilt,
    pos: { top: `${24 + col * 6 + row * 4}%`, left: `${13 + col * 3.6}%` },
  }
}

/** user-added stickers, persist across set switches */
function AddedStickers({ added }: { added: Array<{ key: string; src: string }> }) {
  const reduce = useReducedMotion()
  const { overrides, activeKey } = useMatEdit()
  const [dragging, setDragging] = useState(false)
  const live = added.filter((a) => !overrides[a.key]?.deleted)
  const hasActive = live.some((a) => a.key === activeKey)
  return (
    <div className={['df-stickers', dragging && 'is-dragging', hasActive && 'has-active'].filter(Boolean).join(' ')}>
      <AnimatePresence>
        {live.map((a, i) => {
          // seed slot/tilt from the stable key, not the live index
          const seed = Number(a.key.slice('added-'.length))
          return (
            <DraggableMatSticker
              key={a.key}
              objectKey={a.key}
              item={addedItem(a.src, Number.isFinite(seed) ? seed : i)}
              index={i}
              reduce={!!reduce}
              onDraggingChange={setDragging}
            />
          )
        })}
      </AnimatePresence>
    </div>
  )
}

/** the "+" FAB and its bloom library panel */
function AddStickerControl({ open, onToggle, onAdd }: { open: boolean; onToggle: (v: boolean) => void; onAdd: (src: string) => void }) {
  const reduce = useReducedMotion()
  const [cat, setCat] = useState(LIB_TABS[0].id)
  const items = useMemo(() => STICKER_LIBRARY.filter((src) => CAT_OF.get(src) === cat), [cat])
  const LIB_TILE = 46
  const cols = Math.min(6, Math.max(1, items.length))
  // explicit panel height per category so tab switches morph smoothly
  const rows = Math.max(1, Math.ceil(items.length / cols))
  const gridH = rows * LIB_TILE + (rows - 1) * 9 // 9px row gap
  const panelH = gridH + 74
  return (
    <motion.div
      className="df-addzone"
      initial={reduce ? false : { opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0.4, duration: 0.5 }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            className="df-add-panel"
            role="dialog"
            aria-label="Çıkartma ekle"
            initial={reduce ? false : { opacity: 0, scale: 0.85, y: 10, height: panelH }}
            animate={{ opacity: 1, scale: 1, y: 0, height: panelH }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 8, transition: { duration: 0.14, ease: 'easeIn' } }}
            transition={
              reduce
                ? { duration: 0 }
                : {
                    default: { type: 'spring', bounce: 0.26, duration: 0.42 },
                    // bottom-anchored, ease height with no overshoot
                    height: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                  }
            }
          >
            {/* grid, tabs below; panel blooms upward from the FAB */}
            {/* one grid at a time (mode="wait") */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={cat}
                className="df-matmenu-lib-grid df-add-grid"
                style={{ gridTemplateColumns: `repeat(${cols}, ${LIB_TILE}px)` }}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.12 }}
              >
                {items.map((src) => (
                  <button type="button" key={src} className="df-matmenu-lib-item" title={stickerTitle(src)} onClick={() => onAdd(src)}>
                    <StickerTile src={src} />
                  </button>
                ))}
              </motion.div>
            </AnimatePresence>
            <div className="df-matmenu-tabs" role="tablist" aria-label="Çıkartma kategorileri">
              {LIB_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={t.id === cat}
                  className={t.id === cat ? 'df-matmenu-tab is-active' : 'df-matmenu-tab'}
                  onClick={() => setCat(t.id)}
                >
                  {t.id === cat && (
                    <motion.span
                      className="df-matmenu-tab-bg"
                      layoutId="df-add-tab-bg"
                      transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="df-matmenu-tab-label">{t.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        className={open ? 'df-add-fab is-open' : 'df-add-fab'}
        aria-label={open ? 'Çıkartma seçiciyi kapat' : 'Masaya çıkartma ekle'}
        aria-expanded={open}
        title="Çıkartma ekle"
        onClick={() => onToggle(!open)}
      >
        {/* plus to cross: a 45deg spin of the icon */}
        <motion.svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          animate={{ rotate: open ? 45 : 0 }}
          transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0.3, duration: 0.4 }}
        >
          <path d="M12 4.5v15M4.5 12h15" />
        </motion.svg>
      </button>
    </motion.div>
  )
}

/** photoreal Polaroid OneStep, pure CSS */
function PolaroidCamera() {
  return (
    <div className="df-polaroid" aria-hidden="true">
      <div className="top">
        <div className="flash" />
        <div className="timer" />
        <div className="sensor" />
        <div className="lens">
          <div className="glass" />
        </div>
        <div className="shutter" />
        <div className="viewfinder">
          <div className="glass">
            <div className="back" />
          </div>
        </div>
        <div className="toggle-container">
          <div className="toggle" />
        </div>
        <div className="power" />
        <div className="title" />
      </div>
      <div className="bottom">
        <div className="toggle-container">
          <div className="toggle">
            <div className="handle" />
          </div>
        </div>
        <div className="printer" />
        <div className="labels">
          <div className="rainbow" />
          <div className="logo">Polaroid</div>
          <div className="type" />
        </div>
      </div>
    </div>
  )
}

// dev-activity monitor: a contribution grid, links to GitHub
const DEV_GRID_COLS = 7 // 4 rows x 7 cols, row-major
// levels 0-4 map to the Less-to-More palette
const DEV_GRID: number[] = [
  0, 0, 0, 0, 0, 1, 2,
  0, 0, 0, 0, 1, 2, 3,
  0, 0, 0, 1, 2, 3, 4,
  0, 0, 1, 1, 2, 3, 3,
]

/** dev-activity monitor; click target is a real link */
function DevMonitor({ href }: { href: string }) {
  return (
    <a
      className="df-monitor"
      href={href}
      target="_blank"
      rel="noreferrer"
      draggable={false}
      aria-label="GitHub etkinliğini görüntüle"
      title="Tıklayarak projelere göz atabilirsin · basılı tutup taşı"
    >
      <span className="df-ipad-device" aria-hidden="true">
        <img className="df-ipad-shell" src="/stickers/devices/github-ipad.svg" alt="" draggable={false} decoding="async" />
        <span className="df-ipad-screen">
          {/* tracker UI as SVG so it scales to the screen */}
          <svg className="df-ipad-ui" viewBox="0 0 264 201" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <defs>
              <radialGradient id="df-ui-bg" cx="0" cy="0" r="1" gradientTransform="matrix(324 0 0 231 74 0)" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#21303f" />
                <stop offset="0.68" stopColor="#121c28" />
                <stop offset="1" stopColor="#0c141d" />
              </radialGradient>
              <linearGradient id="df-ui-glare" x1="0" y1="0" x2="112" y2="88" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#ffffff" stopOpacity="0.12" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <filter id="df-ui-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect className="df-ui-bg" x="0" y="0" width="264" height="201" rx="14" />
            <path className="df-ui-glare" d="M0 0H142L0 104Z" />
            <text className="df-ui-title" x="16" y="24">projelere göz at</text>
            <circle className="df-ui-dot" cx="221" cy="19.5" r="4" filter="url(#df-ui-glow)" />
            <text className="df-ui-streak" x="248" y="24">32</text>
            {DEV_GRID.map((lvl, i) => {
              const col = i % DEV_GRID_COLS
              const row = Math.floor(i / DEV_GRID_COLS)
              return (
                <rect
                  key={i}
                  className="df-ui-cell"
                  data-lvl={lvl}
                  x={21 + col * 33}
                  y={50 + row * 31}
                  width="24"
                  height="24"
                  rx="9"
                  filter={lvl === 4 ? 'url(#df-ui-glow)' : undefined}
                />
              )
            })}
            <g className="df-ui-tags">
              <rect x="16" y="182" width="40" height="15" rx="7.5" />
              <text x="36" y="192.6">React</text>
              <rect x="61" y="182" width="29" height="15" rx="7.5" />
              <text x="75.5" y="192.6">SVG</text>
              <rect x="95" y="182" width="47" height="15" rx="7.5" />
              <text x="118.5" y="192.6">Motion</text>
            </g>
          </svg>
        </span>
      </span>
    </a>
  )
}

/** workspace lamp, rendered above the book */
const LAMP_ITEM = STICKER_SETS.find((s) => s.id === 'workspace')?.items.find((it) => it.lamp)
const LAMP_DEFAULT_SCALE = 1.15
const LAMP_DEFAULT_ROTATE = 10

// cover colours: light pastel set
const COVER_THEMES: Array<{ id: string; name: string; base: string; ink: 'light' | 'dark' }> = [
  { id: 'powder', name: 'Pudra', base: '#f4c9d6', ink: 'dark' },
  { id: 'garden-blush', name: 'Bahçe pembesi', base: '#e9bdc8', ink: 'dark' },
  { id: 'blush', name: 'Pembe', base: '#f3a3bd', ink: 'dark' },
  { id: 'coral', name: 'Mercan', base: '#f79a86', ink: 'dark' },
  { id: 'apricot', name: 'Kayısı', base: '#ffc196', ink: 'dark' },
  { id: 'butter', name: 'Tereyağı', base: '#ffe27a', ink: 'dark' },
  { id: 'lemon-cream', name: 'Limonlu krema', base: '#ffedaa', ink: 'dark' },
  { id: 'mint', name: 'Nane yeşili', base: '#a7e0c2', ink: 'dark' },
  { id: 'milk-mint', name: 'Sütlü nane', base: '#c8ead8', ink: 'dark' },
  { id: 'sage', name: 'Adaçayı', base: '#9fc59f', ink: 'dark' },
  { id: 'sky', name: 'Gökyüzü', base: '#a9d4ea', ink: 'dark' },
  { id: 'periwinkle', name: 'Peri mavisi', base: '#b6bdee', ink: 'dark' },
  { id: 'lilac', name: 'Leylak', base: '#d4c7e3', ink: 'dark' },
  { id: 'cotton-candy', name: 'Pamuk şeker', base: '#f2c2df', ink: 'dark' },
]

/** cover gradient + ink vars from base colour */
function coverVars(theme: (typeof COVER_THEMES)[number]): React.CSSProperties {
  return {
    '--df-cover-1': `color-mix(in srgb, ${theme.base}, white 14%)`,
    '--df-cover-2': theme.base,
    '--df-cover-3': `color-mix(in srgb, ${theme.base}, black 16%)`,
    '--df-cover-ink': theme.ink === 'light' ? '#eef3f1' : '#5b4a52',
  } as React.CSSProperties
}

/** pill button that opens a swatch popover */
function SwatchPicker({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<{ id: string; name: string; swatch: string }>
  onChange: (id: string) => void
}) {
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const current = options.find((o) => o.id === value) ?? options[0]

  // popover blooms out of the pill; swatches stagger in
  const popVariants: Variants = {
    hidden: { opacity: 0, scale: 0.82, x: '-50%', y: -8 },
    visible: {
      opacity: 1,
      scale: 1,
      x: '-50%',
      y: 0,
      transition: reduce
        ? { duration: 0 }
        : { type: 'spring', bounce: 0.36, duration: 0.42, staggerChildren: 0.016, delayChildren: 0.04 },
    },
    exit: {
      opacity: 0,
      scale: 0.92,
      x: '-50%',
      y: -6,
      transition: reduce ? { duration: 0 } : { duration: 0.15, ease: 'easeIn' },
    },
  }
  const swVariants: Variants = {
    hidden: { opacity: 0, scale: 0.6 },
    visible: { opacity: 1, scale: 1, transition: reduce ? { duration: 0 } : { type: 'spring', bounce: 0.3, duration: 0.32 } },
  }

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    // Escape closes and returns focus to trigger
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="df-picker" ref={ref}>
      <button
        type="button"
        ref={triggerRef}
        className={open ? 'df-picker-trigger is-open' : 'df-picker-trigger'}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`${label}: ${current.name}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="df-picker-chip" style={{ '--sw': current.swatch } as React.CSSProperties} />
        <span className="df-picker-label">{label}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="df-picker-pop"
            role="group"
            aria-label={label}
            style={{ left: '50%' }}
            variants={popVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {options.map((o) => (
              <motion.button
                key={o.id}
                type="button"
                className={value === o.id ? 'df-sw is-active' : 'df-sw'}
                style={{ '--sw': o.swatch } as React.CSSProperties}
                variants={swVariants}
                whileHover={reduce ? undefined : { scale: 1.18, y: -2 }}
                whileTap={reduce ? undefined : { scale: 0.9 }}
                aria-pressed={value === o.id}
                aria-label={o.name}
                title={o.name}
                onClick={() => {
                  onChange(o.id)
                  setOpen(false)
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CoverColorPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return <SwatchPicker label="kapak rengi" value={value} onChange={onChange} options={COVER_THEMES.map((t) => ({ id: t.id, name: t.name, swatch: t.base }))} />
}

// desk surfaces; cutting-mats share a white grid
const matBg = (r1: string, r2: string, r3: string) =>
  [
    'repeating-linear-gradient(0deg, rgba(255,255,255,0.11) 0 1px, transparent 1px 112px)',
    'repeating-linear-gradient(90deg, rgba(255,255,255,0.11) 0 1px, transparent 1px 112px)',
    'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 28px)',
    'repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 28px)',
    `radial-gradient(130% 120% at 50% 0%, ${r1} 0%, ${r2} 70%, ${r3} 100%)`,
  ].join(', ')

const BACKGROUND_THEMES: Array<{ id: string; name: string; swatch: string; style: React.CSSProperties }> = [
  { id: 'mat', name: 'Yeşil zemin', swatch: '#2f6f5b', style: { backgroundColor: '#2f6f5b', backgroundImage: matBg('#347a64', '#285446', '#20473b'), '--df-cast': 'rgba(15, 30, 24, 0.5)' } as React.CSSProperties },
  { id: 'matblue', name: 'Mavi zemin', swatch: '#2f5a6f', style: { backgroundColor: '#2f5a6f', backgroundImage: matBg('#36728c', '#284c5c', '#203f4d'), '--df-cast': 'rgba(14, 28, 36, 0.5)' } as React.CSSProperties },
  { id: 'matpink', name: 'Pembe zemin', swatch: '#a85d72', style: { backgroundColor: '#a85d72', backgroundImage: matBg('#b56a80', '#8c4a5e', '#76414f'), '--df-cast': 'rgba(70, 30, 44, 0.42)' } as React.CSSProperties },
  {
    id: 'pinkscene',
    name: 'Pembe sahne',
    swatch: '#f9c5d5',
    style: {
      backgroundColor: '#f9c5d5',
      backgroundImage:
        "radial-gradient(62% 58% at 50% 52%, rgba(255, 247, 226, 0.06) 0%, rgba(94, 48, 68, 0.06) 52%, rgba(94, 48, 68, 0.31) 100%), linear-gradient(rgba(235, 139, 174, 0.24), rgba(218, 119, 157, 0.3)), url('/backgrounds/pink-desk-scene.webp')",
      backgroundSize: '100% 100%, 100% 100%, cover',
      backgroundPosition: 'center center, center center, center center',
      backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
      '--df-cast': 'rgba(98, 45, 66, 0.36)',
    } as React.CSSProperties,
  },
  {
    id: 'cream-botanical',
    name: 'Krem botanik',
    swatch: '#eeefdc',
    style: {
      backgroundColor: '#eeefdc',
      backgroundImage:
        "radial-gradient(62% 58% at 50% 52%, rgba(255, 250, 232, 0.05) 0%, rgba(72, 82, 58, 0.05) 52%, rgba(72, 82, 58, 0.24) 100%), linear-gradient(rgba(223, 226, 205, 0.18), rgba(201, 211, 188, 0.23)), url('/backgrounds/cream-botanical.webp')",
      backgroundSize: '100% 100%, 100% 100%, cover',
      backgroundPosition: 'center center, center center, center center',
      backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
      '--df-cast': 'rgba(64, 80, 58, 0.32)',
    } as React.CSSProperties,
  },
  {
    id: 'sky-cloud-grid',
    name: 'Gökyüzü bulutu',
    swatch: '#b1d4f3',
    style: {
      backgroundColor: '#b1d4f3',
      backgroundImage:
        "radial-gradient(62% 58% at 50% 52%, rgba(255, 255, 244, 0.05) 0%, rgba(42, 74, 108, 0.05) 52%, rgba(42, 74, 108, 0.26) 100%), linear-gradient(rgba(112, 166, 214, 0.16), rgba(86, 146, 202, 0.22)), url('/backgrounds/sky-cloud-grid.webp')",
      backgroundSize: '100% 100%, 100% 100%, cover',
      backgroundPosition: 'center center, center center, center center',
      backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
      '--df-cast': 'rgba(45, 80, 116, 0.34)',
    } as React.CSSProperties,
  },
  {
    id: 'blue-cute-scene',
    name: 'Mavi sahne',
    swatch: '#91c7fe',
    style: {
      backgroundColor: '#91c7fe',
      backgroundImage:
        "radial-gradient(62% 58% at 50% 52%, rgba(255, 252, 236, 0.05) 0%, rgba(32, 72, 112, 0.05) 52%, rgba(32, 72, 112, 0.28) 100%), linear-gradient(rgba(95, 157, 222, 0.18), rgba(70, 132, 202, 0.24)), url('/backgrounds/blue-cute-scene.webp')",
      backgroundSize: '100% 100%, 100% 100%, cover',
      backgroundPosition: 'center center, center center, center center',
      backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
      '--df-cast': 'rgba(38, 75, 118, 0.36)',
    } as React.CSSProperties,
  },
  {
    id: 'wood',
    name: 'Wood desk',
    swatch: '#a9794e',
    style: {
      backgroundColor: '#a9794e',
      backgroundImage:
        'repeating-linear-gradient(91deg, rgba(60,30,10,0.08) 0 1px, transparent 1px 6px), repeating-linear-gradient(90deg, rgba(255,240,220,0.05) 0 2px, transparent 2px 9px), linear-gradient(180deg, #b9885a, #9c6e44)',
      '--df-cast': 'rgba(55, 32, 14, 0.4)',
    } as React.CSSProperties,
  },
  { id: 'cream', name: 'Cream', swatch: '#efe7d8', style: { backgroundColor: '#efe7d8', backgroundImage: 'radial-gradient(130% 120% at 50% 0%, #f6efe2 0%, #ebe1d0 70%, #e3d8c4 100%)', '--df-cast': 'rgba(120, 100, 88, 0.3)' } as React.CSSProperties },
  { id: 'lavender', name: 'Lavender', swatch: '#ddd4ec', style: { backgroundColor: '#ddd4ec', backgroundImage: 'radial-gradient(130% 120% at 50% 0%, #ece6f6 0%, #ddd4ec 70%, #cfc4e3 100%)', '--df-cast': 'rgba(110, 100, 128, 0.3)' } as React.CSSProperties },
]

// switchable theme assets, warmed on idle after the first reveal
const DESKFOLIO_THEME_WARM_SRCS: string[] = [
  ...new Set([
    ...BACKGROUND_THEMES
      .map((t) => /url\(['"]?([^'")]+)/.exec(String(t.style.backgroundImage ?? ''))?.[1])
      .filter((u): u is string => !!u),
    ...STICKER_SETS.flatMap((s) => s.items.map((it) => it.src)).filter((src) => !src.startsWith('__component:')),
    '/stickers/devices/github-ipad.svg',
  ]),
]

// warm only the "+" panel's first tab on idle
const DESKFOLIO_LIBRARY_WARM_SRCS: string[] = STICKER_LIBRARY.filter(
  (src) => !src.startsWith('__component:') && CAT_OF.get(src) === LIB_TABS[0].id,
)

/** swatch picker for the desk surface */
function BackgroundPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return <SwatchPicker label="arka plan" value={value} onChange={onChange} options={BACKGROUND_THEMES.map((t) => ({ id: t.id, name: t.name, swatch: t.swatch }))} />
}

// blessed cover/background pairings
type Pairing = { name: string; coverId: string; bgId: string }
const PAIRINGS: Pairing[] = [
  { name: 'Pink Scene', coverId: 'milk-mint', bgId: 'pinkscene' }, // default
  { name: 'Strawberry Matcha', coverId: 'powder', bgId: 'mat' }, // pink on matcha green
  { name: 'Lemon Lagoon', coverId: 'butter', bgId: 'matblue' }, // yellow on teal
  { name: 'Coral Reef', coverId: 'coral', bgId: 'matblue' }, // coral on teal
  { name: 'Minty Rose', coverId: 'mint', bgId: 'matpink' }, // mint on rose
  { name: 'Milk Mint Rose', coverId: 'milk-mint', bgId: 'matpink' }, // softer mint on rose
  { name: 'Periwinkle Clover', coverId: 'periwinkle', bgId: 'mat' }, // blue-violet on green
  { name: 'Bluebird Oak', coverId: 'sky', bgId: 'wood' }, // sky blue on wood
  { name: 'Honey Oak', coverId: 'butter', bgId: 'wood' }, // butter on grain
  { name: 'Sage Woodgrain', coverId: 'sage', bgId: 'wood' }, // sage on wood
  { name: 'Apricot Dusk', coverId: 'apricot', bgId: 'lavender' }, // apricot on lavender
  { name: 'Blue Cream Soda', coverId: 'sky', bgId: 'cream' }, // sky blue on cream
  { name: 'Pink Scene', coverId: 'milk-mint', bgId: 'pinkscene' }, // mint on pink scene
  { name: 'Botanical Blush', coverId: 'garden-blush', bgId: 'cream-botanical' }, // rose on cream botanical
  { name: 'Sky Lemon Cream', coverId: 'lemon-cream', bgId: 'sky-cloud-grid' }, // lemon on blue grid
  { name: 'Blue Cotton Candy', coverId: 'cotton-candy', bgId: 'blue-cute-scene' }, // candy on blue scene
]

const SURPRISE_FIRST_PAIRINGS: Pairing[] = [
  { name: 'Pink Scene', coverId: 'milk-mint', bgId: 'pinkscene' },
  { name: 'Milk Mint Rose', coverId: 'milk-mint', bgId: 'matpink' },
  { name: 'Periwinkle Clover', coverId: 'periwinkle', bgId: 'mat' },
]

// initial-load desk: one of these two combos at random
const LOAD_DEFAULT_PAIRINGS: Pairing[] = [
  { name: 'Periwinkle Clover', coverId: 'periwinkle', bgId: 'mat' },
  { name: 'Milk Mint Rose', coverId: 'milk-mint', bgId: 'matpink' },
]

const BACKGROUND_COVER_MATCH: Record<string, string> = {
  pinkscene: 'milk-mint',
  'cream-botanical': 'garden-blush',
  'sky-cloud-grid': 'lemon-cream',
  'blue-cute-scene': 'cotton-candy',
}

// each set's paired background (Workspace has none)
const SET_BACKGROUND: Record<string, string> = {
  journal: 'pinkscene',
  stationery: 'sky-cloud-grid',
}

/** pick a random blessed palette, avoiding the current combo */
function randomPairing(curCoverId?: string, curBgId?: string): Pairing {
  const pool = PAIRINGS.filter((p) => p.coverId !== curCoverId || p.bgId !== curBgId)
  const from = pool.length ? pool : PAIRINGS
  return from[Math.floor(Math.random() * from.length)]
}

// phone peel-sticker pool (re-rolled by surprise)
const MOBILE_STICKER_POOL = [
  'sticker-cutie-bear.svg', 'sticker-cutie-chick.svg', 'sticker-cutie-pig.svg', 'sticker-cutie-snail.svg',
  'sticker-cutie-cat-meow.svg', 'sticker-cutie-cat-wiggle.svg', 'sticker-cutie-sleepy-bunny.svg',
  'sticker-cutie-sleepy-kitty.svg', 'sticker-cutie-rainbow-cloud.svg', 'sticker-cutie-unicorn-float.svg',
  'sticker-cutie-flower-smile.svg', 'sticker-cutie-gift.svg', 'sticker-cutie-rocket.svg', 'sticker-cutie-apple.svg',
  'sticker-cutie-cherry-mug.svg', 'sticker-cutie-poppies.svg', 'sticker-cutie-tulip-heart.svg',
  'sticker-cutie-gameboy.svg', 'sticker-cutie-sneaker.svg', 'sticker-plant-succulent.svg', 'sticker-plant-2.svg',
]

/** pick two distinct peel-stickers, avoiding the current pair */
function pickMobileStickers(prev?: [string, string]): [string, string] {
  const avoid = new Set(prev ?? [])
  const pool = MOBILE_STICKER_POOL.filter((s) => !avoid.has(s))
  const a = pool[Math.floor(Math.random() * pool.length)]
  const rest = MOBILE_STICKER_POOL.filter((s) => s !== a && !avoid.has(s))
  const b = (rest.length ? rest : MOBILE_STICKER_POOL.filter((s) => s !== a))[
    Math.floor(Math.random() * (rest.length ? rest.length : MOBILE_STICKER_POOL.length - 1))
  ]
  return [a, b]
}

/** "surprise me" pill, re-rolls the whole palette */
function ShufflePalette({ onShuffle }: { onShuffle: () => void }) {
  const reduce = useReducedMotion()
  const [spin, setSpin] = useState(0)
  return (
    <button
      type="button"
      className="df-picker-trigger df-shuffle"
      aria-label="Beni şaşırt, rastgele bir palet seç"
      title="Beni şaşırt"
      onClick={() => {
        onShuffle()
        setSpin((s) => s + 1)
      }}
    >
      <motion.span
        className="df-shuffle-icon"
        animate={reduce ? undefined : { rotate: spin * 360 }}
        transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0.32, duration: 0.6 }}
      >
        <LbSparkle />
      </motion.span>
      <span className="df-picker-label">sürpriz</span>
    </button>
  )
}

// mat-unroll intro: two black panels slide apart
function MatRollIntro() {
  // brief hold, then a weighty ease-out as the rollers travel off
  const roll = { type: 'spring', bounce: 0.07, duration: 0.72, delay: 0.1 } as const
  return (
    <div className="df-rollintro" aria-hidden="true">
      <motion.div className="df-roll df-roll-l" initial={{ x: 0 }} animate={{ x: '-100.5%' }} transition={roll}>
        <span className="df-roll-rod">
          <span className="df-roll-sheen" />
        </span>
      </motion.div>
      <motion.div className="df-roll df-roll-r" initial={{ x: 0 }} animate={{ x: '100.5%' }} transition={roll}>
        <span className="df-roll-rod">
          <span className="df-roll-sheen" />
        </span>
      </motion.div>
    </div>
  )
}

// book content packs
// ships as a portfolio; journal pack kept below (flip SHOW_JOURNAL)
const SHOW_JOURNAL = false

// brand glyphs for the contact page
const IconGitHub = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
)
const IconLinkedIn = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.114 20.452H3.558V9h3.556v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)
const IconMail = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
    <path d="M3.5 6.5 12 13l8.5-6.5" />
  </svg>
)

// portfolio pack (shown)
const PORTFOLIO_COVER = (
  <div className="df-cover">
    <span className="df-cover-band" aria-hidden="true" />
    <div className="df-cover-label">
      <span className="df-cover-mark" aria-hidden="true">
        <img className="df-cover-photo" src="/sg-cover.png" alt="" decoding="async" />
        <svg className="df-cover-cursor" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
        </svg>
      </span>
      <p className="df-cover-title">portfolyo</p>
      <span className="df-cover-sub">tasarım + kod</span>
      <span className="df-cover-lines" aria-hidden="true" />
    </div>
    <span className="df-cover-hint">açmak için dokun <span className="df-heart" aria-hidden="true">♡</span></span>
  </div>
)

// closing is the final page (p7), not a backCover

const PORTFOLIO_PAGES: React.ReactNode[] = [
  // spread 1 left: about
  <div className="df-page" key="p0" style={{ gap: '0.45rem' }}>
    <LbSparkle className="df-doodle" style={{ top: 2, right: 6, width: 16, height: 16 }} />
    {/* soft doodle cluster, lower-right */}
    <LbHeart className="df-doodle df-doodle--soft" style={{ bottom: 118, right: 26, width: 27, height: 27, transform: 'rotate(-12deg)' }} />
    <LbSparkle className="df-doodle df-doodle--soft df-doodle--lilac" style={{ bottom: 165, right: 74, width: 14, height: 14 }} />
    <h3 className="df-hello">hakkımda <span className="df-heart" aria-hidden="true">♡</span></h3>
    <div className="df-about-head">
      <span className="df-avatar"><img src="/sg-profile.png" alt="Shamama Guliyeva" loading="lazy" decoding="async" /></span>
      <div>
        <Editable className="df-name" placeholder="adın" initial="Shamama Guliyeva" />
        <span className="df-role"><LbSparkle /> yazılım geliştirici &amp; dijital tasarımcı</span>
      </div>
    </div>
    <div className="df-card">
      <Editable
        className="df-edit--body df-edit--tight"
        placeholder="kendinden kısaca bahset…"
        initial="Yazılım geliştirme, web teknolojileri ve dijital tasarımın yanı sıra çok dilli içerik yönetimi ve çeviri konusunda da deneyimliyim. React, TypeScript, Python ve C# ile proje geliştiriyorum, Figma, Canva ve Photoshop gibi uygulamaları kullanarak tasarım yapıyorum. Bunlara ek olarak video editleme ile de ilgileniyorum ve kendimi geliştirmeye çalışıyorum."
      />
    </div>
    <p className="df-label df-label--push">şu anda…</p>
    <span className="df-date"><LbHeart /> yüksek lisans öğrencisiyim, staj &amp; iş birliklerine açığım</span>
    <a className="df-cv-btn" href="/Shamama_Guliyeva_CV.pdf" download="Shamama_Guliyeva_CV.pdf">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M4 19h16" /></svg>
      CV&apos;yi indir
    </a>
  </div>,
  // spread 1 right: skills
  <div className="df-page" key="p1">
    <LbCloud className="df-doodle df-doodle--lilac" style={{ top: 0, right: 4, width: 26, height: 26 }} />
    {/* soft doodles, lower half */}
    <LbHeart className="df-doodle df-doodle--soft" style={{ bottom: 96, right: 34, width: 26, height: 26, transform: 'rotate(10deg)' }} />
    <LbSparkle className="df-doodle df-doodle--soft df-doodle--lilac" style={{ bottom: 150, left: 14, width: 18, height: 18 }} />
    <LbCloud className="df-doodle df-doodle--soft df-doodle--mint" style={{ bottom: 60, left: 30, width: 24, height: 24 }} />
    <h3 className="df-hello df-hello--lilac">yetenekler</h3>
    <div className="df-card df-card--lilac">
      <p className="df-card-title"><LbSparkle /> kullandığım teknolojiler</p>
      <ul className="df-tags">
        <li className="df-tag"><img className="df-tag-icon" src="/stickers/items/sticker-dev-python.svg" alt="" /> Python</li>
        <li className="df-tag"><img className="df-tag-icon" src="/stickers/items/sticker-dev-javascript.svg" alt="" /> JavaScript</li>
        <li className="df-tag"><img className="df-tag-icon" src="/stickers/items/sticker-dev-typescript.svg" alt="" /> TypeScript</li>
        <li className="df-tag"><img className="df-tag-icon" src="/stickers/items/sticker-dev-csharp.svg" alt="" /> C#</li>
        <li className="df-tag"><img className="df-tag-icon" src="/stickers/items/sticker-dev-sql.svg" alt="" /> SQL</li>
        <li className="df-tag"><img className="df-tag-icon" src="/stickers/items/sticker-dev-docker.svg" alt="" /> Docker</li>
        <li className="df-tag"><img className="df-tag-icon" src="/stickers/items/sticker-dev-azure.svg" alt="" /> Azure</li>
        <li className="df-tag"><img className="df-tag-icon" src="/stickers/items/sticker-dev-git.svg" alt="" /> Git</li>
      </ul>
    </div>
    <div className="df-card">
      <p className="df-card-title"><LbHeart /> kullandığım programlar</p>
      <ul className="df-tags df-tags--blush">
        <li className="df-tag"><img className="df-tag-icon" src="/stickers/items/sticker-dev-figma.png" alt="" /> Figma</li>
        <li className="df-tag"><img className="df-tag-icon" src="/stickers/items/sticker-dev-canva.svg" alt="" /> Canva</li>
        <li className="df-tag"><img className="df-tag-icon" src="/stickers/items/sticker-dev-photoshop.svg" alt="" /> Photoshop</li>
      </ul>
      <p className="df-card-title" style={{ marginTop: 12 }}><LbHeart /> önem verdiklerim</p>
      <ul className="df-tags df-tags--blush">
        <li className="df-tag">📱 UI/UX tasarım</li>
        <li className="df-tag">🌍 lokalizasyon</li>
        <li className="df-tag">🏷️ marka kimliği</li>
      </ul>
    </div>
  </div>,
  // spread 2 left: selected work
  <div className="df-page" key="p2">
    <h3 className="df-hello">seçili işler</h3>
    <p className="df-sig df-link-hint">
      <svg viewBox="0 0 60 40" width="30" height="20" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 6C18 20 34 26 54 20" /><path d="M46 14L56 20L44 26" /></svg>
      isme tıklayarak siteye gidebilirsin
    </p>
    <div className="df-proj">
      <p className="df-proj-head"><DfProjName href="https://canzies.netlify.app/" variant={0}>Canzies</DfProjName><span className="df-proj-meta">Can Kesiktaş</span></p>
      <Editable className="df-edit--body df-proj-desc" placeholder="açıklama ekle…" initial="Can Kesiktaş için HTML, CSS ve JavaScript kullanarak sıfırdan geliştirdiğim bir site. Şarkı isteği, bir mini oyun ve mektup gönderme bölümü var; Spotify entegrasyonu ve özel bir renk paleti ekledim, Netlify üzerinden yayınlayıp güncel tutuyorum." />
    </div>
    <div className="df-proj">
      <p className="df-proj-head"><DfProjName href="https://puskullubela.netlify.app/" variant={3}>Püsküllü Bela</DfProjName><span className="df-proj-meta">Ahmet Emre Doğaner</span></p>
      <Editable className="df-edit--body df-proj-desc" placeholder="açıklama ekle…" initial="Ahmet Emre Doğaner için geliştirdiğim bir site. Burada da şarkı isteği, bir oyun ve mektup gönderme bölümleri bulunuyor; kendi renk paleti ve görsel kimliğiyle sıfırdan kodladım." />
    </div>
  </div>,
  // spread 2 right: more work
  <div className="df-page" key="p3">
    <LbSparkle className="df-doodle df-doodle--butter" style={{ bottom: 16, right: 12, width: 22, height: 22 }} />
    <h3 className="df-hello df-hello--lilac">diğer işler</h3>
    <div className="df-proj">
      <p className="df-proj-head"><DfProjName href="https://rradikal.netlify.app/" variant={2}>Radikal</DfProjName><span className="df-proj-meta">hayran sitesi</span></p>
      <Editable className="df-edit--body df-proj-desc" placeholder="açıklama ekle…" initial="Serideki başka bir site, kendi renk paleti ve görsel kimliğiyle. Yine sıfırdan HTML, CSS ve JavaScript kullanarak geliştirdim." />
    </div>
    <div className="df-proj">
      <p className="df-proj-head"><DfProjName variant={1}>HelloJob</DfProjName><span className="df-proj-meta">iş platformu</span></p>
      <Editable className="df-edit--body df-proj-desc" placeholder="açıklama ekle…" initial="İş arayanların ilan bulup başvurabildiği, şirketlerin de ilan yönetebildiği bir platform geliştirdim; filtreleme, başvuru takibi ve kullanıcı arayüzü içeriyor. CodeAcademy bitirme projem olarak üstün başarıyla tamamladım." />
    </div>
    <p className="df-sig">…ve rafta daha fazlası <span className="df-heart" aria-hidden="true">♡</span></p>
  </div>,
  // spread 2.5 left: design & product
  <div className="df-page" key="p2d">
    <LbSparkle className="df-doodle" style={{ top: 2, right: 6, width: 16, height: 16 }} />
    <h3 className="df-hello">tasarım &amp; ürün</h3>
    <div className="df-proj">
      <p className="df-proj-head"><DfProjName variant={0}>Permapoly &amp; UNO</DfProjName><span className="df-proj-meta">oyun tasarımı</span></p>
      <Editable className="df-edit--body df-proj-desc" placeholder="açıklama ekle…" initial="Bir masaüstü oyunu ve kart oyunu için tasarladığım görsel kimlik paketi. Monopoly'nin Perma için uyarlanmış hali ve özel bir UNO destesi için kutu tasarımı ve baskıya hazır kartlar hazırladım." />
      <ul className="df-links" style={{ marginTop: 10 }}>
        <li><a className="df-link" href="https://www.figma.com/design/rUYNzdQj147Spw3np55k3L/Permapoly-Kit-?m=auto&t=4IaNgm0cu7eVaLI7-1" target="_blank" rel="noreferrer">Permapoly</a></li>
        <li><a className="df-link" href="https://canva.link/16y4uo5tl30g3pp" target="_blank" rel="noreferrer">UNO kartları</a></li>
        <li><a className="df-link" href="https://canva.link/9fbusvatmwbaiq7" target="_blank" rel="noreferrer">UNO kutusu</a></li>
      </ul>
    </div>
    <div className="df-proj">
      <p className="df-proj-head"><DfProjName href="https://canva.link/1vwt6oz1v6nrh00" variant={2}>T-shirt tasarımı</DfProjName><span className="df-proj-meta">ürün tasarımı</span></p>
      <Editable className="df-edit--body df-proj-desc" placeholder="açıklama ekle…" initial="Canva'da tasarladığım, baskıya hazır bir t-shirt tasarımı." />
    </div>
  </div>,
  // spread 2.5 right: education
  <div className="df-page" key="p2e">
    <LbCloud className="df-doodle df-doodle--lilac" style={{ top: 0, right: 4, width: 24, height: 24 }} />
    <h3 className="df-hello df-hello--lilac">eğitim</h3>
    <ul className="df-xp">
      <li className="df-xp-row">
        <span className="df-xp-dot" aria-hidden="true" />
        <div>
          <p className="df-xp-role">Bilgisayar Bilimi Yüksek Lisansı (M.Sc.)</p>
          <p className="df-xp-meta">Rostock Üniversitesi, Almanya · 04/2026 - devam ediyor</p>
        </div>
      </li>
      <li className="df-xp-row">
        <span className="df-xp-dot" aria-hidden="true" />
        <div>
          <p className="df-xp-role">Bilgisayar Mühendisliği Lisansı (B.Sc.)</p>
          <p className="df-xp-meta">Azerbaycan Teknik Üniversitesi · 09/2021 - 07/2025 · Not Ortalaması 92/100</p>
        </div>
      </li>
    </ul>
    <p className="df-label df-label--push">başarı…</p>
    <span className="df-date"><LbHeart /> #CodeForFuture, Code Academy: 6 aylık kursu üstün başarıyla tamamladım, bitirme projemde yüksek onur diploması aldım</span>
  </div>,
  // spread 3 left: experience timeline
  <div className="df-page" key="p4">
    <h3 className="df-hello">deneyim</h3>
    <ul className="df-xp">
      <li className="df-xp-row">
        <span className="df-xp-dot" aria-hidden="true" />
        <div>
          <p className="df-xp-role">Web İçerik Yöneticisi</p>
          <p className="df-xp-meta">Retinalab LLC · 05/2025 - 09/2025</p>
        </div>
      </li>
      <li className="df-xp-row">
        <span className="df-xp-dot" aria-hidden="true" />
        <div>
          <p className="df-xp-role">Sanal Katılım Teknisyeni</p>
          <p className="df-xp-meta">Kronos · COP29 · 10/2024 - 11/2024</p>
        </div>
      </li>
      <li className="df-xp-row">
        <span className="df-xp-dot" aria-hidden="true" />
        <div>
          <p className="df-xp-role">Web İçerik Yöneticisi</p>
          <p className="df-xp-meta">Angel CR Inc. (seemorg.com) · 06/2023 - 09/2023</p>
        </div>
      </li>
    </ul>
  </div>,
  // spread 3 right: contact
  <div className="df-page" key="p5">
    <LbHeart className="df-doodle" style={{ top: 2, right: 6, width: 16, height: 16 }} />
    <h3 className="df-hello df-hello--lilac">merhaba de <span className="df-heart" aria-hidden="true">♡</span></h3>
    <Editable
      className="df-edit--body"
      placeholder="sıcak bir not…"
      initial="Bir projen, bir sorun mu var, ya da sadece sohbet mi etmek istiyorsun? Senden haber almayı çok isterim."
    />
    <ul className="df-links">
      <li>
        <a className="df-link" href="https://github.com/shamamaaa" target="_blank" rel="noreferrer"><IconGitHub /> GitHub</a>
      </li>
      <li>
        <a className="df-link" href="https://linkedin.com/in/shamama-guliyeva-92467b333" target="_blank" rel="noreferrer"><IconLinkedIn /> LinkedIn</a>
      </li>
      <li>
        <a className="df-link" href="mailto:shamamaguliyeva04@gmail.com"><IconMail /> E-posta</a>
      </li>
    </ul>
    <p className="df-sig">her zaman yazabilirsin <span className="df-heart" aria-hidden="true">♡</span></p>
  </div>,
  // closing finale
  <div className="df-page df-thanks" key="p7">
    <LbSparkle className="df-thanks-spark" />
    <p className="df-thanks-title">okuduğun için teşekkürler <span className="df-heart" aria-hidden="true">♡</span></p>
    <span className="df-thanks-sub">hadi bir şeyler yapalım</span>
  </div>,
]

// journal pack (preserved, hidden)
const JOURNAL_COVER = (
  <div className="df-cover">
    <span className="df-cover-band" aria-hidden="true" />
    <div className="df-cover-label">
      <LbHeart className="df-cover-heart" />
      <p className="df-cover-title">my journal</p>
      <span className="df-cover-sub">est. today</span>
      <span className="df-cover-lines" aria-hidden="true" />
    </div>
    <span className="df-cover-hint">tap to open <span className="df-heart" aria-hidden="true">♡</span></span>
  </div>
)

const JOURNAL_BACK_COVER = (
  <div className="df-end">
    <LbSparkle className="df-cover-doodle" style={{ width: 24, height: 24 }} />
    <p className="df-end-title">the end <span className="df-heart" aria-hidden="true">♡</span></p>
    <span className="df-end-sub">see you tomorrow</span>
  </div>
)

const JOURNAL_PAGES: React.ReactNode[] = [
  // spread 1 left: entry + mood
  <div className="df-page" key="p0">
    <LbSparkle className="df-doodle" style={{ top: 2, right: 6, width: 16, height: 16 }} />
    <h3 className="df-hello">hello <span className="df-heart" aria-hidden="true">♡</span></h3>
    <span className="df-date"><LbCal /> Tuesday, June 4</span>
    <div className="df-card">
      <p className="df-card-title"><LbHeart /> dear diary</p>
      <Editable
        className="df-edit--body"
        placeholder="write your day…"
        initial="Woke up before my alarm and didn't even mind. Walked to the café in the drizzle for the oat latte, then watched the rain start and stop twice. A small day. A good one."
      />
    </div>
    <p className="df-label">today i feel…</p>
    <MoodFaces />
  </div>,
  // spread 1 right: grateful list
  <div className="df-page" key="p1">
    <LbCloud className="df-doodle df-doodle--lilac" style={{ top: 0, right: 4, width: 26, height: 26 }} />
    <h3 className="df-hello df-hello--lilac">grateful for</h3>
    <div className="df-card df-card--lilac">
      <ul className="df-checklist">
        <CheckItem placeholder="…" initial="rain sounds on the window" />
        <CheckItem placeholder="…" initial="matching socks, finally" />
        <CheckItem placeholder="…" initial="grandma's voice on the phone" />
      </ul>
    </div>
    <p className="df-sig">little things, mostly <span className="df-heart" aria-hidden="true">♡</span></p>
  </div>,
  // spread 2 left: a captured moment
  <div className="df-page" key="p2">
    <h3 className="df-hello">a moment</h3>
    <div className="df-photo">
      <img className="df-photo-img" src="/stickers/journal-polaroid-memory.svg" alt="A dreamy pastel memory from today" loading="lazy" decoding="async" />
      <p className="df-photo-cap">a little pastel pause ~</p>
    </div>
    <Editable
      className="df-edit--quote"
      placeholder="remember it…"
      initial="I saved this because it felt like the day was being soft on purpose. Everything looked minty and warm for a second, like a tiny scene I could fold up and keep between these pages."
    />
  </div>,
  // spread 2 right: tomorrow's checklist
  <div className="df-page" key="p3">
    <h3 className="df-hello df-hello--lilac">tomorrow</h3>
    <div className="df-card df-card--lilac">
      <p className="df-card-title"><LbBell /> to do</p>
      <ul className="df-checklist">
        <CheckItem placeholder="add a task…" initial="water the poor basil" />
        <CheckItem placeholder="add a task…" initial="text maya back!!" />
        <CheckItem placeholder="add a task…" initial="finish the blue sweater" />
        <CheckItem placeholder="add a task…" />
      </ul>
    </div>
  </div>,
  // spread 3 left: this week's highlights
  <div className="df-page" key="p4">
    <LbSparkle className="df-doodle df-doodle--butter" style={{ bottom: 16, right: 12, width: 22, height: 22 }} />
    <h3 className="df-hello">this week</h3>
    <div className="df-card">
      <p className="df-card-title"><LbSparkle /> highlights</p>
      <ul className="df-checklist">
        <CheckItem placeholder="…" initial="morning walk, no phone" />
        <CheckItem placeholder="…" initial="finished the book i kept restarting" />
        <CheckItem placeholder="…" initial="pancakes that didn't burn" />
      </ul>
    </div>
  </div>,
  // spread 3 right: a line you liked
  <div className="df-page" key="p5">
    <h3 className="df-hello df-hello--lilac">a line i liked</h3>
    <Editable
      className="df-edit--quote"
      placeholder="paste a favourite line…"
      initial="“Almost everything will work again if you unplug it for a few minutes — including you.”"
    />
    <p className="df-sig">anne lamott</p>
  </div>,
]

/** classic click-wheel iPod, pure CSS */
function MiniPod() {
  return (
    <div className="ipod">
      <div className="screen">
        <div className="battery" />
        <ul className="menu">
          <li className="s">Music</li>
          <li className="s">Extras</li>
          <li className="s">Settings</li>
          <li className="active">Shuffle Songs</li>
          <li>Backlight</li>
        </ul>
      </div>
      <div className="clickwheel">
        <button type="button" tabIndex={-1} className="clickwheel-button menu-button">Menu</button>
        <button type="button" tabIndex={-1} className="clickwheel-button rw">≪</button>
        <button type="button" tabIndex={-1} className="clickwheel-button ff">≫</button>
        <button type="button" tabIndex={-1} className="clickwheel-button pp"><span>▶</span>❚❚</button>
      </div>
    </div>
  )
}

// shared spring for the staged reveal
const STAGE_SPRING = { type: 'spring', bounce: 0.22, duration: 0.55 } as const

/** self-contained DeskFolio demo */
export function DeskFolioPage() {
  // size the spread to the column
  const [viewport, setViewport] = useState(() => ({
    w: typeof window === 'undefined' ? 1200 : window.innerWidth,
    h: typeof window === 'undefined' ? 900 : window.innerHeight,
  }))
  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const next = { w: window.innerWidth, h: window.innerHeight }
      setViewport((prev) => (prev.w === next.w && prev.h === next.h ? prev : next))
    }
    const on = () => {
      if (frame) return
      frame = window.requestAnimationFrame(measure)
    }
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('resize', on)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  // staged intro reveal: mat, book, stickers, controls
  // intro gates content stages (1=book, 2=stickers, 3=controls); matDown drops the roll overlay
  const reduce = useReducedMotion()
  const [intro, setIntro] = useState(reduce ? 3 : 0)
  const [matDown, setMatDown] = useState(reduce)
  useEffect(() => {
    if (reduce) {
      setIntro(3)
      setMatDown(true)
      return
    }
    const timers = [
      window.setTimeout(() => setIntro(1), 700), // 1: book blooms
      window.setTimeout(() => setMatDown(true), 880), // unmount the roll overlay
      window.setTimeout(() => setIntro(2), 980), // 2: stickers drop in
      window.setTimeout(() => setIntro(3), 1240), // 3: controls bloom in
    ]
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [reduce])


  // phones: full-screen one-page reader, driven by media query
  const [compact, setCompact] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)')
    const on = () => setCompact(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  // a touch smaller than the mat
  const spread = Math.min(800, Math.round(viewport.w * 0.82))
  const pageW = Math.max(150, Math.round(spread / 2))
  const pageH = Math.round(pageW * 1.34)
  const stageScale = Math.min(1, viewport.h / (pageH + 376))

  // phones render the same desktop DeskFolio, scaled to fit, one page at a time
  const M_PAGE_W = 380 // desktop default page size
  const M_PAGE_H = 509
  // focused right page width: 80% of screen, capped by height
  const mRightW = Math.min(viewport.w * 0.8, (viewport.h * 0.5) / 1.34)
  const mScale = mRightW / M_PAGE_W
  const mobile = { pageW: M_PAGE_W, pageH: M_PAGE_H, scale: mScale, w: Math.round(mRightW), h: Math.round(mRightW * 1.34) }

  // fixed defaults as requested: milk-mint cover on pinkscene background
  const [coverId] = useState('milk-mint')
  const coverTheme = COVER_THEMES.find((t) => t.id === coverId) ?? COVER_THEMES[0]
  const [bgId] = useState('pinkscene')
  const bgTheme = BACKGROUND_THEMES.find((t) => t.id === bgId) ?? BACKGROUND_THEMES[0]
  // pre-warm reveal images during the mat-roll window
  useEffect(() => {
    const initialBg = BACKGROUND_THEMES.find((t) => t.id === bgId)
    const bgUrl = /url\(['"]?([^'")]+)/.exec(String(initialBg?.style.backgroundImage ?? ''))?.[1]
    const srcs = bgUrl ? [...DESKFOLIO_WARM_SRCS, bgUrl] : DESKFOLIO_WARM_SRCS
    const imgs = srcs.map(warmImage)
    return () => imgs.forEach((img) => { img.src = '' })
  }, [bgId])
  // after the first reveal, warm assets on idle
  useEffect(() => {
    let cancelled = false
    let imgs: HTMLImageElement[] = []
    const ric = typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback : null
    const idleIds: number[] = []
    const timeoutIds: number[] = []

    const schedule = (cb: IdleRequestCallback, timeout = 2500) => {
      if (ric) {
        idleIds.push(ric(cb, { timeout }) as number)
        return
      }
      timeoutIds.push(
        window.setTimeout(() => cb({ didTimeout: true, timeRemaining: () => 0 } as IdleDeadline), 80),
      )
    }

    const warmChunked = (srcs: string[], done?: () => void) => {
      let index = 0
      const step: IdleRequestCallback = (deadline) => {
        if (cancelled) return
        let count = 0
        while (index < srcs.length && (count < 4 || deadline.timeRemaining() > 8)) {
          imgs.push(warmImage(srcs[index++]))
          count += 1
        }
        if (index < srcs.length) schedule(step, 3000)
        else done?.()
      }
      schedule(step)
    }

    const start = () => {
      warmChunked(DESKFOLIO_THEME_WARM_SRCS, () => {
        warmChunked(DESKFOLIO_LIBRARY_WARM_SRCS)
      })
    }

    if (ric) idleIds.push(ric(start, { timeout: 2500 }) as number)
    else timeoutIds.push(window.setTimeout(start, 1600))

    return () => {
      cancelled = true
      if (ric && typeof window.cancelIdleCallback === 'function') idleIds.forEach((id) => window.cancelIdleCallback(id))
      timeoutIds.forEach((id) => window.clearTimeout(id))
      imgs.forEach((img) => { img.src = '' })
    }
  }, [])
  const [stickerSet] = useState('workspace')
  // the two phone peel-stickers
  const [mStickers] = useState<[string, string]>(() => pickMobileStickers())
  // lamp starts off
  const [lampOn, setLampOn] = useState(false)
  useEffect(() => {
    setLampOn(false)
  }, [stickerSet])
  // shared mat-object edit state
  const [matOverrides, setMatOverrides] = useState<Record<string, MatOverride>>({
    'desk-lamp': { scale: LAMP_DEFAULT_SCALE, rotate: LAMP_DEFAULT_ROTATE },
  })
  const [activeMatKey, setActiveMatKey] = useState<string | null>(null)
  // user-added stickers
  const [added] = useState<Array<{ key: string; src: string }>>([])
  const [devActivityLink, setDevActivityLink] = useState(() => {
    try {
      return window.localStorage.getItem(DEV_ACTIVITY_LINK_STORAGE_KEY) || DEFAULT_DEV_ACTIVITY_LINK
    } catch {
      return DEFAULT_DEV_ACTIVITY_LINK
    }
  })
  useEffect(() => {
    const nextLink = matOverrides['dev-activity']?.href
    if (!nextLink || nextLink === devActivityLink) return
    setDevActivityLink(nextLink)
    try {
      window.localStorage.setItem(DEV_ACTIVITY_LINK_STORAGE_KEY, nextLink)
    } catch {
      /* localStorage unavailable; in-memory edit still works */
    }
  }, [devActivityLink, matOverrides])
  const matEdit = useMemo<MatEditApi>(() => {
    const set = STICKER_SETS.find((s) => s.id === stickerSet)
    const tableSrcs = new Set<string>()
    set?.items.forEach((it, i) => {
      if (it.lamp) return
      const ov = matOverrides[`${set.id}-${i}-${it.src}`]
      if (ov?.deleted) return
      tableSrcs.add(ov?.src ?? it.src)
    })
    return {
      activeKey: activeMatKey,
      setActiveKey: (key) => setActiveMatKey(key),
      overrides: matOverrides,
      patch: (key, partial) => setMatOverrides((prev) => ({ ...prev, [key]: { ...prev[key], ...partial } })),
      remove: (key) => setMatOverrides((prev) => ({ ...prev, [key]: { ...prev[key], deleted: true } })),
      tableSrcs,
    }
  }, [activeMatKey, matOverrides, stickerSet])
  useEffect(() => {
    if (!activeMatKey) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMatKey(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeMatKey])
  const polaroidOverride = matOverrides['stationery-polaroid']
  const devActivityOverride = matOverrides['dev-activity']
  const lampOverride = matOverrides['desk-lamp']

  // book content
  const cover = SHOW_JOURNAL ? JOURNAL_COVER : PORTFOLIO_COVER
  const backCover = SHOW_JOURNAL ? JOURNAL_BACK_COVER : undefined
  const pages = SHOW_JOURNAL ? JOURNAL_PAGES : PORTFOLIO_PAGES
  // phone book: a blank verso before every content page
  const mobilePages = useMemo(() => {
    const out: React.ReactNode[] = []
    for (const p of pages) {
      out.push(null) // blank left page (verso)
      out.push(p) // focused right page
    }
    return out
  }, [pages])

  return (
    <>
      <section className="deskfolio-live">
        <div
          className="demo-stage deskfolio-demo-stage"
          style={
            {
              '--df-picker-w': `${pageW}px`,
              '--df-stage-scale': stageScale,
              ...bgTheme.style,
            } as React.CSSProperties
          }
        >
          <MatEditContext.Provider value={matEdit}>
          {/* tap-to-close backdrop */}
          {activeMatKey && (
            <div
              className="df-matmenu-backdrop"
              aria-hidden="true"
              onPointerDown={() => setActiveMatKey(null)}
            />
          )}
          {!matDown && <MatRollIntro />}
          {/* mounted once the mat is down; desktop only */}
          {intro >= 2 && !compact && <MatStickers setId={stickerSet} compact={compact} />}
          {/* user-added stickers */}
          {intro >= 2 && !compact && added.length > 0 && <AddedStickers added={added} />}
          {/* phones: a few decorative peel-stickers */}
          {intro >= 2 && compact && (
            <>
              <div className="df-mstickers" aria-hidden="true">
                <img className="m3" src={ITM + mStickers[0]} alt="" decoding="async" />
                <img className="m4" src={ITM + mStickers[1]} alt="" decoding="async" />
              </div>
              {/* iPod peeking from the corner */}
              <div className="df-mipod" aria-hidden="true">
                <MiniPod />
              </div>
            </>
          )}
          {/* Polaroid on the Stationery desk, a placed object */}
          <AnimatePresence>
            {!compact && stickerSet === 'stationery' && intro >= 2 && !polaroidOverride?.deleted && (
              <DraggableMatObject
                key="polaroid"
                objectKey="stationery-polaroid"
                editable
                kind="polaroid"
                className="df-sticker-dragger df-polaroid-dragger"
                style={
                  {
                    left: '17%',
                    top: '79.5%',
                    // Resize maps to --df-pol-scale, Tilt to --df-pol-rotate
                    ...((polaroidOverride?.scale ?? 1) !== 1
                      ? { '--df-pol-scale': 0.26 * (polaroidOverride?.scale ?? 1) }
                      : {}),
                    ...((polaroidOverride?.rotate ?? 0) !== 0
                      ? { '--df-pol-rotate': `${-7 + (polaroidOverride?.rotate ?? 0)}deg` }
                      : {}),
                  } as React.CSSProperties
                }
              >
                <motion.div
                  className="df-polaroid-mat"
                  initial={reduce ? false : { opacity: 0, y: -26 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16, transition: { duration: 0.18, ease: 'easeIn' } }}
                  transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0.4, duration: 0.6, delay: 0.14 }}
                >
                  <div className="df-polaroid-scale">
                    <PolaroidCamera />
                  </div>
                </motion.div>
              </DraggableMatObject>
            )}
          </AnimatePresence>
          {/* dev-activity monitor, draggable; tap opens GitHub */}
          {!compact && intro >= 2 && !devActivityOverride?.deleted && (
            <DraggableMatObject
              objectKey="dev-activity"
              editable
              kind="device"
              className="df-sticker-dragger df-monitor-dragger"
              title="Open GitHub · hold to move"
              style={
                {
                  // Workspace tucks it lower-left; other sets lower-right
                  left: stickerSet === 'workspace' ? '2%' : '66.5%',
                  top: stickerSet === 'workspace' ? '73%' : '80%',
                  '--df-monitor-scale': devActivityOverride?.scale ?? (stickerSet === 'workspace' ? 0.95 : 1),
                  '--df-monitor-rotate': `${(stickerSet === 'workspace' ? -13 : -6) + (devActivityOverride?.rotate ?? 0)}deg`,
                } as React.CSSProperties
              }
            >
              <motion.div
                className="df-monitor-mat"
                initial={reduce ? false : { opacity: 0, y: -22 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0.4, duration: 0.6, delay: 0.2 }}
              >
                <DevMonitor href={devActivityLink} />
              </motion.div>
            </DraggableMatObject>
          )}
          <motion.div
            className={compact ? 'df-book-bloom df-book-bloom--mobile' : 'df-book-bloom'}
            initial={false}
            animate={
              reduce
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: intro >= 1 ? 1 : 0, y: intro >= 1 ? 0 : 12, scale: intro >= 1 ? 1 : 0.94 }
            }
            transition={reduce ? { duration: 0 } : STAGE_SPRING}
          >
            {compact ? (
              // phones: framed so only the right page shows
              <div className="df-mobile-scaler" style={{ width: mobile.w, height: mobile.h }}>
                <div className="df-mobile-scaler-inner" style={{ transform: `scale(${mobile.scale})`, left: -mobile.w }}>
                  <DeskFolio
                    cover={cover}
                    pages={mobilePages}
                    closeOnEnd={!SHOW_JOURNAL}
                    closedShift="0%"
                    pageWidth={mobile.pageW}
                    pageHeight={mobile.pageH}
                    style={coverVars(coverTheme)}
                  />
                </div>
              </div>
            ) : (
              <DeskFolio
                cover={cover}
                pages={pages}
                backCover={backCover}
                closeOnEnd={!SHOW_JOURNAL}
                pageWidth={pageW}
                pageHeight={pageH}
                style={coverVars(coverTheme)}
              />
            )}
          </motion.div>
          {/* lamp + beam render above the book */}
          <AnimatePresence>
            {!compact && stickerSet === 'workspace' && LAMP_ITEM && !lampOverride?.deleted && (
              <DraggableMatObject
                key="desk-lamp"
                objectKey="desk-lamp"
                editable
                kind="object"
                className="df-sticker-dragger df-lamp-dragger"
                title="Hold to edit lamp"
                style={{ width: scaleCssClamp(LAMP_ITEM.width, lampOverride?.scale ?? 1), ...LAMP_ITEM.pos }}
              >
                <DeskLamp
                  item={{ ...LAMP_ITEM, rotate: LAMP_ITEM.rotate + (lampOverride?.rotate ?? 0) }}
                  index={0}
                  on={lampOn}
                  onToggle={() => setLampOn((v) => !v)}
                  placed
                />
              </DraggableMatObject>
            )}
          </AnimatePresence>
          {/* "tap to light it" hint, Workspace + lamp off */}
          {!compact && (
            <AnimatePresence>
              {stickerSet === 'workspace' && LAMP_ITEM && !lampOverride?.deleted && !lampOn && intro >= 2 && (
                <motion.div
                  className="df-lamp-hint"
                  aria-hidden="true"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, transition: { duration: 0.22, ease: 'easeIn' } }}
                  transition={reduce ? { duration: 0 } : { duration: 0.55, delay: 0.5 }}
                >
                  <span className="df-lamp-hint-text">yakmak için<br />dokun!</span>
                  <svg className="df-lamp-hint-arrow" viewBox="0 0 96 56" aria-hidden="true">
                    <path d="M7 8C22 29 47 39 78 34" />
                    <path d="M69 24L80 34L66 42" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          {/* highlighter is desktop-only */}
          {!compact && (
            <motion.div
              className="df-tray-bloom"
              initial={false}
              animate={
                reduce
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: intro >= 3 ? 1 : 0, y: intro >= 3 ? 0 : 18, scale: intro >= 3 ? 1 : 0.9 }
              }
              transition={reduce ? { duration: 0 } : { ...STAGE_SPRING, delay: intro >= 3 ? 0.12 : 0 }}
            >
              <HighlighterTray panelWidth={Math.min(360, pageW)} />
            </motion.div>
          )}
          </MatEditContext.Provider>
        </div>
      </section>

      {compact ? (
        <p className="tagline">
          Bu bileşen en iyi masaüstünde deneyimlenir. Masaüstü önizlemesi tüm etkileşimleri, özelleştirmeleri ve efektleri açar.
        </p>
      ) : SHOW_JOURNAL ? (
        <p className="tagline">
          A little book you actually open and write in. Tap the cover and it blooms open, then turn the pages by grabbing a corner and dragging it over. It follows your hand and springs to settle. Every page is yours to write on. No buttons, no images, no engine.
        </p>
      ) : (
        <div className="tagline deskfolio-writeup">
          <div className="df-writeup-intro">
            <h1 className="df-writeup-name">Shamama Guliyeva</h1>
            <p className="df-writeup-tagline">Kitap gibi açılan, cep boyutu bir portföy.</p>
            <p className="df-writeup-copy">
              Sürüklenebilir masa eşyaları ve düzenlenebilir çıkartmalarla süslediğim, sevimli bir vitrin. Açık kaynak DeskFolio şablonunu (mortspace) temel alarak kendi portföyüme dönüştürdüm.
            </p>
            <p className="df-writeup-copy df-writeup-aside">
              Orijinal şablona ve emeğe teşekkürler, GitHub&apos;dan inceleyebilirsin.
            </p>
          </div>
          <div className="df-writeup-pills" aria-label="Deskfolio notları">
            <span className="df-writeup-pill df-writeup-pill--orange">Uzun basışla düzenleme</span>
            <span className="df-writeup-pill df-writeup-pill--green">Freepik + el yapımı görseller</span>
            <span className="df-writeup-pill df-writeup-pill--blue">React + motion.dev</span>
          </div>
          <div className="df-howto">
            <div className="df-howto-frame">
              <img
                className="df-howto-bear"
                src="/stickers/items/sticker-cutie-bear.svg"
                width={300}
                height={297}
                loading="lazy"
                decoding="async"
                alt="Masadaki bir ayı çıkartması, üzerinde uzun basışla açılan düzenleme menüsüyle"
              />
              <div className="df-howto-menu" aria-hidden="true">
                <span className="df-howto-menu-row"><LbResize className="df-howto-menu-ico" /> Boyutlandır</span>
                <span className="df-howto-menu-row"><LbReplace className="df-howto-menu-ico" /> Değiştir</span>
                <span className="df-howto-menu-row df-howto-menu-row--danger"><LbTrash className="df-howto-menu-ico" /> Sil</span>
              </div>
              {/* pointer cursor */}
              <svg className="df-howto-cursor" viewBox="0 0 64 64" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.78696 6.09422C6.7281 5.68898 5.68898 6.7281 6.09422 7.78696L24.9891 57.1574C25.394 58.2154 26.8598 58.2962 27.3786 57.2892L36.7699 39.0589C37.2761 38.0763 38.0763 37.2761 39.0589 36.7699L57.2892 27.3786C58.2962 26.8598 58.2154 25.394 57.1574 24.9891L7.78696 6.09422ZM2.35847 9.21669C0.716609 4.92667 4.92668 0.716611 9.21669 2.35847L58.5871 21.2533C62.8737 22.8939 63.2012 28.8325 59.121 30.9345L40.8908 40.3258C40.6482 40.4507 40.4507 40.6482 40.3258 40.8908L30.9345 59.121C28.8325 63.2012 22.8939 62.8737 21.2533 58.5871L2.35847 9.21669Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className="df-howto-text">
              <span className="df-howto-eyebrow">Nasıl kullanılır</span>
              <p>Herhangi bir çıkartmayı veya masa nesnesini basılı tut, bu küçük menü açılsın: <strong>Boyutlandır</strong> ile büyüt/küçült, <strong>Değiştir</strong> ile başka bir çıkartmayla değiştir, ya da <strong>Sil</strong> ile masadan kaldır.</p>
              <p>Herhangi bir şeyi sürükleyerek taşı, kendi eklemek için <strong>+</strong> düğmesine dokun.</p>
            </div>
          </div>
          <div className="df-reference-strip">
            <span className="df-reference-title">Kaynaklar</span>
            <div className="df-reference-pills">
              <a href="https://codepen.io/fossheim/pen/xxboBzO" target="_blank" rel="noreferrer">Polaroid</a>
              <a href="https://codepen.io/kreitlow/pen/mqgxYo" target="_blank" rel="noreferrer">iPod Shuffle</a>
              <a href="https://github.com/mortspace/Deskfolio" target="_blank" rel="noreferrer">DeskFolio şablonu</a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
