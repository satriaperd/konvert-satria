import { useEffect, useRef } from 'react'

const RADIUS   = 160
const MAX_PUSH = 30
const MAX_LIFT = 10
const SPACING  = 16
const SEGMENT  = 10

function readLineColor() {
  return document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'rgba(255, 179, 0, 0.40)'
    : 'rgba(255, 179, 0, 0.60)'
}

function checkBackground(x, y) {
  const el = document.elementFromPoint(x, y)
  if (!el || el.closest('footer') || el.closest('header')) return false
  let node = el
  for (let i = 0; i < 6 && node && node !== document.body; i++) {
    const bg = getComputedStyle(node).backgroundColor
    if (bg && bg !== 'rgba(0, 0, 0, 0)') return false
    node = node.parentElement
  }
  return true
}

export default function BackgroundCanvas() {
  const canvasRef = useRef(null)
  const targetRef = useRef({ x: -9999, y: -9999 })
  const lerpRef   = useRef({ x: -9999, y: -9999 })
  const rafRef    = useRef(null)
  const colorRef  = useRef(readLineColor())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const DX = 0.707107, DY = 0.707107
    const PX = -0.707107, PY = 0.707107

    let W, H, diagonal, numLines, lineLength

    const resize = () => {
      W          = canvas.width  = window.innerWidth
      H          = canvas.height = window.innerHeight
      diagonal   = Math.sqrt(W * W + H * H)
      numLines   = Math.ceil(diagonal / SPACING) + 4
      lineLength = diagonal + 200
    }
    resize()

    // Cache line color — update only when theme attribute changes
    const mo = new MutationObserver(() => { colorRef.current = readLineColor() })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    const drawFrame = () => {
      ctx.clearRect(0, 0, W, H)
      ctx.strokeStyle = colorRef.current
      ctx.lineWidth   = 0.75
      ctx.lineCap     = 'round'

      const { x: mx, y: my } = lerpRef.current
      const cx = W / 2, cy = H / 2
      const noMouse = mx < -500

      // Pass 1 — undistorted lines batched into a single stroke() call
      ctx.beginPath()
      for (let i = -numLines; i <= numLines; i++) {
        const lcx = cx + i * SPACING * PX
        const lcy = cy + i * SPACING * PY
        const sx0 = lcx - DX * lineLength / 2
        const sy0 = lcy - DY * lineLength / 2

        let straight = true
        if (!noMouse) {
          const proj = (mx - sx0) * DX + (my - sy0) * DY
          const cp   = Math.max(0, Math.min(lineLength, proj))
          const dist = Math.hypot(sx0 + DX * cp - mx, sy0 + DY * cp - my)
          straight = dist >= RADIUS
        }
        if (straight) {
          ctx.moveTo(sx0, sy0)
          ctx.lineTo(sx0 + DX * lineLength, sy0 + DY * lineLength)
        }
      }
      ctx.stroke()

      if (noMouse) return

      // Pass 2 — distorted lines only (within RADIUS), each stroked individually
      for (let i = -numLines; i <= numLines; i++) {
        let lcx = cx + i * SPACING * PX
        let lcy = cy + i * SPACING * PY
        const sx0 = lcx - DX * lineLength / 2
        const sy0 = lcy - DY * lineLength / 2

        const proj        = (mx - sx0) * DX + (my - sy0) * DY
        const clampedProj = Math.max(0, Math.min(lineLength, proj))
        const closestX    = sx0 + DX * clampedProj
        const closestY    = sy0 + DY * clampedProj
        const closestDist = Math.hypot(closestX - mx, closestY - my)

        if (closestDist >= RADIUS) continue

        const perpDist = (mx - lcx) * PX + (my - lcy) * PY
        const liftMag  = (1 - closestDist / RADIUS) ** 2 * MAX_LIFT
        lcx -= Math.sign(perpDist) * liftMag * PX
        lcy -= Math.sign(perpDist) * liftMag * PY

        const sx = lcx - DX * lineLength / 2
        const sy = lcy - DY * lineLength / 2
        const ex = lcx + DX * lineLength / 2
        const ey = lcy + DY * lineLength / 2

        const halfChord = Math.sqrt(Math.max(0, RADIUS * RADIUS - closestDist * closestDist))
        const tCenter   = clampedProj / lineLength
        const tHalf     = halfChord / lineLength
        const t0        = Math.max(0, tCenter - tHalf)
        const t1        = Math.min(1, tCenter + tHalf)

        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(sx + t0 * lineLength * DX, sy + t0 * lineLength * DY)

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

    // Touch / reduced-motion: draw once, redraw only on resize — no RAF loop
    if (isTouch || reduceMotion) {
      drawFrame()
      const onResize = () => { resize(); drawFrame() }
      window.addEventListener('resize', onResize)
      return () => {
        window.removeEventListener('resize', onResize)
        mo.disconnect()
      }
    }

    // Desktop: full interactive RAF loop
    const onMouseMove = (e) => {
      const { clientX: x, clientY: y } = e
      targetRef.current = checkBackground(x, y) ? { x, y } : { x: -9999, y: -9999 }
    }
    const onMouseLeave = () => {
      targetRef.current = { x: -9999, y: -9999 }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('resize', resize)

    let running = false
    const loop = () => {
      const lr = lerpRef.current, tr = targetRef.current
      lr.x += (tr.x - lr.x) * 0.1
      lr.y += (tr.y - lr.y) * 0.1
      rafRef.current = requestAnimationFrame(loop)
      drawFrame()
    }

    // Pause loop when tab is hidden — resume on visibility restore
    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current)
        running = false
      } else if (!running) {
        running = true
        loop()
      }
    }

    running = true
    loop()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelAnimationFrame(rafRef.current)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('resize', resize)
      mo.disconnect()
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
