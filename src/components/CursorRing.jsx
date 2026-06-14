import { useEffect, useRef } from 'react'

export default function CursorRing() {
  const ringRef = useRef(null)
  const dotRef  = useRef(null)

  useEffect(() => {
    // Touch devices keep the OS cursor
    if (window.matchMedia('(pointer: coarse)').matches) return

    const ring = ringRef.current
    const dot  = dotRef.current
    if (!ring || !dot) return

    const onMove = ({ clientX: x, clientY: y }) => {
      const tx = `translate(${x}px, ${y}px)`
      ring.style.transform = tx
      dot.style.transform  = tx

      // Show ring only when cursor is over the background (no opaque element underneath).
      // Walk up from the element under cursor; if any ancestor before <body>
      // has a computed background, we're over content — hide the ring.
      const target = document.elementFromPoint(x, y)
      let onContent = false
      let node = target
      for (let i = 0; i < 6 && node && node !== document.body; i++) {
        const bg = getComputedStyle(node).backgroundColor
        if (bg && bg !== 'rgba(0, 0, 0, 0)') { onContent = true; break }
        node = node.parentElement
      }
      ring.style.opacity = onContent ? '0' : '1'
    }

    const onLeave = () => {
      ring.style.transform = 'translate(-300px, -300px)'
      dot.style.transform  = 'translate(-300px, -300px)'
      ring.style.opacity   = '0'
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
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef}  className="cursor-dot"  aria-hidden="true" />
    </>
  )
}
