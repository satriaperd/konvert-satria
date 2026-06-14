import { useState, useEffect, useCallback, useRef } from 'react'
import gsap from 'gsap'
import JSZip from 'jszip'
import Header from './components/Header'
import Footer from './components/Footer'
import BackgroundCanvas from './components/BackgroundCanvas'
import CursorRing from './components/CursorRing'
import DropZone from './components/DropZone'
import OptionsPanel from './components/OptionsPanel'
import FilePreviewCard from './components/FilePreviewCard'
import ProcessingScreen from './components/ProcessingScreen'
import ResultScreen from './components/ResultScreen'
import { convertFile, warmup, FORMAT_STEPS, FORMAT_META, PDF_OUTPUT_FORMATS, SVG_OUTPUT_FORMATS } from './encoders/index.js'
import { isSupported, isPDF, isEPS, isSVG, uid, formatSize, classifyError } from './utils/format'
import { STRINGS } from './i18n.js'

function MagneticBtn({ children, className, onClick }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left - rect.width / 2) * 0.25
      const y = (e.clientY - rect.top - rect.height / 2) * 0.25
      gsap.to(el, { x, y, duration: 0.3, ease: 'power2.out' })
    }
    const onLeave = () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      gsap.killTweensOf(el)
    }
  }, [])

  return (
    <button ref={ref} className={className} onClick={onClick}>
      {children}
    </button>
  )
}

function makeStatuses(files, format) {
  return files.map(f => {
    const stepsKey = isEPS(f.file) ? 'eps-svg' : isSVG(f.file) ? 'svg-input' : format
    return {
      id:       f.id,
      fileName: f.file.name,
      status:   'pending',
      steps:    FORMAT_STEPS[stepsKey].map(s => ({ ...s, status: 'pending' })),
      error:    null,
    }
  })
}

