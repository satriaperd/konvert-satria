import { useEffect, useRef } from 'react'

export default function CursorRing() {
  const wrapRef = useRef(null)  // follows cursor instantly (no transition)
  const ringRef = useRef(null)  // scale transition only
  const dotRef  = useRef(null)  // follows cursor instantly

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    const wrap = wrapRef.current
    const ring = ringRef.current
    const dot  = dotRef.current
    if (!wrap || !ring || !dot) return

    const onMove = ({ clientX: x, clientY: y }) => {
      const tx = `translate(${x}px, ${y}px)`
      wrap.style.transform = tx
      dot.style.transform  = tx

      // Walk up from the element under cursor to detect opaque content.
      // Stop before <body> — body's background is the page bg, not "content".
      const target = document.elementFromPoint(x, y)
      let onContent = false
      let node = target
      for (let i = 0; i < 6 && node && node !== document.body; i++) {
        const bg = getComputedStyle(node).backgroundColor
        if (bg && bg !== 'rgba(0, 0, 0, 0)') { onContent = true; break }
        node = node.parentElement
      }

      // Toggle class — CSS transition handles scale 0↔1
      ring.classList.toggle('is-visible', !onContent)
    }

    const onLeave = () => {
      wrap.style.transform = 'translate(-300px, -300px)'
      dot.style.transform  = 'translate(-300px, -300px)'
      ring.classList.remove('is-visible')
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <>
      <div ref={wrapRef} className="cursor-ring-wrap" aria-hidden="true">
        <div ref={ringRef} className="cursor-ring" />
      </div>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  )
}
