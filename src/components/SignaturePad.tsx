import { Toggle } from '@base-ui-components/react/toggle'
import { ToggleGroup } from '@base-ui-components/react/toggle-group'
import { useEffect, useId, useRef, useState } from 'react'
import { customer } from '../data/estimate'

interface Props {
  onChange: (signature: string | null) => void
}

type Mode = 'draw' | 'type'

/**
 * Draw-to-sign on a canvas, or switch to type-to-sign. Either way it reports a
 * non-empty signature string up to the gate. A "Clear" control resets it.
 */
export default function SignaturePad({ onChange }: Props) {
  const [mode, setMode] = useState<Mode>('draw')
  const [typed, setTyped] = useState('')
  const [hasDrawing, setHasDrawing] = useState(false)
  const inputId = useId()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)

  // Size the canvas backing store to its CSS box for crisp lines on HiDPI.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || mode !== 'draw') return
    const ratio = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * ratio
    canvas.height = rect.height * ratio
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(ratio, ratio)
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#1c1b19'
    }
  }, [mode])

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = true
    last.current = pos(e)
  }

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx || !last.current) return
    const p = pos(e)
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
    if (!hasDrawing) {
      setHasDrawing(true)
      onChange('drawn-signature')
    }
  }

  const end = () => {
    drawing.current = false
    last.current = null
  }

  const clearDrawing = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawing(false)
    onChange(null)
  }

  const switchMode = (next: Mode) => {
    if (next === mode) return
    // Clear whatever the previous mode captured so the gate reflects reality.
    if (mode === 'draw') clearDrawing()
    else {
      setTyped('')
      onChange(null)
    }
    setMode(next)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          Signature
          <span className="ml-1.5 font-normal text-ink-faint">— {customer.name}</span>
        </label>
        <ToggleGroup
          value={[mode]}
          onValueChange={(groupValue) => {
            const next = groupValue[groupValue.length - 1] as Mode | undefined
            if (next) switchMode(next)
          }}
          aria-label="Signature input method"
          className="inline-flex rounded-md border border-line-strong p-0.5 text-xs"
        >
          {(['draw', 'type'] as Mode[]).map((m) => (
            <Toggle
              key={m}
              value={m}
              className={(state) =>
                [
                  'cursor-pointer rounded-[5px] px-3 py-1.5 font-medium capitalize transition-colors outline-none',
                  'focus-visible:ring-2 focus-visible:ring-ink/30',
                  state.pressed ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink',
                ].join(' ')
              }
            >
              {m}
            </Toggle>
          ))}
        </ToggleGroup>
      </div>

      {mode === 'draw' ? (
        <div className="mt-2">
          {/* Only the canvas and its overlays share this positioning context,
              so the baseline guide and placeholder anchor to the canvas box —
              not to the caption/Clear row below it. */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              aria-label="Signature drawing area. Draw with your finger or mouse, or switch to Type to enter your name with a keyboard."
              onPointerDown={start}
              onPointerMove={move}
              onPointerUp={end}
              onPointerLeave={end}
              className="h-32 w-full touch-none rounded-md border border-line-strong bg-white"
            />
            {/* Signature baseline guide — sits under the ink, never blocks drawing. */}
            <div className="pointer-events-none absolute inset-x-4 bottom-6 flex items-center gap-2 text-ink-faint/70">
              <span className="text-sm leading-none">✕</span>
              <span className="h-px flex-1 bg-line" />
            </div>
            {!hasDrawing && (
              <span className="pointer-events-none absolute inset-x-0 top-5 text-center text-sm text-ink-faint">
                Sign here with your finger or mouse
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-xs text-ink-faint">Draw your signature above</span>
            <button
              type="button"
              onClick={clearDrawing}
              className="-mr-1 rounded px-2 py-1 text-xs font-medium text-ink-soft underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              Clear
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2">
          <input
            id={inputId}
            type="text"
            autoComplete="name"
            value={typed}
            onChange={(e) => {
              const v = e.target.value
              setTyped(v)
              onChange(v.trim() ? v.trim() : null)
            }}
            placeholder="Type your full name"
            className="w-full rounded-md border border-line-strong bg-white px-3.5 py-2 font-signature text-4xl leading-tight text-ink outline-none placeholder:font-sans placeholder:text-base placeholder:text-ink-faint focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/30"
          />
          <p className="mt-1.5 text-xs text-ink-faint">
            Typing your name counts as your legal signature.
          </p>
        </div>
      )}
    </div>
  )
}
