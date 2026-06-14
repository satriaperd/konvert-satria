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

      // Ring is always visible when on-page — size changes between 3 states
      ring.classList.add('is-visible')

      const target = document.elementFromPoint(x, y)

      // Clickable element → ring pulses at full size (replaces hand cursor)
      let clickable = false
      let node = target
      for (let i = 0; i < 8 && node && node !== document.body; i++) {
        const tag = node.tagName
        if (
          tag === 'A' || tag === 'BUTTON' || tag === 'INPUT' ||
          tag === 'SELECT' || tag === 'TEXTAREA' ||
          node.getAttribute('role') === 'button' || node.getAttribute('role') === 'link'
        ) { clickable = true; break }
        node = node.parentElement
      }

      if (clickable) {
        ring.classList.remove('is-large')
        ring.classList.add('is-pulsing')
        return
      }

      ring.classList.remove('is-pulsing')

      // Header/footer chrome → small ring, skip background check
      if (target?.closest('footer') || target?.closest('header')) {
        ring.classList.remove('is-large')
        return
      }

      // Transparent (canvas background) → full-size ring (is-large)
      // Opaque content (cards, panels) → small ring (is-visible only)
      let onContent = false
      node = target
      for (let i = 0; i < 6 && node && node !== document.body; i++) {
        const bg = getComputedStyle(node).backgroundColor
        if (bg && bg !== 'rgba(0, 0, 0, 0)') { onContent = true; break }
        node = node.parentElement
      }
      ring.classList.toggle('is-large', !onContent)
    }

    const onLeave = () => {
      wrap.style.transform = 'translate(-300px, -300px)'
      dot.style.transform  = 'translate(-300px, -300px)'
      ring.classList.remove('is-visible')
      ring.classList.remove('is-large')
      ring.classList.remove('is-pulsing')
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
