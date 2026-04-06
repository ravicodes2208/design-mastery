import { useState, useEffect, useRef, useCallback } from 'react'
import clsx from 'clsx'

// Lazy-load mermaid to avoid main bundle bloat
let mermaidInstance = null
async function getMermaid() {
  if (!mermaidInstance) {
    const m = await import('mermaid')
    mermaidInstance = m.default
    mermaidInstance.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#6366f1',
        primaryTextColor: '#e2e8f0',
        primaryBorderColor: '#818cf8',
        lineColor: '#94a3b8',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
        noteBkgColor: '#1e293b',
        noteTextColor: '#e2e8f0',
        noteBorderColor: '#475569',
        actorBkg: '#1e293b',
        actorBorder: '#6366f1',
        actorTextColor: '#e2e8f0',
        signalColor: '#e2e8f0',
        signalTextColor: '#e2e8f0',
      },
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
      fontSize: 13,
      flowchart: { useMaxWidth: true, htmlLabels: true },
      sequence: { useMaxWidth: true },
    })
  }
  return mermaidInstance
}

function MermaidRenderer({ definition, id }) {
  const containerRef = useRef(null)
  const [svg, setSvg] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const render = async () => {
      try {
        const mermaid = await getMermaid()
        const uniqueId = `mermaid-${id}-${Date.now()}`
        const { svg: rendered } = await mermaid.render(uniqueId, definition)
        if (!cancelled) {
          setSvg(rendered)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    }
    render()
    return () => { cancelled = true }
  }, [definition, id])

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
        Diagram error: {error}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex justify-center overflow-x-auto py-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

function MermaidDiagrams({ diagrams }) {
  const [activeDiagram, setActiveDiagram] = useState(0)
  const [activeStep, setActiveStep] = useState(0)

  if (!diagrams?.diagrams?.length) return null

  const diagram = diagrams.diagrams[activeDiagram]
  const step = diagram.steps[activeStep]
  const totalSteps = diagram.steps.length

  const goToStep = useCallback((idx) => {
    setActiveStep(Math.max(0, Math.min(totalSteps - 1, idx)))
  }, [totalSteps])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {diagrams.title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{diagrams.subtitle}</p>
      </div>

      {/* Diagram Selector */}
      <div className="flex flex-wrap gap-2">
        {diagrams.diagrams.map((d, i) => (
          <button
            key={d.id}
            onClick={() => { setActiveDiagram(i); setActiveStep(0) }}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all border-2',
              activeDiagram === i
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
            )}
          >
            {d.title}
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400">{diagram.description}</p>

      {/* Step-by-Step Builder */}
      <div className="flex items-center gap-2 flex-wrap">
        {diagram.steps.map((s, i) => (
          <button
            key={i}
            onClick={() => goToStep(i)}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border',
              i === activeStep
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : i <= activeStep
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-indigo-200'
            )}
          >
            <span className={clsx(
              'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
              i === activeStep
                ? 'bg-indigo-600 text-white'
                : i < activeStep
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            )}>
              {i < activeStep ? '✓' : i + 1}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Step Description */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800">
        <span className="text-indigo-500 text-lg">📐</span>
        <p className="text-sm text-indigo-800 dark:text-indigo-300">{step.description}</p>
      </div>

      {/* Mermaid Diagram */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden min-h-[300px]">
        <div className="px-4 py-2 border-b border-gray-700 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-xs text-gray-400 ml-2">UML Diagram — Step {activeStep + 1}/{totalSteps}</span>
        </div>
        <MermaidRenderer
          key={`${diagram.id}-${activeStep}`}
          definition={step.diagram}
          id={`${diagram.id}-${activeStep}`}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => goToStep(activeStep - 1)}
          disabled={activeStep === 0}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeStep === 0
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
          )}
        >
          ← Previous
        </button>
        <button
          onClick={() => goToStep(activeStep + 1)}
          disabled={activeStep === totalSteps - 1}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeStep === totalSteps - 1
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-white bg-indigo-600 hover:bg-indigo-700'
          )}
        >
          Build Next →
        </button>
      </div>
    </div>
  )
}

export default MermaidDiagrams
