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

      const target = document.elementFromPoint(x, y)

      // Walk up checking for interactive elements — ring pulses instead of showing hand cursor
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
        ring.classList.add('is-visible')
        ring.classList.add('is-pulsing')
        return
      }

      ring.classList.remove('is-pulsing')

      // Header and footer are chrome — always show ring without background check
      const inChrome = !!(target?.closest('footer') || target?.closest('header'))
      if (inChrome) {
        ring.classList.add('is-visible')
        return
      }

      // Content areas: hide ring when opaque background is detected
      let onContent = false
      node = target
      for (let i = 0; i < 6 && node && node !== document.body; i++) {
        const bg = getComputedStyle(node).backgroundColor
        if (bg && bg !== 'rgba(0, 0, 0, 0)') { onContent = true; break }
        node = node.parentElement
      }
      ring.classList.toggle('is-visible', !onContent)
    }

    const onLeave = () => {
      wrap.style.transform = 'translate(-300px, -300px)'
      dot.style.transform  = 'translate(-300px, -300px)'
      ring.classList.remove('is-visible')
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
