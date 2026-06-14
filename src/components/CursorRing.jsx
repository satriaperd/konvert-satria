import { useEffect, useRef } from 'react'

export default function CursorRing() {
  const wrapRef       = useRef(null)  // instant position — no transition
  const darkRingRef   = useRef(null)  // always-on cursor indicator (dark transparent)
  const orangeRingRef = useRef(null)  // background-only ring (orange, scale 0↔1)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    const wrap   = wrapRef.current
    const dark   = darkRingRef.current
    const orange = orangeRingRef.current
    if (!wrap || !dark || !orange) return

    const onMove = ({ clientX: x, clientY: y }) => {
      wrap.style.transform = `translate(${x}px, ${y}px)`

      // Dark ring always follows and is always visible while on-page
      dark.classList.add('is-visible')

      const target = document.elementFromPoint(x, y)

      // Check for clickable element → dark ring pulses
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
      dark.classList.toggle('is-pulsing', clickable)

      // Orange ring only on transparent background (canvas areas), not chrome or content
      if (target?.closest('footer') || target?.closest('header')) {
        orange.classList.remove('is-visible')
        return
      }

      let onContent = false
      node = target
      for (let i = 0; i < 6 && node && node !== document.body; i++) {
        const bg = getComputedStyle(node).backgroundColor
        if (bg && bg !== 'rgba(0, 0, 0, 0)') { onContent = true; break }
        node = node.parentElement
      }
      orange.classList.toggle('is-visible', !onContent)
    }

    const onLeave = () => {
      wrap.style.transform = 'translate(-300px, -300px)'
      dark.classList.remove('is-visible')
      dark.classList.remove('is-pulsing')
      orange.classList.remove('is-visible')
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div ref={wrapRef} className="cursor-wrap" aria-hidden="true">
      <div ref={darkRingRef}   className="cursor-ring-dark" />
      <div ref={orangeRingRef} className="cursor-ring-orange" />
    </div>
  )
}