export default function App() {
  const [files,         setFiles]         = useState([])
  const [mode,          setMode]          = useState('lossy')
  const [quality,       setQuality]       = useState(75)
  const [outputFormat,  setOutputFormat]  = useState('webp')
  const hasEps = files.some(f => isEPS(f.file))
  const hasPdf = !hasEps && files.some(f => isPDF(f.file))
  const hasSvg = !hasEps && !hasPdf && files.some(f => isSVG(f.file))
  const [theme,         setTheme]         = useState(() => {
    const saved = localStorage.getItem('konvert-theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [lang,          setLang]          = useState(() =>
    localStorage.getItem('konvert-lang') || 'en'
  )
  const [screen,        setScreen]        = useState('upload')
  const [fileStatuses,  setFileStatuses]  = useState([])
  const [results,       setResults]       = useState([])

  const t = STRINGS[lang]

  // ── Auto-switch output format when input type changes ────
  useEffect(() => {
    if (!files.length) return
    if (hasEps && outputFormat !== 'svg') setOutputFormat('svg')
    else if (!hasEps && hasPdf && !PDF_OUTPUT_FORMATS.includes(outputFormat)) setOutputFormat('svg')
    else if (!hasEps && !hasPdf && hasSvg && !SVG_OUTPUT_FORMATS.includes(outputFormat)) setOutputFormat('svg')
    else if (!hasEps && !hasPdf && !hasSvg && (PDF_OUTPUT_FORMATS.includes(outputFormat) || SVG_OUTPUT_FORMATS.includes(outputFormat))) setOutputFormat('webp')
  }, [hasEps, hasPdf, hasSvg]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Theme ────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('konvert-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => setTheme(t => t === 'light' ? 'dark' : 'light'), [])

  // ── Language ─────────────────────────────────────────────
  const toggleLang = useCallback(() => {
    setLang(l => {
      const next = l === 'en' ? 'id' : 'en'
      localStorage.setItem('konvert-lang', next)
      return next
    })
  }, [])

  // ── File management ──────────────────────────────────────
  const addFiles = useCallback((incoming) => {
    const filtered = incoming.filter(isSupported)
    if (!filtered.length) return

    const entries = filtered.map(file => ({
      id: uid(), file,
      previewUrl: URL.createObjectURL(file),
      w: 0, h: 0,
    }))

    setFiles(prev => [...prev, ...entries])
    warmup(outputFormat)

    entries.forEach(entry => {
      if (isPDF(entry.file) || isEPS(entry.file) || isSVG(entry.file)) return
      createImageBitmap(entry.file)
        .then(bm => {
          setFiles(prev => prev.map(f =>
            f.id === entry.id ? { ...f, w: bm.width, h: bm.height } : f
          ))
          bm.close()
        })
        .catch(() => {})
    })
  }, [outputFormat])

  const removeFile = useCallback((id) => {
    setFiles(prev => {
      const entry = prev.find(f => f.id === id)
      if (entry) URL.revokeObjectURL(entry.previewUrl)
      return prev.filter(f => f.id !== id)
    })
  }, [])

  // ── Conversion ───────────────────────────────────────────
  const convertAll = useCallback(async () => {
    if (!files.length) return

    setFileStatuses(makeStatuses(files, outputFormat))
    setResults([])
    setScreen('processing')

    await warmup(outputFormat)

    const newResults = []
    const meta = FORMAT_META[outputFormat]

    for (const entry of files) {
      setFileStatuses(prev =>
        prev.map(s => s.id === entry.id ? { ...s, status: 'active' } : s)
      )

      const updateStep = (stepId, stepStatus) =>
        setFileStatuses(prev => prev.map(s => {
          if (s.id !== entry.id) return s
          return { ...s, steps: s.steps.map(step =>
            step.id === stepId ? { ...step, status: stepStatus } : step
          )}
        }))

      try {
        const { buffer, w, h, resized } = await convertFile(
          entry.file, quality, mode === 'lossless', outputFormat, updateStep
        )
        const blob    = new Blob([buffer], { type: meta.mime })
        const blobUrl = URL.createObjectURL(blob)
        newResults.push({
          id: entry.id, file: entry.file,
          originalUrl: entry.previewUrl,
          blob, blobUrl,
          originalSize: entry.file.size,
          outputSize:   blob.size,
          w, h, resized,
          format: outputFormat,
        })
        setFileStatuses(prev =>
          prev.map(s => s.id === entry.id ? { ...s, status: 'done' } : s)
        )
      } catch (err) {
        const { human, detail } = classifyError(err)
        setFileStatuses(prev =>
          prev.map(s => s.id !== entry.id ? s : {
            ...s,
            status: 'error',
            error: human,
            errorDetail: detail,
            steps: s.steps.map(step =>
              step.status === 'active' ? { ...step, status: 'error' } : step
            ),
          })
        )
      }
    }

    setResults(newResults)
    if (newResults.length > 0) {
      setTimeout(() => setScreen('result'), 600)
    }
  }, [files, quality, mode, outputFormat])

  // ── Download ─────────────────────────────────────────────
  const downloadOne = useCallback((result) => {
    const ext = FORMAT_META[result.format]?.ext || '.webp'
    const a = document.createElement('a')
    a.href     = result.blobUrl
    a.download = result.file.name.replace(/\.(jpg|jpeg|png|svg|pdf|eps)$/i, ext)
    a.click()
  }, [])

  const downloadAll = useCallback(async () => {
    if (!results.length) return
    const zip = new JSZip()
    results.forEach(r => {
      const ext = FORMAT_META[r.format]?.ext || '.webp'
      zip.file(r.file.name.replace(/\.(jpg|jpeg|png|svg|pdf|eps)$/i, ext), r.blob)
    })
    const zipBlob = await zip.generateAsync({
      type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 1 },
    })
    const a = document.createElement('a')
    a.href     = URL.createObjectURL(zipBlob)
    a.download = 'konvert_images.zip'
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 10000)
  }, [results])

  // ── Reset ────────────────────────────────────────────────
  const reset = useCallback(() => {
    files.forEach(f => URL.revokeObjectURL(f.previewUrl))
    results.forEach(r => URL.revokeObjectURL(r.blobUrl))
    setFiles([])
    setResults([])
    setFileStatuses([])
    setScreen('upload')
  }, [files, results])

  // ── Render ───────────────────────────────────────────────
  return (
    <>
      <BackgroundCanvas />
      <CursorRing />
      <div className="app-content">
      <Header onToggleTheme={toggleTheme} onToggleLang={toggleLang} t={t} />

      {screen === 'upload' && (
        <main className="app-main screen-enter" key="upload">
          <DropZone onFiles={addFiles} t={t} />

          {files.length > 0 && (
            <>
              <OptionsPanel
                mode={mode} quality={quality} outputFormat={outputFormat}
                onMode={setMode} onQuality={setQuality} onFormat={setOutputFormat}
                inputType={hasEps ? 'eps' : hasPdf ? 'pdf' : hasSvg ? 'svg' : 'image'}
                t={t}
              />

              <section className="files-section">
                <div className="files-header">
                  <div className="files-header-left">
                    <span className="files-title">{t.filesLabel}</span>
                    <span className="badge">{files.length}</span>
                  </div>
                  <span className="files-total">
                    {t.total(formatSize(files.reduce((s, f) => s + f.file.size, 0)))}
                  </span>
                </div>
                <div className="files-list">
                  {files.map(entry => (
                    <FilePreviewCard key={entry.id} entry={entry} onRemove={removeFile} />
                  ))}
                </div>
              </section>

              <div className="convert-action">
                <MagneticBtn className="btn btn--primary btn--lg" onClick={convertAll}>
                  {hasEps
                    ? (files.length === 1 ? t.convertOneEps : t.convertManyEps(files.length))
                    : hasPdf
                      ? (files.length === 1 ? t.convertOnePdf  : t.convertManyPdf(files.length))
                    : hasSvg
                      ? (files.length === 1 ? t.convertOneSvg  : t.convertManySvg(files.length))
                      : (files.length === 1 ? t.convertOne     : t.convertMany(files.length))
                  }
                </MagneticBtn>
              </div>
            </>
          )}
        </main>
      )}

      {screen === 'processing' && (
        <div className="screen-enter" key="processing">
          <ProcessingScreen
            fileStatuses={fileStatuses}
            onViewResults={() => setScreen('result')}
            t={t}
          />
        </div>
      )}

      {screen === 'result' && (
        <div className="screen-enter" key="result">
          <ResultScreen
            results={results}
            onDownloadOne={downloadOne}
            onDownloadAll={downloadAll}
            onReset={reset}
            t={t}
          />
        </div>
      )}

      <Footer t={t} />
      </div>
    </>
  )
}
