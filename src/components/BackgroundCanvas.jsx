import { useEffect, useRef } from 'react'

const RADIUS   = 160  // mouse influence radius in px (2× the 80px cursor ring)
const MAX_PUSH = 30   // max vertex displacement in px
const MAX_LIFT = 10   // max perpendicular line spread in px (creates "lifted" spacing)
const SPACING  = 16   // perpendicular distance between diagonal lines
const SEGMENT  = 10   // subdivision length within distortion zone

function lineColor() {
  return document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'rgba(255, 179, 0, 0.40)'
    : 'rgba(255, 179, 0, 0.60)'
}

export default function BackgroundCanvas() {
  const canvasRef = useRef(null)
  const mouseRef  = useRef({ x: -9999, y: -9999 })
  const lerpRef   = useRef({ x: -9999, y: -9999 })  // smoothed mouse for distortion
  const rafRef    = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // \ direction unit vector and its perpendicular
    const DX = 0.707107, DY = 0.707107    // line direction (top-left → bottom-right)
    const PX = -0.707107, PY = 0.707107   // perpendicular offset direction

    let W, H, diagonal, numLines, lineLength

    const resize = () => {
      W          = canvas.width  = window.innerWidth
      H          = canvas.height = window.innerHeight
      diagonal   = Math.sqrt(W * W + H * H)
      numLines   = Math.ceil(diagonal / SPACING) + 4
      lineLength = diagonal + 200
    }
    resize()

    const onMouseMove  = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    const onMouseLeave = ()  => { mouseRef.current = { x: -9999, y: -9999 } }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('resize', resize)

    const drawFrame = () => {
      ctx.clearRect(0, 0, W, H)
      ctx.strokeStyle = lineColor()
      ctx.lineWidth   = 0.75
      ctx.lineCap     = 'round'

      const { x: mx, y: my } = lerpRef.current
      const cx = W / 2
      const cy = H / 2

      for (let i = -numLines; i <= numLines; i++) {
        // Original line center, offset perpendicular from viewport center
        let lcx = cx + i * SPACING * PX
        let lcy = cy + i * SPACING * PY

        const sx0 = lcx - DX * lineLength / 2
        const sy0 = lcy - DY * lineLength / 2

        // Project mouse onto line to find closest point (using original position)
        const proj        = (mx - sx0) * DX + (my - sy0) * DY
        const clampedProj = Math.max(0, Math.min(lineLength, proj))
        const closestX    = sx0 + DX * clampedProj
        const closestY    = sy0 + DY * clampedProj
        const closestDist = Math.hypot(closestX - mx, closestY - my)

        if (closestDist >= RADIUS || mx < -500) {
          ctx.beginPath()
          ctx.moveTo(sx0, sy0)
          ctx.lineTo(sx0 + DX * lineLength, sy0 + DY * lineLength)
          ctx.stroke()
          continue
        }

        // Lift: push each line away from the mouse perpendicularly.
        // Lines spread apart, making spacing appear wider near the cursor.
        const perpDist = (mx - lcx) * PX + (my - lcy) * PY
        const liftMag  = (1 - closestDist / RADIUS) ** 2 * MAX_LIFT
        lcx -= Math.sign(perpDist) * liftMag * PX
        lcy -= Math.sign(perpDist) * liftMag * PY

        const sx = lcx - DX * lineLength / 2
        const sy = lcy - DY * lineLength / 2
        const ex = lcx + DX * lineLength / 2
        const ey = lcy + DY * lineLength / 2

        // Compute t-range within the influence circle for vertex distortion
        const halfChord = Math.sqrt(Math.max(0, RADIUS * RADIUS - closestDist * closestDist))
        const tCenter   = clampedProj / lineLength
        const tHalf     = halfChord / lineLength
        const t0        = Math.max(0, tCenter - tHalf)
        const t1        = Math.min(1, tCenter + tHalf)

        const p0x = sx + t0 * lineLength * DX
        const p0y = sy + t0 * lineLength * DY

        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(p0x, p0y)

        const segCount = Math.max(6, Math.ceil((t1 - t0) * lineLength / SEGMENT))
        for (let j = 1; j <= segCount; j++) {
          const t  = t0 + (t1 - t0) * (j / segCount)
          let px   = sx + t * lineLength * DX
          let py   = sy + t * lineLength * DY
          const dx = px - mx
          const dy = py - my
          const d  = Math.hypot(dx, dy)
          if (d < RADIUS && d > 0.5) {
            const force = ((1 - d / RADIUS) ** 2) * MAX_PUSH
            px += (dx / d) * force
            py += (dy / d) * force
          }
          ctx.lineTo(px, py)
        }

        ctx.lineTo(ex, ey)
        ctx.stroke()
      }
    }

    const isTouch      = window.matchMedia('(pointer: coarse)').matches
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (isTouch || reduceMotion) {
      drawFrame()
      window.addEventListener('resize', drawFrame)
    } else {
      const loop = () => {
        // Lerp mouse → smooth trailing distortion, lines slide rather than snap
        const lr = lerpRef.current, mr = mouseRef.current
        lr.x += (mr.x - lr.x) * 0.1
        lr.y += (mr.y - lr.y) * 0.1
        rafRef.current = requestAnimationFrame(loop)
        drawFrame()
      }
      loop()
    }

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('resize', resize)
      if (isTouch || reduceMotion) window.removeEventListener('resize', drawFrame)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', display: 'block' }}
    />
  )
}
